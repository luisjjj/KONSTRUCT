"use client";

import { useState, useEffect } from "react";

export default function WaitlistContent() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => setCount(d.count || 0))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();

      if (data.duplicate) {
        setStatus("duplicate");
      } else if (data.success) {
        setStatus("success");
        setCount((c) => c + 1);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Nav */}
      <nav className="w-full px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-white text-xl font-bold tracking-tight">Konstruct</span>
        <span className="text-[12px] text-slate-500 font-medium tracking-wide uppercase">Coming Soon</span>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-[12px] text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Launching Soon
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            The trust engine for{" "}
            <span className="text-slate-400">construction delivery</span>{" "}
            in Nigeria
          </h1>

          {/* Subtext */}
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-md mx-auto">
            Lock funds into milestones. Verify work with evidence. Keep every
            naira accountable. Konstruct makes construction projects transparent
            and trustworthy.
          </p>

          {/* Form */}
          {status === "success" ? (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-[14px] font-semibold text-emerald-400">
                  You&apos;re on the list!
                </span>
              </div>
              <p className="text-[13px] text-slate-500">
                We&apos;ll notify you the moment we launch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="flex-1 px-4 py-3.5 text-[14px] rounded-xl bg-slate-800/80 border border-slate-700/60 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500/50 transition-all"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3.5 text-[14px] rounded-xl bg-slate-800/80 border border-slate-700/60 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!email || status === "loading"}
                className="w-full sm:w-auto px-8 py-3.5 text-[14px] font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Joining..." : "Join the Waitlist"}
              </button>
              {status === "duplicate" && (
                <p className="text-[13px] text-slate-400">
                  You&apos;re already on the list. We&apos;ll be in touch!
                </p>
              )}
              {status === "error" && (
                <p className="text-[13px] text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          )}

          {/* Social proof */}
          <p className="text-[13px] text-slate-500">
            {count > 0 ? (
              <>
                Join <span className="text-slate-300 font-semibold">{count.toLocaleString()}</span> people already on the waitlist
              </>
            ) : (
              "Be the first to know when we launch"
            )}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-6 text-center">
        <p className="text-[12px] text-slate-600">
          &copy; 2026 Konstruct. Made for Nigeria. Built for the world.
        </p>
      </footer>
    </div>
  );
}
