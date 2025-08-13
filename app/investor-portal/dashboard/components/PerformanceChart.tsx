interface PerformanceChartProps {
  irr: number;
  moic: number;
  dpi: number;
  tvpi: number;
}

export default function PerformanceChart({ irr, moic, dpi, tvpi }: PerformanceChartProps) {
  const metrics = [
    { label: 'IRR', value: `${irr.toFixed(1)}%`, description: 'Internal Rate of Return' },
    { label: 'MOIC', value: `${moic.toFixed(2)}x`, description: 'Multiple on Invested Capital' },
    { label: 'DPI', value: `${dpi.toFixed(2)}x`, description: 'Distributions to Paid-In' },
    { label: 'TVPI', value: `${tvpi.toFixed(2)}x`, description: 'Total Value to Paid-In' },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="border-l-4 border-blue-500 pl-4">
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm font-medium text-gray-500">{metric.label}</div>
              <div className="text-xs text-gray-400">{metric.description}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="h-48 bg-gray-50 rounded flex items-center justify-center text-gray-400">
            Performance chart visualization would go here
          </div>
        </div>
      </div>
    </div>
  );
}