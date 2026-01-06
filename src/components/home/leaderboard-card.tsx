import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Crown, DollarSign } from "lucide-react";

type Row = {
  participantId: string;
  name: string;
  points: number;
  isPro: boolean;
};

type RoundBlock = {
  roundId: string;
  roundName: string;
  rows: Row[];
};

type Props = {
  totalRows: Row[];
  byRound: RoundBlock[];
};

function LeaderTable({ rows }: { rows: Row[] }) {
  const topId = rows[0]?.participantId;

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ainda não há pontuação (precisa de jogos finalizados).
      </p>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-18">#</TableHead>
            <TableHead>Participante</TableHead>
            <TableHead className="text-right">Pontos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow key={r.participantId}>
              <TableCell className="font-medium">{idx + 1}</TableCell>
              <TableCell className="flex items-center gap-2">
                <span className="truncate">{r.name}</span>
                {r.participantId === topId ? (
                  <Badge className="gap-1">
                    <Crown className="h-3.5 w-3.5" />
                    Líder
                  </Badge>
                ) : null}
                {r.isPro ? (
                  <Badge
                    variant="outline"
                    className="uppercase bg-green-600 text-white"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    PRO
                  </Badge>
                ) : null}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {r.points}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function LeaderboardCard({ totalRows, byRound }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Leaderboard</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="total">
          <ScrollArea className="w-full">
            <TabsList className="w-max flex flex-nowrap gap-2 whitespace-nowrap">
              <TabsTrigger value="total" className="shrink-0 whitespace-nowrap">
                Geral
              </TabsTrigger>

              {byRound.map((r) => (
                <TabsTrigger
                  key={r.roundId}
                  value={r.roundId}
                  className="shrink-0 whitespace-nowrap"
                >
                  {r.roundName}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="total" className="mt-4">
            <LeaderTable rows={totalRows} />
          </TabsContent>

          {byRound.map((r) => (
            <TabsContent key={r.roundId} value={r.roundId} className="mt-4">
              <LeaderTable rows={r.rows} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
