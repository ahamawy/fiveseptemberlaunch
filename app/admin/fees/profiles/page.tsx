"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BRAND_CONFIG } from '@/BRANDING/brand.config';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  TrashIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface FeeProfile {
  id: number;
  name: string;
  kind: 'LEGACY' | 'MODERN';
  config: any;
  created_at: string;
  deal_type?: string;
  is_active?: boolean;
  has_premium?: boolean;
}

export default function FeeProfilesPage() {
  const [profiles, setProfiles] = useState<FeeProfile[]>([]);
  const [dealId, setDealId] = useState<number>(0);
  const [profileName, setProfileName] = useState<string>('');
  const [jsonText, setJsonText] = useState<string>('');
  const [kind, setKind] = useState<'LEGACY'|'MODERN'>('LEGACY');
  const [message, setMessage] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [hasPremium, setHasPremium] = useState<boolean>(false);
  const [expandedProfile, setExpandedProfile] = useState<number | null>(null);
  const [docText, setDocText] = useState<string>('');

  const load = async () => {
    const res = await fetch('/api/admin/fees/profiles');
    const json = await res.json();
    if (json?.data) setProfiles(json.data);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    try {
      const config = jsonText ? JSON.parse(jsonText) : {};
      
      // Add premium calculation if enabled
      if (hasPremium) {
        config.calculate_premium = true;
        config.premium_basis = 'valuation_delta';
      }
      
      const res = await fetch('/api/admin/fees/profiles', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ 
          id: editingId,
          deal_id: Number(dealId), 
          name: profileName || `${kind} Profile for Deal ${dealId}`,
          kind, 
          config,
          has_premium: hasPremium
        })
      });
      const json = await res.json();
      if (json?.success) {
        setMessage(editingId ? 'Profile updated.' : 'Profile created/activated.');
        resetForm();
        await load();
      } else {
        setMessage(json?.error || 'Failed');
      }
    } catch (e: any) {
      setMessage(e?.message || 'Failed');
    }
  };

  const onExtractFromDoc = async () => {
    setMessage('Parsing...');
    try {
      const res = await fetch('/api/admin/ingest/parse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ doc_text: docText })
      });
      const json = await res.json();
      if (!json?.success) {
        setMessage(json?.error || 'Parse failed');
        return;
      }
      if (json?.mapping?.deal?.deal_id) setDealId(Number(json.mapping.deal.deal_id));
      setJsonText(JSON.stringify(json.profile_suggestion, null, 2));
      setMessage('Profile JSON extracted. Review and Create/Activate.');
    } catch (e: any) {
      setMessage(e?.message || 'Failed');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDealId(0);
    setProfileName('');
    setJsonText('');
    setKind('LEGACY');
    setHasPremium(false);
  };

  const editProfile = (profile: FeeProfile) => {
    setEditingId(profile.id);
    setProfileName(profile.name);
    setKind(profile.kind);
    setJsonText(JSON.stringify(profile.config, null, 2));
    setHasPremium(profile.has_premium || false);
    setDealId(0); // Deal ID handled separately
    setExpandedProfile(null);
  };

  const cloneProfile = (profile: FeeProfile) => {
    setEditingId(null);
    setProfileName(`${profile.name} (Copy)`);
    setKind(profile.kind);
    setJsonText(JSON.stringify(profile.config, null, 2));
    setHasPremium(profile.has_premium || false);
    setDealId(0);
    setExpandedProfile(null);
  };

  const deleteProfile = async (id: number) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    
    try {
      const res = await fetch(`/api/admin/fees/profiles?id=${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json?.success) {
        setMessage('Profile deleted.');
        await load();
      } else {
        setMessage(json?.error || 'Failed to delete');
      }
    } catch (e: any) {
      setMessage(e?.message || 'Delete failed');
    }
  };

  const togglePremium = async (profile: FeeProfile) => {
    try {
      const updatedConfig = { ...profile.config };
      updatedConfig.calculate_premium = !profile.has_premium;
      
      const res = await fetch('/api/admin/fees/profiles', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          config: updatedConfig,
          has_premium: !profile.has_premium
        })
      });
      
      const json = await res.json();
      if (json?.success) {
        setMessage(`Premium ${!profile.has_premium ? 'enabled' : 'disabled'} for ${profile.name}`);
        await load();
      }
    } catch (e: any) {
      setMessage(e?.message || 'Toggle failed');
    }
  };

  return (
    <div className="min-h-screen bg-background-deep">
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Fee Calculator Profiles
          </h1>
          <p className="text-sm text-gray-400">
            Configure and manage fee calculation profiles for deals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Form */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Profile' : 'Create Profile'}
              </h2>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <details className="border border-surface-border rounded p-3 bg-surface/50">
                <summary className="cursor-pointer font-medium text-white">Extract profile from document (AI)</summary>
                <textarea
                  className="mt-2 w-full p-2 rounded-lg bg-surface border border-surface-border text-white font-mono text-xs"
                  rows={6}
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  placeholder="Paste term sheet / subscription text here"
                />
                <div className="mt-2">
                  <button onClick={onExtractFromDoc} className="px-3 py-2 rounded bg-indigo-600 text-white">Parse & Prefill</button>
                </div>
              </details>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface border border-surface-border text-white focus:ring-2 focus:ring-primary-300"
                  placeholder="Enter profile name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Deal ID (0 for template)
                </label>
                <input
                  type="number"
                  value={dealId}
                  onChange={(e) => setDealId(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-surface border border-surface-border text-white focus:ring-2 focus:ring-primary-300"
                  placeholder="Enter deal ID..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Profile Type
                </label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as 'LEGACY'|'MODERN')}
                  className="w-full p-2 rounded-lg bg-surface border border-surface-border text-white focus:ring-2 focus:ring-primary-300"
                >
                  <option value="LEGACY">LEGACY</option>
                  <option value="MODERN">MODERN</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Enable Premium Calculation
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPremium}
                    onChange={(e) => setHasPremium(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-primary-300 focus:ring-primary-300"
                  />
                  <span className="text-sm text-gray-300">
                    Calculate premium fees based on valuation changes
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Configuration JSON
                </label>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={8}
                  className="w-full p-3 rounded-lg bg-surface border border-surface-border text-white font-mono text-sm focus:ring-2 focus:ring-primary-300"
                  placeholder={`{
  "tiers": [
    {
      "threshold": 0,
      "management_fee": 0.02,
      "performance_fee": 0.20,
      "admin_fee": 0.005
    }
  ],
  "hurdle_rate": 0.08,
  "catch_up": true,
  "high_water_mark": true
}`}
                />
              </div>

              <button
                onClick={onCreate}
                className="w-full px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-primary-300 to-secondary-blue text-white hover:opacity-90"
              >
                {editingId ? 'Update Profile' : 'Create Profile'}
              </button>

              {message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  message.includes('created') || message.includes('activated')
                    ? 'bg-success-500/20 border border-success-500/30 text-success-300'
                    : 'bg-error-500/20 border border-error-500/30 text-error-300'
                }`}>
                  {message.includes('created') || message.includes('activated') ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <ExclamationCircleIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm">{message}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Existing Profiles */}
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Existing Profiles
            </h2>
            
            <div className="space-y-3">
              {profiles.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-sm text-gray-500">No profiles found</span>
                </div>
              ) : (
                profiles.map((profile) => (
                  <div key={profile.id} className="border border-surface-border rounded-lg p-4 hover:bg-surface-light/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-white">{profile.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          profile.kind === 'LEGACY' 
                            ? 'bg-warning-500/20 text-warning-300' 
                            : 'bg-primary-300/20 text-primary-300'
                        }`}>
                          {profile.kind}
                        </span>
                        {profile.has_premium && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-success-500/20 text-success-300">
                            <SparklesIcon className="w-3 h-3 inline mr-1" />
                            Premium
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setExpandedProfile(expandedProfile === profile.id ? null : profile.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {expandedProfile === profile.id ? 'Hide' : 'Show'} Config
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>ID: {profile.id}</span>
                      <span>•</span>
                      <span>Created: {new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => editProfile(profile)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-surface border border-surface-border text-white hover:bg-surface-light text-sm"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => cloneProfile(profile)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-surface border border-surface-border text-white hover:bg-surface-light text-sm"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                        Clone
                      </button>
                      
                      <button
                        onClick={() => togglePremium(profile)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-surface border border-surface-border text-white hover:bg-surface-light text-sm"
                      >
                        <CurrencyDollarIcon className="w-4 h-4" />
                        {profile.has_premium ? 'Disable' : 'Enable'} Premium
                      </button>
                      
                      <button
                        onClick={() => deleteProfile(profile.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-error-500/20 border border-error-500/30 text-error-300 hover:bg-error-500/30 text-sm ml-auto"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                    
                    {/* Expanded Config View */}
                    {expandedProfile === profile.id && (
                      <div className="mt-4 p-3 bg-surface rounded border border-surface-border">
                        <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                          {JSON.stringify(profile.config, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}