"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { marginOptions } from "@/lib/scoring";
import { upsertPick } from "@/services/picks";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import { Game } from "@/types/game";
import { Round } from "@/types/round";
import { MarginBucket } from "@/types/marginBucket";
import {Participant, Team, Pick} from "@/types/admin"

import { Clock, Lock, CheckCircle2 } from "lucide-react";

type Props = {
  me: Participant | null;
  round: (Round & { games: Game[] }) | null;
  myPicks: Pick[];
  teams?: Team[]; // <- passe do server (ideal)
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
    <Badge variant="outline" className="gap-1 text-gray-200">
      <Lock className="h-3.5 w-3.5" />
      Travado
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 text-gray-200">
      <Clock className="h-3.5 w-3.5" />
      Aberto
    </Badge>
  );
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

function TeamInline({
  name,
  logo,
  size = "sm",
}: {
  name: string;
  logo?: string | null;
  size?: "sm" | "md";
}) {
  const cls = size === "md" ? "h-7 w-7" : "h-6 w-6";
  return (
    <span className="flex items-center gap-2 min-w-0">
      <Avatar className={`${cls} shrink-0`}>
        <AvatarImage src={logo ?? ""} alt={name} />
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="truncate text-gray-200">{name}</span>
    </span>
  );
}

export default function PicksClient({ me, round, myPicks, teams = [] }: Props) {
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

  const teamsByName = useMemo(() => {
    const m = new Map<string, Team>();
    teams.forEach((t) => m.set(norm(t.name), t));
    return m;
  }, [teams]);

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

      // abertos primeiro
      if (aLocked !== bLocked) return aLocked ? 1 : -1;

      // mais próximo -> mais longe
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    });
  }, [round]);

  if (!round) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Minhas apostas</h1>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Sem rodada ativa</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-200">
            Peça pro admin ativar uma rodada e cadastrar os jogos.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="space-y-6 mx-auto max-w-5xl px-2 py-3">
      <header className="space-y-1 flex flex-col items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-200">
          Minhas apostas
        </h1>
        <p className="text-sm text-muted-foreground">
          Rodada ativa: <span className="font-medium">{round.name}</span>
        </p>
      </header>

      <div className="grid gap-4">
        {sortedGames.map((g) => {
          const existing = pickMap.get(g.id);

          const timeLocked = new Date() >= new Date(g.lockAt);
          const finalLocked = g.status === "FINAL";
          const locked = timeLocked || finalLocked;

          const homeTeam = teamsByName.get(norm(g.homeTeam));
          const awayTeam = teamsByName.get(norm(g.awayTeam));

          const winnerLabel =
            existing?.pickWinner === "HOME"
              ? g.homeTeam
              : existing?.pickWinner === "AWAY"
              ? g.awayTeam
              : null;

          const marginLabel = existing?.pickMargin
            ? existing.pickMargin.replace("M", "").replace("30PLUS", "30+")
            : null;

          const setWinner = (pickWinner: "HOME" | "AWAY") => {
            const pickMargin = (existing?.pickMargin ?? "M5") as MarginBucket;

            startTransition(async () => {
              await upsertPick({ gameId: g.id, pickWinner, pickMargin });
              location.reload();
            });
          };

          const setMargin = (pickMargin: MarginBucket) => {
            const pickWinner = (existing?.pickWinner ?? "HOME") as
              | "HOME"
              | "AWAY";

            startTransition(async () => {
              await upsertPick({ gameId: g.id, pickWinner, pickMargin });
              location.reload();
            });
          };

          return (
            <Card key={g.id} className="bg-slate-500">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1 min-w-0">
                    {/* título com logos */}
                    <CardTitle className="text-base">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">

                        {awayTeam ? (
                          <TeamInline name={awayTeam.name} logo={awayTeam.logo} size="md" />
                        ) : (
                          <span className="font-medium truncate text-gray-200">{g.awayTeam}</span>
                        )}
                        <span className="text-gray-200 shrink-0">@</span>

                        {homeTeam ? (
                          <TeamInline name={homeTeam.name} logo={homeTeam.logo} size="md" />
                        ) : (
                          <span className="font-medium truncate text-gray-200">{g.homeTeam}</span>
                        )}
                      </div>
                    </CardTitle>

                    <p className="text-xs text-gray-200">
                      Início: {formatDate(new Date(g.startAt))} • Lock:{" "}
                      {formatDate(new Date(g.lockAt))}
                    </p>

                    {g.status === "FINAL" &&
                    g.homeScore != null &&
                    g.awayScore != null ? (
                      <p className="text-sm">
                        Placar:{" "}
                        <span className="font-semibold text-gray-200">{g.homeScore}</span>{" "}
                        <span className="text-gray-200">x</span>{" "}
                        <span className="font-semibold text-gray-200">{g.awayScore}</span>
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
                <div className="flex items-center gap-4">
                  {/* VENCEDOR (CHECKBOXES COM LOGO) */}
                  <div className="space-y-2">
                    <Label className="text-gray-200">Vencedor</Label>

                    <div className="grid grid-cols-2 gap-3">

                      {/* AWAY */}
                      <label
                        className={[
                          "flex items-center gap-2 rounded-md border px-3 py-2 select-none",
                          existing?.pickWinner === "AWAY"
                            ? "border-primary bg-primary/10"
                            : "border-border",
                          locked || pending
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer hover:bg-muted/40",
                        ].join(" ")}
                      >
                        <Checkbox
                          disabled={locked || pending}
                          checked={existing?.pickWinner === "AWAY"}
                          onCheckedChange={(checked) => {
                            if (locked || pending) return;
                            if (checked !== true) return; // mantém 1 marcado
                            setWinner("AWAY");
                          }}
                        />

                        {awayTeam ? (
                          <TeamInline name={awayTeam.name} logo={awayTeam.logo} />
                        ) : (
                          <span className="truncate">{g.awayTeam}</span>
                        )}
                      </label>
                      {/* HOME */}
                      <label
                        className={[
                          "flex items-center gap-2 rounded-md border px-3 py-2 select-none",
                          existing?.pickWinner === "HOME"
                            ? "border-primary bg-primary/10"
                            : "border-border",
                          locked || pending
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer hover:bg-muted/40",
                        ].join(" ")}
                      >
                        <Checkbox
                          disabled={locked || pending}
                          checked={existing?.pickWinner === "HOME"}
                          onCheckedChange={(checked) => {
                            if (locked || pending) return;
                            if (checked !== true) return; // mantém 1 marcado
                            setWinner("HOME");
                          }}
                        />

                        {homeTeam ? (
                          <TeamInline name={homeTeam.name} logo={homeTeam.logo} />
                        ) : (
                          <span className="truncate">{g.homeTeam}</span>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* MARGEM (SELECT) */}
                  <div className="space-y-2">
                    <Label className="text-gray-200">Margem</Label>
                    <Select
                      disabled={locked || pending}
                      value={(existing?.pickMargin as string) ?? "M5"}
                      onValueChange={(val) => setMargin(val as MarginBucket)}
                    >
                      <SelectTrigger className="text-gray-200">
                        <SelectValue placeholder="Selecione a margem" className="text-gray-200" />
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
                  <p className="text-xs text-gray-200">
                    Jogo finalizado — picks não podem mais ser alteradas.
                  </p>
                ) : locked ? (
                  <p className="text-xs text-gray-200">
                    Apostas travadas para este jogo.
                  </p>
                ) : (
                  <p className="text-xs text-gray-200">
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
