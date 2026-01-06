import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HomeHeader } from "@/components/home/home-header";
import { Footer } from "@/components/home/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NFL PB League Challenge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Container único para manter tudo alinhado */}
        <div className="flex-1 w-full">
          <div className="mx-auto max-w-5xl w-full px-4">
            {/* Header */}
            <div className="pt-6">
              <HomeHeader />
            </div>

            {/* Conteúdo */}
            <main className="py-6">{children}</main>
          </div>
        </div>

        {/* Footer sempre no fundo */}
        <Footer />
      </body>
    </html>
  );
}
