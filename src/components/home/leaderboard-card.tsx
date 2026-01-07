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
      <p className="text-sm text-gray-200">
        Ainda não há pontuação (precisa de jogos finalizados).
      </p>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader >
          <TableRow className="">
            <TableHead className="w-18 text-gray-200">#</TableHead>
            <TableHead className="text-gray-200">Participante</TableHead>
            <TableHead className="text-right text-gray-200">Pontos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow key={r.participantId}>
              <TableCell className="font-medium text-gray-200">{idx + 1}</TableCell>
              <TableCell className="flex items-center gap-2">
                <span className="truncate text-gray-200">{r.name}</span>
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
              <TableCell className="text-right font-semibold text-gray-200">
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
    <Card className="bg-slate-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-gray-200">Leaderboard</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="total">
          <ScrollArea className="w-full">
            <TabsList className="w-max flex flex-nowrap gap-2 whitespace-nowrap bg-slate-900/40 border border-white/10 mx-auto">
              <TabsTrigger
                value="total"
                className="shrink-0 whitespace-nowrap data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow text-gray-200"
              >
                Geral
              </TabsTrigger>

              {byRound.map((r) => (
                <TabsTrigger
                  key={r.roundId}
                  value={r.roundId}
                  className="shrink-0 whitespace-nowrap data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow text-gray-200"
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
