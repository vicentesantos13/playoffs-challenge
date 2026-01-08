/* eslint-disable @typescript-eslint/no-explicit-any */
import { pointsForPick } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getRound } from "@/services/board";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getTeams } from "@/services/admin";
import { MarginBucket } from "@/types/marginBucket";


const ALLOWED_MARGINS = ["M5", "M10", "M15", "M20", "M25PLUS"] as const;

function toAppMarginBucket(v: unknown): MarginBucket {
  const s = String(v);
  if (!ALLOWED_MARGINS.includes(s as any)) {
    throw new Error(`pickMargin inválido no banco: ${s}`);
  }
  return s as MarginBucket;
}

function fmt(dt: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dt));
}

function marginLabel(v: string) {
  return v.replace("M", "").replace("30PLUS", "30+");
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

function TeamChip({
  name,
  logo,
  size = 18,
  textClassName = "",
}: {
  name: string;
  logo?: string | null;
  size?: number;
  textClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      {logo ? (
        <span
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <Image
            src={logo}
            alt={name}
            fill
            sizes={`${size}px`}
            className="object-contain"
          />
        </span>
      ) : (
        <span
          className="grid place-items-center rounded bg-muted text-[10px] font-semibold shrink-0"
          style={{ width: size, height: size }}
          aria-hidden
        >
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}

      <span className={`truncate ${textClassName}`}>{name}</span>
    </span>
  );
}

export default async function BoardPage() {
  const round = await getRound();

  // pega todos os times pra ter logo por nome
  const teams = await getTeams();

  const teamsByName = new Map<string, { name: string; logo: string }>();
  for (const t of teams) {
    teamsByName.set(norm(t.name), { name: t.name, logo: t.logo });
  }

  const getTeamLogo = (teamName: string) =>
    teamsByName.get(norm(teamName))?.logo ?? null;

  if (!round) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base text-gray-200">
              Pick Board
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-200">
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
          <h1 className="text-2xl font-semibold tracking-tight text-gray-200">
            Pick Board
          </h1>
        </div>
      </header>

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
          {/* Tabs com logo + scroll horizontal no mobile */}
          <ScrollArea className="">
            <TabsList className="w-max flex gap-2 h-auto whitespace-nowrap  bg-slate-900/40 border border-white/10 mx-auto">
              {games.map((g) => {
                const awayLogo = getTeamLogo(g.awayTeam);
                const homeLogo = getTeamLogo(g.homeTeam);

                return (
                  <TabsTrigger
                    key={g.id}
                    value={g.id}
                    className="gap-2 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow"
                  >
                    <span className="inline-flex items-center gap-2">
                      <TeamChip
                        name={g.awayTeam}
                        logo={awayLogo}
                        size={16}
                        textClassName="max-w-[110px] text-gray-200"
                      />
                      <span className="text-gray-200">@</span>
                      <TeamChip
                        name={g.homeTeam}
                        logo={homeLogo}
                        size={16}
                        textClassName="max-w-[110px] text-gray-200"
                      />
                    </span>

                    {g.status === "FINAL" ? (
                      <Badge className="ml-1">Final</Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-1">
                        Agendado
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {games.map((g) => {
            const locked = now >= new Date(g.lockAt);
            const isFinal =
              g.status === "FINAL" &&
              g.homeScore != null &&
              g.awayScore != null;

            const homeLogo = getTeamLogo(g.homeTeam);
            const awayLogo = getTeamLogo(g.awayTeam);

            return (
              <TabsContent key={g.id} value={g.id} className="mt-4 space-y-4">
                <Card className="bg-slate-500">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        {/* título com logos maiores */}
                        <CardTitle className="text-base">
                          <div className="flex items-center gap-3 flex-wrap">
                            <TeamChip
                              name={g.awayTeam}
                              logo={awayLogo}
                              size={26}
                              textClassName="font-semibold text-gray-200 "
                            />
                            <span className="text-gray-200">@</span>
                            <TeamChip
                              name={g.homeTeam}
                              logo={homeLogo}
                              size={26}
                              textClassName="font-semibold text-gray-200"
                            />
                          </div>
                        </CardTitle>

                        <p className="text-xs text-gray-300">
                          Início: {fmt(g.startAt)} • Lock: {fmt(g.lockAt)}
                        </p>

                        {isFinal ? (
                          <div className="flex items-center text-gray-200">
                            <span className="mr-1">Placar:</span>
                            <TeamChip name={g.awayTeam} logo={awayLogo} />
                            <span className="font-semibold mx-1">
                              {g.awayScore}
                            </span>
                            <span className="text-gray-200">@</span>{" "}
                            <span className="font-semibold mx-1">
                              {g.homeScore}
                            </span>{" "}
                            <TeamChip name={g.homeTeam} logo={homeLogo} />
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-gray-300">
                          {locked || isFinal ? "Travado" : "Aberto"}
                        </Badge>
                        {isFinal ? (
                          <Badge className="gap-1 bg-blue-600">
                            Resultados liberados
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Sem resultado</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {g.picks.length === 0 ? (
                      <p className="text-sm text-gray-200">
                        Ninguém apostou neste jogo ainda.
                      </p>
                    ) : (
                      <div className="rounded-lg border overflow-scroll md:overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-300">
                            <tr className="text-left text-gray-600">
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
                                const pickedTeamName =
                                  p.pickWinner === "HOME"
                                    ? g.homeTeam
                                    : g.awayTeam;

                                const pickedLogo = getTeamLogo(pickedTeamName);
                                const pickedMargin = marginLabel(p.pickMargin);

                                let winnerOk: boolean | null = null;
                                let marginOk: boolean | null = null;
                                let pts: number | null = null;

                                if (isFinal) {
                                  const res = pointsForPick({
                                    pickWinner: p.pickWinner as "HOME" | "AWAY",
                                    pickMargin: toAppMarginBucket(p.pickMargin),
                                    homeScore: g.homeScore!,
                                    awayScore: g.awayScore!,
                                  });
                                  winnerOk = res.winnerCorrect;
                                  marginOk = res.marginCorrect;
                                  pts = res.points;
                                }

                                return (
                                  <tr
                                    key={p.id}
                                    className="border-t text-gray-200"
                                  >
                                    <td className="p-3 font-medium">
                                      {p.participant.name}
                                    </td>

                                    {/* Pick com logo */}
                                    <td className="p-3">
                                      <TeamChip
                                        name={pickedTeamName}
                                        logo={pickedLogo}
                                        size={18}
                                      />
                                    </td>

                                    <td className="p-3">{pickedMargin}</td>

                                    <td className="p-3 text-right">
                                      {!isFinal ? (
                                        <Badge variant="secondary">
                                          Sem resultado
                                        </Badge>
                                      ) : (
                                        <div className="flex justify-end gap-2 flex-wrap">
                                          <Badge
                                            variant={"outline"}
                                            className="text-gray-200"
                                          >
                                            {winnerOk
                                              ? "Vencedor ✅"
                                              : "Vencedor ❌"}
                                          </Badge>
                                          <Badge
                                            variant={"outline"}
                                            className="text-gray-200"
                                          >
                                            {marginOk
                                              ? "Margem ✅"
                                              : "Margem ❌"}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className="text-gray-200"
                                          >
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
