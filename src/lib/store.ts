import { create } from "zustand";
import { User, Project, Activity, Notification, Dispute, Quote, Phase, PhaseStatus, Milestone, Evidence, Payment } from "@/types";
import {
  fetchProjects,
  fetchProjectWithPhases,
  insertProject,
  insertPhase,
  insertMilestone as insertMilestoneDB,
  toggleMilestone as toggleMilestoneDB,
  approvePhaseInDB,
  releasePhaseFundInDB,
  insertEvidence as insertEvidenceDB,
  verifyEvidenceInDB,
  fetchActivities,
  fetchPayments,
  fetchDisputes,
  insertDispute as insertDisputeDB,
  fetchDisputeMessages,
  insertDisputeMessage as insertDisputeMessageDB,
  fetchSubscription,
  fetchNotifications as fetchNotificationsDB,
  insertNotification as insertNotificationDB,
  markNotificationRead as markNotificationReadDB,
  markAllNotificationsRead as markAllNotificationsReadDB,
  fetchProjectInvites,
  sendProjectInvite,
  acceptProjectInvite,
  type Subscription,
  type NotificationRow,
} from "@/lib/supabase/browser-queries";

interface AppState {
  currentUser: User | null;
  subscription: Subscription | null;
  projects: Project[];
  activities: Activity[];
  notifications: Notification[];
  disputes: Dispute[];
  quotes: Quote[];
  payments: Payment[];
  projectInvites: import("@/lib/supabase/browser-queries").ProjectInvite[];
  currentProjectId: string | null;
  _loaded: boolean;

  setCurrentUser: (user: User | null) => void;
  setCurrentProject: (id: string | null) => void;
  logout: () => void;

  loadSubscription: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  loadProjects: () => Promise<void>;
  loadProject: (id: string) => Promise<Project | null>;
  createProject: (project: {
    name: string; description: string; location: string; address: string;
    projectType: string; totalBudget: number; startDate: string; expectedEndDate: string;
    phases: { title: string; description: string; order: number; budgetAllocation: number }[];
  }) => Promise<Project | null>;

  updatePhaseStatus: (projectId: string, phaseId: string, status: PhaseStatus) => void;
  toggleMilestone: (projectId: string, phaseId: string, milestoneId: string) => Promise<void>;
  approvePhase: (projectId: string, phaseId: string) => Promise<void>;
  releasePhaseFund: (projectId: string, phaseId: string) => Promise<void>;
  addEvidence: (projectId: string, phaseId: string, evidence: Omit<Evidence, "id">) => Promise<void>;
  verifyEvidence: (projectId: string, phaseId: string, evidenceId: string) => Promise<void>;

  loadPayments: (projectId: string) => Promise<void>;
  requestPayment: (payment: Omit<Payment, "id">) => void;
  approvePayment: (paymentId: string) => void;

  loadDisputes: (projectId: string) => Promise<void>;
  loadDisputeMessages: (disputeId: string) => Promise<void>;
  raiseDispute: (dispute: Omit<Dispute, "id" | "messages" | "status">) => Promise<void>;
  addDisputeMessage: (disputeId: string, userId: string, content: string) => Promise<void>;

  loadActivities: (projectId: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, "id">) => void;

  loadNotifications: () => Promise<void>;
  addNotification: (data: { title: string; message: string; type: string; link?: string }) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  loadProjectInvites: (projectId: string) => Promise<void>;
  sendInvite: (projectId: string, email: string, role: string) => Promise<boolean>;
  acceptInvite: (inviteId: string) => Promise<boolean>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  subscription: null,
  projects: [],
  activities: [],
  notifications: [],
  disputes: [],
  quotes: [],
  payments: [],
  projectInvites: [],
  currentProjectId: null,
  _loaded: false,

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentProject: (id) => set({ currentProjectId: id }),
  logout: () => set({ currentUser: null, subscription: null, currentProjectId: null, projects: [], activities: [], payments: [], disputes: [], _loaded: false }),

  loadSubscription: async () => {
    const user = get().currentUser;
    if (!user) return;
    const subscription = await fetchSubscription(user.id);
    set({ subscription });
  },

  refreshUserProfile: async () => {
    const user = get().currentUser;
    if (!user) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, phone, organization")
      .eq("id", user.id)
      .single();
    if (profile) {
      set({ currentUser: { ...user, role: profile.role, phone: profile.phone || undefined, organization: profile.organization || undefined } });
    }
  },

  loadProjects: async () => {
    const user = get().currentUser;
    if (!user) return;
    const projects = await fetchProjects(user.id);
    set({ projects, _loaded: true });
  },

  loadProject: async (id) => {
    const project = await fetchProjectWithPhases(id);
    if (project) {
      set((state) => {
        const exists = state.projects.findIndex((p) => p.id === id);
        if (exists >= 0) {
          const projects = [...state.projects];
          projects[exists] = project;
          return { projects };
        }
        return { projects: [...state.projects, project] };
      });
    }
    return project;
  },

