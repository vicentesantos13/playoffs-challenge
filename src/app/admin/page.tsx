import { getSessionParticipant } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminClient } from "@/components/admin/admin-client";
import { getAllParticipants, getAllRounds } from "@/services/admin";

export default async function AdminPage() {
  const me = await getSessionParticipant();

  if (!me) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Você precisa entrar para acessar o admin.
            </p>
            <Button asChild>
              <Link href="/login">Ir para login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!me.isAdmin) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acesso negado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Seu usuário não é admin.
            </p>
            <Button asChild variant="secondary">
              <Link href="/">Voltar</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const rounds = await getAllRounds();
  const participants = await getAllParticipants()

  return (
    <main className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <AdminClient rounds={rounds}  participants={participants}/>
    </main>
  );
}
