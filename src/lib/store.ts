import { create } from "zustand";
import { User, Project, Activity, Notification, Dispute, Quote, Phase, PhaseStatus, Milestone, Evidence, Payment } from "@/types";

interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  activities: Activity[];
  notifications: Notification[];
  disputes: Dispute[];
  quotes: Quote[];
  payments: Payment[];
  currentProjectId: string | null;

  setCurrentUser: (user: User | null) => void;
  setCurrentProject: (id: string | null) => void;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, role: User["role"]) => boolean;
  logout: () => void;

  getProject: (id: string) => Project | undefined;
  getCurrentProject: () => Project | undefined;

  createProject: (project: Partial<Project>) => void;
  updatePhaseStatus: (projectId: string, phaseId: string, status: PhaseStatus) => void;
  toggleMilestone: (projectId: string, phaseId: string, milestoneId: string) => void;
  approvePhase: (projectId: string, phaseId: string) => void;
  releasePhaseFund: (projectId: string, phaseId: string) => void;
  addEvidence: (projectId: string, phaseId: string, evidence: Omit<Evidence, "id">) => void;
  verifyEvidence: (projectId: string, phaseId: string, evidenceId: string) => void;

  requestPayment: (payment: Omit<Payment, "id">) => void;
  approvePayment: (paymentId: string) => void;

  raiseDispute: (dispute: Omit<Dispute, "id" | "messages" | "status">) => void;
  addDisputeMessage: (disputeId: string, userId: string, content: string) => void;

  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;

  addActivity: (activity: Omit<Activity, "id">) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [],
  projects: [],
  activities: [],
  notifications: [],
  disputes: [],
  quotes: [],
  payments: [],
  currentProjectId: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentProject: (id) => set({ currentProjectId: id }),

  login: (email, _password) => {
    const user = get().users.find((u) => u.email === email);
    if (user) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },

  signup: (name, email, role) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ users: [...state.users, newUser], currentUser: newUser }));
    return true;
  },

  logout: () => set({ currentUser: null, currentProjectId: null }),

  getProject: (id) => get().projects.find((p) => p.id === id),
  getCurrentProject: () => {
    const { currentProjectId, projects } = get();
    return projects.find((p) => p.id === currentProjectId);
  },

  createProject: (partial) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: partial.name || "New Project",
      description: partial.description || "",
      location: partial.location || "",
      address: partial.address || "",
      projectType: partial.projectType || "Residential",
      totalBudget: partial.totalBudget || 0,
      spentBudget: 0,
      currency: "NGN",
      startDate: partial.startDate || new Date().toISOString(),
      expectedEndDate: partial.expectedEndDate || "",
      ownerId: partial.ownerId || get().currentUser?.id || "",
      phases: partial.phases || [],
      collaborators: partial.collaborators || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "planning",
      completionPercentage: 0,
      fundsLocked: partial.totalBudget || 0,
      fundsReleased: 0,
    };
    set((state) => ({ projects: [...state.projects, newProject] }));
  },

  updatePhaseStatus: (projectId, phaseId, status) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          phases: p.phases.map((ph) => {
            if (ph.id !== phaseId) return ph;
            return { ...ph, status };
          }),
        };
      }),
    }));
  },

  toggleMilestone: (projectId, phaseId, milestoneId) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          phases: p.phases.map((ph) => {
            if (ph.id !== phaseId) return ph;
            return {
              ...ph,
              milestones: ph.milestones.map((m) => {
                if (m.id !== milestoneId) return m;
                return {
                  ...m,
                  completed: !m.completed,
                  completedAt: !m.completed ? new Date().toISOString() : undefined,
                  completedBy: !m.completed ? state.currentUser?.id : undefined,
                };
              }),
            };
          }),
        };
      }),
    }));
  },

  approvePhase: (projectId, phaseId) => {
    const user = get().currentUser;
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const allMilestonesCompleted = p.phases
          .find((ph) => ph.id === phaseId)
          ?.milestones.every((m) => m.completed);
        if (!allMilestonesCompleted) return p;
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          phases: p.phases.map((ph) => {
            if (ph.id !== phaseId) return ph;
            return { ...ph, status: "approved" as PhaseStatus, approvedBy: user?.id, approvedAt: new Date().toISOString() };
          }),
        };
      }),
    }));
  },

  releasePhaseFund: (projectId, phaseId) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const phase = p.phases.find((ph) => ph.id === phaseId);
        if (!phase || phase.status !== "approved") return p;
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          fundsReleased: p.fundsReleased + phase.budgetAllocation,
          fundsLocked: p.fundsLocked - phase.budgetAllocation,
          spentBudget: p.spentBudget + phase.budgetSpent,
          phases: p.phases.map((ph) => {
            if (ph.id !== phaseId) return ph;
            return { ...ph, status: "funded" as PhaseStatus, fundReleased: true, fundedAt: new Date().toISOString() };
          }),
        };
      }),
    }));
  },

  addEvidence: (projectId, phaseId, evidenceData) => {
    const newEvidence: Evidence = {
      ...evidenceData,
      id: `ev-${Date.now()}`,
    };
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          phases: p.phases.map((ph) => {
            if (ph.id !== phaseId) return ph;
            return { ...ph, evidence: [...ph.evidence, newEvidence] };
          }),
        };
      }),
    }));
  },

  verifyEvidence: (projectId, phaseId, evidenceId) => {
    const user = get().currentUser;
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          phases: p.phases.map((ph) => {
            if (ph.id !== phaseId) return ph;
            return {
              ...ph,
              evidence: ph.evidence.map((ev) => {
                if (ev.id !== evidenceId) return ev;
                return { ...ev, verified: true, verifiedBy: user?.id, verifiedAt: new Date().toISOString() };
              }),
            };
          }),
        };
      }),
    }));
  },

  requestPayment: (paymentData) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
    };
    set((state) => ({ payments: [...state.payments, newPayment] }));
  },

  approvePayment: (paymentId) => {
    const user = get().currentUser;
    set((state) => ({
      payments: state.payments.map((pay) => {
        if (pay.id !== paymentId) return pay;
        return { ...pay, status: "completed" as const, approvedBy: user?.id, processedAt: new Date().toISOString() };
      }),
    }));
  },

  raiseDispute: (disputeData) => {
    const newDispute: Dispute = {
      ...disputeData,
      id: `disp-${Date.now()}`,
      status: "open",
      messages: [],
    };
    set((state) => ({ disputes: [...state.disputes, newDispute] }));
  },

  addDisputeMessage: (disputeId, userId, content) => {
    set((state) => ({
      disputes: state.disputes.map((d) => {
        if (d.id !== disputeId) return d;
        return {
          ...d,
          messages: [...d.messages, { id: `dm-${Date.now()}`, userId, content, createdAt: new Date().toISOString() }],
        };
      }),
    }));
  },

  markNotificationRead: (notifId) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  addActivity: (activityData) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
    };
    set((state) => ({ activities: [newActivity, ...state.activities] }));
  },
}));
