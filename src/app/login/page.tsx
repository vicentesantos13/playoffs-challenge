import { redirect } from "next/navigation";
import { getSessionParticipant } from "@/lib/auth";
import { loginAction } from "@/services/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const me = await getSessionParticipant();
  if (me) redirect("/"); // se já estiver logado, manda pra home

  return (
    <main className="container mx-auto max-w-md px-4 py-10">
      <Card className="bg-slate-700 text-gray-200">
        <CardHeader>
          <CardTitle className="text-base">Entrar no Playoffs Challenge</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" placeholder="Seu nome no grupo" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                name="pin"
                placeholder="Mínimo 4 dígitos"
                required
              />
              <p className="text-xs text-muted-foreground">
                Se o seu nome ainda não existir, vamos criar automaticamente.
              </p>
            </div>

            <Button type="submit" className="w-full" variant={"secondary"}>
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
