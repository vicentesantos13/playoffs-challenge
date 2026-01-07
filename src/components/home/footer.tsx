import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-slate-800">
      <div className="mx-auto max-w-5xl w-full px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NFL PB League Challenge • Desenvolvido
            por{" "}
            <Link href={"https://github.com/vicentesantos13"}>
              Vicente Santos
            </Link>
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <div className="bg-[url('/assets/brand/LG_MV_logo.png')] bg-contain bg-no-repeat bg-center w-20 h-20"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
