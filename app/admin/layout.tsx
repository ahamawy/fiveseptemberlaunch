"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    { href: "/admin/formulas", label: "Formulas" },
    { href: "/admin/fees", label: "Fees" },
  ];

  return (
    <div className="min-h-screen bg-background-deep">
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-background-surface/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between">
            <div className="text-primary-300 font-semibold">Admin</div>
            <div className="flex gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    pathname?.startsWith(l.href)
                      ? "bg-primary-900/40 text-primary-200"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}

