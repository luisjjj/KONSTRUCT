"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { getRoleLabel, getRoleColor, cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";
import {
  IconBuilding, IconFolder, IconCheckCircle, IconCreditCard, IconShield,
  IconFileText, IconChart, IconSettings, IconBell, IconSearch, IconMenu,
  IconX, IconLogout, IconChevronRight
} from "@/components/icons";

function SunIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <IconBuilding size={18} /> },
  { label: "Projects", href: "/dashboard/projects", icon: <IconFolder size={18} /> },
  { label: "Approvals", href: "/dashboard/approvals", icon: <IconCheckCircle size={18} /> },
  { label: "Payments", href: "/dashboard/payments", icon: <IconCreditCard size={18} /> },
  { label: "Disputes", href: "/dashboard/disputes", icon: <IconShield size={18} /> },
  { label: "Quotes", href: "/dashboard/quotes", icon: <IconFileText size={18} /> },
  { label: "Reports", href: "/dashboard/reports", icon: <IconChart size={18} /> },
  { label: "Settings", href: "/dashboard/settings", icon: <IconSettings size={18} /> },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { currentUser, logout, notifications } = useStore();
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.read && n.userId === currentUser?.id).length;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    logout();
    router.push("/");
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-[272px] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-700/80 z-50 flex flex-col transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="px-5 h-[72px] flex items-center border-b border-slate-100 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <IconBuilding size={18} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Konstruct</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200/50"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                )}>
                <span className={cn(isActive ? "text-white" : "text-slate-400 dark:text-slate-500")}>{item.icon}</span>
                {item.label}
                {item.label === "Approvals" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">{unreadCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 flex-shrink-0">
              {currentUser?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">{currentUser?.name || "User"}</div>
              <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold mt-0.5", getRoleColor(currentUser?.role || "owner"))}>
                {getRoleLabel(currentUser?.role || "owner")}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <IconLogout size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { notifications, markAllNotificationsRead, currentUser } = useStore();
  const { theme, toggle } = useTheme();
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read && n.userId === currentUser?.id).length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/80">
      <div className="flex items-center justify-between h-[60px] px-4 lg:px-8">
        <button onClick={onMenuToggle} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <IconMenu size={20} />
        </button>
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input type="text" placeholder="Search projects, phases..." className="w-full pl-9 pr-4 py-2 text-[13px] rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-slate-200 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <SunIcon size={18} className="text-slate-400 dark:text-slate-500" />
            ) : (
              <MoonIcon size={18} className="text-slate-500" />
            )}
          </button>
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <IconBell size={18} className="text-slate-500 dark:text-slate-400" />
              {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />}
            </button>
            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                    <button onClick={markAllNotificationsRead} className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                    {notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className={cn("px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer", !n.read && "bg-indigo-50/30 dark:bg-indigo-900/20")}>
                        <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{n.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, setCurrentUser } = useStore();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user && mounted) {
        const meta = user.user_metadata || {};
        setCurrentUser({
          id: user.id,
          name: meta.full_name || user.email?.split("@")[0] || "User",
          email: user.email || "",
          role: meta.role || "owner",
          createdAt: user.created_at,
        });
      }
      if (mounted) setAuthChecked(true);
    };
    checkAuth();
    return () => { mounted = false; };
  }, [router, setCurrentUser]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[272px]">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
