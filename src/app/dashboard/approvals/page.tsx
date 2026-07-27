"use client";

import { useStore } from "@/lib/store";
import { formatNaira, formatDateTime, cn } from "@/lib/utils";
import { useState } from "react";
import { IconCheckCircle, IconClock, IconCheck } from "@/components/icons";

export default function ApprovalsPage() {
  const { projects, currentUser, approvePhase, releasePhaseFund } = useStore();
  const [tab, setTab] = useState<"pending" | "completed">("pending");
  const userProjects = projects.filter((p) => p.ownerId === currentUser?.id || p.collaborators.includes(currentUser?.id || ""));
  const pending = userProjects.flatMap((p) => p.phases.filter((ph) => ph.status === "submitted_for_review").map((ph) => ({ ...ph, projectName: p.name, projectId: p.id })));
  const completed = userProjects.flatMap((p) => p.phases.filter((ph) => ["approved", "funded", "completed"].includes(ph.status)).map((ph) => ({ ...ph, projectName: p.name, projectId: p.id })));
  const items = tab === "pending" ? pending : completed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Approvals</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Review and approve phase completions and fund releases</p>
      </div>
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("pending")} className={cn("px-4 py-2 rounded-lg text-[13px] font-semibold transition-all", tab === "pending" ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500")}>
          Pending ({pending.length})
        </button>
        <button onClick={() => setTab("completed")} className={cn("px-4 py-2 rounded-lg text-[13px] font-semibold transition-all", tab === "completed" ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500")}>
          Completed ({completed.length})
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <IconCheckCircle size={24} className="text-slate-300" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No {tab} approvals</h3>
          <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">{tab === "pending" ? "All phases have been reviewed" : "No approvals completed yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((phase) => (
            <div key={phase.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">{phase.projectName}</div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{phase.title}</h3>
                  <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-0.5">{phase.description}</p>
                </div>
                <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0", tab === "pending" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>
                  {tab === "pending" ? "Awaiting Review" : "Approved"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div><div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Budget</div><div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{formatNaira(phase.budgetAllocation)}</div></div>
                <div><div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Milestones</div><div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{phase.milestones.filter((m) => m.completed).length}/{phase.milestones.length}</div></div>
                <div><div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Evidence</div><div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{phase.evidence.length} files</div></div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Milestone Checklist</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {phase.milestones.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 text-[12px]">
                      <div className={cn("w-3 h-3 rounded-sm flex-shrink-0", m.completed ? "bg-emerald-500" : "bg-slate-200")} />
                      <span className={cn(m.completed ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500")}>{m.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              {tab === "pending" && phase.milestones.every((m) => m.completed) && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => approvePhase(phase.projectId, phase.id)} className="flex-1 py-2.5 text-[13px] font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all">Approve Phase</button>
                  <button onClick={() => { approvePhase(phase.projectId, phase.id); releasePhaseFund(phase.projectId, phase.id); }} className="flex-1 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">Approve & Release</button>
                </div>
              )}
              {tab === "pending" && !phase.milestones.every((m) => m.completed) && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/60">
                  <p className="text-[12px] text-amber-700">Cannot approve: {phase.milestones.filter((m) => !m.completed).length} milestone(s) remaining.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
