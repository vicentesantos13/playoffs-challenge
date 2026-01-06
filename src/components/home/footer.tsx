import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trophy, ShieldCheck } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 mx-auto max-w-5xl w-full">
      <Separator />
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">NFL PB League Challenge • By LG Marketing Virtual</p>
            <p className="text-xs text-muted-foreground">
              © {year} • Desenvolvido por{" "}
              <Link
                href={"https://github.com/vicentesantos13"}
                className="hover:underline"
              >
                Vicente Santos
              </Link>{" "}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3.5 w-3.5" />
              Playoffs Challenge
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Regras claras
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}
