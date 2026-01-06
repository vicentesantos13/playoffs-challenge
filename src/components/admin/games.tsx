import { startTransition } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TabsContent } from "../ui/tabs";
import { createGame, deleteGame } from "@/actions/admin";
import { Game, Round } from "@/generated/prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { EditGameDialog } from "./editgame";

type RoundWithGames = Round & { games: Game[] };

type AllGames = {
  roundName: string;
  id: string;
  createdAt: Date;
  roundId: string;
  homeTeam: string;
  awayTeam: string;
  startAt: Date;
  lockAt: Date;
  status: "SCHEDULED" | "FINAL";
  homeScore: number | null;
  awayScore: number | null;
};

type Props = {
  gameRoundId: string;
  setGameRoundId: (id: string) => void;
  rounds: RoundWithGames[];
  pending: boolean;
  awayTeam: string;
  setAwayTeam: (team: string) => void;
  homeTeam: string;
  setHomeTeam: (team: string) => void;
  startAt: string;
  setStartAt: (date: string) => void;
  allGames: AllGames[];
};
function fmt(dt: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dt));
}
export const Games = ({
  gameRoundId,
  setGameRoundId,
  rounds,
  pending,
  awayTeam,
  setAwayTeam,
  homeTeam,
  setHomeTeam,
  startAt,
  setStartAt,
  allGames,
}: Props) => {
  return (
    <TabsContent value="games" className="space-y-4 mt-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Criar jogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Rodada</Label>
              <Select value={gameRoundId} onValueChange={setGameRoundId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a rodada" />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.order}. {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Away</Label>
                <Input
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  placeholder="Time fora"
                />
              </div>
              <div className="space-y-2">
                <Label>Home</Label>
                <Input
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  placeholder="Time casa"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
              </div>
            </div>

            <Button
              disabled={pending || !gameRoundId}
              onClick={() => {
                startTransition(async () => {
                  await createGame({
                    roundId: gameRoundId,
                    homeTeam,
                    awayTeam,
                    startAtISO: startAt,
                    lockAtISO: startAt,
                  });
                  location.reload();
                });
              }}
            >
              {pending ? "Criando..." : "Criar jogo"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Jogos cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allGames.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum jogo cadastrado.
              </p>
            ) : (
              allGames.map((g) => (
                <div
                  key={g.id}
                  className="rounded-lg border p-3 flex items-center justify-between gap-3"
                >
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
                  <div className="flex items-center gap-2">
                    {g.status === "FINAL" ? (
                      <Badge>Final</Badge>
                    ) : (
                      <Badge variant="secondary">Scheduled</Badge>
                    )}
                    {g.status === "FINAL" &&
                    g.homeScore != null &&
                    g.awayScore != null ? (
                      <Badge variant="outline">
                        {g.homeScore} x {g.awayScore}
                      </Badge>
                    ) : null}

                    <EditGameDialog game={g} rounds={rounds} />

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={pending || g.status === "FINAL"}
                      onClick={() => {
                        const ok = confirm(
                          `Apagar o jogo "${g.homeTeam} vs ${g.awayTeam}"? Isso apaga as picks desse jogo também.`
                        );
                        if (!ok) return;

                        startTransition(async () => {
                          await deleteGame(g.id);
                          location.reload();
                        });
                      }}
                    >
                      Apagar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};
