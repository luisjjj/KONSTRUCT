"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/lib/theme";
import { IconBuilding, IconLock, IconCamera, IconRoute, IconMoney, IconClock, IconShield, IconCheckCircle, IconArrowRight, IconMenu, IconX, IconHandshake, IconEye, IconCheck } from "@/components/icons";

const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

function Counter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const dur = 2000;
    const inc = target / (dur / 16);
    const t = setInterval(() => {
      start += inc;
      if (start >= target) { setVal(target); clearInterval(t); } else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

export default function LandingContent() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Trust", href: "#trust" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                <IconBuilding size={18} className="text-white dark:text-slate-900" strokeWidth={2} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Konstruct</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">{l.label}</a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle dark mode">
                {theme === "dark" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
              </button>
              <Link href="/login" className="px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Log In</Link>
              <Link href="/signup" className="px-5 py-2.5 text-[13px] font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-all active:scale-[0.98] shadow-sm">Get Started</Link>
            </div>
            <div className="flex md:hidden items-center gap-2">
              <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle dark mode">
                {theme === "dark" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {menuOpen ? <IconX size={20} className="text-slate-600 dark:text-slate-300" /> : <IconMenu size={20} className="text-slate-600 dark:text-slate-300" />}
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4 space-y-1 shadow-lg">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">{l.label}</a>
            ))}
            <div className="pt-3 flex gap-2 border-t border-slate-100 dark:border-slate-800 mt-2">
              <Link href="/login" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">Log In</Link>
              <Link href="/signup" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-white">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none z-0">
          <HeroScene />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.08] mb-6">
              Build with confidence.
              <br />
              <span className="text-slate-400 dark:text-slate-500">Pay with proof.</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The phase-gated construction ledger that keeps every naira tied to verified progress. Owners see proof. Contractors get paid. Both trust the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-all active:scale-[0.98] shadow-sm">
                Start Your Project <IconArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] shadow-sm">
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 border-y border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: 20, prefix: "\u20A6", suffix: "M+", label: "Projected Value Tracked" },
              { val: 5, suffix: "+", label: "Active Properties" },
              { val: 98, suffix: "%", label: "On-Time Completion" },
              { val: 50, suffix: "+", label: "Milestones Verified" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  <Counter target={s.val} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div className="text-sm text-slate-400 dark:text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Every feature builds trust</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              From foundation to finishing, Konstruct ensures every phase is documented, verified, and approved before funds move.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-in">
            {[
              { icon: <IconLock size={22} className="text-indigo-600 dark:text-indigo-400" />, title: "Phase-Locked Funds", desc: "Next phase funds stay locked until current phase milestones are verified and approved. No shortcuts.", color: "bg-indigo-50 dark:bg-indigo-900/30" },
              { icon: <IconCamera size={22} className="text-cyan-600 dark:text-cyan-400" />, title: "Evidence-Backed Progress", desc: "Contractors upload photos, videos, and documents. Owners verify and approve with confidence.", color: "bg-cyan-50 dark:bg-cyan-900/30" },
              { icon: <IconRoute size={22} className="text-violet-600 dark:text-violet-400" />, title: "Visual Phase Roadmap", desc: "See your project as a structured journey. Completed phases glow, locked phases wait.", color: "bg-violet-50 dark:bg-violet-900/30" },
              { icon: <IconMoney size={22} className="text-emerald-600 dark:text-emerald-400" />, title: "Transparent Payments", desc: "Every payment is tied to verified milestones. Full audit trail from request to release.", color: "bg-emerald-50 dark:bg-emerald-900/30" },
              { icon: <IconClock size={22} className="text-amber-600 dark:text-amber-400" />, title: "Real-Time Dashboard", desc: "Both owner and contractor see the same truth. Progress, budget, and evidence in sync.", color: "bg-amber-50 dark:bg-amber-900/30" },
              { icon: <IconShield size={22} className="text-rose-600 dark:text-rose-400" />, title: "Dispute Resolution", desc: "Built-in dispute threads tied to phases. Evidence, comments, and resolution tracking.", color: "bg-rose-50 dark:bg-rose-900/30" },
            ].map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-300 hover:-translate-y-0.5">
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>{f.icon}</div>
                <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 lg:py-28 bg-slate-900 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">How Konstruct works</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A simple, transparent process that protects both the project owner and the contractor.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-in">
            {[
              { step: "01", title: "Create Project", desc: "Set up your project with phases, budgets, and milestones. Invite your team." },
              { step: "02", title: "Track Progress", desc: "Contractors update phases and upload evidence. You see everything in real time." },
              { step: "03", title: "Verify & Approve", desc: "Review evidence, verify milestones, and approve phase completion." },
              { step: "04", title: "Release Funds", desc: "Approved phases unlock the next budget. Payments flow with proof." },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                {i < 3 && <div className="hidden lg:block absolute top-5 right-0 w-8 h-px bg-white/10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Start free. Scale as your portfolio grows. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-in">
            {[
              { name: "Starter", price: "Free", desc: "For individual projects", features: ["1 project", "Up to 5 phases", "Basic evidence upload", "Email support", "Mobile access"], cta: "Get Started", popular: false },
              { name: "Professional", price: "\u20A625,000", period: "/month", desc: "For active teams", features: ["10 projects", "Unlimited phases", "Advanced analytics", "Priority support", "Quote comparison", "Dispute tracking"], cta: "Start Free Trial", popular: true },
              { name: "Enterprise", price: "Custom", desc: "For large portfolios", features: ["Unlimited projects", "Team management", "Audit logs & reports", "Custom integrations", "Dedicated account manager", "SLA guarantee"], cta: "Contact Sales", popular: false },
            ].map((plan, i) => (
              <div key={i} className={`relative p-7 rounded-2xl border bg-white dark:bg-slate-900 transition-all duration-300 hover:-translate-y-0.5 ${plan.popular ? "border-slate-900 dark:border-slate-100 shadow-xl shadow-slate-200/50 dark:shadow-slate-800/50 ring-1 ring-slate-900 dark:ring-slate-100" : "border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-slate-800"}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">Most Popular</div>}
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{plan.price}</span>
                    {plan.period && <span className="text-sm text-slate-400">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <IconCheckCircle size={15} className="text-emerald-500 flex-shrink-0" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block w-full text-center py-3 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] ${plan.popular ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white shadow-sm" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">Built for trust. Designed for Nigeria.</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed">
            Konstruct was created to solve the construction trust problem in Nigeria. Every feature is designed to prevent fraud, ensure accountability, and create a shared source of truth.
          </p>
          <div className="grid md:grid-cols-3 gap-6 stagger-in">
            {[
              { icon: <IconBuilding size={28} className="text-slate-700 dark:text-slate-300" />, title: "Phase-Gated Control", desc: "Funds only release when work is verified. No abandonment after mobilization." },
              { icon: <IconEye size={28} className="text-slate-700 dark:text-slate-300" />, title: "Evidence Trail", desc: "Every milestone backed by photos, videos, and documents. Immutable audit log." },
              { icon: <IconHandshake size={28} className="text-slate-700 dark:text-slate-300" />, title: "Shared Truth", desc: "Owner and contractor see the same dashboard. No information asymmetry." },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">{item.icon}</div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Ready to build with confidence?</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-10">Join hundreds of project owners and contractors who trust Konstruct.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 text-[15px] font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-all active:scale-[0.98] shadow-sm">
            Start Your Project Today <IconArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                  <IconBuilding size={15} className="text-white dark:text-slate-900" strokeWidth={2} />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Konstruct</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">The trust engine for construction delivery in Nigeria.</p>
            </div>
            {[
              { title: "Product", links: [
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Security", href: "/features" },
              ]},
              { title: "Company", links: [
                { label: "About", href: "/features" },
                { label: "Blog", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#" },
              ]},
              { title: "Legal", links: [
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
                { label: "Cookie Policy", href: "#" },
              ]},
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><Link href={link.href} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{link.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">&copy; 2026 Konstruct. All rights reserved.</p>
            <p className="text-xs text-slate-400">Made for Nigeria. Built for the world.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
