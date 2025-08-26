import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DevTools } from "@/components/DevTools";
import { DevToolbar } from "@/components/dev/DevToolbar";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { HealthBanner } from "@/components/dev/HealthBanner";

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EquiTie Investor Portal",
  description: "Institutional-grade investment portfolio management platform",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  themeColor: '#8B5CF6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans bg-background text-foreground min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="dark" storageKey="equitie-theme">
          <ErrorBoundary>
            <HealthBanner />
            {children}
            <DevTools />
            <DevToolbar />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
