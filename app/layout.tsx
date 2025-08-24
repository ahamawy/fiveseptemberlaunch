import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DevTools } from "@/components/DevTools";
import { DevToolbar } from "@/components/dev/DevToolbar";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { HealthBanner } from "@/components/dev/HealthBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Equitie Investor Portal",
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
        className={`${inter.className} bg-background-deep text-text-primary min-h-screen`}
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
