'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlusIcon, BeakerIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface FormulaTemplate {
  id: number;
  formula_code: string;
  formula_name: string;
  description: string;
  nc_formula: string;
  investor_proceeds_formula: string;
  investor_proceeds_discount_formula: string;
  eq_proceeds_formula?: string;
  eq_proceeds_discount_formula?: string;
  has_dual_mgmt_fee: boolean;
  has_premium: boolean;
  has_structuring: boolean;
  has_other_fees: boolean;
  is_active: boolean;
}

export default function FormulaManagerPage() {
  const [formulas, setFormulas] = useState<FormulaTemplate[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<FormulaTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testVariables, setTestVariables] = useState<Record<string, number>>({
    GC: 1000000,
    NC: 950000,
    PMSP: 100,
    ISP: 105,
    EUP: 150,
    IUP: 105,
    MFR: 0.02,
    SFR: 0.03,
    PFR: 0.20,
    AF: 5000,
    T: 5,
    DMFR: 0.10,
    DSFR: 0.10,
    DAF: 0.10,
    DPFR: 0.10
  });

  useEffect(() => {
    fetchFormulas();
  }, []);

  const fetchFormulas = async () => {
    try {
      const response = await fetch('/api/admin/formulas');
      const data = await response.json();
      if (data.success) {
        setFormulas(data.data);
      }
    } catch (e: unknown) {
      console.error('Error fetching formulas:', e);
    } finally {
      setLoading(false);
    }
  };

  const testFormula = async (formula: string) => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/admin/formulas/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formula,
          variables: testVariables
        })
      });
      const result = await response.json();
      setTestResult(result);
    } catch (e: unknown) {
      console.error('Error testing formula:', e);
      const message = e instanceof Error ? e.message : String(e);
      setTestResult({ success: false, error: message });
    } finally {
      setIsTesting(false);
    }
  };

  const saveFormula = async () => {
    if (!selectedFormula) return;
    
    try {
      const url = selectedFormula.id 
        ? `/api/admin/formulas/${selectedFormula.id}`
        : '/api/admin/formulas';
      
      const method = selectedFormula.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedFormula)
      });
      
      const result = await response.json();
      if (result.success) {
        await fetchFormulas();
        setSelectedFormula(null);
        setIsEditing(false);
      }
    } catch (e: unknown) {
      console.error('Error saving formula:', e);
    }
  };

  const deleteFormula = async (id: number) => {
    if (!confirm('Are you sure you want to delete this formula?')) return;
    
    try {
      const response = await fetch(`/api/admin/formulas/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchFormulas();
      }
    } catch (e: unknown) {
      console.error('Error deleting formula:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading formulas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Formula Manager</h1>
            <p className="mt-2 text-muted-foreground">Manage deal economics formulas</p>
          </div>
          <Button
            onClick={() => {
              setSelectedFormula({
                id: 0,
                formula_code: '',
                formula_name: '',
                description: '',
                nc_formula: '',
                investor_proceeds_formula: '',
                investor_proceeds_discount_formula: '',
                has_dual_mgmt_fee: false,
                has_premium: false,
                has_structuring: true,
                has_other_fees: false,
                is_active: true
              });
              setIsEditing(true);
            }}
            variant="primary"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Formula
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formula List */}
          <div className="lg:col-span-1">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Formula Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formulas.map((formula) => (
                    <div
                      key={formula.id}
                      onClick={() => {
                        setSelectedFormula(formula);
                        setIsEditing(false);
                        setTestResult(null);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFormula?.id === formula.id
                          ? 'bg-primary-500/20 border border-primary-400'
                          : 'bg-card hover:bg-muted'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-foreground">{formula.formula_name}</div>
                          <div className="text-sm text-muted-foreground">{formula.formula_code}</div>
                        </div>
                        {formula.is_active ? (
                          <CheckCircleIcon className="w-5 h-5 text-success-400" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-error-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formula Details */}
          <div className="lg:col-span-2">
            {selectedFormula ? (
              <Card variant="glass">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{isEditing ? 'Edit Formula' : 'Formula Details'}</CardTitle>
                    <div className="flex space-x-2">
                      {!isEditing && (
                        <>
                          <Button
                            onClick={() => setIsEditing(true)}
                            variant="glass"
                            size="sm"
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteFormula(selectedFormula.id)}
                            variant="glass"
                            size="sm"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                      {isEditing && (
                        <>
                          <Button
                            onClick={saveFormula}
                            variant="primary"
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setIsEditing(false);
                              if (!selectedFormula.id) {
                                setSelectedFormula(null);
                              }
                            }}
                            variant="glass"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Formula Code
                        </label>
                        <input
                          type="text"
                          value={selectedFormula.formula_code}
                          onChange={(e) => setSelectedFormula({
                            ...selectedFormula,
                            formula_code: e.target.value
                          })}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Formula Name
                        </label>
                        <input
                          type="text"
                          value={selectedFormula.formula_name}
                          onChange={(e) => setSelectedFormula({
                            ...selectedFormula,
                            formula_name: e.target.value
                          })}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Formulas */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Net Capital Formula
                        </label>
                        <div className="relative">
                          <textarea
                            value={selectedFormula.nc_formula}
                            onChange={(e) => setSelectedFormula({
                              ...selectedFormula,
                              nc_formula: e.target.value
                            })}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground font-mono text-sm disabled:opacity-50"
                            rows={2}
                          />
                          <Button
                            onClick={() => testFormula(selectedFormula.nc_formula)}
                            variant="glass"
                            size="sm"
                            className="absolute right-2 top-2"
                          >
                            <BeakerIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Investor Proceeds Formula
                        </label>
                        <div className="relative">
                          <textarea
                            value={selectedFormula.investor_proceeds_formula}
                            onChange={(e) => setSelectedFormula({
                              ...selectedFormula,
                              investor_proceeds_formula: e.target.value
                            })}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground font-mono text-sm disabled:opacity-50"
                            rows={3}
                          />
                          <Button
                            onClick={() => testFormula(selectedFormula.investor_proceeds_formula)}
                            variant="glass"
                            size="sm"
                            className="absolute right-2 top-2"
                          >
                            <BeakerIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Investor Proceeds (Post-Discount) Formula
                        </label>
                        <div className="relative">
                          <textarea
                            value={selectedFormula.investor_proceeds_discount_formula}
                            onChange={(e) => setSelectedFormula({
                              ...selectedFormula,
                              investor_proceeds_discount_formula: e.target.value
                            })}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground font-mono text-sm disabled:opacity-50"
                            rows={3}
                          />
                          <Button
                            onClick={() => testFormula(selectedFormula.investor_proceeds_discount_formula)}
                            variant="glass"
                            size="sm"
                            className="absolute right-2 top-2"
                          >
                            <BeakerIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Flags */}
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFormula.has_dual_mgmt_fee}
                          onChange={(e) => setSelectedFormula({
                            ...selectedFormula,
                            has_dual_mgmt_fee: e.target.checked
                          })}
                          disabled={!isEditing}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-foreground">Has Dual Management Fee</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFormula.has_premium}
                          onChange={(e) => setSelectedFormula({
                            ...selectedFormula,
                            has_premium: e.target.checked
                          })}
                          disabled={!isEditing}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-foreground">Has Premium</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFormula.has_structuring}
                          onChange={(e) => setSelectedFormula({
                            ...selectedFormula,
                            has_structuring: e.target.checked
                          })}
                          disabled={!isEditing}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-foreground">Has Structuring Fee</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFormula.has_other_fees}
                          onChange={(e) => setSelectedFormula({
                            ...selectedFormula,
                            has_other_fees: e.target.checked
                          })}
                          disabled={!isEditing}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-foreground">Has Other Fees</span>
                      </label>
                    </div>

                    {/* Test Result */}
                    {testResult && (
                      <div className={`p-4 rounded-lg ${
                        testResult.success 
                          ? 'bg-success-500/10 border border-success-400' 
                          : 'bg-error-500/10 border border-error-400'
                      }`}>
                        <div className="font-medium text-sm mb-1">
                          {testResult.success ? 'Test Successful' : 'Test Failed'}
                        </div>
                        {testResult.success ? (
                          <div className="text-foreground">
                            Result: <span className="font-mono font-bold">
                              {typeof testResult.result === 'number' 
                                ? testResult.result.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })
                                : testResult.result}
                            </span>
                          </div>
                        ) : (
                          <div className="text-error-400 text-sm">{testResult.error}</div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card variant="glass">
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    Select a formula template or create a new one
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}