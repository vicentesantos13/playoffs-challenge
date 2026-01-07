import { getActiveRoundWithGames, getLeaderboardAll} from "@/actions/leaderboard";
import { GamesCard } from "@/components/home/games-card";
import { LeaderboardCard } from "@/components/home/leaderboard-card";
import { EmptyState } from "@/components/home/empty-state";
import { getTeams } from "@/services/admin";

export default async function HomePage() {
  const round = await getActiveRoundWithGames();

  const { totalRows, byRound } = await getLeaderboardAll();

  const teams = await getTeams();

  return (
    <main className="container mx-auto max-w-5xl px- py-6 space-y-6">
      {!round ? (
        <div className="grid gap-4">
          <EmptyState
            title="Sem rodada ativa"
            description="Peça pro admin ativar uma rodada e cadastrar os jogos."
          />
          <LeaderboardCard totalRows={totalRows} byRound={byRound} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <GamesCard games={round.games} teams={teams}/>
          <LeaderboardCard totalRows={totalRows} byRound={byRound} />
        </div>
      )}
    </main>
  );
}
