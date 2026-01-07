import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Lock, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";

import { Game } from "@/types/game";
import { Team } from "@/types/admin";

type Props = {
  games: Game[];
  teams?: Team[]; // <- passa do server (ou do parent)
};

function formatDate(dt: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(dt);
}

function statusBadge(status: Game["status"]) {
  if (status === "FINAL")
    return (
      <Badge className="gap-1 bg-blue-500">
        <CheckCircle2 className="h-3.5 w-3.5" /> Final
      </Badge>
    );

  return <Badge variant="secondary">Agendado</Badge>;
}

function TeamChip({ name, logo }: { name: string; logo?: string | null }) {
  return (
    <span className="flex items-center gap-2 min-w-0">
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarImage src={logo ?? ""} alt={name} />
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="font-medium truncate text-gray-200">{name}</span>
    </span>
  );
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

export function GamesCard({ games, teams = [] }: Props) {
  const teamsByName = useMemo(() => {
    const m = new Map<string, Team>();
    teams.forEach((t) => m.set(norm(t.name), t));
    return m;
  }, [teams]);

  return (
    <Card className="bg-slate-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-gray-200">Jogos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 p-2">
        {games.length === 0 ? (
          <p className="text-sm text-gray-200">
            Nenhum jogo cadastrado nesta rodada.
          </p>
        ) : (
          <div className="space-y-2">
            {games.map((g) => {
              const locked = new Date() > new Date(g.lockAt);

              const home = teamsByName.get(norm(g.homeTeam));
              const away = teamsByName.get(norm(g.awayTeam));

              return (
                <div
                  key={g.id}
                  className="rounded-lg border p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        

                        

                        {away ? (
                          <TeamChip name={away.name} logo={away.logo} />
                        ) : (
                          <span className="font-medium truncate text-gray-200">
                            {g.awayTeam}
                          </span>
                        )}

                        <span className="text-gray-200 shrink-0">
                          @
                        </span>

                        {home ? (
                          <TeamChip name={home.name} logo={home.logo} />
                        ) : (
                          <span className="font-medium truncate text-gray-200">
                            {g.homeTeam}
                          </span>
                        )}
                      </div>

                      {statusBadge(g.status)}

                      {locked || g.status === "FINAL" ? (
                        <Badge variant="outline" className="gap-1 text-gray-200">
                          <Lock className="h-3.5 w-3.5" />
                          Travado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-gray-200">
                          <Clock className="h-3.5 w-3.5" />
                          Aberto
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 mt-1">
                      Início: {formatDate(new Date(g.startAt))} • Lock:{" "}
                      {formatDate(new Date(g.lockAt))}
                    </p>
                  </div>

                  <div className="text-sm text-gray-200">
                    {g.status === "FINAL" &&
                    g.homeScore != null &&
                    g.awayScore != null ? (
                      <span className="font-semibold ">
                        {g.awayScore}
                        <span className="text-gray-200 mx-1">@</span>{" "}
                        {g.homeScore}
                      </span>
                    ) : (
                      <span className="text-gray-200">—</span>
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
