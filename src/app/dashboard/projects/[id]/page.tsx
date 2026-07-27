"use client";

import { useStore } from "@/lib/store";
import { formatNaira, formatDate, formatDateTime, timeAgo, getPhaseStatusColor, getPhaseStatusLabel, cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { IconChevronLeft, IconCheckCircle, IconUpload, IconCheck, IconClock, IconLock, IconMoney } from "@/components/icons";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { projects, currentUser, approvePhase, releasePhaseFund, toggleMilestone, addEvidence, verifyEvidence } = useStore();
  const project = projects.find((p) => p.id === projectId);
  const [activeTab, setActiveTab] = useState<"phases" | "evidence" | "payments" | "activity">("phases");
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadPhaseId, setUploadPhaseId] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadType, setUploadType] = useState<"photo" | "video" | "document">("photo");
  const [showApprove, setShowApprove] = useState(false);
  const [approvePhaseId, setApprovePhaseId] = useState<string | null>(null);
  const [showFund, setShowFund] = useState(false);
  const [fundPhaseId, setFundPhaseId] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Project not found</h2>
        <Link href="/dashboard/projects" className="px-5 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">Back to Projects</Link>
      </div>
    );
  }

  const currentPhase = project.phases.find((p) => ["in_progress", "submitted_for_review"].includes(p.status));
  const sel = project.phases.find((p) => p.id === selectedPhase);

  const doUpload = () => {
    if (!uploadPhaseId || !currentUser) return;
    addEvidence(project.id, uploadPhaseId, { phaseId: uploadPhaseId, type: uploadType, url: `/evidence/${uploadType}-${Date.now()}.jpg`, caption: uploadCaption, uploadedBy: currentUser.id, uploadedAt: new Date().toISOString(), verified: false });
    setShowUpload(false); setUploadCaption("");
  };

  const tabs = ["phases", "evidence", "payments", "activity"] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-[13px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 mb-2 transition-colors">
            <IconChevronLeft size={14} /> Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{project.name}</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{project.location} · {project.projectType}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setUploadPhaseId(currentPhase?.id || project.phases[0]?.id); setShowUpload(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm">
            <IconUpload size={14} /> Upload Evidence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Budget", value: formatNaira(project.totalBudget), icon: <IconMoney size={15} className="text-indigo-600" /> },
          { label: "Spent", value: formatNaira(project.spentBudget), icon: <IconClock size={15} className="text-amber-600" /> },
          { label: "Locked", value: formatNaira(project.fundsLocked), icon: <IconLock size={15} className="text-rose-600" /> },
          { label: "Released", value: formatNaira(project.fundsReleased), icon: <IconCheckCircle size={15} className="text-emerald-600" /> },
          { label: "Completion", value: `${project.completionPercentage}%`, icon: <IconCheckCircle size={15} className="text-violet-600" /> },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 dark:border-slate-700/80 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">{s.icon}<span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</span></div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 dark:border-slate-700/80 overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-2 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={cn("px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors", activeTab === t ? "border-slate-900 text-slate-900 dark:text-slate-100" : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300")}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "phases" && (
            <div className="space-y-3">
              {project.phases.map((phase) => {
                const done = phase.milestones.filter((m) => m.completed).length;
                const total = phase.milestones.length;
                const pct = phase.budgetAllocation > 0 ? (phase.budgetSpent / phase.budgetAllocation) * 100 : 0;
                const isOpen = selectedPhase === phase.id;
                return (
                  <div key={phase.id} className={cn("rounded-xl border transition-all cursor-pointer", isOpen ? "border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 shadow-sm" : "border-slate-200 dark:border-slate-700 hover:border-slate-300")} onClick={() => setSelectedPhase(isOpen ? null : phase.id)}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold", ["completed", "funded"].includes(phase.status) ? "bg-emerald-100 text-emerald-700" : ["in_progress", "submitted_for_review", "approved"].includes(phase.status) ? "bg-amber-100 text-amber-700" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
                            {phase.order}
                          </div>
                          <div>
                            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{phase.title}</h3>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{phase.description}</p>
                          </div>
                        </div>
                        <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", getPhaseStatusColor(phase.status))}>{getPhaseStatusLabel(phase.status)}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3">
                        <div><div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Budget</div><div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{formatNaira(phase.budgetAllocation)}</div></div>
                        <div><div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Spent</div><div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{formatNaira(phase.budgetSpent)}</div></div>
                        <div><div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Milestones</div><div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{done}/{total}</div></div>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: ["completed", "funded"].includes(phase.status) ? "#10b981" : "#f59e0b" }} />
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-4">
                        <div>
                          <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-2">Milestones</h4>
                          <div className="space-y-1.5">
                            {phase.milestones.map((m) => (
                              <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:bg-slate-900 transition-colors" onClick={(e) => { e.stopPropagation(); toggleMilestone(project.id, phase.id, m.id); }}>
                                <div className={cn("w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-colors", m.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-slate-400")}>
                                  {m.completed && <IconCheck size={9} className="text-white" strokeWidth={3} />}
                                </div>
                                <span className={cn("text-[13px] flex-1", m.completed ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400")}>{m.title}</span>
                                {m.completedAt && <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatDateTime(m.completedAt)}</span>}
                              </div>
                            ))}
                          </div>
                        </div>

                        {phase.evidence.length > 0 && (
                          <div>
                            <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-2">Evidence</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {phase.evidence.map((ev) => (
                                <div key={ev.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {ev.type === "photo" ? <IconUpload size={14} className="text-slate-500 dark:text-slate-400" /> : <IconUpload size={14} className="text-slate-500 dark:text-slate-400" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-medium text-slate-900 dark:text-slate-100 truncate">{ev.caption}</div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{timeAgo(ev.uploadedAt)}</div>
                                  </div>
                                  {ev.verified && <IconCheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {phase.status === "submitted_for_review" && currentUser?.role === "owner" && (
                            <button onClick={(e) => { e.stopPropagation(); setApprovePhaseId(phase.id); setShowApprove(true); }} className="flex-1 py-2.5 text-[13px] font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all">Approve Phase</button>
                          )}
                          {phase.status === "approved" && currentUser?.role === "owner" && (
                            <button onClick={(e) => { e.stopPropagation(); setFundPhaseId(phase.id); setShowFund(true); }} className="flex-1 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">Release Funds</button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); setUploadPhaseId(phase.id); setShowUpload(true); }} className="px-4 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Upload</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="space-y-3">
              {project.phases.flatMap((p) => p.evidence).length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-[13px]">No evidence uploaded yet</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {project.phases.flatMap((p) => p.evidence.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <IconUpload size={18} className="text-slate-400 dark:text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{ev.caption}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{timeAgo(ev.uploadedAt)}</div>
                        <div className="mt-1">
                          {ev.verified ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Verified</span>
                          ) : (
                            <button onClick={() => verifyEvidence(project.id, p.id, ev.id)} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">Verify</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-2.5">
              {project.phases.filter((p) => p.fundReleased).length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-[13px]">No payments released yet</div>
              ) : (
                project.phases.filter((p) => p.fundReleased).map((phase) => (
                  <div key={phase.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><IconCheckCircle size={16} className="text-emerald-600" /></div>
                      <div>
                        <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{phase.title} — Fund Release</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{phase.fundedAt ? formatDateTime(phase.fundedAt) : "N/A"}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-semibold text-emerald-700">{formatNaira(phase.budgetAllocation)}</div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Released</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-[13px]">Activity feed for this project</div>
          )}
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Upload Evidence</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["photo", "video", "document"] as const).map((t) => (
                  <button key={t} onClick={() => setUploadType(t)} className={cn("flex-1 rounded-xl border-2 p-2.5 text-[12px] font-semibold transition-all", uploadType === t ? "border-slate-900 bg-slate-50" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400")}>
                    {t === "photo" ? "Photo" : t === "video" ? "Video" : "Document"}
                  </button>
                ))}
              </div>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-slate-300 transition-colors cursor-pointer">
                <IconUpload size={28} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                <p className="text-[13px] text-slate-500 dark:text-slate-400">Click to upload or drag and drop</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">PNG, JPG, MP4 up to 50MB</p>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Caption</label>
                <input type="text" value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" placeholder="Describe what this evidence shows" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowUpload(false)} className="flex-1 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button onClick={doUpload} disabled={!uploadCaption} className="flex-1 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50">Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApprove && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowApprove(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <IconCheckCircle size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 text-center mb-2">Approve Phase Completion</h3>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 text-center mb-6 leading-relaxed">
              You are about to approve this phase. This will unlock the next phase funds and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowApprove(false)} className="flex-1 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
              <button onClick={() => { if (approvePhaseId) approvePhase(project.id, approvePhaseId); setShowApprove(false); }} className="flex-1 py-2.5 text-[13px] font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all">Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {showFund && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFund(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <IconMoney size={24} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 text-center mb-2">Release Phase Funds</h3>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 text-center mb-6 leading-relaxed">
              This will release the allocated funds for this phase to the contractor. Confirm fund release.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowFund(false)} className="flex-1 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
              <button onClick={() => { if (fundPhaseId) releasePhaseFund(project.id, fundPhaseId); setShowFund(false); }} className="flex-1 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">Release Funds</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
