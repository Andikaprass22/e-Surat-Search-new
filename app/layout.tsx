import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { Agentation } from "agentation";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "e-Surat Search",
  description:
    "Aplikasi pencarian dokumen dan surat berbasis TF-IDF untuk organisasi internal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
          {children}
          {process.env.NODE_ENV === "development" && <Agentation />}
        </TooltipProvider>
      </body>
    </html>
  );
}
