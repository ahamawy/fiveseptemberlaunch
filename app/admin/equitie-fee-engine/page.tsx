'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FeeHubBanner } from '@/components/admin/FeeHubBanner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Calculator,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  Download,
  Send
} from 'lucide-react';
import { formatCurrency } from '@/lib/theme-utils';

export default function EquitieFeeEnginePage() {
  const [activeTab, setActiveTab] = useState('calculate');
  const [dealId, setDealId] = useState('1');
  const [grossCapital, setGrossCapital] = useState('1000000');
  const [unitPrice, setUnitPrice] = useState('1000');
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateFees = async () => {
    setIsCalculating(true);
    try {
      const formData = new FormData();
      formData.append('message', `Calculate fees for deal ${dealId} with $${grossCapital} investment`);

      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.extractedData) {
        setCalculationResult(data.extractedData);
      }
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);

      // Process through chat API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message', 'Process this fee data');

      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.extractedData) {
        setImportResult(data.extractedData);
      }
    };
    reader.readAsText(file);
  };

  const validateSchedule = async () => {
    const formData = new FormData();
    formData.append('message', `Validate schedule for deal ${dealId}`);

    const response = await fetch('/api/admin/chat', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    setValidationResult(data);
  };

  return (
    <div className="min-h-screen bg-background-deep">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <FeeHubBanner />
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary-purple/20 to-primary-blue/20 backdrop-blur-sm">
              <Calculator className="w-8 h-8 text-primary-purple" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
                EQUITIE Fee Engine
              </h1>
              <p className="text-text-muted mt-1">
                Advanced fee calculation system with precedence ordering and validation
              </p>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-surface-elevated/50 backdrop-blur-sm">
            <TabsTrigger value="calculate" className="data-[state=active]:bg-primary-purple/20">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-primary-purple/20">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger value="validate" className="data-[state=active]:bg-primary-purple/20">
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate
            </TabsTrigger>
            <TabsTrigger value="report" className="data-[state=active]:bg-primary-purple/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Report
            </TabsTrigger>
          </TabsList>

          {/* Calculate Tab */}
          <TabsContent value="calculate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card className="bg-surface-elevated/50 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary-purple" />
                    Fee Calculation
                  </CardTitle>
                  <CardDescription>
                    Enter investment details to calculate fees with precedence ordering
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deal">Deal ID</Label>
                    <Input
                      id="deal"
                      type="number"
                      value={dealId}
                      onChange={(e) => setDealId(e.target.value)}
                      className="bg-background-deep/50 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gross">Gross Capital ($)</Label>
                    <Input
                      id="gross"
                      type="number"
                      value={grossCapital}
                      onChange={(e) => setGrossCapital(e.target.value)}
                      className="bg-background-deep/50 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit Price ($)</Label>
                    <Input
                      id="unit"
                      type="number"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      className="bg-background-deep/50 border-white/10"
                    />
                  </div>
                  <Button
                    onClick={calculateFees}
                    disabled={isCalculating}
                    className="w-full bg-gradient-to-r from-primary-purple to-primary-blue hover:opacity-90"
                  >
                    {isCalculating ? 'Calculating...' : 'Calculate Fees'}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Card */}
              <Card className="bg-surface-elevated/50 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success-light" />
                    Calculation Results
                  </CardTitle>
                  <CardDescription>
                    Fees applied in precedence order with basis calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculationResult ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-text-muted">Fee Breakdown</h4>
                        {calculationResult.state?.appliedFees?.map((fee: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-sm">
                              {idx + 1}. {fee.component}
                              <span className="text-xs text-text-muted ml-2">[{fee.basis}]</span>
                            </span>
                            <span className={`text-sm font-mono ${fee.amount < 0 ? 'text-error-light' : 'text-success-light'}`}>
                              {fee.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(fee.amount))}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-text-muted">Transfer Pre-Discount</span>
                          <span className="font-mono">{formatCurrency(calculationResult.transferPreDiscount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-text-muted">Total Discounts</span>
                          <span className="font-mono text-error-light">-{formatCurrency(calculationResult.totalDiscounts)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Transfer Post-Discount</span>
                          <span className="font-mono text-primary-purple">{formatCurrency(calculationResult.transferPostDiscount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-text-muted">Units Allocated</span>
                          <span className="font-mono">{calculationResult.units}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-text-muted">
                      <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Enter details and calculate to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card className="bg-surface-elevated/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary-purple" />
                  Import Fee Data
                </CardTitle>
                <CardDescription>
                  Upload CSV files with investor data or fee schedules for processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file">Upload CSV File</Label>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="bg-background-deep/50 border-white/10"
                  />
                </div>

                {csvContent && (
                  <div>
                    <Label htmlFor="preview">CSV Preview</Label>
                    <Textarea
                      id="preview"
                      value={csvContent.split('\n').slice(0, 5).join('\n')}
                      readOnly
                      className="bg-background-deep/50 border-white/10 font-mono text-xs h-32"
                    />
                  </div>
                )}

                {importResult && (
                  <Alert className="bg-success-dark/20 border-success-light/50">
                    <CheckCircle className="w-4 h-4 text-success-light" />
                    <AlertDescription>
                      Successfully processed {importResult.imported} records.
                      {importResult.preview?.length > 0 && (
                        <div className="mt-2">
                          Total Gross: {formatCurrency(
                            importResult.preview.reduce((sum: number, p: any) => sum + p.gross_capital, 0)
                          )}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Validate Tab */}
          <TabsContent value="validate" className="space-y-6">
            <Card className="bg-surface-elevated/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-purple" />
                  Schedule Validation
                </CardTitle>
                <CardDescription>
                  Validate fee schedules and check configuration integrity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    type="number"
                    value={dealId}
                    onChange={(e) => setDealId(e.target.value)}
                    placeholder="Deal ID"
                    className="bg-background-deep/50 border-white/10"
                  />
                  <Button
                    onClick={validateSchedule}
                    className="bg-gradient-to-r from-primary-purple to-primary-blue"
                  >
                    Validate Schedule
                  </Button>
                </div>

                {validationResult && (
                  <div className="space-y-4">
                    {validationResult.response && (
                      <Alert className={validationResult.response.includes('valid') ?
                        "bg-success-dark/20 border-success-light/50" :
                        "bg-error-dark/20 border-error-light/50"
                      }>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          <pre className="whitespace-pre-wrap text-sm">
                            {validationResult.response}
                          </pre>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-6">
            <Card className="bg-surface-elevated/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-purple" />
                  Fee Reports
                </CardTitle>
                <CardDescription>
                  Generate comprehensive fee reports with audit trails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-text-muted">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Fee reporting coming soon</p>
                  <Button variant="outline" className="border-primary-purple/50 text-primary-purple">
                    <Download className="w-4 h-4 mr-2" />
                    Export Sample Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="mt-8 bg-surface-elevated/30 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Quick Help</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2 text-primary-purple">Precedence Order</h4>
                <p className="text-text-muted">Fees are applied in strict order. PREMIUM always has precedence = 1.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-primary-purple">Basis Types</h4>
                <p className="text-text-muted">GROSS (original), NET (after premium), NET_AFTER_PREMIUM (for subsequent fees).</p>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-primary-purple">Discounts</h4>
                <p className="text-text-muted">Stored as negative amounts in the database for clear audit trails.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
