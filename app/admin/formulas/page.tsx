"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BeakerIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

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
  mgmt_fee_split_year?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Deal {
  id: number;
  name: string;
  formula_template_id?: number;
}

export default function FormulasPage() {
  const [formulas, setFormulas] = useState<FormulaTemplate[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [testFormula, setTestFormula] = useState("");
  const [testVariables, setTestVariables] = useState("{}");
  const [testResult, setTestResult] = useState<any>(null);
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [selectedFormulaForDeal, setSelectedFormulaForDeal] = useState<
    number | null
  >(null);
  const [dealFormulaMap, setDealFormulaMap] = useState<
    Record<number, { id: number; name: string; code: string } | null>
  >({});

  useEffect(() => {
    fetchFormulas();
    fetchDeals();
  }, []);

  const fetchFormulas = async () => {
    try {
      const response = await fetch("/api/admin/formulas");
      const data = await response.json();
      if (data.success) {
        setFormulas(data.data || []);
      } else {
        console.error("Failed to fetch formulas");
      }
    } catch (error) {
      console.error("Error fetching formulas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await fetch("/api/deals");
      const data = await response.json();
      if (data.success) {
        setDeals(data.data || []);
        // Fetch current formula assignment for each deal in the background
        const dealsArr: Deal[] = data.data || [];
        const results = await Promise.all(
          dealsArr.map(async (d: Deal) => {
            try {
              const r = await fetch(`/api/deals/${d.id}/formula`);
              const j = await r.json();
              if (j?.success && j?.data) {
                return [
                  d.id,
                  {
                    id: j.data.id,
                    name: j.data.formula_name,
                    code: j.data.formula_code,
                  },
                ] as const;
              }
              return [d.id, null] as const;
            } catch (_) {
              return [d.id, null] as const;
            }
          })
        );
        const map: Record<
          number,
          { id: number; name: string; code: string } | null
        > = {};
        results.forEach(([id, val]) => {
          map[id] = val;
        });
        setDealFormulaMap(map);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
    }
  };

  const handleTestFormula = async () => {
    try {
      const variables = JSON.parse(testVariables);
      const response = await fetch("/api/admin/formulas/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formula: testFormula, variables }),
      });

      const data = await response.json();
      setTestResult(data);
      if (!data.success) {
        console.error(data.error || "Formula test failed");
      }
    } catch (error) {
      console.error("Invalid variables JSON:", error);
    }
  };

  const handleAssignFormula = async () => {
    if (!selectedDeal || !selectedFormulaForDeal) {
      alert("Please select both a deal and a formula");
      return;
    }

    try {
      const response = await fetch(`/api/deals/${selectedDeal}/formula`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formulaTemplateId: selectedFormulaForDeal }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Formula assigned to deal successfully!");
        setSelectedDeal(null);
        setSelectedFormulaForDeal(null);
      } else {
        alert(data.error || "Failed to assign formula");
      }
    } catch (error) {
      console.error("Error assigning formula:", error);
      alert("Error assigning formula");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040210] to-[#0A0420] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Formula Management System
          </h1>
          <p className="text-gray-400">
            Centralized management for all deal formula templates and
            assignments
          </p>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="bg-glass-dark border border-white/10">
            <TabsTrigger value="templates">Formula Templates</TabsTrigger>
            <TabsTrigger value="assignments">Deal Assignments</TabsTrigger>
            <TabsTrigger value="testing">Formula Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-glass-dark border-white/10">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-white">
                    Formula Templates
                  </h2>
                  <Button
                    onClick={() =>
                      (window.location.href = "/admin/formula-manager")
                    }
                    className="bg-primary hover:bg-primary/90"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Formula
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white">Code</TableHead>
                        <TableHead className="text-white">Name</TableHead>
                        <TableHead className="text-white">Features</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formulas.map((formula) => (
                        <TableRow key={formula.id} className="border-white/10">
                          <TableCell className="text-white font-mono">
                            {formula.formula_code}
                          </TableCell>
                          <TableCell className="text-white">
                            {formula.formula_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {formula.has_premium && (
                                <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">
                                  Premium
                                </span>
                              )}
                              {formula.has_structuring && (
                                <span className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-400">
                                  Structuring
                                </span>
                              )}
                              {formula.has_dual_mgmt_fee && (
                                <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                                  Dual Mgmt
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formula.is_active ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircleIcon className="w-5 h-5 text-red-400" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  (window.location.href =
                                    "/admin/formula-manager")
                                }
                                className="text-white hover:bg-white/10"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card className="bg-glass-dark border-white/10">
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Assign Formula to Deal
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Select Deal</Label>
                    <Select
                      value={selectedDeal?.toString()}
                      onValueChange={(value) => setSelectedDeal(Number(value))}
                    >
                      <SelectTrigger className="bg-glass-dark border-white/10 text-white">
                        <SelectValue placeholder="Choose a deal" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#040210] border-white/10">
                        {deals.map((deal) => (
                          <SelectItem
                            key={deal.id}
                            value={deal.id.toString()}
                            className="text-white hover:bg-white/10"
                          >
                            {deal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Select Formula</Label>
                    <Select
                      value={selectedFormulaForDeal?.toString()}
                      onValueChange={(value) =>
                        setSelectedFormulaForDeal(Number(value))
                      }
                    >
                      <SelectTrigger className="bg-glass-dark border-white/10 text-white">
                        <SelectValue placeholder="Choose a formula" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#040210] border-white/10">
                        {formulas
                          .filter((f) => f.is_active)
                          .map((formula) => (
                            <SelectItem
                              key={formula.id}
                              value={formula.id.toString()}
                              className="text-white hover:bg-white/10"
                            >
                              {formula.formula_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={handleAssignFormula}
                      className="bg-primary hover:bg-primary/90 w-full"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Assign Formula
                    </Button>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-white font-semibold mb-3">
                    Current Assignments
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-white">Deal</TableHead>
                          <TableHead className="text-white">
                            Current Formula
                          </TableHead>
                          <TableHead className="text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deals.map((d) => (
                          <TableRow key={d.id} className="border-white/10">
                            <TableCell className="text-white">
                              {d.name}
                            </TableCell>
                            <TableCell className="text-white font-mono">
                              {dealFormulaMap[d.id] ? (
                                `${dealFormulaMap[d.id]!.code} — ${
                                  dealFormulaMap[d.id]!.name
                                }`
                              ) : (
                                <span className="text-white/60">(none)</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={
                                    selectedDeal === d.id
                                      ? selectedFormulaForDeal?.toString()
                                      : undefined
                                  }
                                  onValueChange={(value) => {
                                    setSelectedDeal(d.id);
                                    setSelectedFormulaForDeal(Number(value));
                                  }}
                                >
                                  <SelectTrigger className="bg-glass-dark border-white/10 text-white w-56">
                                    <SelectValue placeholder="Choose formula" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#040210] border-white/10">
                                    {formulas
                                      .filter((f) => f.is_active)
                                      .map((f) => (
                                        <SelectItem
                                          key={f.id}
                                          value={f.id.toString()}
                                          className="text-white hover:bg-white/10"
                                        >
                                          {f.formula_name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  onClick={async () => {
                                    if (!selectedFormulaForDeal) return;
                                    const res = await fetch(
                                      `/api/deals/${d.id}/formula`,
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          formulaTemplateId:
                                            selectedFormulaForDeal,
                                        }),
                                      }
                                    );
                                    const j = await res.json();
                                    if (j?.success) {
                                      setDealFormulaMap({
                                        ...dealFormulaMap,
                                        [d.id]: {
                                          id: j.data.id,
                                          name: j.data.formula_name,
                                          code: j.data.formula_code,
                                        },
                                      });
                                      setSelectedDeal(null);
                                      setSelectedFormulaForDeal(null);
                                    } else {
                                      alert(
                                        j?.error || "Failed to assign formula"
                                      );
                                    }
                                  }}
                                  className="bg-primary hover:bg-primary/90"
                                  disabled={
                                    selectedDeal !== d.id ||
                                    !selectedFormulaForDeal
                                  }
                                >
                                  Assign
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card className="bg-glass-dark border-white/10">
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Formula Testing Sandbox
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Formula Expression</Label>
                    <Textarea
                      value={testFormula}
                      onChange={(e) => setTestFormula(e.target.value)}
                      placeholder="e.g., (NC * (EUP/IUP)) - (MFR * GC * T)"
                      className="bg-glass-dark border-white/10 text-white font-mono"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-white">Variables (JSON)</Label>
                    <Textarea
                      value={testVariables}
                      onChange={(e) => setTestVariables(e.target.value)}
                      placeholder='{"NC": 1000000, "EUP": 2, "IUP": 1, "MFR": 0.02, "GC": 1000000, "T": 2}'
                      className="bg-glass-dark border-white/10 text-white font-mono"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleTestFormula}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <BeakerIcon className="w-4 h-4 mr-2" />
                    Test Formula
                  </Button>

                  {testResult && (
                    <Card className="bg-glass-dark border-white/10 p-4">
                      <h3 className="text-white font-semibold mb-2">Result:</h3>
                      {testResult.success ? (
                        <div className="text-green-400 font-mono text-2xl">
                          {typeof testResult.result === "number"
                            ? testResult.result.toLocaleString()
                            : testResult.result}
                        </div>
                      ) : (
                        <div className="text-red-400">{testResult.error}</div>
                      )}
                    </Card>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
