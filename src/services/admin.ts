/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/prisma";
import { getSessionParticipant, requireAdmin } from "@/lib/auth";
import { pointsForPick } from "@/lib/scoring";
import { Participant } from "@/types/admin";
import { cookies } from "next/headers";
import { MarginBucket } from "@/types/marginBucket";


const ALLOWED_MARGINS = ["M5", "M10", "M15", "M20", "M25PLUS"] as const;

function toAppMarginBucket(v: unknown): MarginBucket {
  const s = String(v);
  if (!ALLOWED_MARGINS.includes(s as any)) {
    throw new Error(`pickMargin inválido no banco: ${s}`);
  }
  return s as MarginBucket;
}

export async function createRound(input: { name: string; order: number }) {
  const me = await getSessionParticipant();
  requireAdmin(me);

  const name = input.name.trim();
  if (!name) throw new Error("Nome da rodada é obrigatório.");
  if (!Number.isFinite(input.order)) throw new Error("Order inválido.");

  await prisma.round.create({
    data: { name, order: input.order },
  });

  return { ok: true };
}

export async function getAllRounds() {
  return await prisma.round.findMany({
    orderBy: { order: "asc" },
    include: {
      games: { orderBy: { startAt: "asc" } },
    },
  });
}

export async function setActiveRound(roundId: string) {
  const me = await getSessionParticipant();
  requireAdmin(me);

  await prisma.$transaction([
    prisma.round.updateMany({ data: { isActive: false } }),
    prisma.round.update({ where: { id: roundId }, data: { isActive: true } }),
  ]);

  return { ok: true };
}

export async function createGame(input: {
  roundId: string;
  homeTeam: string;
  awayTeam: string;
  startAtISO: string; // vindo do input datetime-local
  lockAtISO: string; // idem
}) {
  const me = await getSessionParticipant();
  requireAdmin(me);

  const homeTeam = input.homeTeam.trim();
  const awayTeam = input.awayTeam.trim();
  if (!homeTeam || !awayTeam) throw new Error("Times são obrigatórios.");
  if (homeTeam === awayTeam) throw new Error("Times não podem ser iguais.");

  const startAt = new Date(input.startAtISO);
  const lockAt = new Date(input.lockAtISO);

  if (Number.isNaN(startAt.getTime())) throw new Error("startAt inválido.");
  if (Number.isNaN(lockAt.getTime())) throw new Error("lockAt inválido.");
  if (lockAt > startAt)
    throw new Error("lockAt não pode ser depois do startAt.");

  await prisma.game.create({
    data: {
      roundId: input.roundId,
      homeTeam,
      awayTeam,
      startAt,
      lockAt,
      status: "SCHEDULED",
    },
  });

  return { ok: true };
}

export async function finalizeGame(input: {
  gameId: string;
  homeScore: number;
  awayScore: number;
}) {
  const me = await getSessionParticipant();
  requireAdmin(me);

  if (!Number.isFinite(input.homeScore) || input.homeScore < 0)
    throw new Error("homeScore inválido.");
  if (!Number.isFinite(input.awayScore) || input.awayScore < 0)
    throw new Error("awayScore inválido.");

  const game = await prisma.game.findUnique({
    where: { id: input.gameId },
    include: { picks: true },
  });
  if (!game) throw new Error("Jogo não encontrado.");

  await prisma.game.update({
    where: { id: input.gameId },
    data: {
      homeScore: input.homeScore,
      awayScore: input.awayScore,
      status: "FINAL",
    },
  });

  const updates = game.picks.map((p) => {
    const res = pointsForPick({
      pickWinner: p.pickWinner as "HOME" | "AWAY",
      // ✅ converte do enum do Prisma -> seu type local
      pickMargin: toAppMarginBucket(p.pickMargin),
      homeScore: input.homeScore,
      awayScore: input.awayScore,
    });

    return prisma.pick.update({
      where: { id: p.id },
      data: {
        winnerCorrect: res.winnerCorrect,
        marginCorrect: res.marginCorrect,
        points: res.points,
      },
    });
  });

  await prisma.$transaction(updates);
  return { ok: true };
}

export async function updateGame(input: {
  gameId: string;
  roundId: string;
  homeTeam: string;
  awayTeam: string;
  startAtISO: string;
}) {
  const me = await getSessionParticipant();
  requireAdmin(me);

  const homeTeam = input.homeTeam.trim();
  const awayTeam = input.awayTeam.trim();

  if (!input.gameId) throw new Error("gameId é obrigatório.");
  if (!input.roundId) throw new Error("roundId é obrigatório.");
  if (!homeTeam || !awayTeam) throw new Error("Times são obrigatórios.");
  if (homeTeam === awayTeam) throw new Error("Times não podem ser iguais.");

  const startAt = new Date(input.startAtISO);
  if (Number.isNaN(startAt.getTime())) throw new Error("startAt inválido.");

  const game = await prisma.game.findUnique({ where: { id: input.gameId } });
  if (!game) throw new Error("Jogo não encontrado.");

  // regra: não editar se já finalizou
  if (game.status === "FINAL")
    throw new Error("Não é possível editar um jogo FINAL.");

  // lock = start (trava quando começa)
  const lockAt = startAt;

  await prisma.game.update({
    where: { id: input.gameId },
    data: {
      roundId: input.roundId,
      homeTeam,
      awayTeam,
      startAt,
      lockAt,
    },
  });

  return { ok: true };
}

export async function deleteGame(gameId: string) {
  const me = await getSessionParticipant();
  requireAdmin(me);

  if (!gameId) throw new Error("gameId é obrigatório.");

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { picks: { select: { id: true } } },
  });

  if (!game) throw new Error("Jogo não encontrado.");

  // regra: não deletar se FINAL (evita bagunça de pontuação)
  if (game.status === "FINAL")
    throw new Error("Não é possível apagar um jogo FINAL.");

  // apaga picks primeiro (se não tiver cascade no schema)
  await prisma.$transaction([
    prisma.pick.deleteMany({ where: { gameId } }),
    prisma.game.delete({ where: { id: gameId } }),
  ]);

  return { ok: true };
}

export async function getAllParticipants(): Promise<Participant[]> {
  return await prisma.participant.findMany({
    select: {
      id: true,
      name: true,
      isAdmin: true,
      isPro: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function updateParticipantFlags(input: {
  participantId: string;
  isAdmin?: boolean;
  isPro?: boolean;
}) {
  const { participantId, ...data } = input;

  await prisma.participant.update({
    where: { id: participantId },
    data,
  });

  return { ok: true };
}


export async function getTeams(){
  return await prisma.teams.findMany({});
}

export async function getCurrentUser() {
  const c = cookies();
  const participantId = (await c).get("pc_pid")?.value; // ou como você salva
  if (!participantId) return null;

  return prisma.participant.findUnique({
    where: { id: participantId },
    select: { id: true, name: true, isAdmin: true },
  });
}