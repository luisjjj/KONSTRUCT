"use client";

import Link from "next/link";
import { IconBuilding, IconLock, IconCamera, IconRoute, IconMoney, IconClock, IconShield, IconCheckCircle, IconHandshake } from "@/components/icons";

export default function FeaturesPage() {
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-4">Built for trust and control</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Every feature in Konstruct is designed to create transparency, accountability, and confidence.</p>
        </div>
        <div className="space-y-24">
          {[
            { title: "Phase-Gated Fund Control", desc: "Next phase funds remain locked until the current phase is completed, documented, and owner-approved.", features: ["Automatic fund locking", "Milestone-based release", "Owner approval required", "Full audit trail"], icon: <IconLock size={28} className="text-indigo-600" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
            { title: "Visual Phase Roadmap", desc: "See your project as a structured journey. Completed phases glow green, active phases pulse amber, locked phases wait.", features: ["3D roadmap visualization", "Real-time status updates", "Interactive phase nodes", "Progress indicators"], icon: <IconRoute size={28} className="text-violet-600" />, color: "bg-violet-50 dark:bg-violet-900/20" },
            { title: "Evidence-Backed Verification", desc: "Contractors upload photos, videos, receipts, and documents. Each piece tagged to a specific phase and milestone.", features: ["Photo & video uploads", "Document attachments", "Milestone tagging", "Verification badges"], icon: <IconCamera size={28} className="text-cyan-600" />, color: "bg-cyan-50 dark:bg-cyan-900/20" },
            { title: "Shared Real-Time Dashboard", desc: "Both owner and contractor see the same truth. No information asymmetry. Progress, budget, and evidence in sync.", features: ["Live project status", "Budget tracking", "Activity feed", "Role-based views"], icon: <IconClock size={28} className="text-amber-600" />, color: "bg-amber-50 dark:bg-amber-900/20" },
            { title: "Transparent Payment System", desc: "Every payment is tied to verified milestones. Full audit trail from request to approval to release.", features: ["Payment requests", "Approval workflow", "Fund release tracking", "Payment history"], icon: <IconMoney size={28} className="text-emerald-600" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
            { title: "Dispute Resolution", desc: "Built-in dispute threads tied to specific phases or evidence. Comment, track, and resolve transparently.", features: ["Phase-linked disputes", "Message threads", "Resolution tracking", "Admin review option"], icon: <IconShield size={28} className="text-rose-600" />, color: "bg-rose-50 dark:bg-rose-900/20" },
          ].map((f, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12`}>
              <div className="flex-1">
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6`}>{f.icon}</div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-4">{f.title}</h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{f.desc}</p>
                <ul className="space-y-2">
                  {f.features.map((ft, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <IconCheckCircle size={15} className="text-emerald-500 flex-shrink-0" strokeWidth={2} />{ft}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full bg-slate-50 dark:bg-slate-800 rounded-3xl h-64 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                <div className="opacity-20">{f.icon}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Ready to build with trust?</h2>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 text-[15px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm mt-4">Get Started Free</Link>
        </div>
      </div>
    </div>
  );
}
