"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatNaira, timeAgo, getPhaseStatusColor, getPhaseStatusLabel, cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  IconLock, IconMoney, IconClock, IconCheckCircle, IconArrowRight,
  IconCamera, IconChart, IconShield, IconUpload, IconCheck, IconBuilding
} from "@/components/icons";

const PhaseRoadmap3D = dynamic(() => import("@/components/PhaseRoadmap3D"), { ssr: false });

export default function DashboardContent() {
  const { projects, activities, currentUser, notifications, loadProjects, loadActivities } = useStore();
  const [loading, setLoading] = useState(true);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      loadProjects().finally(() => setLoading(false));
    }
  }, [currentUser, loadProjects]);

  const activeProject = projects[selectedProjectIndex] ?? projects[0];

  useEffect(() => {
    if (activeProject) {
      loadActivities(activeProject.id);
    }
  }, [activeProject?.id, loadActivities]);

  const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin" />
      </div>
    );
  }

  const userProjects = projects;

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
          <IconBuilding size={32} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No projects yet</h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Create your first project to get started</p>
        <Link href="/dashboard/projects/new" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all">
          Create Project
        </Link>
      </div>
    );
  }

  const currentPhase = activeProject.phases.find((p) => ["in_progress", "submitted_for_review", "approved"].includes(p.status));
  const nextLocked = activeProject.phases.find((p) => p.status === "not_started");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Project Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${activeProject.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            View Details
          </Link>
          <Link href="/dashboard/projects/new" className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all shadow-sm">
            <span className="text-lg leading-none">+</span> New Project
          </Link>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-2.5 cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <IconBuilding size={16} className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <div className="text-left min-w-0">
            <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">{activeProject.name}</div>
          </div>
          <svg
            className={cn(
              "w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 flex-shrink-0",
              isDropdownOpen && "rotate-180"
            )}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>

        <div
          className={cn(
            "absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden transition-all duration-200 origin-top",
            isDropdownOpen
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Projects</span>
          </div>
          {userProjects.map((project, index) => (
            <button
              key={project.id}
              onClick={() => {
                setSelectedProjectIndex(index);
                setIsDropdownOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors duration-150",
                index === selectedProjectIndex
                  ? "bg-indigo-50 dark:bg-indigo-900/20"
                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                index === selectedProjectIndex
                  ? "bg-indigo-100 dark:bg-indigo-800/40"
                  : "bg-slate-100 dark:bg-slate-700"
              )}>
                <IconBuilding size={14} className={cn(
                  index === selectedProjectIndex
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-500"
                )} />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn(
                  "text-[13px] font-semibold truncate",
                  index === selectedProjectIndex
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-slate-900 dark:text-slate-100"
                )}>{project.name}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{project.location}</div>
              </div>
              {index === selectedProjectIndex && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-in">
        {[
          { label: "Total Project Value", value: formatNaira(activeProject.totalBudget), icon: <IconMoney size={18} className="text-indigo-600 dark:text-indigo-400" />, bg: "bg-indigo-50 dark:bg-indigo-900/30" },
          { label: "Current Phase", value: currentPhase?.title || "N/A", icon: <IconClock size={18} className="text-amber-600 dark:text-amber-400" />, bg: "bg-amber-50 dark:bg-amber-900/30" },
          { label: "Funds Locked", value: formatNaira(activeProject.fundsLocked), icon: <IconLock size={18} className="text-rose-600 dark:text-rose-400" />, bg: "bg-rose-50 dark:bg-rose-900/30" },
          { label: "Completion", value: `${activeProject.completionPercentage}%`, icon: <IconCheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />, bg: "bg-emerald-50 dark:bg-emerald-900/30" },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.bg)}>{card.icon}</div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">{card.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Phase Roadmap</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Visual progression of your project phases</p>
          </div>
        </div>
        <PhaseRoadmap3D phases={activeProject.phases} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-5">Budget Overview</h2>
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-500 dark:text-slate-400">Total Budget</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatNaira(activeProject.totalBudget)}</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000"
                style={{ width: `${activeProject.totalBudget > 0 ? (activeProject.spentBudget / activeProject.totalBudget) * 100 : 0}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              <span>Spent: {formatNaira(activeProject.spentBudget)}</span>
              <span>Remaining: {formatNaira(activeProject.totalBudget - activeProject.spentBudget)}</span>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Phase Breakdown</h3>
            <div className="space-y-3">
              {activeProject.phases.map((phase) => (
                <div key={phase.id} className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", ["completed", "funded"].includes(phase.status) ? "bg-emerald-500" : phase.status === "in_progress" ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{phase.title}</span>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", getPhaseStatusColor(phase.status))}>{getPhaseStatusLabel(phase.status)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${phase.budgetAllocation > 0 ? (phase.budgetSpent / phase.budgetAllocation) * 100 : 0}%`,
                        backgroundColor: ["completed", "funded"].includes(phase.status) ? "#10b981" : "#f59e0b"
                      }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      <span>{formatNaira(phase.budgetSpent)} / {formatNaira(phase.budgetAllocation)}</span>
                      <span>{phase.milestones.filter((m) => m.completed).length}/{phase.milestones.length} milestones</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {currentPhase && (
            <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                  <IconClock size={15} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider">Current Phase</h3>
              </div>
              <h4 className="text-base font-bold text-amber-900 dark:text-amber-100 mb-1">{currentPhase.title}</h4>
              <p className="text-xs text-amber-700/60 dark:text-amber-300/50 mb-3">{currentPhase.description}</p>
              <div className="space-y-1.5">
                {currentPhase.milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    <div className={cn("w-3.5 h-3.5 rounded-md border-2 flex items-center justify-center flex-shrink-0", m.completed ? "bg-emerald-500 border-emerald-500" : "border-amber-300 dark:border-amber-700")}>
                      {m.completed && <IconCheck size={8} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={cn(m.completed ? "text-amber-800 dark:text-amber-200" : "text-amber-600/60 dark:text-amber-400/50")}>{m.title}</span>
                  </div>
                ))}
              </div>
              <Link href={`/dashboard/projects/${activeProject.id}`} className="flex items-center justify-center gap-1.5 w-full mt-4 py-2.5 text-[13px] font-semibold text-amber-800 dark:text-amber-200 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors">
                View Phase Details <IconArrowRight size={13} />
              </Link>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {activities.filter((a) => a.projectId === activeProject.id).slice(0, 5).length === 0 ? (
                <p className="text-[12px] text-slate-400 dark:text-slate-500 text-center py-4">No activity yet</p>
              ) : (
                activities.filter((a) => a.projectId === activeProject.id).slice(0, 5).map((act) => (
                  <div key={act.id} className="flex gap-3">
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", act.type === "payment" ? "bg-indigo-500" : act.type === "evidence" ? "bg-cyan-500" : act.type === "phase" ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500")} />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{act.action}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{act.details}</div>
                      <div className="text-[10px] text-slate-400/70 dark:text-slate-500/70 mt-0.5">{timeAgo(act.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {nextLocked && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
            <IconLock size={20} className="text-slate-500 dark:text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Next Phase: {nextLocked.title}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {formatNaira(nextLocked.budgetAllocation)} locked · Will unlock when {currentPhase?.title || "current phase"} is approved
            </p>
          </div>
          <Link href={`/dashboard/projects/${activeProject.id}`} className="flex-shrink-0 px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Review & Unlock
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">Payment Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Released</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{formatNaira(activeProject.fundsReleased)}</div>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4">
              <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">Total Locked</div>
              <div className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1">{formatNaira(activeProject.fundsLocked)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Upload Evidence", href: `/dashboard/projects/${activeProject.id}`, icon: <IconUpload size={16} className="text-cyan-600 dark:text-cyan-400" /> },
              { label: "Request Approval", href: "/dashboard/approvals", icon: <IconCheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" /> },
              { label: "View Reports", href: "/dashboard/reports", icon: <IconChart size={16} className="text-indigo-600 dark:text-indigo-400" /> },
              { label: "Raise Dispute", href: "/dashboard/disputes", icon: <IconShield size={16} className="text-rose-600 dark:text-rose-400" /> },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-200 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                {action.icon} {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
