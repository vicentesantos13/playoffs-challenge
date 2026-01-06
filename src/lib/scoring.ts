import { MarginBucket } from "@/generated/prisma/enums";


export function diffToBucket(diff: number): MarginBucket {
  const d = Math.abs(diff);

  if (d >= 30) return "M30PLUS";
  if (d <= 0) return "M5"; // playoffs raramente empata; fallback

  // arredonda pra cima para múltiplo de 5
  const rounded = Math.ceil(d / 5) * 5;

  switch (rounded) {
    case 5: return "M5";
    case 10: return "M10";
    case 15: return "M15";
    case 20: return "M20";
    case 25: return "M25";
    case 30: return "M30";
    default: return "M30PLUS";
  }
}

export function winnerSide(homeScore: number, awayScore: number): "HOME" | "AWAY" {
  return homeScore >= awayScore ? "HOME" : "AWAY";
}

function isSuperBowlRound(name?: string) {
  return (name ?? "").trim().toLowerCase() === "super bowl";
}

export function pointsForPick(args: {
  pickWinner: "HOME" | "AWAY";
  pickMargin: MarginBucket;
  homeScore: number;
  awayScore: number;
  roundName?:string;
}): { winnerCorrect: boolean; marginCorrect: boolean; points: number; realBucket: MarginBucket; realWinner: "HOME" | "AWAY" } {
  const realWinner = winnerSide(args.homeScore, args.awayScore);
  const realBucket = diffToBucket(args.homeScore - args.awayScore);

  const winnerCorrect = args.pickWinner === realWinner;
  const marginCorrect = winnerCorrect && args.pickMargin === realBucket;
  const basePoints = (winnerCorrect ? 1 : 0) + (marginCorrect ? 1 : 0);
  const multiplier = isSuperBowlRound(args.roundName) ? 2 : 1;

  const points = basePoints * multiplier;

  return { winnerCorrect, marginCorrect, points, realBucket, realWinner };
}

export const marginOptions: { label: string; value: MarginBucket }[] = [
  { label: "5", value: "M5" },
  { label: "10", value: "M10" },
  { label: "15", value: "M15" },
  { label: "20", value: "M20" },
  { label: "25", value: "M25" },
  { label: "30", value: "M30" },
  { label: "30+", value: "M30PLUS" },
];
