"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/theme-utils";

interface ProfileData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    residenceCountry: string;
    taxId: string;
  };
  investorInfo: {
    type: "Individual" | "Institutional" | "Family Office" | "Fund";
    accreditationStatus:
      | "Accredited"
      | "Qualified"
      | "Sophisticated"
      | "Retail";
    investorSince: string;
    totalInvested: number;
    activeInvestments: number;
    preferredSectors: string[];
    riskProfile: "Conservative" | "Moderate" | "Aggressive";
  };
  kycStatus: {
    status:
      | "Not Started"
      | "In Progress"
      | "Under Review"
      | "Approved"
      | "Expired";
    lastUpdated: string;
    expiryDate: string | null;
    documents: Array<{
      type: string;
      status: "Pending" | "Verified" | "Rejected";
      uploadDate: string;
    }>;
  };
  bankDetails: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode: string;
    currency: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    quarterlyReports: boolean;
    language: string;
    timezone: string;
  };
}

// Removed mock profile data. Will map from /api/investors/[id]

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "personal" | "investor" | "kyc" | "banking" | "preferences"
  >("personal");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/investors/1");
        if (!res.ok) {
          setData(null);
          setLoading(false);
          return;
        }
        const json = await res.json();
        const inv = json?.data || {};
        const mapped: ProfileData = {
          personalInfo: {
            fullName: inv.full_name || inv.name || "Investor",
            email: inv.primary_email || inv.email || "-",
            phone: inv.primary_phone || inv.phone || "-",
            dateOfBirth: inv.date_of_birth || new Date().toISOString(),
            nationality: inv.country_of_citizenship || inv.country || "-",
            residenceCountry: inv.country_of_residence || "-",
            taxId: inv.tax_id || "N/A",
          },
          investorInfo: {
            type: (inv.investor_type || "Individual").replace(/_/g, " "),
            accreditationStatus: inv.kyc_status || "Approved",
            investorSince: inv.created_at || new Date().toISOString(),
            totalInvested: 0,
            activeInvestments: 0,
            preferredSectors: [],
            riskProfile: "Moderate",
          },
          kycStatus: {
            status: inv.kyc_status || "Approved",
            lastUpdated: inv.updated_at || new Date().toISOString(),
            expiryDate: null,
            documents: [],
          },
          bankDetails: {
            accountName: inv.full_name || "Investor",
            bankName: "-",
            accountNumber: "****",
            routingNumber: "****",
            swiftCode: "-",
            currency: "USD",
          },
          preferences: {
            emailNotifications: true,
            smsNotifications: false,
            marketingEmails: true,
            quarterlyReports: true,
            language: "English",
            timezone: "UTC",
          },
        };
        setData(mapped);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">
          <svg
            className="animate-spin h-8 w-8 text-primary-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading profile...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card variant="glass">
        <CardContent className="text-center py-12">
          <div className="text-error">Error loading profile data</div>
        </CardContent>
      </Card>
    );
  }

  const getKYCStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "success" | "warning" | "error" | "info" | "default"
    > = {
      "Not Started": "default",
      "In Progress": "warning",
      "Under Review": "info",
      Approved: "success",
      Expired: "error",
    };
    return variants[status] || "default";
  };

  const getRiskProfileBadge = (profile: string) => {
    const variants: Record<string, "success" | "warning" | "error"> = {
      Conservative: "success",
      Moderate: "warning",
      Aggressive: "error",
    };
    return variants[profile] || "neutral";
  };

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "investor", label: "Investor Profile" },
    { id: "kyc", label: "KYC & Compliance" },
    { id: "banking", label: "Banking" },
    { id: "preferences", label: "Preferences" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-surface-border">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
          Profile & Settings
        </h1>
        <p className="mt-2 text-text-secondary">
          Manage your account information and preferences
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="gradient" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Investor Type</p>
                <p className="text-lg font-semibold text-text-primary mt-1">
                  {data.investorInfo.type}
                </p>
              </div>
              <svg
                className="w-6 h-6 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">KYC Status</p>
                <Badge
                  variant={getKYCStatusBadge(data.kycStatus.status)}
                  className="mt-1"
                >
                  {data.kycStatus.status}
                </Badge>
              </div>
              <svg
                className="w-6 h-6 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  Active Investments
                </p>
                <p className="text-2xl font-bold text-primary-300 mt-1">
                  {data.investorInfo.activeInvestments}
                </p>
              </div>
              <svg
                className="w-6 h-6 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Member Since</p>
                <p className="text-lg font-semibold text-text-primary mt-1">
                  {new Date(data.investorInfo.investorSince).getFullYear()}
                </p>
              </div>
              <svg
                className="w-6 h-6 text-text-secondary"
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

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "primary" : "glass"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <Card variant="glass" className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Full Name
                  </label>
                  <p className="text-text-primary">
                    {data.personalInfo.fullName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Email Address
                  </label>
                  <p className="text-text-primary">{data.personalInfo.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Phone Number
                  </label>
                  <p className="text-text-primary">{data.personalInfo.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Date of Birth
                  </label>
                  <p className="text-text-primary">
                    {formatDate(data.personalInfo.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Nationality
                  </label>
                  <p className="text-text-primary">
                    {data.personalInfo.nationality}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Country of Residence
                  </label>
                  <p className="text-text-primary">
                    {data.personalInfo.residenceCountry}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Tax ID
                  </label>
                  <p className="text-text-primary font-mono">
                    {data.personalInfo.taxId}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="primary" size="sm">
                  Edit Information
                </Button>
                <Button variant="glass" size="sm">
                  Change Password
                </Button>
              </div>
            </div>
          )}

          {/* Investor Profile Tab */}
          {activeTab === "investor" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Investor Profile
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Investor Type
                  </label>
                  <p className="text-text-primary">{data.investorInfo.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Accreditation Status
                  </label>
                  <Badge variant="success">
                    {data.investorInfo.accreditationStatus}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Risk Profile
                  </label>
                  <Badge
                    variant={
                      getRiskProfileBadge(data.investorInfo.riskProfile) as any
                    }
                  >
                    {data.investorInfo.riskProfile}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Investor Since
                  </label>
                  <p className="text-text-primary">
                    {formatDate(data.investorInfo.investorSince)}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Preferred Sectors
                </label>
                <div className="flex gap-2 flex-wrap">
                  {data.investorInfo.preferredSectors.map((sector) => (
                    <Badge key={sector} variant="gradient">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="primary" size="sm">
                  Update Preferences
                </Button>
                <Button variant="glass" size="sm">
                  Risk Assessment
                </Button>
              </div>
            </div>
          )}

          {/* KYC & Compliance Tab */}
          {activeTab === "kyc" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                KYC & Compliance
              </h3>

              {/* KYC Status Card */}
              <Card
                variant={
                  data.kycStatus.status === "Approved" ? "gradient" : "glass"
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          data.kycStatus.status === "Approved"
                            ? "bg-success/20"
                            : "bg-warning/20"
                        }`}
                      >
                        <svg
                          className={`h-6 w-6 ${
                            data.kycStatus.status === "Approved"
                              ? "text-success"
                              : "text-warning"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          KYC Status
                        </p>
                        <p className="text-sm text-text-secondary">
                          Last updated: {formatDate(data.kycStatus.lastUpdated)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={getKYCStatusBadge(data.kycStatus.status)}
                      size="lg"
                    >
                      {data.kycStatus.status}
                    </Badge>
                  </div>
                  {data.kycStatus.expiryDate && (
                    <p className="text-sm text-text-muted mt-3">
                      Expires: {formatDate(data.kycStatus.expiryDate)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Documents List */}
              <div>
                <h4 className="text-lg font-medium text-text-primary mb-3">
                  Verification Documents
                </h4>
                <div className="space-y-2">
                  {data.kycStatus.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-background-surface rounded-lg"
                    >
                      <div className="flex items-center gap-3">
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
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {doc.type}
                          </p>
                          <p className="text-xs text-text-muted">
                            Uploaded: {formatDate(doc.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          doc.status === "Verified"
                            ? "success"
                            : doc.status === "Rejected"
                            ? "error"
                            : "warning"
                        }
                      >
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="primary" size="sm">
                  Upload Documents
                </Button>
                <Button variant="glass" size="sm">
                  Request Review
                </Button>
              </div>
            </div>
          )}

          {/* Banking Tab */}
          {activeTab === "banking" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Banking Information
              </h3>
              <Card variant="glass">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Account Name
                      </label>
                      <p className="text-text-primary">
                        {data.bankDetails.accountName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Bank Name
                      </label>
                      <p className="text-text-primary">
                        {data.bankDetails.bankName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Account Number
                      </label>
                      <p className="text-text-primary font-mono">
                        {data.bankDetails.accountNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Routing Number
                      </label>
                      <p className="text-text-primary font-mono">
                        {data.bankDetails.routingNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        SWIFT Code
                      </label>
                      <p className="text-text-primary font-mono">
                        {data.bankDetails.swiftCode}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Currency
                      </label>
                      <Badge variant="info">{data.bankDetails.currency}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button variant="primary" size="sm">
                  Update Banking Details
                </Button>
                <Button variant="glass" size="sm">
                  Add Another Account
                </Button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Preferences
              </h3>

              {/* Notification Settings */}
              <div>
                <h4 className="text-lg font-medium text-text-primary mb-3">
                  Notifications
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background-surface rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Email Notifications
                      </p>
                      <p className="text-xs text-text-muted">
                        Receive updates via email
                      </p>
                    </div>
                    <Badge
                      variant={
                        data.preferences.emailNotifications
                          ? "success"
                          : "default"
                      }
                    >
                      {data.preferences.emailNotifications
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background-surface rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        SMS Notifications
                      </p>
                      <p className="text-xs text-text-muted">
                        Receive updates via SMS
                      </p>
                    </div>
                    <Badge
                      variant={
                        data.preferences.smsNotifications
                          ? "success"
                          : "default"
                      }
                    >
                      {data.preferences.smsNotifications
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background-surface rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Marketing Emails
                      </p>
                      <p className="text-xs text-text-muted">
                        Receive promotional content
                      </p>
                    </div>
                    <Badge
                      variant={
                        data.preferences.marketingEmails ? "success" : "default"
                      }
                    >
                      {data.preferences.marketingEmails
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background-surface rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Quarterly Reports
                      </p>
                      <p className="text-xs text-text-muted">
                        Receive performance reports
                      </p>
                    </div>
                    <Badge
                      variant={
                        data.preferences.quarterlyReports
                          ? "success"
                          : "default"
                      }
                    >
                      {data.preferences.quarterlyReports
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Regional Settings */}
              <div>
                <h4 className="text-lg font-medium text-text-primary mb-3">
                  Regional Settings
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Language
                    </label>
                    <p className="text-text-primary">
                      {data.preferences.language}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Timezone
                    </label>
                    <p className="text-text-primary">
                      {data.preferences.timezone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="primary" size="sm">
                  Save Preferences
                </Button>
                <Button variant="glass" size="sm">
                  Reset to Default
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
