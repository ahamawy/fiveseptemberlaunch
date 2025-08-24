import { Card, CardContent } from "@/components/ui/Card";
import {
  formatCurrency,
  formatPercentage,
  getStatusColor,
} from "@/lib/theme-utils";
import {
  ChevronRightIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
// Temporary type until contracts are restored
type PortfolioDeal = any;

interface DealCardProps {
  deal: PortfolioDeal;
  onNavigate?: (dealId: number) => void;
  investorId?: string;
  variant?: "compact" | "detailed";
}

export function DealCard({
  deal,
  onNavigate,
  investorId,
  variant = "compact",
}: DealCardProps) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(deal.dealId);
    } else {
      const url = `/investor-portal/deals/${deal.dealId}${
        investorId ? `?investor=${investorId}` : ""
      }`;
      window.location.href = url;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-success-500/20 text-success-400 border-success-400/30",
      exited: "bg-info-500/20 text-info-400 border-info-400/30",
      written_off: "bg-error-500/20 text-error-400 border-error-400/30",
    };
    return (
      styles[status as keyof typeof styles] ||
      "bg-neutral-500/20 text-neutral-400 border-neutral-400/30"
    );
  };

  const getTrendIcon = () => {
    if (deal.irr > 15) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-success-400" />;
    } else if (deal.irr < 0) {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-error-400" />;
    }
    return null;
  };

  if (variant === "detailed") {
    return (
      <Card
        variant="glass"
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={handleClick}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary-300 transition-colors">
                {deal.dealName}
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                {deal.companyName}
                {deal.sector && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-surface-hover text-xs">
                    {deal.sector}
                  </span>
                )}
              </p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-text-tertiary group-hover:text-primary-300 transition-colors" />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-text-tertiary">Committed</p>
              <p className="text-sm font-medium text-text-primary">
                {formatCurrency(deal.committed, deal.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Current Value</p>
              <p className="text-sm font-medium text-text-primary">
                {formatCurrency(deal.currentValue, deal.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">IRR</p>
              <div className="flex items-center gap-1">
                <p
                  className={`text-sm font-medium ${
                    getStatusColor(deal.irr).text
                  }`}
                >
                  {formatPercentage(deal.irr)}
                </p>
                {getTrendIcon()}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">MOIC</p>
              <p className="text-sm font-medium text-text-primary">
                {deal.moic.toFixed(2)}x
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                  deal.status
                )}`}
              >
                {deal.status}
              </span>
              {deal.documentsCount && deal.documentsCount > 0 && (
                <div className="flex items-center gap-1 text-text-tertiary">
                  <DocumentTextIcon className="w-4 h-4" />
                  <span className="text-xs">{deal.documentsCount}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-text-tertiary capitalize">
              {deal.dealType === "fund"
                ? "Partnership"
                : deal.dealType.replace("_", " ")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact variant
  return (
    <Card
      variant="gradient"
      className="hover:shadow-lg transition-all cursor-pointer group"
      onClick={handleClick}
    >
      <CardContent>
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-text-primary group-hover:text-primary-300 transition-colors">
            {deal.dealName}
          </h4>
          <p className="text-xs text-text-secondary">
            {deal.companyName}
            <span className="ml-2 px-2 py-0.5 rounded-full border border-white/10 text-[10px] uppercase tracking-wide text-white/70">
              {deal.dealType === "fund" ? "Partnership" : deal.dealType}
            </span>
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-tertiary">Committed:</span>
            <span className="font-medium text-text-primary">
              {formatCurrency(deal.committed, deal.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Current Value:</span>
            <span className="font-medium text-text-primary">
              {formatCurrency(deal.currentValue, deal.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">IRR:</span>
            <span className={`font-medium ${getStatusColor(deal.irr).text}`}>
              {formatPercentage(deal.irr)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">MOIC:</span>
            <span className="font-medium text-text-primary">
              {deal.moic.toFixed(2)}x
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
              deal.status
            )}`}
          >
            {deal.status}
          </span>
          <ChevronRightIcon className="w-4 h-4 text-text-tertiary group-hover:text-primary-300 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
