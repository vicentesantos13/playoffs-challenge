"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Participant, Team } from "@/types/admin";

import { Rounds } from "./rounds";
import { Games } from "./games";
import { Finalize } from "./finalize";
import { Participants } from "./participants";
import { getTeams } from "@/services/admin";
import { Game } from "@/types/game";
import { Round } from "@/types/round";

type RoundWithGames = Round & { games: Game[] };

export function AdminClient({
  rounds,
  participants,
}: {
  rounds: RoundWithGames[];
  participants: Participant[];
}) {
  const [pending, startTransition] = useTransition();

  const activeRound = rounds.find((r) => r.isActive) ?? null;

  // --- Create round
  const [roundName, setRoundName] = useState("");
  const [roundOrder, setRoundOrder] = useState<number>(
    rounds.length ? rounds.length + 1 : 1
  );

  // --- Create game
  const [gameRoundId, setGameRoundId] = useState<string>(
    activeRound?.id ?? rounds[0]?.id ?? ""
  );
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [startAt, setStartAt] = useState(""); // datetime-local string

  const [people, setPeople] = useState<Participant[]>(participants);

  const allGames = useMemo(
    () =>
      rounds.flatMap((r) => r.games.map((g) => ({ ...g, roundName: r.name }))),
    [rounds]
  );
  const scheduledGames = allGames.filter((g) => g.status === "SCHEDULED");

  const [teams, setTeams] = useState<Team[]>([]);
  // --- Finalize scores (controlled inputs per game)

  useEffect(() => {
    const fetchTeams = async () => {
      const res = await getTeams();
      setTeams(res);
    };
    fetchTeams();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Admin</CardTitle>
          {activeRound ? (
            <Badge className="w-fit">Rodada ativa: {activeRound.name}</Badge>
          ) : (
            <Badge variant="secondary" className="w-fit">
              Sem rodada ativa
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="rounds" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="participants">Participantes</TabsTrigger>
            <TabsTrigger value="rounds">Rodadas</TabsTrigger>
            <TabsTrigger value="games">Jogos</TabsTrigger>
            <TabsTrigger value="finalize">Finalizar</TabsTrigger>
          </TabsList>

          {/* PARTICIPANTES */}
          <Participants
            pending={pending}
            people={people}
            startTransition={startTransition}
            setPeople={setPeople}
          />

          {/* ROUNDS */}
          <Rounds
            pending={pending}
            rounds={rounds}
            roundName={roundName}
            setRoundName={setRoundName}
            roundOrder={roundOrder}
            setRoundOrder={setRoundOrder}
          />

          {/* GAMES */}

          <Games
            pending={pending}
            rounds={rounds}
            allGames={allGames}
            awayTeam={awayTeam}
            setAwayTeam={setAwayTeam}
            homeTeam={homeTeam}
            setHomeTeam={setHomeTeam}
            startAt={startAt}
            setStartAt={setStartAt}
            gameRoundId={gameRoundId}
            setGameRoundId={setGameRoundId}
            teams={teams}
          />
          {/* FINALIZE */}
          <Finalize pending={pending} scheduledGames={scheduledGames} />
        </Tabs>
      </CardContent>
    </Card>
  );
}
