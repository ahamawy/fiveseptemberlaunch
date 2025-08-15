"use client";

import { useEffect, useState } from 'react';

export default function FeeProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [dealId, setDealId] = useState<number>(0);
  const [jsonText, setJsonText] = useState<string>('');
  const [kind, setKind] = useState<'LEGACY'|'MODERN'>('LEGACY');
  const [message, setMessage] = useState<string>('');

  const load = async () => {
    const res = await fetch('/api/admin/fees/profiles');
    const json = await res.json();
    if (json?.data) setProfiles(json.data);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    try {
      const res = await fetch('/api/admin/fees/profiles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ deal_id: Number(dealId), kind, config: jsonText ? JSON.parse(jsonText) : {} })
      });
      const json = await res.json();
      if (json?.success) {
        setMessage('Profile created/activated.');
        await load();
      } else {
        setMessage(json?.error || 'Failed');
      }
    } catch (e: any) {
      setMessage(e?.message || 'Failed');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Fee Calculator Profiles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm">Deal ID</label>
          <input className="border rounded p-2 w-full" type="number" value={dealId} onChange={(e) => setDealId(Number(e.target.value))} />
          <label className="block text-sm">Kind</label>
          <select className="border rounded p-2 w-full" value={kind} onChange={(e) => setKind(e.target.value as any)}>
            <option value="LEGACY">LEGACY</option>
            <option value="MODERN">MODERN</option>
          </select>
          <label className="block text-sm">Profile JSON (optional)</label>
          <textarea className="border rounded p-2 w-full h-40 font-mono text-xs" value={jsonText} onChange={(e) => setJsonText(e.target.value)} placeholder='{"ordering":["STRUCTURING","ADMIN","MANAGEMENT","PERFORMANCE"],"structuring":{"method":"PCT_OF_GROSS","pct":3}}' />
          <div className="flex gap-2">
            <button onClick={onCreate} className="px-3 py-2 rounded bg-blue-600 text-white">Create/Activate</button>
            <span className="text-sm text-gray-600">{message}</span>
          </div>
        </div>
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">deal_id</th>
                <th className="text-left p-2">schedule_id</th>
                <th className="text-left p-2">version</th>
                <th className="text-left p-2">active</th>
                <th className="text-left p-2">profile_id</th>
                <th className="text-left p-2">kind</th>
                <th className="text-left p-2">name</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{p.deal_id ?? ''}</td>
                  <td className="p-2">{p.schedule_id}</td>
                  <td className="p-2">{p.version}</td>
                  <td className="p-2">{String(p.is_active)}</td>
                  <td className="p-2">{p.profile_id}</td>
                  <td className="p-2">{p.kind}</td>
                  <td className="p-2">{p.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
