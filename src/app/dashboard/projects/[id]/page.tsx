"use client";

import { useStore } from "@/lib/store";
import { formatNaira, formatDate, formatDateTime, timeAgo, getPhaseStatusColor, getPhaseStatusLabel, cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IconChevronLeft, IconCheckCircle, IconUpload, IconCheck, IconClock, IconLock, IconMoney, IconCamera, IconUsers } from "@/components/icons";
import { uploadEvidenceFile, type ProjectInvite } from "@/lib/supabase/browser-queries";
import { openWhatsApp } from "@/lib/utils";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { projects, activities, currentUser, loadProject, approvePhase, releasePhaseFund, toggleMilestone, addEvidence, verifyEvidence } = useStore();
  const project = projects.find((p) => p.id === projectId);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"phases" | "timeline" | "evidence" | "payments" | "activity">("phases");
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadPhaseId, setUploadPhaseId] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadType, setUploadType] = useState<"photo" | "video" | "document">("photo");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"contractor" | "verifier">("contractor");
  const [sendingInvite, setSendingInvite] = useState(false);
  const { projectInvites, loadProjectInvites, sendInvite } = useStore();
  const [showApprove, setShowApprove] = useState(false);
  const [approvePhaseId, setApprovePhaseId] = useState<string | null>(null);
  const [showFund, setShowFund] = useState(false);
  const [fundPhaseId, setFundPhaseId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId).finally(() => setLoading(false));
      loadProjectInvites(projectId);
    }
  }, [projectId, loadProject, loadProjectInvites]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin" />
      </div>
    );
  }

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

  const doUpload = async () => {
    if (!uploadPhaseId || !currentUser || !uploadFile) return;
    setUploading(true);
    const url = await uploadEvidenceFile(uploadFile, project.id);
    if (url) {
      addEvidence(project.id, uploadPhaseId, {
        phaseId: uploadPhaseId,
        type: uploadType,
        url,
        caption: uploadCaption,
        uploadedBy: currentUser.id,
        uploadedAt: new Date().toISOString(),
        verified: false,
      });
    }
    setUploading(false);
    setShowUpload(false);
    setUploadCaption("");
    setUploadFile(null);
  };

  const tabs = ["phases", "timeline", "evidence", "payments", "activity"] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-[13px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mb-2 transition-colors">
            <IconChevronLeft size={14} /> Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{project.name}</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{project.location} · {project.projectType}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openWhatsApp("", `Check out "${project.name}" on Konstruct\n\n${project.location} · ${project.projectType}\nBudget: ${formatNaira(project.totalBudget)}\nCompletion: ${project.completionPercentage}%\n\nhttps://konstruct.name.ng/dashboard/projects/${project.id}`)} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Share on WhatsApp
          </button>
          <button onClick={() => setShowInvite(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <IconUsers size={14} /> Invite
          </button>
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
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">{s.icon}<span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</span></div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-2 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={cn("px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors", activeTab === t ? "border-slate-900 text-slate-900 dark:text-slate-100" : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "phases" && (
            <div className="space-y-3">
              {project.phases.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-[13px]">No phases created yet</div>
              ) : project.phases.map((phase) => {
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
                          {phase.milestones.length === 0 ? (
                            <p className="text-[12px] text-slate-400 dark:text-slate-500">No milestones yet</p>
                          ) : (
                            <div className="space-y-1.5">
                              {phase.milestones.map((m) => (
                                <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition-colors" onClick={(e) => { e.stopPropagation(); toggleMilestone(project.id, phase.id, m.id); }}>
                                  <div className={cn("w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-colors", m.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-slate-400")}>
                                    {m.completed && <IconCheck size={9} className="text-white" strokeWidth={3} />}
                                  </div>
                                  <span className={cn("text-[13px] flex-1", m.completed ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400")}>{m.title}</span>
                                  {m.completedAt && <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatDateTime(m.completedAt)}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {phase.evidence.length > 0 && (
                          <div>
                            <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-2">Evidence</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {phase.evidence.map((ev) => (
                                <div key={ev.id} className="rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                                  {ev.type === "photo" && ev.url && !ev.url.startsWith("/evidence") ? (
                                    <img src={ev.url} alt={ev.caption} className="w-full h-24 object-cover" />
                                  ) : (
                                    <div className="w-full h-24 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                      <IconUpload size={20} className="text-slate-400 dark:text-slate-500" />
                                    </div>
                                  )}
                                  <div className="p-2">
                                    <div className="text-[11px] font-medium text-slate-900 dark:text-slate-100 truncate">{ev.caption}</div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{timeAgo(ev.uploadedAt)}</span>
                                      {ev.verified && <IconCheckCircle size={12} className="text-emerald-500" />}
                                    </div>
                                  </div>
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

          {activeTab === "timeline" && (
            <div className="space-y-4">
              {project.phases.flatMap((p) => p.evidence.filter((e) => e.type === "photo" && e.url && !e.url.startsWith("/evidence"))).length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-[13px]">No progress photos yet</div>
              ) : (
                <>
                  <p className="text-[12px] text-slate-400 dark:text-slate-500">Chronological photo feed — {project.phases.flatMap((p) => p.evidence.filter((e) => e.type === "photo")).length} photos uploaded</p>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-6">
                      {project.phases.flatMap((p) =>
                        p.evidence
                          .filter((e) => e.type === "photo" && e.url && !e.url.startsWith("/evidence"))
                          .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                          .map((ev) => (
                            <div key={ev.id} className="relative pl-10">
                              <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-slate-900 dark:bg-slate-100 border-2 border-white dark:border-slate-900 z-10" />
                              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                                <img src={ev.url} alt={ev.caption} className="w-full h-48 object-cover" />
                                <div className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{ev.caption}</div>
                                    {ev.verified && <IconCheckCircle size={14} className="text-emerald-500" />}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{timeAgo(ev.uploadedAt)}</span>
                                    <span className="text-[10px] text-slate-300 dark:text-slate-600">·</span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{p.title}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="space-y-3">
              {project.phases.flatMap((p) => p.evidence).length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-[13px]">No evidence uploaded yet</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {project.phases.flatMap((p) => p.evidence.map((ev) => (
                    <div key={ev.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      {ev.type === "photo" && ev.url && !ev.url.startsWith("/evidence") ? (
                        <img src={ev.url} alt={ev.caption} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                          <IconUpload size={24} className="text-slate-400 dark:text-slate-500" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{ev.caption}</div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{timeAgo(ev.uploadedAt)}</div>
                          </div>
                        </div>
                        <div className="mt-2">
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
            <div className="space-y-3">
              {activities.filter((a) => a.projectId === project.id).length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-[13px]">No activity yet</div>
              ) : (
                activities.filter((a) => a.projectId === project.id).slice(0, 20).map((act) => (
                  <div key={act.id} className="flex gap-3">
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", act.type === "payment" ? "bg-indigo-500" : act.type === "evidence" ? "bg-cyan-500" : act.type === "phase" ? "bg-emerald-500" : "bg-slate-400")} />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{act.action}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{act.details}</div>
                      <div className="text-[10px] text-slate-400/70 dark:text-slate-500/70 mt-0.5">{timeAgo(act.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
              <input
                ref={fileInputRef}
                type="file"
                accept={uploadType === "photo" ? "image/*" : uploadType === "video" ? "video/*" : ".pdf,.doc,.docx"}
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <div
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-slate-300 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadFile ? (
                  <div>
                    {uploadFile.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(uploadFile)} alt="Preview" className="w-20 h-20 object-cover rounded-lg mx-auto mb-2" />
                    ) : (
                      <IconUpload size={28} className="mx-auto mb-2 text-slate-400" />
                    )}
                    <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{uploadFile.name}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    <button onClick={(e) => { e.stopPropagation(); setUploadFile(null); }} className="text-[11px] text-red-500 mt-1 hover:text-red-600">Remove</button>
                  </div>
                ) : (
                  <>
                    <IconUpload size={28} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">Click to upload or drag and drop</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      {uploadType === "photo" ? "PNG, JPG up to 50MB" : uploadType === "video" ? "MP4 up to 50MB" : "PDF, DOC up to 10MB"}
                    </p>
                  </>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Caption</label>
                <input type="text" value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" placeholder="Describe what this evidence shows" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowUpload(false); setUploadFile(null); }} className="flex-1 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button onClick={doUpload} disabled={!uploadCaption || !uploadFile || uploading} className="flex-1 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50">
                  {uploading ? "Uploading..." : "Upload"}
                </button>
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
              <button onClick={async () => { if (approvePhaseId) await approvePhase(project.id, approvePhaseId); setShowApprove(false); }} className="flex-1 py-2.5 text-[13px] font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all">Confirm Approval</button>
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
              <button onClick={async () => { if (fundPhaseId) await releasePhaseFund(project.id, fundPhaseId); setShowFund(false); }} className="flex-1 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">Release Funds</button>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <IconUsers size={24} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 text-center mb-4">Invite to Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Email Address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" placeholder="contractor@email.com" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Role</label>
                <div className="flex gap-2">
                  {(["contractor", "verifier"] as const).map((r) => (
                    <button key={r} onClick={() => setInviteRole(r)} className={cn("flex-1 rounded-xl border-2 p-2.5 text-[12px] font-semibold transition-all capitalize", inviteRole === r ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400")}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {projectInvites.length > 0 && (
                <div>
                  <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Pending Invites</label>
                  <div className="space-y-1.5">
                    {projectInvites.filter((i) => !i.accepted).map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-medium text-slate-900 dark:text-slate-100 truncate">{invite.email}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{invite.role}</div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setShowInvite(false); setInviteEmail(""); }} className="flex-1 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button onClick={async () => {
                  if (!inviteEmail || sendingInvite) return;
                  setSendingInvite(true);
                  const ok = await sendInvite(project.id, inviteEmail, inviteRole);
                  setSendingInvite(false);
                  if (ok) {
                    setInviteEmail("");
                    setShowInvite(false);
                  }
                }} disabled={!inviteEmail || sendingInvite} className="flex-1 py-2.5 text-[13px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50">
                  {sendingInvite ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
