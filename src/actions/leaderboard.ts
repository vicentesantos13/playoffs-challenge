import { getLeaderboard as getLeaderboardSVC, getActiveRoundWithGames as getActiveRoundWithGamesSVC, getLeaderboardAll as getLeaderboardAllSVC } from "../services/leaderboard"


export const  getLeaderboard = async (roundId?:string)=>{
 return await getLeaderboardSVC(roundId);
}

export const getActiveRoundWithGames = async ()=>{
    return await getActiveRoundWithGamesSVC()
}

export async function getLeaderboardAll() {
  return getLeaderboardAllSVC();
}