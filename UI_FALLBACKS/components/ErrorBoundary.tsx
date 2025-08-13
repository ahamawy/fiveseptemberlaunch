import * as React from 'react';

type Props = { children: React.ReactNode; title?: string; onRetry?: () => void };

// Minimal shadcn-compatible button fallback
function FallbackButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium bg-equitie-purple text-white hover:bg-equitie-purple/90 active:scale-95 ' +
        (props.className || '')
      } />
  );
}

// Minimal shadcn-compatible card fallback
function FallbackCard(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={
        'rounded-xl border border-white/10 bg-[color:var(--elevated,#160F33)] p-4 shadow ' +
        (props.className || '')
      } />
  );
}

export class ErrorBoundary extends React.Component<Props, { hasError: boolean; error?: any }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) {
    if (typeof window !== 'undefined') console.error('ErrorBoundary', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <FallbackCard data-testid="error-state">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white font-semibold">{this.props.title || 'Something went wrong'}</h3>
              <p className="text-white/70 text-sm mt-1">{String(this.state.error?.message || 'Unknown error')}</p>
            </div>
            {this.props.onRetry && <FallbackButton onClick={this.props.onRetry}>Retry</FallbackButton>}
          </div>
        </FallbackCard>
      );
    }
    return this.props.children;
  }
}
