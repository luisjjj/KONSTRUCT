"use client";

import { useStore } from "@/lib/store";
import { formatNaira, formatDateTime, cn } from "@/lib/utils";
import { IconCheckCircle, IconClock } from "@/components/icons";

export default function PaymentsPage() {
  const { projects, currentUser } = useStore();
  const userProjects = projects.filter((p) => p.ownerId === currentUser?.id || p.collaborators.includes(currentUser?.id || ""));
  const released = userProjects.flatMap((p) => p.phases.filter((ph) => ph.fundReleased).map((ph) => ({ id: ph.id, projectName: p.name, phaseName: ph.title, amount: ph.budgetAllocation, date: ph.fundedAt || "" })));
  const pending = userProjects.flatMap((p) => p.phases.filter((ph) => ph.status === "approved" && !ph.fundReleased).map((ph) => ({ id: ph.id, projectName: p.name, phaseName: ph.title, amount: ph.budgetAllocation, date: ph.approvedAt || "" })));
  const totalReleased = released.reduce((s, p) => s + p.amount, 0);
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Payments</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Track fund releases and payment history</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200/60 p-5 bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Total Released</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{formatNaira(totalReleased)}</div>
          <div className="text-[11px] text-emerald-600/60 mt-1">{released.length} payment{released.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/60 p-5 bg-gradient-to-br from-amber-50/50 to-white">
          <div className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">Pending Release</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{formatNaira(totalPending)}</div>
          <div className="text-[11px] text-amber-600/60 mt-1">{pending.length} awaiting</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Budget</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatNaira(userProjects.reduce((s, p) => s + p.totalBudget, 0))}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Across all projects</div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Payment History</h2>
        {[...pending, ...released].length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-[13px]">No payments recorded yet</div>
        ) : (
          <div className="space-y-2.5">
            {[...pending, ...released].map((pay) => (
              <div key={pay.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", released.includes(pay as typeof released[0]) ? "bg-emerald-50" : "bg-amber-50")}>
                    {released.includes(pay as typeof released[0]) ? <IconCheckCircle size={16} className="text-emerald-600" /> : <IconClock size={16} className="text-amber-600" />}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{pay.phaseName}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">{pay.projectName} {pay.date && `· ${formatDateTime(pay.date)}`}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{formatNaira(pay.amount)}</div>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", released.includes(pay as typeof released[0]) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                    {released.includes(pay as typeof released[0]) ? "Released" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
