"use client";

import { ExportButton } from "@/components/ui/ExportButton";

export default function TestExportPage() {
  const sampleData = [
    { id: 1, name: "SpaceX", value: 1000000, moic: 15.2 },
    { id: 2, name: "OpenAI", value: 500000, moic: 8.5 },
    { id: 3, name: "Figure AI", value: 750000, moic: 12.3 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Export Functionality</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Basic Export (CSV only)</h2>
          <ExportButton 
            data={sampleData}
            type="raw"
            showFormats={false}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Export with Format Options</h2>
          <ExportButton 
            data={sampleData}
            type="portfolio"
            showFormats={true}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Primary Button Style</h2>
          <ExportButton 
            data={sampleData}
            type="deals"
            variant="primary"
          />
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Sample Data:</h3>
        <pre className="text-xs mt-2">{JSON.stringify(sampleData, null, 2)}</pre>
      </div>
    </div>
  );
}