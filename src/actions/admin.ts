"use server";

import {
  createGame as createGameSVC,
  createRound as createRoundSVC,
  finalizeGame as finalizeGameSVC,
  setActiveRound as setActiveRoundSVC,
  updateGame as updateGameSVC,
  deleteGame as deleteGameSVC,
} from "@/services/admin";

// Rodadas
export async function createRound(input: { name: string; order: number }) {
  return createRoundSVC(input);
}

export async function setActiveRound(roundId: string) {
  return setActiveRoundSVC(roundId);
}

// Jogos
export async function createGame(input: {
  roundId: string;
  homeTeam: string;
  awayTeam: string;
  startAtISO: string; // datetime-local
  lockAtISO: string; // datetime-local
}) {
  return createGameSVC(input);
}

export async function finalizeGame(input: {
  gameId: string;
  homeScore: number;
  awayScore: number;
}) {
  return finalizeGameSVC(input);
}

export async function updateGame(input: {
  gameId: string;
  roundId: string;
  homeTeam: string;
  awayTeam: string;
  startAtISO: string; // datetime-local
}) {
  return updateGameSVC(input);
}

export async function deleteGame(gameId: string) {
  return deleteGameSVC(gameId);
}
