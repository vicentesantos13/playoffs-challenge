/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/prisma";
import { getSessionParticipant } from "@/lib/auth";
import type { MarginBucket } from "@/types/marginBucket";
import { getActiveRoundWithGames } from "@/actions/leaderboard";

const ALLOWED_MARGINS = ["M5", "M10", "M15", "M20", "M25PLUS"] as const;

function assertMarginBucket(
  v: string
): asserts v is (typeof ALLOWED_MARGINS)[number] {
  if (!ALLOWED_MARGINS.includes(v as any)) {
    throw new Error(`Margem inválida: ${v}`);
  }
}

export async function upsertPick(input: {
  gameId: string;
  pickWinner: "HOME" | "AWAY";
  pickMargin: MarginBucket;
}) {
  const me = await getSessionParticipant();
  if (!me) throw new Error("Você precisa entrar para apostar.");

  const game = await prisma.game.findUnique({ where: { id: input.gameId } });
  if (!game) throw new Error("Jogo não encontrado.");

  const now = new Date();
  if (now > game.lockAt) throw new Error("Apostas travadas para este jogo.");

  // ✅ garante que bate com o enum do banco
  assertMarginBucket(input.pickMargin);

  await prisma.pick.upsert({
    where: {
      participantId_gameId: { participantId: me.id, gameId: input.gameId },
    },
    create: {
      participantId: me.id,
      gameId: input.gameId,
      pickWinner: input.pickWinner,
      // 👇 cast sem depender do enum do Prisma
      pickMargin: input.pickMargin as unknown as any,
    } as any,
    update: {
      pickWinner: input.pickWinner,
      pickMargin: input.pickMargin as unknown as any,
    } as any,
  });

  return { ok: true };
}

export const getMyPicks = async () => {
  const me = await getSessionParticipant();
  if (!me) throw new Error("Você precisa entrar para apostar.");
  const round = await getActiveRoundWithGames();

  const picks =
    me && round
      ? await prisma.pick.findMany({
          where: { participantId: me.id, game: { roundId: round.id } },
        })
      : [];

  return picks;
};
