import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />
      <div className="text-center space-y-8 px-6">
        <h1 className="text-5xl md:text-6xl font-bold mx-auto max-w-3xl">
          <span className="text-gradient bg-gradient-hero animate-gradient">EquiTie</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">A modern investor portal for portfolios, deals, and performance.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/investor-portal/dashboard">
            <Button variant="gradient" size="lg" glow>
              Investor Portal
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="glass" size="lg">
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}