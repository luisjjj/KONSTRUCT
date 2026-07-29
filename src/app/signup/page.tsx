"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/types";
import { IconBuilding } from "@/components/icons";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const roles: { value: UserRole; label: string; desc: string }[] = [
    {
      value: "owner",
      label: "Project Owner",
      desc: "I own or fund construction projects",
    },
    {
      value: "contractor",
      label: "Contractor",
      desc: "I execute construction work",
    },
    {
      value: "architect",
      label: "Architect / PM",
      desc: "I design or manage projects",
    },
  ];

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Send welcome email
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "welcome", to: email, name: fullName }),
    }).catch(() => {});

    if (data.session) {
      router.push("/dashboard");
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950 flex items-center justify-center mx-auto mb-6">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-green-600 dark:text-green-400"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
            Check your email
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
            We sent a confirmation link to{" "}
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {email}
            </span>
            . Click the link to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block py-3 px-6 text-[14px] font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 dark:bg-slate-950 relative overflow-hidden items-center justify-center">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.06) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 max-w-sm px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-8">
            <IconBuilding size={28} className="text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
            Start building with trust
          </h2>
          <p className="text-slate-400 dark:text-slate-500 leading-relaxed text-[15px]">
            Join thousands of construction professionals using Konstruct to
            deliver projects transparently.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <IconBuilding
                size={18}
                className="text-white dark:text-slate-900"
                strokeWidth={2}
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Konstruct
            </span>
          </Link>

          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    step >= s
                      ? "bg-slate-900 dark:bg-slate-100"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={step === 1 ? handleStep1 : handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                  Create your account
                </h1>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
                  Fill in your details to get started
                </p>
                <div>
                  <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all"
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all"
                    placeholder="Repeat your password"
                    required
                    minLength={8}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 text-[14px] font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm mt-4"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                  Choose your role
                </h1>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
                  This helps us customise your experience
                </p>
                <div className="space-y-2.5">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                        role === r.value
                          ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            role === r.value
                              ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {role === r.value && (
                            <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-900" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            {r.label}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            {r.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 text-[14px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 text-[14px] font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-slate-900 dark:text-slate-100 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
