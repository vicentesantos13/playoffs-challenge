import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trophy, ListChecks, HomeIcon, LayoutGrid, LogOut } from "lucide-react";
import { logoutAction } from "@/services/auth";
import { getActiveRoundWithGames } from "@/actions/leaderboard";
import { getCurrentUser } from "@/services/admin";

export async function HomeHeader() {
  const round = await getActiveRoundWithGames();
  const roundName = round ? round.name : null;

  const user = await getCurrentUser();

  return (
    <header className=" top-0 z-40 border-b ">
      <div className="mx-auto max-w-5xl w-full px-4 pb-4 flex flex-col gap-3 ">
        {/* Title */}
        <div className="flex flex-col items-center  min-w-0">
          <div className="bg-[url('/assets/brand/nfl-pb-league-logo.png')] bg-contain bg-no-repeat bg-center w-40 h-60"></div>

          <div className="min-w-0">
            <h1 className="font-semibold leading-tight truncate text-white text-center text-3xl">
              NFL PB League Challenge
            </h1>
            <p className=" text-muted-foreground truncate text-center text-xl">
              {roundName ? (
                <>
                  Rodada ativa:{" "}
                  <span className="font-medium ">{roundName}</span>
                </>
              ) : (
                "Nenhuma rodada ativa (admin precisa ativar)."
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full lg:w-auto">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center">
            <Button
              asChild
              variant="secondary"
              className="gap-2 w-full lg:w-auto"
            >
              <Link href="/">
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
            </Button>

            {user && (
              <Button
                asChild
                variant="secondary"
                className="gap-2 w-full lg:w-auto"
              >
                <Link href="/picks">
                  <ListChecks className="h-4 w-4" />
                  Apostas
                </Link>
              </Button>
            )}

            {!user && (
              <Button
                asChild
                variant="secondary"
                className="gap-2 w-full lg:w-auto"
              >
                <Link href="/login">
                  Login
                </Link>
              </Button>
            )}



            <Button
              asChild
              variant="secondary"
              className="gap-2 w-full lg:w-auto"
            >
              <Link href="/board">
                <LayoutGrid className="h-4 w-4" />
                Board
              </Link>
            </Button>
            {user && user.isAdmin && (
              <Button
                asChild
                variant="secondary"
                className="gap-2 w-full lg:w-auto"
              >
                <Link href="/admin">
                  <Trophy className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}

            <form action={logoutAction} className="w-full lg:w-auto">
              <Button
                variant="secondary"
                type="submit"
                className="gap-2 w-full lg:w-auto"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Separator />
    </header>
  );
}
