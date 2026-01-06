"use server";

import prisma from "@/lib/prisma";
import { pointsForPick } from "@/lib/scoring";

export async function getLeaderboard(roundId?: string) {
  // soma points dos picks (se roundId, filtra)
  const rows = await prisma.participant.findMany({
    select: {
      id: true,
      name: true,
      isPro: true,
      picks: {
        select: { points: true, game: { select: { roundId: true } } },
      },
    },
  });

  const totals = rows.map((p) => ({
    participantId: p.id,
    name: p.name,
    isPro: p.isPro,
    points: p.picks
      .filter((pk) => (roundId ? pk.game.roundId === roundId : true))
      .reduce((acc, pk) => acc + pk.points, 0),
  }));

  totals.sort((a, b) => b.points - a.points);
  return totals;
}

export async function getActiveRoundWithGames() {
  const round = await prisma.round.findFirst({
    where: { isActive: true },
    include: {
      games: { orderBy: { startAt: "asc" } },
    },
  });
  return round;
}

export async function getLeaderboardAll() {
  const rounds = await prisma.round.findMany({
    orderBy: { order: "asc" },
    include: {
      games: {
        include: {
          picks: { include: { participant: true } },
        },
      },
    },
  });

  const totals = new Map<
    string,
    { participantId: string; name: string; isPro: boolean; points: number }
  >();

  const byRound = rounds.map((r) => {
    const roundMap = new Map<
      string,
      { participantId: string; name: string; isPro: boolean; points: number }
    >();

    for (const g of r.games) {
      const isFinal =
        g.status === "FINAL" && g.homeScore != null && g.awayScore != null;
      if (!isFinal) continue;

      for (const p of g.picks) {
        const res = pointsForPick({
          pickWinner: p.pickWinner as "HOME" | "AWAY",
          pickMargin: p.pickMargin,
          homeScore: g.homeScore!,
          awayScore: g.awayScore!,
        });

        const isPro = !!p.participant.isPro;

        // total geral
        const t = totals.get(p.participantId) ?? {
          participantId: p.participantId,
          name: p.participant.name,
          isPro,
          points: 0,
        };
        t.points += res.points;
        // se isPro mudou no tempo, mantém o valor mais recente
        t.isPro = isPro;
        totals.set(p.participantId, t);

        // por rodada
        const rr = roundMap.get(p.participantId) ?? {
          participantId: p.participantId,
          name: p.participant.name,
          isPro,
          points: 0,
        };
        rr.points += res.points;
        rr.isPro = isPro;
        roundMap.set(p.participantId, rr);
      }
    }

    return {
      roundId: r.id,
      roundName: r.name,
      rows: Array.from(roundMap.values()).sort((a, b) => b.points - a.points),
    };
  });

  const totalRows = Array.from(totals.values()).sort(
    (a, b) => b.points - a.points
  );

  return { totalRows, byRound };
}
