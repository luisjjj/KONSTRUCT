"use client";

import Link from "next/link";
import { IconBuilding, IconCheckCircle } from "@/components/icons";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const FlutterwavePay = dynamic(() => import("@/components/FlutterwavePay"), { ssr: false });

const plans = [
  { id: "starter", name: "Starter", price: "Free", amount: 0, desc: "For individual projects", features: ["1 active project", "Up to 5 phases", "Basic evidence upload", "Email support", "Mobile access"], popular: false },
  { id: "professional", name: "Professional", price: "₦25,000", amount: 25000, period: "/month", desc: "For active contractors and owners", features: ["10 active projects", "Unlimited phases", "Advanced analytics", "Priority support", "Quote comparison", "Dispute tracking"], popular: true },
  { id: "enterprise", name: "Enterprise", price: "₦100,000", amount: 100000, period: "/month", desc: "For large portfolios", features: ["Unlimited projects", "Team management", "Audit logs & reports", "Custom integrations", "Dedicated account manager", "SLA guarantee"], popular: false },
];

export default function PricingPage() {
  const [success, setSuccess] = useState(false);
  const [subscribedPlan, setSubscribedPlan] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUserEmail(session.user.email || "");
        setUserName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || "");
      }
    });
  }, []);

  const handleSuccess = async (planName: string) => {
    setSubscribedPlan(planName);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && planName !== "starter") {
      const { data, error } = await supabase.rpc("update_user_role_for_subscription", {
        p_user_id: user.id,
        p_plan_name: planName,
      });
      console.log("Role update result:", { data, error, planName, userId: user.id });
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600 dark:text-emerald-400">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Payment Successful!</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            Your <strong>{subscribedPlan}</strong> subscription is now active. You have access to all features in your plan.
          </p>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="px-6 py-3 text-[14px] font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <nav className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center"><IconBuilding size={15} className="text-white" strokeWidth={2} /></div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Konstruct</span>
          </Link>
          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Dashboard</Link>
                <Link href="/dashboard/projects" className="px-5 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">My Projects</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Log In</Link>
                <Link href="/signup" className="px-5 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Start free and scale as your portfolio grows.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative p-7 rounded-2xl border bg-white dark:bg-slate-900 transition-all ${plan.popular ? "border-slate-900 dark:border-slate-100 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900 dark:ring-slate-100" : "border-slate-200 dark:border-slate-700 hover:shadow-lg"}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">Most Popular</div>}
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{plan.price}</span>
                {plan.period && <span className="text-sm text-slate-400 dark:text-slate-500">{plan.period}</span>}
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">{plan.desc}</p>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <IconCheckCircle size={15} className="text-emerald-500 flex-shrink-0" strokeWidth={2} />{f}
                  </li>
                ))}
              </ul>
              {plan.amount === 0 ? (
                <Link href="/signup" className="block w-full text-center py-3 text-sm font-semibold rounded-xl transition-all bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                  Get Started Free
                </Link>
              ) : (
                <FlutterwavePay
                  amount={plan.amount}
                  planName={plan.name}
                  planId={plan.id}
                  customerEmail={userEmail}
                  customerName={userName}
                  onSuccess={() => handleSuccess(plan.name)}
                  className={`block w-full text-center py-3 text-sm font-semibold rounded-xl transition-all ${plan.popular ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                >
                  {plan.popular ? "Start Free Trial" : "Subscribe Now"}
                </FlutterwavePay>
              )}
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">Frequently asked questions</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {[
              { q: "Can I switch plans at any time?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing." },
              { q: "Is there a free trial for Professional?", a: "Yes, Professional comes with a 14-day free trial. No credit card required." },
              { q: "What payment methods do you accept?", a: "We accept debit cards, bank transfers, and USSD payments powered by Flutterwave." },
              { q: "Can I export my data?", a: "Yes, you can export all your project data, reports, and evidence at any time." },
            ].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 text-left">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] mb-1">{faq.q}</h4>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
