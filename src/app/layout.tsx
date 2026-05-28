import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "The Alchemille — The Post-Practice State",
    template: "%s · The Alchemille",
  },
  description:
    "The student app for The Post-Practice State. Practice. Window. Garden.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://alchemilleapp.vercel.app"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      {/*
        data-stage defaults to "albedo" — students who haven't started yet sit in cream+forest.
        Server reads the student's progress and rewrites data-stage to "nigredo" / "albedo" / "rubedo".
        See src/lib/stage.ts for the resolution logic.
      */}
      <html lang="en" data-stage="albedo" className={inter.variable}>
        <body className="font-sans min-h-screen antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
