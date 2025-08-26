"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

interface Document {
  id: string;
  name: string;
  type: "Report" | "Tax Form" | "Statement" | "Agreement" | "Other";
  date: string;
  size: string;
  status: "Available" | "Processing" | "Archived";
}

// Removed mock data: will fetch from /api/documents

export default function DocumentsPage() {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/documents?limit=100");
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        const mapped: Document[] = data.map((d: any, idx: number) => ({
          id: String(d.id ?? idx),
          name: d.name || d.document_name || `Document ${idx + 1}`,
          type: (d.type || d.document_type || "Other") as Document["type"],
          date: d.uploaded_date || d.created_at || new Date().toISOString(),
          size: d.size_bytes ? `${Math.ceil(d.size_bytes / 1024)} KB` : "-",
          status: (d.status || "Available") as Document["status"],
        }));
        setDocuments(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load documents");
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const documentTypes = [
    "All",
    "Report",
    "Tax Form",
    "Statement",
    "Agreement",
    "Other",
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesType = selectedType === "All" || doc.type === selectedType;
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Report":
        return "primary";
      case "Tax Form":
        return "warning";
      case "Statement":
        return "info";
      case "Agreement":
        return "success";
      default:
        return "neutral";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge variant="success">Available</Badge>;
      case "Processing":
        return <Badge variant="warning">Processing</Badge>;
      case "Archived":
        return <Badge variant="default">Archived</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="relative space-y-8">
      <div className="absolute inset-0 bg-gradient-mesh opacity-10 pointer-events-none" />
      <div className="relative z-10">
      {/* Header */}
      <div className="pb-6 border-b border-surface-border">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
          Documents
        </h1>
        <p className="mt-2 text-text-secondary">
          Access your investment documents, reports, and tax forms
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-background-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300/50 text-text-primary placeholder-text-muted"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {documentTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "primary" : "glass"}
              size="sm"
              onClick={() => setSelectedType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <Card variant="glass" className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} document
            {filteredDocuments.length !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-text-secondary">
              Loading documents...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-error-400">{error}</div>
          ) : filteredDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5 text-primary-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {doc.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(doc.type) as any}>
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {new Date(doc.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {doc.size}
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={doc.status !== "Available"}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={doc.status !== "Available"}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-text-primary">
                No documents found
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {searchTerm || selectedType !== "All"
                  ? "Try adjusting your filters"
                  : "Documents will appear here when available"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="gradient" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total Documents</p>
                <p className="text-2xl font-bold text-text-primary">
                  {documents.length}
                </p>
              </div>
              <svg
                className="h-8 w-8 text-primary-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Reports</p>
                <p className="text-2xl font-bold text-text-primary">
                  {documents.filter((d) => d.type === "Report").length}
                </p>
              </div>
              <svg
                className="h-8 w-8 text-accent-blue"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m0 4h12a2 2 0 002-2v-3a1 1 0 00-1-1H5a1 1 0 00-1 1v3a2 2 0 002 2z"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Tax Forms</p>
                <p className="text-2xl font-bold text-text-primary">
                  {documents.filter((d) => d.type === "Tax Form").length}
                </p>
              </div>
              <svg
                className="h-8 w-8 text-accent-yellow"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">This Month</p>
                <p className="text-2xl font-bold text-text-primary">
                  {
                    documents.filter((d) => {
                      const dt = new Date(d.date);
                      const start = new Date();
                      start.setDate(1);
                      start.setHours(0, 0, 0, 0);
                      return dt >= start;
                    }).length
                  }
                </p>
              </div>
              <svg
                className="h-8 w-8 text-accent-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
