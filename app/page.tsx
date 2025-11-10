'use client';
import { useEffect, useMemo, useState } from "react";

// Simple version without charts for now
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const today = () => fmtDate(new Date());
const uid = () => Math.random().toString(36).slice(2);

const computeRefreshScore = (e: any) => {
  const base = 50;
  const energyBoost = e.energy * 10;
  const caffeinePenalty = e.caffeineMg / 50;
  const snoozePenalty = e.snooze * 5;
  const hydrationBonus = e.hydrationPack ? 5 : 0;
  return Math.max(0, Math.min(100, Math.round(base + energyBoost - caffeinePenalty - snoozePenalty + hydrationBonus)));
};

const seedIfEmpty = () => {
  if (typeof window === 'undefined') return [];
  
  const raw = localStorage.getItem("wur.entries");
  if (raw) {
    try { 
      const parsed = JSON.parse(raw); 
      if (Array.isArray(parsed)) return parsed; 
    } catch {}
  }
  
  const base = new Date();
  base.setDate(base.getDate() - 9);
  const seeded = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const energy = 2 + Math.floor(Math.random() * 4);
    const snooze = Math.floor(Math.random() * 3);
    const caffeine = [0, 80, 120, 160, 200, 260][Math.floor(Math.random() * 6)];
    const hydration = Math.random() > 0.5;
    const wake = `${7 + Math.floor(Math.random() * 2)}:${["00","10","20","30","40","50"][Math.floor(Math.random() * 6)]}`;
    return { 
      id: uid(), 
      date: fmtDate(d), 
      wakeTime: wake, 
      bedtime: undefined, 
      snooze: snooze, 
      energy: energy, 
      caffeineMg: caffeine, 
      hydrationPack: hydration, 
      notes: "" 
    };
  });
  localStorage.setItem("wur.entries", JSON.stringify(seeded));
  return seeded;
};

function KPI({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1rem', backdropFilter: 'blur(10px)' }}>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#1e3a8a' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</div>}
    </div>
  );
}

function InsightCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1rem', backdropFilter: 'blur(10px)' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e3a8a' }}>{title}</div>
      <div style={{ fontSize: '0.875rem', color: '#475569' }}>{desc}</div>
    </div>
  );
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default function WakeUpRefreshMVP() {
  const [entries, setEntries] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    id: "", 
    date: today(), 
    wakeTime: "07:15", 
    bedtime: "", 
    snooze: 0, 
    energy: 3, 
    caffeineMg: 120, 
    hydrationPack: false, 
    notes: "" 
  });
  const [filterDays, setFilterDays] = useState(14);

  useEffect(() => { 
    if (typeof window !== 'undefined') {
      setEntries(seedIfEmpty()); 
    }
  }, []);

  useEffect(() => { 
    if (typeof window !== 'undefined') {
      localStorage.setItem("wur.entries", JSON.stringify(entries)); 
    }
  }, [entries]);

  const recent = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (filterDays - 1));
    return entries.filter(e => new Date(e.date) >= cutoff).sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, filterDays]);

  const streak = useMemo(() => {
    const dates = new Set(entries.map((e: any) => e.date));
    let d = new Date(); 
    let s = 0; 
    while (dates.has(fmtDate(d))) { 
      s++; 
      d.setDate(d.getDate() - 1); 
    }
    return s;
  }, [entries]);

  const todayEntry = entries.find((e: any) => e.date === today());

  const addEntry = () => {
    if (!form.date) return;
    const e = { ...form, id: uid(), bedtime: form.bedtime || undefined };
    setEntries(prev => { 
      const filtered = prev.filter(p => !(p.date === e.date)); 
      return [...filtered, e]; 
    });
    setForm(f => ({ ...f, id: "" }));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #dbeafe, #ffffff, #fed7aa)',
      color: '#0f172a'
    }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        background: 'linear-gradient(to right, #1e3a8a, #dc2626)',
        color: 'white',
        borderBottom: '1px solid rgba(30, 58, 138, 0.4)',
        padding: '1rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            Wake‑Up <span style={{ color: '#fdba74' }}>Refresh</span>
          </h1>
        </div>
      </header>

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Left Column */}
          <div>
            <div style={{ 
              background: 'rgba(255,255,255,0.9)', 
              borderRadius: '1.5rem', 
              border: '1px solid #e2e8f0', 
              padding: '1.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1e3a8a' }}>
                Daily Check‑In
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                Log your morning in under 30 seconds.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <label style={{ gridColumn: 'span 2', fontSize: '0.875rem' }}>
                  Date
                  <input 
                    type="date" 
                    style={{ 
                      marginTop: '0.25rem', 
                      width: '100%', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.75rem', 
                      padding: '0.5rem'
                    }} 
                    value={form.date} 
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
                  />
                </label>
                
                <label style={{ fontSize: '0.875rem' }}>
                  Wake time
                  <input 
                    type="time" 
                    style={{ 
                      marginTop: '0.25rem', 
                      width: '100%', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.75rem', 
                      padding: '0.5rem'
                    }} 
                    value={form.wakeTime} 
                    onChange={e => setForm(f => ({ ...f, wakeTime: e.target.value }))} 
                  />
                </label>
                
                <label style={{ fontSize: '0.875rem' }}>
                  Bedtime (opt)
                  <input 
                    type="time" 
                    style={{ 
                      marginTop: '0.25rem', 
                      width: '100%', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.75rem', 
                      padding: '0.5rem'
                    }} 
                    value={form.bedtime} 
                    onChange={e => setForm(f => ({ ...f, bedtime: e.target.value }))} 
                  />
                </label>
                
                <button 
                  onClick={addEntry}
                  style={{
                    gridColumn: 'span 2',
                    marginTop: '0.25rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    background: '#dc2626',
                    color: 'white',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Save Check‑In
                </button>
              </div>
              
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                {todayEntry ? "Nice—today is logged." : "Tip: log within 30 minutes of waking for best insights."}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div style={{ 
              background: 'rgba(255,255,255,0.9)', 
              borderRadius: '1.5rem', 
              border: '1px solid #e2e8f0', 
              padding: '1.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#1e3a8a' }}>
                Your Dashboard
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <KPI label="Streak" value={`${streak}d`} subtitle="Consecutive days logged" />
                <KPI label="Avg Energy" value={avg(recent.map((r: any) => r.energy)).toFixed(1)} subtitle="1–5" />
                <KPI label="Avg Caffeine" value={`${avg(recent.map((r: any) => r.caffeineMg)).toFixed(0)} mg`} subtitle="per morning" />
                <KPI label="Avg Refresh" value={`${avg(recent.map((r: any) => computeRefreshScore(r))).toFixed(0)}`} subtitle="0–100" />
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#1e3a8a' }}>
                  Recent Entries
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Date</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Wake</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Energy</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Refresh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((r: any) => (
                        <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 500, color: '#1e3a8a' }}>{r.date}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{r.wakeTime}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{r.energy}</td>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#dc2626' }}>
                            {computeRefreshScore(r)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}