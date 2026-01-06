import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trophy, ListChecks, HomeIcon, LayoutGrid, LogOut } from "lucide-react";
import { logoutAction } from "@/services/auth";
import { getActiveRoundWithGames } from "@/actions/leaderboard";

export async function HomeHeader() {
  const round = await getActiveRoundWithGames();
  const roundName = round ? round.name : null;

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {/* Title */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-semibold tracking-tight">
            NFL PB League Challenge
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            {roundName ? (
              <>
                Rodada ativa:{" "}
                <span className="font-medium text-foreground">{roundName}</span>
              </>
            ) : (
              "Nenhuma rodada ativa ainda (admin precisa ativar)."
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="w-full lg:w-auto">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-end">
            <Button asChild variant="secondary" className="gap-2 w-full lg:w-auto">
              <Link href="/">
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
            </Button>

            <Button asChild variant="secondary" className="gap-2 w-full lg:w-auto">
              <Link href="/picks">
                <ListChecks className="h-4 w-4" />
                Apostas
              </Link>
            </Button>

            <Button asChild variant="secondary" className="gap-2 w-full lg:w-auto">
              <Link href="/board">
                <LayoutGrid className="h-4 w-4" />
                Board
              </Link>
            </Button>

            <Button asChild variant="secondary" className="gap-2 w-full lg:w-auto">
              <Link href="/admin">
                <Trophy className="h-4 w-4" />
                Admin
              </Link>
            </Button>

            <form action={logoutAction} className="w-full lg:w-auto">
              <Button variant="secondary" type="submit" className="gap-2 w-full lg:w-auto">
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
