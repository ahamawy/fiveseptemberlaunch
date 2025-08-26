'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect based on role
        const redirectPath = data.role === 'admin' 
          ? '/admin/dashboard' 
          : '/investor-portal/dashboard';
        router.push(redirectPath);
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-mesh opacity-10 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-card/80 backdrop-blur-md rounded-lg shadow-xl p-8 border border-border">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <Logo size="lg" variant="full" className="mb-4" />
            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary border-input rounded focus:ring-primary"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
              </label>

              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Development Mode Notice */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Dev Mode:</strong> Use any email/password. Include "admin" in email for admin access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}