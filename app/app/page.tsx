"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const today = () => fmtDate(new Date());
const uid = () => Math.random().toString(36).slice(2);

type Entry = {
  id: string;
  date: string;
  wakeTime: string;
  bedtime?: string;
  snooze: number;
  energy: number;
  caffeineMg: number;
  hydrationPack: boolean;
  notes?: string;
};

const computeRefreshScore = (e: Entry) => {
  const base = 50;
  const energyBoost = e.energy * 10;
  const caffeinePenalty = e.caffeineMg / 50;
  const snoozePenalty = e.snooze * 5;
  const hydrationBonus = e.hydrationPack ? 5 : 0;
  return Math.max(
    0,
    Math.min(100, Math.round(base + energyBoost - caffeinePenalty - snoozePenalty + hydrationBonus))
  );
};

const toCSV = (rows: Entry[]) => {
  const header = [
    "id",
    "date",
    "wakeTime",
    "bedtime",
    "snooze",
    "energy",
    "caffeineMg",
    "hydrationPack",
    "notes",
    "refreshScore",
  ];
  const body = rows.map((r) => [
    r.id,
    r.date,
    r.wakeTime,
    r.bedtime ?? "",
    r.snooze,
    r.energy,
    r.caffeineMg,
    r.hydrationPack,
    r.notes ?? "",
    computeRefreshScore(r),
  ]);
  return [header, ...body]
    .map((arr) =>
      arr
        .map((v) => (typeof v === "string" && v.includes(",") ? `"${v.replaceAll('"', '""')}"` : v))
        .join(",")
    )
    .join("\n");
};

const seedIfEmpty = (): Entry[] => {
  const raw = typeof window !== "undefined" ? localStorage.getItem("wur.entries") : null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  const base = new Date();
  base.setDate(base.getDate() - 9);
  const seeded: Entry[] = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const energy = 2 + Math.floor(Math.random() * 4);
    const snooze = Math.floor(Math.random() * 3);
    const caffeine = [0, 80, 120, 160, 200, 260][Math.floor(Math.random() * 6)];
    const hydration = Math.random() > 0.5;
    const wake = `${7 + Math.floor(Math.random() * 2)}:${
      ["00", "10", "20", "30", "40", "50"][Math.floor(Math.random() * 6)]
    }`;
    return {
      id: uid(),
      date: fmtDate(d),
      wakeTime: wake,
      bedtime: undefined,
      snooze,
      energy,
      caffeineMg: caffeine,
      hydrationPack: hydration,
      notes: "",
    };
  });
  if (typeof window !== "undefined") {
    localStorage.setItem("wur.entries", JSON.stringify(seeded));
  }
  return seeded;
};

