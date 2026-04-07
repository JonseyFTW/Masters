'use client';

import { useState, useEffect } from 'react';
import { Lock, Upload, Plus, Trash2, Edit3, Save, X, Users, RefreshCw, Check } from 'lucide-react';
import { Entry, Golfer } from '@/lib/types';
import TierBadge from '@/components/TierBadge';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<'entries' | 'golfers' | 'import'>('entries');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const authHeader = { Authorization: `Bearer ${password}` };

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_password');
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function handleLogin() {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem('admin_password', password);
        setAuthed(true);
        setAuthError('');
      } else {
        setAuthError('Invalid password');
      }
    } catch {
      setAuthError('Connection error');
    }
  }

  async function loadData() {
    const [entriesRes, golfersRes] = await Promise.all([
      fetch('/api/entries'),
      fetch('/api/admin/golfers'),
    ]);
    const entriesData = await entriesRes.json();
    const golfersData = await golfersRes.json();
    setEntries(entriesData.entries || []);
    setGolfers(golfersData.golfers || []);
  }

  async function deleteEntryHandler(id: string) {
    if (!confirm('Delete this entry?')) return;
    await fetch(`/api/entries/${id}`, { method: 'DELETE', headers: authHeader });
    showMessage('Entry deleted');
    loadData();
  }

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <div className="bg-masters-card rounded-xl border border-masters-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-masters-yellow" />
            <h1 className="font-semibold text-lg">Admin Login</h1>
          </div>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-masters-dark border border-masters-border rounded-lg px-4 py-2 text-sm text-white placeholder:text-masters-text focus:outline-none focus:border-masters-green mb-3"
          />
          {authError && <p className="text-red-400 text-xs mb-3">{authError}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-masters-green text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-masters-green-light transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button onClick={() => { sessionStorage.removeItem('admin_password'); setAuthed(false); }} className="text-masters-text text-sm hover:text-white">
          Logout
        </button>
      </div>

      {message && (
        <div className="bg-masters-green/20 border border-masters-green rounded-lg px-4 py-2 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-masters-accent-3" />
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['entries', 'golfers', 'import'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              tab === t ? 'bg-masters-green text-white' : 'bg-masters-card text-masters-text border border-masters-border hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'entries' && <EntriesTab entries={entries} authHeader={authHeader} onRefresh={loadData} onMessage={showMessage} />}
      {tab === 'golfers' && <GolfersTab golfers={golfers} authHeader={authHeader} onRefresh={loadData} onMessage={showMessage} />}
      {tab === 'import' && <ImportTab authHeader={authHeader} onRefresh={loadData} onMessage={showMessage} loading={loading} setLoading={setLoading} />}
    </div>
  );
}

function EntriesTab({ entries, authHeader, onRefresh, onMessage }: {
  entries: Entry[];
  authHeader: Record<string, string>;
  onRefresh: () => void;
  onMessage: (msg: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    userName: '', entryName: '',
    t1p1: '', t1p2: '',
    t2p1: '', t2p2: '', t2p3: '',
    t3p1: '', t3p2: '', t3p3: '', t3p4: '',
    alt1: '', alt2: '', alt3: '',
    paid: false,
  });

  function resetForm() {
    setForm({ userName: '', entryName: '', t1p1: '', t1p2: '', t2p1: '', t2p2: '', t2p3: '', t3p1: '', t3p2: '', t3p3: '', t3p4: '', alt1: '', alt2: '', alt3: '', paid: false });
    setShowAdd(false);
    setEditId(null);
  }

  function loadEntry(entry: Entry) {
    setForm({
      userName: entry.userName,
      entryName: entry.entryName,
      t1p1: entry.picks.tier1[0], t1p2: entry.picks.tier1[1],
      t2p1: entry.picks.tier2[0], t2p2: entry.picks.tier2[1], t2p3: entry.picks.tier2[2],
      t3p1: entry.picks.tier3[0], t3p2: entry.picks.tier3[1], t3p3: entry.picks.tier3[2], t3p4: entry.picks.tier3[3],
      alt1: entry.alternates.tier1, alt2: entry.alternates.tier2, alt3: entry.alternates.tier3,
      paid: entry.paid,
    });
    setEditId(entry.id);
    setShowAdd(true);
  }

  async function saveEntry() {
    const body = {
      userName: form.userName,
      entryName: form.entryName || `${form.userName} - Entry 1`,
      picks: {
        tier1: [form.t1p1, form.t1p2],
        tier2: [form.t2p1, form.t2p2, form.t2p3],
        tier3: [form.t3p1, form.t3p2, form.t3p3, form.t3p4],
      },
      alternates: { tier1: form.alt1, tier2: form.alt2, tier3: form.alt3 },
      paid: form.paid,
    };

    if (editId) {
      await fetch(`/api/entries/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(body),
      });
      onMessage('Entry updated');
    } else {
      await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(body),
      });
      onMessage('Entry added');
    }
    resetForm();
    onRefresh();
  }

  async function deleteEntry(id: string) {
    if (!confirm('Delete this entry?')) return;
    await fetch(`/api/entries/${id}`, { method: 'DELETE', headers: authHeader });
    onMessage('Entry deleted');
    onRefresh();
  }

  const fieldClass = "w-full bg-masters-dark border border-masters-border rounded px-3 py-1.5 text-sm text-white placeholder:text-masters-text focus:outline-none focus:border-masters-green";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-masters-text text-sm">{entries.length} entries</span>
        <button onClick={() => { resetForm(); setShowAdd(true); }} className="bg-masters-green text-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-1 hover:bg-masters-green-light">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {showAdd && (
        <div className="bg-masters-card rounded-xl border border-masters-border p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">{editId ? 'Edit Entry' : 'Add Entry'}</h3>
            <button onClick={resetForm}><X className="w-4 h-4 text-masters-text" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="User Name" value={form.userName} onChange={e => setForm({ ...form, userName: e.target.value })} className={fieldClass} />
            <input placeholder="Entry Name" value={form.entryName} onChange={e => setForm({ ...form, entryName: e.target.value })} className={fieldClass} />
          </div>
          <div className="text-xs text-masters-text font-semibold mt-2">Tier 1 Picks (2)</div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Tier 1 Pick 1" value={form.t1p1} onChange={e => setForm({ ...form, t1p1: e.target.value })} className={fieldClass} />
            <input placeholder="Tier 1 Pick 2" value={form.t1p2} onChange={e => setForm({ ...form, t1p2: e.target.value })} className={fieldClass} />
          </div>
          <div className="text-xs text-masters-text font-semibold">Tier 2 Picks (3)</div>
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Tier 2 Pick 1" value={form.t2p1} onChange={e => setForm({ ...form, t2p1: e.target.value })} className={fieldClass} />
            <input placeholder="Tier 2 Pick 2" value={form.t2p2} onChange={e => setForm({ ...form, t2p2: e.target.value })} className={fieldClass} />
            <input placeholder="Tier 2 Pick 3" value={form.t2p3} onChange={e => setForm({ ...form, t2p3: e.target.value })} className={fieldClass} />
          </div>
          <div className="text-xs text-masters-text font-semibold">Tier 3 Picks (4)</div>
          <div className="grid grid-cols-4 gap-3">
            <input placeholder="T3 Pick 1" value={form.t3p1} onChange={e => setForm({ ...form, t3p1: e.target.value })} className={fieldClass} />
            <input placeholder="T3 Pick 2" value={form.t3p2} onChange={e => setForm({ ...form, t3p2: e.target.value })} className={fieldClass} />
            <input placeholder="T3 Pick 3" value={form.t3p3} onChange={e => setForm({ ...form, t3p3: e.target.value })} className={fieldClass} />
            <input placeholder="T3 Pick 4" value={form.t3p4} onChange={e => setForm({ ...form, t3p4: e.target.value })} className={fieldClass} />
          </div>
          <div className="text-xs text-masters-text font-semibold">Alternates</div>
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Tier 1 Alt" value={form.alt1} onChange={e => setForm({ ...form, alt1: e.target.value })} className={fieldClass} />
            <input placeholder="Tier 2 Alt" value={form.alt2} onChange={e => setForm({ ...form, alt2: e.target.value })} className={fieldClass} />
            <input placeholder="Tier 3 Alt" value={form.alt3} onChange={e => setForm({ ...form, alt3: e.target.value })} className={fieldClass} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.paid} onChange={e => setForm({ ...form, paid: e.target.checked })} className="rounded" />
            <span className="text-sm">Paid</span>
          </div>
          <button onClick={saveEntry} className="bg-masters-green text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1 hover:bg-masters-green-light">
            <Save className="w-4 h-4" /> {editId ? 'Update' : 'Save'} Entry
          </button>
        </div>
      )}

      <div className="bg-masters-card rounded-xl border border-masters-border divide-y divide-masters-border">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-masters-text text-sm">No entries yet. Add one above or use CSV import.</div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{entry.entryName}</div>
                <div className="text-masters-text text-xs">{entry.userName} {!entry.paid && <span className="text-masters-yellow">• Unpaid</span>}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => loadEntry(entry)} className="p-1 text-masters-text hover:text-white"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => deleteEntry(entry.id)} className="p-1 text-masters-text hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function GolfersTab({ golfers, authHeader, onRefresh, onMessage }: {
  golfers: Golfer[];
  authHeader: Record<string, string>;
  onRefresh: () => void;
  onMessage: (msg: string) => void;
}) {
  const [localGolfers, setLocalGolfers] = useState<Golfer[]>(golfers);
  const [newName, setNewName] = useState('');
  const [newTier, setNewTier] = useState<1 | 2 | 3>(1);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { setLocalGolfers(golfers); }, [golfers]);

  function changeTier(name: string, tier: 1 | 2 | 3) {
    setLocalGolfers(prev => prev.map(g => g.name === name ? { ...g, tier } : g));
  }

  function removeGolfer(name: string) {
    setLocalGolfers(prev => prev.filter(g => g.name !== name));
  }

  function addGolfer() {
    if (!newName.trim()) return;
    setLocalGolfers(prev => [...prev, { name: newName.trim(), tier: newTier }]);
    setNewName('');
  }

  async function saveGolfers() {
    await fetch('/api/admin/golfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ golfers: localGolfers }),
    });
    onMessage('Golfer tiers saved');
    onRefresh();
  }

  async function fetchField() {
    setFetching(true);
    try {
      const res = await fetch('/api/admin/golfers/fetch');
      const data = await res.json();
      if (data.field?.length) {
        const existing = new Set(localGolfers.map(g => g.name.toLowerCase()));
        const newGolfers = data.field
          .filter((f: { name: string }) => !existing.has(f.name.toLowerCase()))
          .map((f: { name: string }) => ({ name: f.name, tier: 3 as const }));
        setLocalGolfers(prev => [...prev, ...newGolfers]);
        onMessage(`Added ${newGolfers.length} new golfers from ESPN`);
      }
    } catch {
      onMessage('Failed to fetch field');
    }
    setFetching(false);
  }

  const tiers = [1, 2, 3] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={fetchField} disabled={fetching} className="bg-masters-card text-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-1 border border-masters-border hover:bg-masters-card-hover disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} /> Fetch ESPN Field
        </button>
        <button onClick={saveGolfers} className="bg-masters-green text-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-1 hover:bg-masters-green-light">
          <Save className="w-4 h-4" /> Save Changes
        </button>
        <span className="text-masters-text text-xs">{localGolfers.length} golfers</span>
      </div>

      {/* Add golfer */}
      <div className="flex items-center gap-2">
        <input placeholder="Golfer name" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGolfer()}
          className="flex-1 bg-masters-dark border border-masters-border rounded px-3 py-1.5 text-sm text-white placeholder:text-masters-text focus:outline-none focus:border-masters-green" />
        <select value={newTier} onChange={e => setNewTier(Number(e.target.value) as 1 | 2 | 3)}
          className="bg-masters-dark border border-masters-border rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-masters-green">
          <option value={1}>Tier 1</option>
          <option value={2}>Tier 2</option>
          <option value={3}>Tier 3</option>
        </select>
        <button onClick={addGolfer} className="bg-masters-green text-white rounded px-3 py-1.5 text-sm hover:bg-masters-green-light">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {tiers.map(tier => {
        const tierGolfers = localGolfers.filter(g => g.tier === tier);
        return (
          <div key={tier} className="bg-masters-card rounded-xl border border-masters-border">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-masters-border">
              <TierBadge tier={tier} />
              <span className="font-semibold text-sm">Tier {tier} ({tierGolfers.length})</span>
            </div>
            <div className="divide-y divide-masters-border">
              {tierGolfers.map(g => (
                <div key={g.name} className="flex items-center gap-2 px-4 py-2">
                  <span className="flex-1 text-sm">{g.name}</span>
                  <select value={g.tier} onChange={e => changeTier(g.name, Number(e.target.value) as 1 | 2 | 3)}
                    className="bg-masters-dark border border-masters-border rounded px-2 py-1 text-xs text-white">
                    <option value={1}>T1</option>
                    <option value={2}>T2</option>
                    <option value={3}>T3</option>
                  </select>
                  <button onClick={() => removeGolfer(g.name)} className="text-masters-text hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {tierGolfers.length === 0 && (
                <div className="p-3 text-center text-masters-text text-xs">No golfers in this tier</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ImportTab({ authHeader, onRefresh, onMessage, loading, setLoading }: {
  authHeader: Record<string, string>;
  onRefresh: () => void;
  onMessage: (msg: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const [csv, setCsv] = useState('');
  const [replaceAll, setReplaceAll] = useState(false);

  async function handleImport() {
    if (!csv.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ csv, replaceAll }),
      });
      const data = await res.json();
      if (res.ok) {
        onMessage(`Imported ${data.imported} entries (total: ${data.total})`);
        if (data.errors?.length) {
          alert(`Import warnings:\n${data.errors.join('\n')}`);
        }
        setCsv('');
        onRefresh();
      } else {
        onMessage(`Error: ${data.error}`);
      }
    } catch {
      onMessage('Import failed');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-masters-card rounded-xl border border-masters-border p-4">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4" /> CSV Import
        </h3>
        <p className="text-masters-text text-xs mb-3">
          CSV format: name, tier1_pick1, tier1_pick2, tier2_pick1, tier2_pick2, tier2_pick3, tier3_pick1, tier3_pick2, tier3_pick3, tier3_pick4, alt_tier1, alt_tier2, alt_tier3, paid
        </p>
        <textarea
          value={csv}
          onChange={e => setCsv(e.target.value)}
          placeholder={`name,t1p1,t1p2,t2p1,t2p2,t2p3,t3p1,t3p2,t3p3,t3p4,alt1,alt2,alt3,paid\nJohn Smith,Scottie Scheffler,Rory McIlroy,Patrick Cantlay,Tommy Fleetwood,Hideki Matsuyama,Jordan Spieth,Cameron Young,Russell Henley,Tiger Woods,Xander Schauffele,Justin Thomas,Adam Scott,true`}
          className="w-full h-40 bg-masters-dark border border-masters-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-masters-text focus:outline-none focus:border-masters-green font-mono"
        />
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 text-sm text-masters-text">
            <input type="checkbox" checked={replaceAll} onChange={e => setReplaceAll(e.target.checked)} className="rounded" />
            Replace all existing entries
          </label>
          <button onClick={handleImport} disabled={loading || !csv.trim()} className="bg-masters-green text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1 hover:bg-masters-green-light disabled:opacity-50">
            <Upload className="w-4 h-4" /> {loading ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}
