"use client";

import { useStore } from "@/lib/store";
import { getRoleLabel, getRoleColor, cn } from "@/lib/utils";
import { useState } from "react";
import { IconSettings, IconKey, IconTrash, IconCheckCircle } from "@/components/icons";

export default function SettingsPage() {
  const { currentUser } = useStore();
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [org, setOrg] = useState(currentUser?.organization || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-600 dark:text-slate-300">
            {currentUser?.name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">{currentUser?.name}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold", getRoleColor(currentUser?.role || "owner"))}>
                {getRoleLabel(currentUser?.role || "owner")}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                <IconKey size={10} /> immutable
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" placeholder="+234 ..." />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Organization</label>
            <input type="text" value={org} onChange={(e) => setOrg(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" />
          </div>
          <button onClick={handleSave} className="px-5 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm">
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Notifications</h2>
        <div className="space-y-3">
          {[
            { label: "Email notifications for approvals", checked: true },
            { label: "Email notifications for payments", checked: true },
            { label: "Email notifications for evidence uploads", checked: false },
            { label: "SMS notifications for urgent items", checked: false },
          ].map((item, i) => (
            <label key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="text-[13px] text-slate-900 dark:text-slate-100">{item.label}</span>
              <div className={cn("w-10 h-6 rounded-full transition-colors relative cursor-pointer", item.checked ? "bg-slate-900" : "bg-slate-300")}>
                <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-transform", item.checked ? "translate-x-5" : "translate-x-1")} />
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Security</h2>
        <div className="space-y-2">
          {[
            { label: "Change Password", icon: <IconKey size={16} className="text-slate-500 dark:text-slate-400" />, color: "" },
            { label: "Two-Factor Authentication", icon: <IconCheckCircle size={16} className="text-slate-500 dark:text-slate-400" />, color: "" },
            { label: "Delete Account", icon: <IconTrash size={16} className="text-red-500" />, color: "text-red-600 hover:bg-red-50" },
          ].map((item, i) => (
            <button key={i} className={cn("flex items-center gap-3 w-full px-4 py-3 text-[13px] font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left", item.color)}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
