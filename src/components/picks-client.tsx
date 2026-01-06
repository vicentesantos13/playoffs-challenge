"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  MarginBucket,
  Game,
  Pick,
  Round,
  Participant,
} from "@/generated/prisma/client";
import { marginOptions } from "@/lib/scoring";

// Quando você reativar:
import { upsertPick } from "@/services/picks";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Clock, Lock, CheckCircle2 } from "lucide-react";

type Props = {
  me: Participant | null;
  round: (Round & { games: Game[] }) | null;
  myPicks: Pick[];
};

function formatDate(dt: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dt));
}

function gameStatusBadge(status: Game["status"]) {
  if (status === "FINAL") {
    return (
      <Badge className="gap-1">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Final
      </Badge>
    );
  }
  return <Badge variant="secondary">Agendado</Badge>;
}

function openBadge(locked: boolean) {
  return locked ? (
    <Badge variant="outline" className="gap-1">
      <Lock className="h-3.5 w-3.5" />
      Travado
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1">
      <Clock className="h-3.5 w-3.5" />
      Aberto
    </Badge>
  );
}

export default function PicksClient({ me, round, myPicks }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!me) router.replace("/login");
  }, [me, router]);
  

  const pickMap = useMemo(() => {
    const m = new Map<string, Pick>();
    myPicks.forEach((p) => m.set(p.gameId, p));
    return m;
  }, [myPicks]);

  const sortedGames = useMemo(() => {
    if (!round) return [];

    const now = new Date();

    const isLocked = (g: Game) => {
      const timeLocked = now >= new Date(g.lockAt);
      const finalLocked = g.status === "FINAL";
      return timeLocked || finalLocked;
    };

    return [...round.games].sort((a, b) => {
      const aLocked = isLocked(a);
      const bLocked = isLocked(b);

      // 1) abertos primeiro
      if (aLocked !== bLocked) return aLocked ? 1 : -1;

      // 2) por data (mais próximo -> mais longe)
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    });
  }, [round]);

  if (!round) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Minhas apostas
        </h1>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Sem rodada ativa</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Peça pro admin ativar uma rodada e cadastrar os jogos.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!me) {
    return null;
  }

  return (
    <div className="space-y-6 mx-auto max-w-5xl px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Minhas apostas
        </h1>
        <p className="text-sm text-muted-foreground">
          Rodada ativa:{" "}
          <span className="font-medium text-foreground">{round.name}</span>
        </p>
      </header>

      <Separator />

      <div className="grid gap-4">
        {sortedGames.map((g) => {
          const existing = pickMap.get(g.id);
          const timeLocked = new Date() >= new Date(g.lockAt);
          const finalLocked = g.status === "FINAL";
          const locked = timeLocked || finalLocked;

          const winnerLabel =
            existing?.pickWinner === "HOME"
              ? g.homeTeam
              : existing?.pickWinner === "AWAY"
              ? g.awayTeam
              : null;

          const marginLabel = existing?.pickMargin
            ? existing.pickMargin.replace("M", "").replace("30PLUS", "30+")
            : null;

          return (
            <Card key={g.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {g.homeTeam}{" "}
                      <span className="text-muted-foreground">vs</span>{" "}
                      {g.awayTeam}
                    </CardTitle>

                    <p className="text-xs text-muted-foreground">
                      Início: {formatDate(new Date(g.startAt))} • Lock:{" "}
                      {formatDate(new Date(g.lockAt))}
                    </p>

                    {g.status === "FINAL" &&
                    g.homeScore != null &&
                    g.awayScore != null ? (
                      <p className="text-sm">
                        Placar:{" "}
                        <span className="font-semibold">{g.homeScore}</span>{" "}
                        <span className="text-muted-foreground">x</span>{" "}
                        <span className="font-semibold">{g.awayScore}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {gameStatusBadge(g.status)}
                    {openBadge(locked)}
                    {existing ? (
                      <Badge variant="secondary" className="truncate">
                        Seu pick: {winnerLabel} / {marginLabel}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Sem pick</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Vencedor</Label>
                    <Select
                      disabled={locked || pending}
                      value={(existing?.pickWinner as string) ?? ""}
                      onValueChange={(val) => {
                        const pickWinner = val as "HOME" | "AWAY";
                        const pickMargin = (existing?.pickMargin ??
                          "M5") as MarginBucket;

                        startTransition(async () => {
                          await upsertPick({
                            gameId: g.id,
                            pickWinner,
                            pickMargin,
                          });
                          location.reload();
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o vencedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOME">{g.homeTeam}</SelectItem>
                        <SelectItem value="AWAY">{g.awayTeam}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Margem</Label>
                    <Select
                      disabled={locked || pending}
                      value={(existing?.pickMargin as string) ?? "M5"}
                      onValueChange={(val) => {
                        const pickMargin = val as MarginBucket;
                        const pickWinner = (existing?.pickWinner ?? "HOME") as
                          | "HOME"
                          | "AWAY";

                        startTransition(async () => {
                          await upsertPick({
                            gameId: g.id,
                            pickWinner,
                            pickMargin,
                          });
                          location.reload();
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a margem" />
                      </SelectTrigger>
                      <SelectContent>
                        {marginOptions.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            Margem {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {finalLocked ? (
                  <p className="text-xs text-muted-foreground">
                    Jogo finalizado — picks não podem mais ser alteradas.
                  </p>
                ) : locked ? (
                  <p className="text-xs text-muted-foreground">
                    Apostas travadas para este jogo.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Você pode editar até o horário de lock.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
