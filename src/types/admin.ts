import { MarginBucket } from "./marginBucket";

export type Participant = {
  id: string;
  name: string;
  isAdmin: boolean;
  isPro: boolean;
};

export type Team = {
  id: string;
  name: string;
  logo: string;
};

export type Pick = {
    id: string;
    participantId: string;
    gameId: string;
    pickWinner: string;
    pickMargin: MarginBucket;
    winnerCorrect: boolean;
    marginCorrect: boolean;
    points: number;
    createdAt: Date;
    updatedAt: Date;
}
