"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PortalSwitcher from "@/components/PortalSwitcher";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/deals", label: "Deals" },
    { href: "/admin/investors", label: "Investors" },
    { href: "/admin/transactions", label: "Transactions" },
    { href: "/admin/companies", label: "Companies" },
    { href: "/admin/formula-validation", label: "Formula Engine" },
    { href: "/admin/monitoring", label: "Monitoring" },
    { href: "/admin/api-docs", label: "API Docs" },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-mesh opacity-10 pointer-events-none" />
      <PortalSwitcher />
      <nav className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-lg font-semibold text-muted-foreground">Admin Portal</span>
            </div>
            <div className="flex gap-1">
              {links.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/20 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}