  createProject: async (data) => {
    const project = await insertProject({
      name: data.name,
      description: data.description,
      location: data.location,
      address: data.address,
      project_type: data.projectType,
      start_date: data.startDate,
      expected_end_date: data.expectedEndDate,
      total_budget: data.totalBudget,
      status: "active",
      funds_locked: data.totalBudget,
    });

    if (!project) return null;

    const phaseResults: Phase[] = [];
    for (const phaseData of data.phases) {
      const phase = await insertPhase({
        project_id: project.id,
        title: phaseData.title,
        description: phaseData.description,
        order_index: phaseData.order,
        budget_allocation: phaseData.budgetAllocation,
      });
      if (phase) {
        const ms1 = await insertMilestoneDB({ phase_id: phase.id, title: "Sub-phase Setup", description: "Initial setup and preparation" });
        const ms2 = await insertMilestoneDB({ phase_id: phase.id, title: "Execution Complete", description: "All work items finished" });
        phase.milestones = [ms1, ms2].filter(Boolean) as Milestone[];
        phaseResults.push(phase);
      }
    }

    project.phases = phaseResults;
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },

  updatePhaseStatus: (projectId, phaseId, status) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          phases: p.phases.map((ph) => (ph.id === phaseId ? { ...ph, status } : ph)),
        };
      }),
    }));
  },

  toggleMilestone: async (projectId, phaseId, milestoneId) => {
    const project = get().projects.find((p) => p.id === projectId);
    const phase = project?.phases.find((p) => p.id === phaseId);
    const ms = phase?.milestones.find((m) => m.id === milestoneId);
    if (!ms) return;

    await toggleMilestoneDB(milestoneId, !ms.completed);

    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          phases: p.phases.map((ph) => {
            if (ph.id !== phaseId) return ph;
            return {
              ...ph,
              milestones: ph.milestones.map((m) =>
                m.id === milestoneId
                  ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
                  : m
              ),
            };
          }),
        };
      }),
    }));
  },

  approvePhase: async (projectId, phaseId) => {
    const project = get().projects.find((p) => p.id === projectId);
    const phase = project?.phases.find((ph) => ph.id === phaseId);
    await approvePhaseInDB(phaseId);
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          phases: p.phases.map((ph) =>
            ph.id === phaseId ? { ...ph, status: "approved" as PhaseStatus, approvedBy: get().currentUser?.id, approvedAt: new Date().toISOString() } : ph
          ),
        };
      }),
    }));
    if (phase) {
      await get().addNotification({
        title: "Phase Approved",
        message: `"${phase.title}" in ${project?.name || "project"} has been approved for fund release`,
        type: "phase",
        link: `/dashboard/projects/${projectId}`,
      });
    }
  },

  releasePhaseFund: async (projectId, phaseId) => {
    const project = get().projects.find((p) => p.id === projectId);
    const phase = project?.phases.find((ph) => ph.id === phaseId);
    await releasePhaseFundInDB(phaseId);
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const phase = p.phases.find((ph) => ph.id === phaseId);
        if (!phase) return p;
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          fundsReleased: p.fundsReleased + phase.budgetAllocation,
          fundsLocked: Math.max(0, p.fundsLocked - phase.budgetAllocation),
          spentBudget: p.spentBudget + phase.budgetSpent,
          phases: p.phases.map((ph) =>
            ph.id === phaseId ? { ...ph, status: "funded" as PhaseStatus, fundReleased: true, fundedAt: new Date().toISOString() } : ph
          ),
        };
      }),
    }));
    if (phase) {
      await get().addNotification({
        title: "Funds Released",
        message: `₦${phase.budgetAllocation.toLocaleString()} released for "${phase.title}" in ${project?.name || "project"}`,
        type: "payment",
        link: `/dashboard/projects/${projectId}`,
      });
    }
  },

  addEvidence: async (projectId, phaseId, evidenceData) => {
    const user = get().currentUser;
    if (!user) return;
    const ev = await insertEvidenceDB({
      phase_id: phaseId,
      type: evidenceData.type,
      file_url: evidenceData.url,
      description: evidenceData.caption,
      user_id: user.id,
    });
    if (ev) {
      set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            phases: p.phases.map((ph) => (ph.id === phaseId ? { ...ph, evidence: [...ph.evidence, ev] } : ph)),
          };
        }),
      }));
      const project = get().projects.find((p) => p.id === projectId);
      const phase = project?.phases.find((ph) => ph.id === phaseId);
      await get().addNotification({
        title: "Evidence Uploaded",
        message: `New ${evidenceData.type} uploaded for "${phase?.title || "phase"}" in ${project?.name || "project"}`,
        type: "evidence",
        link: `/dashboard/projects/${projectId}`,
      });
    }
  },

  verifyEvidence: async (projectId, phaseId, evidenceId) => {
    const ok = await verifyEvidenceInDB(evidenceId);
    if (!ok) return;
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          phases: p.phases.map((ph) => {
            if (ph.id !== phaseId) return ph;
            return {
              ...ph,
              evidence: ph.evidence.map((ev) =>
                ev.id === evidenceId ? { ...ev, verified: true, verifiedBy: get().currentUser?.id, verifiedAt: new Date().toISOString() } : ev
              ),
            };
          }),
        };
      }),
    }));
  },

  loadPayments: async (projectId) => {
    const payments = await fetchPayments(projectId);
    set({ payments });
  },

  requestPayment: (paymentData) => {
    set((state) => ({ payments: [...state.payments, { ...paymentData, id: `pay-${Date.now()}` }] }));
  },

  approvePayment: (paymentId) => {
    set((state) => ({
      payments: state.payments.map((pay) =>
        pay.id === paymentId ? { ...pay, status: "completed" as const, approvedBy: get().currentUser?.id, processedAt: new Date().toISOString() } : pay
      ),
    }));
  },

  loadDisputes: async (projectId) => {
    const disputes = await fetchDisputes(projectId);
    set((state) => {
      const existing = state.disputes.filter((d) => !disputes.find((nd) => nd.id === d.id));
      return { disputes: [...existing, ...disputes] };
    });
  },

  loadDisputeMessages: async (disputeId) => {
    const messages = await fetchDisputeMessages(disputeId);
    set((state) => ({
      disputes: state.disputes.map((d) =>
        d.id === disputeId ? { ...d, messages } : d
      ),
    }));
  },

  raiseDispute: async (disputeData) => {
    const user = get().currentUser;
    if (!user) return;
    const dispute = await insertDisputeDB({
      project_id: disputeData.projectId,
      phase_id: disputeData.phaseId,
      raised_by: user.id,
      title: disputeData.title,
      description: disputeData.description,
    });
    if (dispute) {
      set((state) => ({ disputes: [dispute, ...state.disputes] }));
      const project = get().projects.find((p) => p.id === disputeData.projectId);
      await get().addNotification({
        title: "Dispute Raised",
        message: `Dispute "${disputeData.title}" raised in ${project?.name || "project"}`,
        type: "dispute",
        link: `/dashboard/disputes`,
      });
    }
  },

  addDisputeMessage: async (disputeId, userId, content) => {
    const msg = await insertDisputeMessageDB(disputeId, userId, content);
    if (msg) {
      set((state) => ({
        disputes: state.disputes.map((d) =>
          d.id === disputeId ? { ...d, messages: [...d.messages, msg] } : d
        ),
      }));
    }
  },

  loadActivities: async (projectId) => {
    const activities = await fetchActivities(projectId);
    set({ activities });
  },

  addActivity: (activityData) => {
    set((state) => ({ activities: [{ ...activityData, id: `act-${Date.now()}` }, ...state.activities] }));
  },

  markNotificationRead: async (notifId) => {
    await markNotificationReadDB(notifId);
    set((state) => ({ notifications: state.notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n)) }));
  },

  markAllNotificationsRead: async () => {
    const user = get().currentUser;
    if (!user) return;
    await markAllNotificationsReadDB(user.id);
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) }));
  },

  loadNotifications: async () => {
    const user = get().currentUser;
    if (!user) return;
    const rows = await fetchNotificationsDB(user.id);
    const notifications: Notification[] = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      title: r.title,
      message: r.message,
      type: r.type as Notification["type"],
      read: r.read,
      createdAt: r.createdAt,
      link: r.link || undefined,
    }));
    set({ notifications });
  },

  addNotification: async (data) => {
    const user = get().currentUser;
    if (!user) return;
    const row = await insertNotificationDB({
      user_id: user.id,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link,
    });
    if (row) {
      const notification: Notification = {
        id: row.id,
        userId: row.userId,
        title: row.title,
        message: row.message,
        type: row.type as Notification["type"],
        read: row.read,
        createdAt: row.createdAt,
        link: row.link || undefined,
      };
      set((state) => ({ notifications: [notification, ...state.notifications] }));
    }
  },

  loadProjectInvites: async (projectId) => {
    const invites = await fetchProjectInvites(projectId);
    set({ projectInvites: invites });
  },

  sendInvite: async (projectId, email, role) => {
    const user = get().currentUser;
    if (!user) return false;
    const invite = await sendProjectInvite(projectId, email, role, user.id);
    if (invite) {
      set((state) => ({ projectInvites: [invite, ...state.projectInvites] }));
      const project = get().projects.find((p) => p.id === projectId);
      await get().addNotification({
        title: "Invite Sent",
        message: `Invitation sent to ${email} for "${project?.name || "project"}"`,
        type: "system",
        link: `/dashboard/projects/${projectId}`,
      });
      fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, projectName: project?.name || "project", inviterName: user.name, role }),
      }).catch(() => {});
      return true;
    }
    return false;
  },

  acceptInvite: async (inviteId) => {
    const user = get().currentUser;
    if (!user) return false;
    const ok = await acceptProjectInvite(inviteId, user.id);
    if (ok) {
      await get().loadProjects();
    }
    return ok;
  },
}));
