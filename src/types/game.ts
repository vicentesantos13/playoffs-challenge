export type Game = {
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
}