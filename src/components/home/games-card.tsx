import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Game } from "@/generated/prisma/client";
import { Clock, Lock, CheckCircle2 } from "lucide-react";

type Props = {
  games: Game[];
};

function formatDate(dt: Date) {
  // Server component: formata no servidor (ok pro MVP)
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(dt);
}

function statusBadge(status: Game["status"]) {
  if (status === "FINAL") return <Badge className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Final</Badge>;
  return <Badge variant="secondary">Agendado</Badge>;
}

export function GamesCard({ games }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Jogos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {games.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum jogo cadastrado nesta rodada.</p>
        ) : (
          <div className="space-y-2">
            {games.map((g) => {
              const locked = new Date() > new Date(g.lockAt);

              return (
                <div
                  key={g.id}
                  className="rounded-lg border p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">
                        {g.homeTeam} <span className="text-muted-foreground">vs</span> {g.awayTeam}
                      </span>
                      {statusBadge(g.status)}
                      {locked ? (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3.5 w-3.5" />
                          Travado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Aberto
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      Início: {formatDate(new Date(g.startAt))} • Lock: {formatDate(new Date(g.lockAt))}
                    </p>
                  </div>

                  <div className="text-sm">
                    {g.status === "FINAL" && g.homeScore != null && g.awayScore != null ? (
                      <span className="font-semibold">
                        {g.homeScore} <span className="text-muted-foreground">x</span> {g.awayScore}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
