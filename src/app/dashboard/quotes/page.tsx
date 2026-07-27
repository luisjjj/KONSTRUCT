"use client";

import { useStore } from "@/lib/store";
import { formatNaira, formatDate, cn } from "@/lib/utils";
import { useState } from "react";
import { IconFileText } from "@/components/icons";

export default function QuotesPage() {
  const { quotes, projects } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const sel = quotes.find((q) => q.id === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Quotes & BOQ</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Compare contractor quotations and manage bill of quantities</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Submitted Quotes</h3>
          {quotes.map((q) => {
            const p = projects.find((pp) => pp.id === q.projectId);
            return (
              <button key={q.id} onClick={() => setSelected(q.id)} className={cn("w-full text-left bg-white dark:bg-slate-900 rounded-2xl border p-4 transition-all", selected === q.id ? "border-slate-300 shadow-sm" : "border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300")}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", q.status === "pending" ? "bg-amber-50 text-amber-700" : q.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{q.status}</span>
                </div>
                <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{q.contractorName}</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{p?.name || "Unknown"}</p>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">{formatNaira(q.totalAmount)}</div>
              </button>
            );
          })}
        </div>
        <div className="lg:col-span-2">
          {sel ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{sel.contractorName}</h3>
                  <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-0.5">Submitted {formatDate(sel.submittedAt)}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="px-4 py-2 text-[13px] font-semibold text-red-600 bg-white dark:bg-slate-900 border border-red-200 rounded-xl hover:bg-red-50 transition-all">Reject</button>
                  <button className="px-4 py-2 text-[13px] font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all">Approve Quote</button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 mb-6">
                <div className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Quote Amount</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatNaira(sel.totalAmount)}</div>
              </div>
              <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-3">Bill of Quantities</h4>
              <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Item</th>
                    <th className="text-right py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="text-right py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unit</th>
                    <th className="text-right py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="text-right py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sel.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800">
                      <td className="py-3 text-slate-900 dark:text-slate-100">{item.description}</td>
                      <td className="py-3 text-right text-slate-500 dark:text-slate-400">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-500 dark:text-slate-400">{item.unit}</td>
                      <td className="py-3 text-right text-slate-500 dark:text-slate-400">{formatNaira(item.unitPrice)}</td>
                      <td className="py-3 text-right font-semibold text-slate-900 dark:text-slate-100">{formatNaira(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td colSpan={4} className="py-3 text-right font-semibold text-slate-900 dark:text-slate-100">Total</td><td className="py-3 text-right font-bold text-lg text-slate-900 dark:text-slate-100">{formatNaira(sel.totalAmount)}</td></tr>
                </tfoot>
              </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-[13px]">Select a quote to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
