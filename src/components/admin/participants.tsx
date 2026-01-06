import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Participant } from "@/types/admin";
import { updateParticipantFlags } from "@/services/admin";

type Props = {
  people: Participant[];
  pending: boolean;
  startTransition: (arg0: () => Promise<void>) => void;
  setPeople: React.Dispatch<React.SetStateAction<Participant[]>>;
};

export const Participants = ({ people, pending, startTransition, setPeople }: Props) => {
  function updateLocal(id: string, patch: Partial<Participant>) {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  }
  return (
    <TabsContent value="participants" className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Participantes</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {people.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum participante ainda.
            </p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-30 text-center">Admin</TableHead>
                    <TableHead className="w-30 text-center">Pro</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {people.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>

                      <TableCell className="text-center">
                        <Checkbox
                          checked={!!p.isAdmin}
                          disabled={pending}
                          onCheckedChange={(checked) => {
                            const v = checked === true;

                            // otimista
                            //   updateLocal(p.id, { isAdmin: v });

                            startTransition(async () => {
                              await updateParticipantFlags({
                                participantId: p.id,
                                isAdmin: v,
                              });
                            });
                          }}
                        />
                      </TableCell>

                      <TableCell className="text-center">
                        <Checkbox
                          checked={!!p.isPro}
                          disabled={pending}
                          onCheckedChange={(checked) => {
                            const v = checked === true;

                            // otimista
                            updateLocal(p.id, { isPro: v });

                            startTransition(async () => {
                              await updateParticipantFlags({
                                participantId: p.id,
                                isPro: v,
                              });
                            });
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Dica: mudanças são salvas automaticamente ao marcar/desmarcar.
          </p>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
