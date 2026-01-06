import { pointsForPick } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRound } from "@/services/board";

function fmt(dt: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dt));
}

function marginLabel(v: string) {
  return v.replace("M", "").replace("30PLUS", "30+");
}

export default async function BoardPage() {
  const round = await getRound();

  if (!round) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Pick Board</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sem rodada ativa no momento.
          </CardContent>
        </Card>
      </main>
    );
  }

  const games = round.games;
  const now = new Date();

  return (
    <main className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Pick Board</h1>
        </div>
      </header>

      <Separator />

      {games.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Sem jogos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            O admin ainda não cadastrou jogos nesta rodada.
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={games[0].id} className="w-full">
          <TabsList className="w-full flex flex-wrap justify-start gap-2 h-auto">
            {games.map((g) => (
              <TabsTrigger key={g.id} value={g.id} className="gap-2">
                {g.awayTeam} @ {g.homeTeam}
                {g.status === "FINAL" ? (
                  <Badge className="ml-1">Final</Badge>
                ) : (
                  <Badge variant="secondary" className="ml-1">
                    Agendado
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {games.map((g) => {
            const locked = now >= new Date(g.lockAt);
            const isFinal =
              g.status === "FINAL" &&
              g.homeScore != null &&
              g.awayScore != null;

            return (
              <TabsContent key={g.id} value={g.id} className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {g.homeTeam}{" "}
                          <span className="text-muted-foreground">vs</span>{" "}
                          {g.awayTeam}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Início: {fmt(g.startAt)} • Lock: {fmt(g.lockAt)}
                        </p>

                        {isFinal ? (
                          <p className="text-sm">
                            Placar:{" "}
                            <span className="font-semibold">{g.homeScore}</span>{" "}
                            <span className="text-muted-foreground">x</span>{" "}
                            <span className="font-semibold">{g.awayScore}</span>
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">
                          {locked ? "Travado" : "Aberto"}
                        </Badge>
                        {isFinal ? (
                          <Badge className="gap-1">Resultados liberados</Badge>
                        ) : (
                          <Badge variant="secondary">Sem resultado</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {g.picks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Ninguém apostou neste jogo ainda.
                      </p>
                    ) : (
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr className="text-left">
                              <th className="p-3 w-[44%]">Participante</th>
                              <th className="p-3">Pick</th>
                              <th className="p-3">Margem</th>
                              <th className="p-3 text-right w-40">Resultado</th>
                            </tr>
                          </thead>

                          <tbody>
                            {g.picks
                              .slice()
                              .sort((a, b) =>
                                a.participant.name.localeCompare(
                                  b.participant.name
                                )
                              )
                              .map((p) => {
                                const pickedTeam =
                                  p.pickWinner === "HOME"
                                    ? g.homeTeam
                                    : g.awayTeam;
                                const pickedMargin = marginLabel(p.pickMargin);

                                let winnerOk: boolean | null = null;
                                let marginOk: boolean | null = null;
                                let pts: number | null = null;

                                if (isFinal) {
                                  const res = pointsForPick({
                                    pickWinner: p.pickWinner as "HOME" | "AWAY",
                                    pickMargin: p.pickMargin,
                                    homeScore: g.homeScore!,
                                    awayScore: g.awayScore!,
                                    // se quiser aplicar Super Bowl aqui também:
                                    // multiplier: round.name.trim().toLowerCase() === "super bowl" ? 2 : 1,
                                  });
                                  winnerOk = res.winnerCorrect;
                                  marginOk = res.marginCorrect;
                                  pts = res.points;
                                }

                                return (
                                  <tr key={p.id} className="border-t">
                                    <td className="p-3 font-medium">
                                      {p.participant.name}
                                    </td>
                                    <td className="p-3">{pickedTeam}</td>
                                    <td className="p-3">{pickedMargin}</td>
                                    <td className="p-3 text-right">
                                      {!isFinal ? (
                                        <Badge variant="secondary">
                                          Sem resultado
                                        </Badge>
                                      ) : (
                                        <div className="flex justify-end gap-2 flex-wrap">
                                          <Badge
                                            variant={
                                              winnerOk ? "default" : "secondary"
                                            }
                                          >
                                            {winnerOk
                                              ? "Vencedor ✅"
                                              : "Vencedor ❌"}
                                          </Badge>
                                          <Badge
                                            variant={
                                              marginOk ? "default" : "secondary"
                                            }
                                          >
                                            {marginOk
                                              ? "Margem ✅"
                                              : "Margem ❌"}
                                          </Badge>
                                          <Badge variant="outline">
                                            +{pts} pt{pts === 1 ? "" : "s"}
                                          </Badge>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </main>
  );
}
