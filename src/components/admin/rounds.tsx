import { startTransition } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TabsContent } from "../ui/tabs";
import { createRound, setActiveRound } from "@/actions/admin";

import { Game } from "@/types/game";
import { Round } from "@/types/round";

type RoundWithGames = Round & { games: Game[] };
type Props = {
  roundName: string;
  setRoundName: (name: string) => void;
  roundOrder: number;
  setRoundOrder: (order: number) => void;
  pending: boolean;
  rounds: RoundWithGames[];
};
export const Rounds = ({
  roundName,
  setRoundName,
  roundOrder,
  setRoundOrder,
  pending,
  rounds,
}: Props) => {
  return (
    <TabsContent value="rounds" className="space-y-4 mt-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Criar rodada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                placeholder="Ex: Wild Card"
              />
            </div>

            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={roundOrder}
                onChange={(e) => setRoundOrder(Number(e.target.value))}
                min={1}
              />
            </div>

            <Button
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  await createRound({
                    name: roundName,
                    order: roundOrder,
                  });
                  location.reload();
                });
              }}
            >
              {pending ? "Salvando..." : "Criar"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Rodadas cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rounds.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma rodada criada.
              </p>
            ) : (
              rounds.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {r.order}. {r.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.games.length} jogo(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.isActive ? (
                      <Badge>Ativa</Badge>
                    ) : (
                      <Badge variant="secondary">Inativa</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending || r.isActive}
                      onClick={() => {
                        startTransition(async () => {
                          await setActiveRound(r.id);
                          location.reload();
                        });
                      }}
                    >
                      Ativar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};
