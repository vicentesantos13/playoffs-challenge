"use server";

import  prisma  from "@/lib/prisma";
import { getSessionParticipant } from "@/lib/auth";
import { MarginBucket } from "@/generated/prisma/enums";



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

  await prisma.pick.upsert({
    where: { participantId_gameId: { participantId: me.id, gameId: input.gameId } },
    create: {
      participantId: me.id,
      gameId: input.gameId,
      pickWinner: input.pickWinner,
      pickMargin: input.pickMargin,
    },
    update: {
      pickWinner: input.pickWinner,
      pickMargin: input.pickMargin,
    },
  });

  return { ok: true };
}
