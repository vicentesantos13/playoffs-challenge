import { getActiveRoundWithGames } from "@/actions/leaderboard";
import PicksClient from "@/components/picks-client";
import { getSessionParticipant } from "@/lib/auth";
import { getTeams } from "@/services/admin";
import { getMyPicks } from "@/services/picks";

export default async function PicksPage() {
  const me = await getSessionParticipant();
  const round = await getActiveRoundWithGames();

  const teams = await getTeams();

  const myPicks = await getMyPicks()

  return (
    <main>
      <PicksClient me={me} round={round} myPicks={myPicks} teams={teams} />
    </main>
  );
}
