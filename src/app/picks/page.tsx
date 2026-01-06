import { getActiveRoundWithGames } from "@/actions/leaderboard";
import PicksClient from "@/components/picks-client";
import { getSessionParticipant } from "@/lib/auth";
import  prisma  from "@/lib/prisma";

export default async function PicksPage() {
  const me = await getSessionParticipant();
  const round = await getActiveRoundWithGames();

  const myPicks = me && round
    ? await prisma.pick.findMany({
        where: { participantId: me.id, game: { roundId: round.id } },
      })
    : [];

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <PicksClient me={me} round={round} myPicks={myPicks} />
    </main>
  );
}
