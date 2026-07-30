"use client";

import { useStore } from "@/lib/store";
import { formatNaira, cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { IconDownload, IconChart } from "@/components/icons";
import { exportProjectReport } from "@/lib/pdf-export";

function MiniChart({ data, color, height = 80 }: { data: number[]; color: string; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * dpr; c.height = height * dpr;
    ctx.scale(dpr, dpr);
    const w = c.offsetWidth; const max = Math.max(...data, 1); const step = w / Math.max(data.length - 1, 1);
    ctx.clearRect(0, 0, w, height);
    ctx.beginPath(); ctx.moveTo(0, height);
    data.forEach((v, i) => { const x = i * step; const y = height - (v / max) * (height - 10); i === 0 ? ctx.lineTo(x, y) : ctx.bezierCurveTo((i - 1) * step + step / 2, height - (data[i - 1] / max) * (height - 10), x - step / 2, y, x, y); });
    ctx.lineTo(w, height); ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, height); g.addColorStop(0, color + "25"); g.addColorStop(1, color + "05");
    ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); data.forEach((v, i) => { const x = i * step; const y = height - (v / max) * (height - 10); i === 0 ? ctx.moveTo(x, y) : ctx.bezierCurveTo((i - 1) * step + step / 2, height - (data[i - 1] / max) * (height - 10), x - step / 2, y, x, y); });
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  }, [data, color, height]);
  return <canvas ref={ref} className="w-full" style={{ height: `${height}px` }} />;
}

export default function ReportsPage() {
  const { projects, currentUser, loadProjects } = useStore();
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    loadProjects().finally(() => setLoading(false));
  }, [loadProjects]);

  const userProjects = projects;
  const active = userProjects.find((p) => p.id === selectedProjectId) || userProjects[0];
  const totalBudget = userProjects.reduce((s, p) => s + p.totalBudget, 0);
  const totalSpent = userProjects.reduce((s, p) => s + p.spentBudget, 0);
  const totalReleased = userProjects.reduce((s, p) => s + p.fundsReleased, 0);
  const avgComp = userProjects.length > 0 ? Math.round(userProjects.reduce((s, p) => s + p.completionPercentage, 0) / userProjects.length) : 0;

  const budgetChartData = active
    ? active.phases.map((p) => p.budgetAllocation)
    : [0];
  const completionChartData = active
    ? active.phases.map((p) => {
        const total = p.milestones.length || 1;
        return Math.round((p.milestones.filter((m) => m.completed).length / total) * 100);
      })
    : [0];

  const totalEvidence = userProjects.flatMap((p) => p.phases.flatMap((ph) => ph.evidence)).length;
  const verifiedEvidence = userProjects.flatMap((p) => p.phases.flatMap((ph) => ph.evidence)).filter((e) => e.verified).length;
  const totalDisputes = userProjects.flatMap((p) => p.phases.length).length;
  const evidenceCoverage = totalEvidence > 0 ? Math.round((verifiedEvidence / totalEvidence) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Reports</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Project analytics and insights</p>
        </div>
        <div className="flex gap-2">
          {userProjects.length > 1 && (
            <select value={selectedProjectId || (active?.id || "")} onChange={(e) => setSelectedProjectId(e.target.value)} className="px-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400">
              {userProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button onClick={() => active && exportProjectReport(active)} disabled={!active} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50">
            <IconDownload size={14} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Projects", value: userProjects.length.toString(), color: "text-slate-900 dark:text-slate-100" },
          { label: "Total Budget", value: formatNaira(totalBudget), color: "text-slate-900 dark:text-slate-100" },
          { label: "Total Spent", value: formatNaira(totalSpent), color: "text-amber-700" },
          { label: "Funds Released", value: formatNaira(totalReleased), color: "text-emerald-700" },
          { label: "Avg Completion", value: `${avgComp}%`, color: "text-indigo-700" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4">
            <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</div>
            <div className={cn("text-lg font-bold mt-1", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-3">Budget Allocation by Phase</h3>
          <MiniChart data={budgetChartData} color="#4f46e5" height={100} />
          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Budget (₦)</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-3">Phase Completion %</h3>
          <MiniChart data={completionChartData} color="#f59e0b" height={100} />
          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Milestones Completed</span>
          </div>
        </div>
      </div>

      {active && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-4">Phase Breakdown — {active.name}</h3>
          <div className="space-y-3">
            {active.phases.map((phase) => {
              const pct = phase.budgetAllocation > 0 ? (phase.budgetSpent / phase.budgetAllocation) * 100 : 0;
              const done = phase.milestones.filter((m) => m.completed).length;
              return (
                <div key={phase.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100 sm:w-24">{phase.title}</div>
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-0">
                    <div className="text-[13px] text-slate-500 dark:text-slate-400 sm:w-32 sm:text-right">{formatNaira(phase.budgetSpent)} / {formatNaira(phase.budgetAllocation)}</div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 sm:w-20 sm:text-right">{done}/{phase.milestones.length} ms</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", ["completed", "funded"].includes(phase.status) ? "bg-emerald-50 text-emerald-700" : phase.status === "in_progress" ? "bg-amber-50 text-amber-700" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>{phase.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-4">Risk Indicators</h3>
          <div className="space-y-2">
            {[
              { label: "Budget Variance", value: totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% spent` : "No data", good: totalBudget > 0 && (totalSpent / totalBudget) < 0.9 },
              { label: "Schedule Progress", value: `${avgComp}% complete`, good: avgComp > 30 },
              { label: "Evidence Coverage", value: `${evidenceCoverage}% verified`, good: evidenceCoverage > 50 },
              { label: "Active Projects", value: `${userProjects.filter((p) => p.status === "in_progress").length} of ${userProjects.length}`, good: true },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[13px] text-slate-900 dark:text-slate-100">{r.label}</span>
                <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", r.good ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-4">Payment Release History</h3>
          <div className="space-y-2">
            {userProjects.flatMap((p) => p.phases.filter((ph) => ph.fundReleased).map((ph) => (
              <div key={ph.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{ph.title}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">{p.name}</div>
                </div>
                <div className="text-[14px] font-semibold text-emerald-700">{formatNaira(ph.budgetAllocation)}</div>
              </div>
            )))}
            {userProjects.flatMap((p) => p.phases.filter((ph) => ph.fundReleased)).length === 0 && (
              <p className="text-center text-[13px] text-slate-400 dark:text-slate-500 py-4">No payments released yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
