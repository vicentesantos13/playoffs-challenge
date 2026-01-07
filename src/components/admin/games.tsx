"use client";

import { useMemo, useState } from "react";
import { startTransition } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TabsContent } from "../ui/tabs";
import { createGame, deleteGame } from "@/actions/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { EditGameDialog } from "./editgame";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Team } from "@/types/admin";

import { Game } from "@/types/game";
import { Round } from "@/types/round";

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

  teams: Team[];
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
  teams,
}: Props) => {
  // ids só pra UI (logo + validações)
  const [awayTeamId, setAwayTeamId] = useState<string>("");
  const [homeTeamId, setHomeTeamId] = useState<string>("");

  const teamsById = useMemo(() => {
    const m = new Map<string, Team>();
    teams.forEach((t) => m.set(t.id, t));
    return m;
  }, [teams]);

  const awaySelected = awayTeamId ? teamsById.get(awayTeamId) : null;
  const homeSelected = homeTeamId ? teamsById.get(homeTeamId) : null;

  const canCreate =
    !!gameRoundId &&
    !!awayTeamId &&
    !!homeTeamId &&
    awayTeamId !== homeTeamId &&
    !!startAt &&
    !pending;

  function TeamChip({ name, logo }: { name: string; logo?: string | null }) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <Avatar className="h-6 w-6">
          <AvatarImage src={logo ?? ""} alt={name} />
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="font-medium truncate">{name}</span>
      </div>
    );
  }

  const teamsByName = useMemo(() => {
    const m = new Map<string, Team>();
    (teams ?? []).forEach((t) => m.set(t.name.trim().toLowerCase(), t));
    return m;
  }, [teams]);

  return (
    <TabsContent value="games" className="space-y-4 mt-4">
      <div className="flex flex-col gap-2">
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

            {/* AWAY + HOME com Select e logo */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Away</Label>

                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={awaySelected?.logo ?? ""}
                      alt={awaySelected?.name ?? "Away"}
                    />
                    <AvatarFallback>
                      {awaySelected?.name?.slice(0, 2).toUpperCase() ?? "A"}
                    </AvatarFallback>
                  </Avatar>

                  <Select
                    value={awayTeamId}
                    onValueChange={(id) => {
                      setAwayTeamId(id);
                      const t = teamsById.get(id);
                      if (t) setAwayTeam(t.name); // mantém string no Game
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o time fora" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={t.logo} alt={t.name} />
                              <AvatarFallback>
                                {t.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{t.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Home</Label>

                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={homeSelected?.logo ?? ""}
                      alt={homeSelected?.name ?? "Home"}
                    />
                    <AvatarFallback>
                      {homeSelected?.name?.slice(0, 2).toUpperCase() ?? "H"}
                    </AvatarFallback>
                  </Avatar>

                  <Select
                    value={homeTeamId}
                    onValueChange={(id) => {
                      setHomeTeamId(id);
                      const t = teamsById.get(id);
                      if (t) setHomeTeam(t.name); // mantém string no Game
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o time da casa" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={t.logo} alt={t.name} />
                              <AvatarFallback>
                                {t.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{t.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

            {awayTeamId && homeTeamId && awayTeamId === homeTeamId ? (
              <p className="text-xs text-destructive">
                Away e Home não podem ser o mesmo time.
              </p>
            ) : null}

            <Button
              disabled={!canCreate}
              onClick={() => {
                startTransition(async () => {
                  await createGame({
                    roundId: gameRoundId,
                    homeTeam, // string (nome)
                    awayTeam, // string (nome)
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

        {/* resto do teu card de listagem continua igual */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Jogos cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allGames.map((g) => {
              const home = teamsByName.get(g.homeTeam.trim().toLowerCase());
              const away = teamsByName.get(g.awayTeam.trim().toLowerCase());

              return (
                <div
                  key={g.id}
                  className="rounded-lg border p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {home ? (
                        <TeamChip name={home.name} logo={home.logo} />
                      ) : (
                        <span className="font-medium truncate">
                          {g.homeTeam}
                        </span> // fallback
                      )}

                      <span className="text-muted-foreground shrink-0">vs</span>

                      {away ? (
                        <TeamChip name={away.name} logo={away.logo} />
                      ) : (
                        <span className="font-medium truncate">
                          {g.awayTeam}
                        </span> // fallback
                      )}
                    </div>

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
                          `Apagar o jogo "${home?.name ?? g.homeTeam} vs ${
                            away?.name ?? g.awayTeam
                          }"? Isso apaga as picks desse jogo também.`
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
              );
            })}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};
