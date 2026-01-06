"use client";
import { startTransition, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TabsContent } from "../ui/tabs";
import { finalizeGame } from "@/actions/admin";

type ScheduledGames = {
  roundName: string;
  id: string;
  status: "SCHEDULED" | "FINAL";
  createdAt: Date;
  roundId: string;
  homeTeam: string;
  awayTeam: string;
  startAt: Date;
  lockAt: Date;
  homeScore: number | null;
  awayScore: number | null;
}[];

type Props = {
  scheduledGames: ScheduledGames;
  pending: boolean;
};

function fmt(dt: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dt));
}

export const Finalize = ({ scheduledGames, pending }: Props) => {
  const [scoreMap, setScoreMap] = useState<
    Record<string, { home: string; away: string }>
  >({});
  return (
    <TabsContent value="finalize" className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            Finalizar jogos (lançar placar)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scheduledGames.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum jogo agendado para finalizar.
            </p>
          ) : (
            scheduledGames.map((g) => {
              const entry = scoreMap[g.id] ?? { home: "", away: "" };

              return (
                <div key={g.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {g.homeTeam}{" "}
                        <span className="text-muted-foreground">vs</span>{" "}
                        {g.awayTeam}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {g.roundName} • {fmt(g.startAt)}
                      </p>
                    </div>
                    <Badge variant="secondary">Scheduled</Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
                    <div className="space-y-1">
                      <Label>{g.homeTeam}</Label>
                      <Input
                        type="number"
                        value={entry.home}
                        onChange={(e) =>
                          setScoreMap((m) => ({
                            ...m,
                            [g.id]: { ...entry, home: e.target.value },
                          }))
                        }
                        min={0}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>{g.awayTeam}</Label>
                      <Input
                        type="number"
                        value={entry.away}
                        onChange={(e) =>
                          setScoreMap((m) => ({
                            ...m,
                            [g.id]: { ...entry, away: e.target.value },
                          }))
                        }
                        min={0}
                      />
                    </div>

                    <Button
                      disabled={
                        pending || entry.home === "" || entry.away === ""
                      }
                      onClick={() => {
                        startTransition(async () => {
                          await finalizeGame({
                            gameId: g.id,
                            homeScore: Number(entry.home),
                            awayScore: Number(entry.away),
                          });
                          location.reload();
                        });
                      }}
                    >
                      {pending ? "Finalizando..." : "Finalizar"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};
