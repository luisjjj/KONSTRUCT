"use client";

import Link from "next/link";
import { IconBuilding, IconCheckCircle, IconArrowRight } from "@/components/icons";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <nav className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center"><IconBuilding size={15} className="text-white" strokeWidth={2} /></div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Konstruct</span>
          </Link>
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Log In</Link>
            <Link href="/signup" className="px-5 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">Get Started</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-4">How Konstruct works</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">A simple, transparent process that protects both parties at every step.</p>
        </div>
        <div className="space-y-16">
          {[
            { step: "01", title: "Create Your Project", desc: "Set up your construction project with phases, budgets, and milestones. Invite your contractor, architect, or project manager.", details: ["Define project phases", "Set budget allocation per phase", "Create milestone checklists", "Invite stakeholders by email"] },
            { step: "02", title: "Contractor Updates Progress", desc: "The contractor works through each phase, updating milestones and uploading evidence of progress.", details: ["Mark milestones as completed", "Upload site photos and videos", "Attach receipts and documents", "Submit phase for owner review"] },
            { step: "03", title: "Owner Reviews & Approves", desc: "The owner reviews submitted evidence, verifies milestone completion, and approves the phase.", details: ["Review uploaded evidence", "Verify milestone completion", "Approve or request changes", "All actions logged with timestamps"] },
            { step: "04", title: "Funds Are Released", desc: "Once approved, the next phase funds are unlocked. The contractor can proceed with full transparency.", details: ["Next phase budget unlocks", "Payment recorded in audit trail", "Both parties see the same data", "Project progresses to next phase"] },
          ].map((item, i) => (
            <div key={i} className="relative">
              {i < 3 && <div className="absolute left-5 top-14 bottom-0 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm">{item.step}</div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">{item.title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                  <ul className="space-y-2">
                    {item.details.map((d, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <IconCheckCircle size={14} className="text-emerald-500 flex-shrink-0" strokeWidth={2} />{d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-20 bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-slate-400 dark:text-slate-500 max-w-lg mx-auto mb-8">Create your first project in minutes. No credit card required.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 text-[15px] font-semibold bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-all shadow-sm">
            Start Your Project <IconArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
