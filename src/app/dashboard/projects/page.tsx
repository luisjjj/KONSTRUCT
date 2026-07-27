"use client";

import { useStore } from "@/lib/store";
import { formatNaira, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { IconFolder, IconPlus, IconBuilding } from "@/components/icons";
import { useEffect, useState } from "react";

export default function ProjectsPage() {
  const { projects, currentUser, loadProjects, _loaded } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadProjects().finally(() => setLoading(false));
    }
  }, [currentUser, loadProjects]);

  const userProjects = projects;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{userProjects.length} project{userProjects.length !== 1 ? "s" : ""} in your portfolio</p>
        </div>
        <Link href="/dashboard/projects/new" className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm">
          <IconPlus size={15} strokeWidth={2.5} /> New Project
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 animate-pulse">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-16 mb-4" />
              <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full mb-4" />
              <div className="space-y-2.5">
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {userProjects.map((project) => {
            const done = project.phases.filter((p) => ["completed", "funded"].includes(p.status)).length;
            const current = project.phases.find((p) => ["in_progress", "submitted_for_review"].includes(p.status));
            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 hover:shadow-lg hover:shadow-slate-200/40 hover:border-slate-300/80 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", project.status === "in_progress" ? "bg-emerald-50 text-emerald-700" : project.status === "completed" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700")}>
                    {project.status === "in_progress" ? "Active" : project.status === "completed" ? "Completed" : "Planning"}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{formatDate(project.createdAt)}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{project.name}</h3>
                <p className="text-[13px] text-slate-400 dark:text-slate-500 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-400 dark:text-slate-500">Budget</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatNaira(project.totalBudget)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-400 dark:text-slate-500">Location</span>
                    <span className="text-slate-600 dark:text-slate-300">{project.location}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${project.completionPercentage}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>{done}/{project.phases.length} phases completed</span>
                    <span className="font-medium">{project.completionPercentage}%</span>
                  </div>
                </div>
                {current && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[12px] font-medium text-amber-700">Current: {current.title}</span>
                  </div>
                )}
              </Link>
            );
          })}

          <Link href="/dashboard/projects/new"
            className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-14 hover:border-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <IconPlus size={20} className="text-slate-400 dark:text-slate-500" />
            </div>
            <span className="text-[13px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">Create New Project</span>
          </Link>
        </div>
      )}
    </div>
  );
}