export default function WakeUpRefreshMVP() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState<Entry>({
    id: "",
    date: today(),
    wakeTime: "07:15",
    bedtime: "",
    snooze: 0,
    energy: 3,
    caffeineMg: 120,
    hydrationPack: false,
    notes: "",
  });
  const [showNudges, setShowNudges] = useState(false);
  const [filterDays, setFilterDays] = useState(14);
  const [showPilotSurvey, setShowPilotSurvey] = useState(false);
  const [pilot, setPilot] = useState({
    campusLocation: "Bird Library",
    causes: new Set<string>(),
    wearable: "None",
    consentShare: false,
  });
  const nudgeTimer = useRef<number | null>(null);

  useEffect(() => {
    setEntries(seedIfEmpty());
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wur.entries", JSON.stringify(entries));
    }
  }, [entries]);

  useEffect(() => {
    if (!showNudges) {
      if (nudgeTimer.current) {
        window.clearInterval(nudgeTimer.current);
        nudgeTimer.current = null;
      }
      return;
    }
    nudgeTimer.current = window.setInterval(() => {
      const msgs = [
        "Hydration nudge: 6–8 oz of water helps kickstart energy.",
        "60-second stretch? Roll shoulders + neck to reduce sleep inertia.",
        "Morning light: open blinds for 5 minutes to anchor your clock.",
        "Micro-goal: tidy your desk for 2 minutes to build momentum.",
      ];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      if (typeof Notification !== "undefined") {
        if (Notification.permission === "granted") new Notification("Wake-Up Refresh", { body: msg });
        else if (Notification.permission !== "denied") Notification.requestPermission();
        else alert(msg);
      } else {
        alert(msg);
      }
    }, 45000);
    return () => {
      if (nudgeTimer.current) {
        window.clearInterval(nudgeTimer.current);
        nudgeTimer.current = null;
      }
    };
  }, [showNudges]);

  const recent = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (filterDays - 1));
    return entries
      .filter((e) => new Date(e.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, filterDays]);

  const streak = useMemo(() => {
    const dates = new Set(entries.map((e) => e.date));
    let d = new Date();
    let s = 0;
    while (dates.has(fmtDate(d))) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [entries]);

  const todayEntry = entries.find((e) => e.date === today());

  type ChallengeUser = { name: string; emoji: string; score: number; streak: number };
  const leaderboard: ChallengeUser[] = useMemo(() => {
    const myPoints = recent.reduce((acc, e) => acc + (computeRefreshScore(e) >= 70 ? 8 : 4), 0) + streak * 2;
    const mock: ChallengeUser[] = [
      { name: "Ava (Whitman)", emoji: "🧠", score: 98, streak: 5 },
      { name: "Noah (DPS)", emoji: "🏃", score: 110, streak: 7 },
      { name: "Mia (Newhouse)", emoji: "🎧", score: 103, streak: 6 },
      { name: "Liam (iSchool)", emoji: "💻", score: 95, streak: 4 },
    ];
    return [{ name: "You", emoji: "⚡", score: myPoints, streak }, ...mock].sort((a, b) => b.score - a.score).slice(0, 5);
  }, [recent, streak]);

  const energySeries = recent.map((r) => ({
    date: r.date.slice(5),
    Energy: r.energy,
    Caffeine: r.caffeineMg,
    Refresh: computeRefreshScore(r),
  }));

  const addEntry = () => {
    if (!form.date) return;
    const e: Entry = { ...form, id: uid(), bedtime: form.bedtime || undefined };
    setEntries((prev) => {
      const filtered = prev.filter((p) => !(p.date === e.date));
      return [...filtered, e];
    });
    setForm((f) => ({ ...f, id: "" }));
  };

  const exportCSV = () => {
    const csv = toCSV([...entries].sort((a, b) => a.date.localeCompare(b.date)));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wake-up-refresh_${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const savePilot = () => {
    const obj = {
      campusLocation: pilot.campusLocation,
      causes: Array.from(pilot.causes),
      wearable: pilot.wearable,
      consentShare: pilot.consentShare,
    };
    localStorage.setItem("wur.pilotSurvey", JSON.stringify(obj));
    setShowPilotSurvey(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 text-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-gradient-to-r from-blue-950 to-orange-600 text-white border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Wake-Up <span className="text-orange-300">Refresh</span>
          </h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowNudges((s) => !s)}
              className="px-3 py-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow ring-1 ring-white/10 transition"
            >
              {showNudges ? "Nudges: On" : "Nudges: Off"}
            </button>
            <button
              onClick={() => setShowPilotSurvey(true)}
              className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white shadow ring-1 ring-white/20 transition"
            >
              Pilot Survey
            </button>
            <button
              onClick={exportCSV}
              className="px-3 py-2 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white shadow ring-1 ring-white/10 transition"
            >
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-1 space-y-6">
          <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-950">Daily Check-In</h2>
            <p className="text-sm text-slate-600 mb-4">Log your morning in under 30 seconds.</p>

            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 text-sm">
                Date
                <input
                  type="date"
                  className="mt-1 w-full border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </label>

              <label className="col-span-1 text-sm">
                Wake time
                <input
                  type="time"
                  className="mt-1 w-full border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={form.wakeTime}
                  onChange={(e) => setForm((f) => ({ ...f, wakeTime: e.target.value }))}
                />
              </label>

              <label className="col-span-1 text-sm">
                Bedtime (opt)
                <input
                  type="time"
                  className="mt-1 w-full border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={form.bedtime ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, bedtime: e.target.value }))}
                />
              </label>

              <label className="col-span-1 text-sm">
                Snoozes
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={form.snooze}
                  onChange={(e) => setForm((f) => ({ ...f, snooze: Number(e.target.value) }))}
                />
              </label>

              <label className="col-span-1 text-sm">
                Energy (1–5)
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  className="mt-3 w-full accent-orange-600"
                  value={form.energy}
                  onChange={(e) => setForm((f) => ({ ...f, energy: Number(e.target.value) }))}
                />
                <span className="text-xs text-slate-600">Current: {form.energy}</span>
              </label>

              <label className="col-span-1 text-sm">
                Caffeine (mg)
                <input
                  type="number"
                  min={0}
                  step={20}
                  className="mt-1 w-full border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={form.caffeineMg}
                  onChange={(e) => setForm((f) => ({ ...f, caffeineMg: Number(e.target.value) }))}
                />
              </label>

              <label className="col-span-1 text-sm flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={form.hydrationPack}
                  onChange={(e) => setForm((f) => ({ ...f, hydrationPack: e.target.checked }))}
                  className="accent-orange-600"
                />{" "}
                Took hydration pack
              </label>

              <label className="col-span-2 text-sm">
                Notes (opt)
                <textarea
                  className="mt-1 w-full border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={2}
                  placeholder="dreams, stress, exercise, late study at Bird…"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </label>

              <button
                onClick={addEntry}
                className="col-span-2 mt-1 px-4 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg ring-1 ring-orange-500/20"
              >
                Save Check-In
              </button>
            </div>

            <div className="mt-4 text-sm text-slate-600">
              {todayEntry ? "Nice—today is logged." : "Tip: log within 30 minutes of waking for best insights."}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-950">SU Campus Challenge</h2>
            <p className="text-sm text-slate-600 mb-3">2-week pilot: points for daily check-ins and high refresh scores.</p>
            <ol className="space-y-2">
              {leaderboard.map((u, idx) => (
                <li
                  key={u.name}
                  className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl px-3 py-2 border"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold w-6 text-right text-blue-950">{idx + 1}.</span>
                    <span>{u.emoji}</span>
                    <span className={u.name === "You" ? "font-bold text-orange-700" : "text-slate-800"}>{u.name}</span>
                  </div>
                  <div className="text-sm text-slate-700">
                    Streak {u.streak} • <span className="font-semibold text-orange-700">{u.score} pts</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-xs text-slate-500 mt-3">Rewards: gym passes, merch, free hydration packs for top 20%.</p>
          </div>
        </section>

        <section className="xl:col-span-2 space-y-6">
          <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold text-blue-950">Your Dashboard</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm">
                  Range
                  <select
                    className="ml-2 border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={filterDays}
                    onChange={(e) => setFilterDays(Number(e.target.value))}
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPI label="Streak" value={`${streak}d`} subtitle="Consecutive days logged" />
              <KPI label="Avg Energy" value={avg(recent.map((r) => r.energy)).toFixed(1)} subtitle="1–5" />
              <KPI label="Avg Caffeine" value={`${avg(recent.map((r) => r.caffeineMg)).toFixed(0)} mg`} subtitle="per morning" />
              <KPI label="Avg Refresh" value={`${avg(recent.map((r) => computeRefreshScore(r))).toFixed(0)}`} subtitle="0–100" />
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" domain={[0, 5]} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Energy" stroke="#F76900" strokeWidth={3} />
                  <Line yAxisId="right" type="monotone" dataKey="Caffeine" stroke="#0B1F44" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="h-72 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Refresh" fill="#F76900" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InsightCard
                title="Personalized Insight"
                desc={(function () {
                  if (!recent.length) return "Log a few days to unlock insights.";
                  const hydra = recent.filter((r) => r.hydrationPack);
                  const noHydra = recent.filter((r) => !r.hydrationPack);
                  const avgHydra = avg(hydra.map((r) => computeRefreshScore(r)));
                  const avgNo = avg(noHydra.map((r) => computeRefreshScore(r)));
                  if (!hydra.length || !noHydra.length) return "Try alternating hydration packs every other day to compare impact.";
                  const delta = (avgHydra - avgNo).toFixed(1);
                  return `Hydration appears to boost your Refresh Score by ${delta} points on average.`;
                })()}
              />

              <InsightCard
                title="Snooze Behavior"
                desc={(function () {
                  if (!recent.length) return "";
                  const withSnooze = recent.filter((r) => r.snooze > 0);
                  const without = recent.filter((r) => r.snooze === 0);
                  if (!withSnooze.length || !without.length) return "Aim for zero snoozes for one week to test impact.";
                  const delta = (
                    avg(without.map((r) => computeRefreshScore(r))) - avg(withSnooze.map((r) => computeRefreshScore(r)))
                  ).toFixed(1);
                  return `Zero-snooze mornings correlate with +${delta} Refresh Score.`;
                })()}
              />
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Wake</th>
                    <th className="py-2 pr-3">Snooze</th>
                    <th className="py-2 pr-3">Energy</th>
                    <th className="py-2 pr-3">Caffeine</th>
                    <th className="py-2 pr-3">Hydration</th>
                    <th className="py-2 pr-3">Refresh</th>
                    <th className="py-2 pr-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 pr-3 font-medium text-blue-950">{r.date}</td>
                      <td className="py-2 pr-3">{r.wakeTime}</td>
                      <td className="py-2 pr-3">{r.snooze}</td>
                      <td className="py-2 pr-3">{r.energy}</td>
                      <td className="py-2 pr-3">{r.caffeineMg} mg</td>
                      <td className="py-2 pr-3">{r.hydrationPack ? "✅" : "—"}</td>
                      <td className="py-2 pr-3 font-semibold text-orange-700">{computeRefreshScore(r)}</td>
                      <td className="py-2 pr-3 max-w-[20ch] truncate" title={r.notes}>
                        {r.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="xl:col-span-3">
          <div className="bg-gradient-to-r from-blue-900 to-orange-600 text-white rounded-3xl border border-blue-900/40 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div>
              <h3 className="text-lg font-semibold">Hydration Pack Bundle</h3>
              <p className="text-white/90 text-sm">
                Start with a 2-week sample (14 sticks). Log usage, then compare your Refresh Scores — data over hype.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 ring-1 ring-white/30">Buy sample $12</button>
              <button className="px-4 py-2 rounded-2xl bg-white text-blue-950 font-semibold">Subscribe $15/mo</button>
            </div>
          </div>
        </section>
      </main>

      <section className="max-w-7xl mx-auto px-4 mb-10">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-950">Pilot Add-Ons</h3>
          <p className="text-sm text-slate-600 mb-3">
            Tune the app to your reality: where you struggle, what causes late nights, and whether you use a wearable.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <label>
              Campus location you struggle most
              <select
                className="mt-1 w-full border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={pilot.campusLocation}
                onChange={(e) => setPilot((p) => ({ ...p, campusLocation: e.target.value }))}
              >
                {[
                  "Bird Library",
                  "Hinds Hall",
                  "Crouse Hall",
                  "Whitman",
                  "Maxwell",
                  "Life Sciences",
                  "Dome",
                  "Link Hall",
                  "Schine Center",
                ].map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Wearable/app
              <select
                className="mt-1 w-full border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={pilot.wearable}
                onChange={(e) => setPilot((p) => ({ ...p, wearable: e.target.value }))}
              >
                {["None", "Fitbit", "Apple Watch", "Apple Health", "Google Fit"].map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="sm:col-span-2">
              <legend className="text-sm mb-1">Common causes (multi-select)</legend>
              <div className="flex flex-wrap gap-2">
                {[
                  "Late coding",
                  "Greek/social events",
                  "Design studio deadlines",
                  "Labs/clinicals",
                  "Work shifts",
                  "Gaming",
                  "Commuting",
                  "Sports practice",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setPilot((p) => {
                        const s = new Set(p.causes as Set<string>);
                        s.has(tag) ? s.delete(tag) : s.add(tag);
                        return { ...p, causes: s };
                      })
                    }
                    className={`px-3 py-1 rounded-2xl border ${
                      (pilot.causes as Set<string>).has(tag)
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={pilot.consentShare}
                onChange={(e) => setPilot((p) => ({ ...p, consentShare: e.target.checked }))}
                className="accent-orange-600"
              />
              I agree to share anonymous trends for campus wellness
            </label>

            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={savePilot}
                className="px-4 py-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </section>

      {showPilotSurvey && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-xl w-full p-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-950">Syracuse Pilot Survey</h3>
            <p className="text-sm text-slate-600 mb-4">
              Help tailor nudges and campus challenges. (Saves locally in this demo.)
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="col-span-2">
                Campus location you struggle most
                <select
                  className="mt-1 w-full border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={pilot.campusLocation}
                  onChange={(e) => setPilot((p) => ({ ...p, campusLocation: e.target.value }))}
                >
                  {[
                    "Bird Library",
                    "Hinds Hall",
                    "Crouse Hall",
                    "Whitman",
                    "Maxwell",
                    "Life Sciences",
                    "Dome",
                    "Link Hall",
                    "Schine Center",
                  ].map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="col-span-2">
                <legend className="text-sm mb-1">Common causes (multi-select)</legend>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Late coding",
                    "Greek/social events",
                    "Design studio deadlines",
                    "Labs/clinicals",
                    "Work shifts",
                    "Gaming",
                    "Commuting",
                    "Sports practice",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setPilot((p) => {
                          const s = new Set(p.causes as Set<string>);
                          s.has(tag) ? s.delete(tag) : s.add(tag);
                          return { ...p, causes: s };
                        })
                      }
                      className={`px-3 py-1 rounded-2xl border ${
                        (pilot.causes as Set<string>).has(tag)
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label>
                Wearable/app
                <select
                  className="mt-1 w-full border rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={pilot.wearable}
                  onChange={(e) => setPilot((p) => ({ ...p, wearable: e.target.value }))}
                >
                  {["None", "Fitbit", "Apple Watch", "Apple Health", "Google Fit"].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={pilot.consentShare}
                  onChange={(e) => setPilot((p) => ({ ...p, consentShare: e.target.checked }))}
                  className="accent-orange-600"
                />
                I agree to share anonymous trends for campus wellness
              </label>

              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button onClick={() => setShowPilotSurvey(false)} className="px-4 py-2 rounded-2xl border">
                  Cancel
                </button>
                <button className="px-4 py-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white" onClick={savePilot}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto px-4 pb-10 pt-4 text-xs text-blue-950/80">
        <p>Prototype • Wake-Up Refresh — Syracuse Pilot</p>
      </footer>
    </div>
  );
}

function KPI({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow p-4">
      <div className="text-xs uppercase tracking-wide text-blue-900/70">{label}</div>
      <div className="text-2xl font-extrabold text-blue-950">{value}</div>
      {subtitle && <div className="text-xs text-slate-600">{subtitle}</div>}
    </div>
  );
}

function InsightCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow p-4">
      <div className="font-semibold mb-1 text-blue-950">{title}</div>
      <div className="text-sm text-slate-700">{desc}</div>
    </div>
  );
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}