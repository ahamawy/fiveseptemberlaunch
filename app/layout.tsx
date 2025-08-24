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
  description: "Manage your investment portfolio",
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
