import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Alchemille",
    template: "%s · Alchemille",
  },
  description:
    "Alchemille — a warm, contemplative companion for your daily practice and the window that follows it.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://alchemilleapp.vercel.app"
  ),
  applicationName: "Alchemille",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Alchemille",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#F4EFE3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${cormorant.variable}`}
        suppressHydrationWarning
      >
        <body className="font-sans min-h-screen bg-cream text-forest">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
