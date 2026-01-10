"use client";

import { useState, useTransition } from "react";
import { updateGame } from "@/actions/admin";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Game } from "@/types/game";
import { Round } from "@/types/round";

function toDatetimeLocalValue(date: Date) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function EditGameDialog({
  game,
  rounds,
}: {
  game: Game & { roundName?: string };
  rounds: Round[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [roundId, setRoundId] = useState(game.roundId);
  const [homeTeam, setHomeTeam] = useState(game.homeTeam);
  const [awayTeam, setAwayTeam] = useState(game.awayTeam);
  const [startAt, setStartAt] = useState(toDatetimeLocalValue(game.startAt));

  function resetForm() {
    setRoundId(game.roundId);
    setHomeTeam(game.homeTeam);
    setAwayTeam(game.awayTeam);
    setStartAt(toDatetimeLocalValue(game.startAt));
  }

  const disabled = pending || game.status === "FINAL";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          disabled={game.status === "FINAL"}
        >
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar jogo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rodada</Label>
            <Select
              value={roundId}
              onValueChange={setRoundId}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a rodada" />
              </SelectTrigger>
              <SelectContent>
                {rounds.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.order}. {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Home</Label>
              <Input
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Away</Label>
              <Input
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Start</Label>
            <Input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={
              disabled ||
              !roundId ||
              !homeTeam.trim() ||
              !awayTeam.trim() ||
              !startAt
            }
            onClick={() => {
              startTransition(async () => {
                if (!startAt) return;
                const startAtISO = new Date(startAt).toISOString();
                await updateGame({
                  gameId: game.id,
                  roundId,
                  homeTeam,
                  awayTeam,
                  startAtISO,
                });
                setOpen(false);
                location.reload();
              });
            }}
          >
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
