"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IconBell, IconCheckCircle, IconCreditCard, IconShield, IconFolder, IconSettings } from "@/components/icons";

const typeIcons: Record<string, React.ReactNode> = {
  phase: <IconCheckCircle size={16} className="text-blue-500" />,
  payment: <IconCreditCard size={16} className="text-emerald-500" />,
  dispute: <IconShield size={16} className="text-amber-500" />,
  evidence: <IconFolder size={16} className="text-violet-500" />,
  system: <IconSettings size={16} className="text-slate-400" />,
};

const typeColors: Record<string, string> = {
  phase: "bg-blue-50 dark:bg-blue-950",
  payment: "bg-emerald-50 dark:bg-emerald-950",
  dispute: "bg-amber-50 dark:bg-amber-950",
  evidence: "bg-violet-50 dark:bg-violet-950",
  system: "bg-slate-100 dark:bg-slate-800",
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead}
            className="px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-12 text-center">
          <IconBell size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 dark:text-slate-500">No notifications yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">You&apos;ll see updates here when things happen</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button key={n.id} onClick={() => markNotificationRead(n.id)}
              className={cn(
                "w-full text-left bg-white dark:bg-slate-900 rounded-2xl border p-4 transition-all hover:shadow-md",
                n.read
                  ? "border-slate-200/80 dark:border-slate-700/80"
                  : "border-slate-300 dark:border-slate-600 ring-1 ring-slate-200 dark:ring-slate-700"
              )}>
              <div className="flex items-start gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", typeColors[n.type] || typeColors.system)}>
                  {typeIcons[n.type] || typeIcons.system}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                    {new Date(n.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
