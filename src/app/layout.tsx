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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col `}
      >
        {/* fundo leve */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-slate-800" />

        <HomeHeader />

        <main className="flex-1">
          <div className="mx-auto max-w-5xl w-full px-4 py-6">{children}</div>
        </main>

        <Footer />
      </body>
    </html>
  );
}
