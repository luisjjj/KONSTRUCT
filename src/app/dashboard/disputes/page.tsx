"use client";

import { useStore } from "@/lib/store";
import { formatDateTime, cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { IconShield, IconPlus, IconCheckCircle } from "@/components/icons";

export default function DisputesPage() {
  const { disputes, projects, currentUser, raiseDispute, addDisputeMessage, loadDisputes, loadProjects } = useStore();
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [msgText, setMsgText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await loadProjects();
      setLoading(false);
    };
    load();
  }, [loadProjects]);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach((p) => loadDisputes(p.id));
    }
  }, [projects, loadDisputes]);

  const userDisputes = disputes.filter((d) => {
    const p = projects.find((pp) => pp.id === d.projectId);
    return p && (p.ownerId === currentUser?.id || p.collaborators.includes(currentUser?.id || ""));
  });
  const sel = userDisputes.find((d) => d.id === selected);

  useEffect(() => {
    if (selected) {
      useStore.getState().loadDisputeMessages(selected);
    }
  }, [selected]);

  const handleCreate = () => {
    if (!newTitle || !newDesc || !newProjectId || !currentUser) return;
    raiseDispute({ projectId: newProjectId, title: newTitle, description: newDesc, raisedBy: currentUser.id, createdAt: new Date().toISOString() });
    setShowNew(false); setNewTitle(""); setNewDesc("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Disputes</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Track and resolve project disagreements</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm">
          <IconPlus size={14} /> Raise Dispute
        </button>
      </div>

      {userDisputes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <IconShield size={24} className="text-emerald-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No disputes</h3>
          <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">All projects are running smoothly</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-2.5">
            {userDisputes.map((d) => {
              const p = projects.find((pp) => pp.id === d.projectId);
              return (
                <button key={d.id} onClick={() => setSelected(d.id)} className={cn("w-full text-left bg-white dark:bg-slate-900 rounded-2xl border p-4 transition-all", selected === d.id ? "border-slate-300 shadow-sm" : "border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300")}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", d.status === "open" ? "bg-red-50 text-red-700" : d.status === "in_review" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>
                      {d.status}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{d.messages.length} msgs</span>
                  </div>
                  <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{d.title}</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{p?.name}</p>
                </button>
              );
            })}
          </div>
          <div className="lg:col-span-2">
            {sel ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 h-full flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{sel.title}</h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Raised {formatDateTime(sel.createdAt)}</p>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", sel.status === "open" ? "bg-red-50 text-red-700" : sel.status === "in_review" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>{sel.status}</span>
                </div>
                <div className="flex-1 p-5 space-y-3 overflow-y-auto max-h-80">
                  {sel.messages.map((m) => {
                    const isMe = m.userId === currentUser?.id;
                    return (
                      <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[80%] rounded-2xl px-4 py-3", isMe ? "bg-slate-900 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100")}>
                          <p className="text-[13px]">{m.content}</p>
                          <div className={cn("text-[10px] mt-1", isMe ? "text-slate-400" : "text-slate-500 dark:text-slate-400")}>{formatDateTime(m.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 p-4 border-t border-slate-100 dark:border-slate-800">
                  <input type="text" value={msgText} onChange={(e) => setMsgText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && msgText && sel) { addDisputeMessage(sel.id, currentUser!.id, msgText); setMsgText(""); } }}
                    className="flex-1 px-4 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" placeholder="Type a message..." />
                  <button onClick={() => { if (msgText && sel) { addDisputeMessage(sel.id, currentUser!.id, msgText); setMsgText(""); } }} disabled={!msgText}
                    className="px-4 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50">Send</button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-[13px]">Select a dispute to view details</div>
            )}
          </div>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Raise a Dispute</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Project</label>
                <select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all">
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" placeholder="Brief summary" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Description</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all min-h-[100px] resize-none" placeholder="Detailed description..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button onClick={handleCreate} disabled={!newTitle || !newDesc || !newProjectId} className="flex-1 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
