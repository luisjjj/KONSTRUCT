export type UserRole = "owner" | "contractor" | "architect" | "project_manager" | "enterprise_admin";

export type PhaseStatus = "not_started" | "in_progress" | "submitted_for_review" | "approved" | "funded" | "completed";

export type DisputeStatus = "open" | "in_review" | "resolved" | "escalated";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  phone?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface Evidence {
  id: string;
  phaseId: string;
  milestoneId?: string;
  type: "photo" | "video" | "document" | "receipt" | "boq";
  url: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Phase {
  id: string;
  projectId: string;
  title: string;
  description: string;
  order: number;
  budgetAllocation: number;
  budgetSpent: number;
  status: PhaseStatus;
  milestones: Milestone[];
  evidence: Evidence[];
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  fundedAt?: string;
  completedAt?: string;
  fundReleased: boolean;
  requiredDocuments: string[];
}

export interface Payment {
  id: string;
  projectId: string;
  phaseId: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  requestedBy: string;
  approvedBy?: string;
  requestedAt: string;
  processedAt?: string;
  reference?: string;
}

export interface Dispute {
  id: string;
  projectId: string;
  phaseId?: string;
  title: string;
  description: string;
  raisedBy: string;
  status: DisputeStatus;
  createdAt: string;
  resolvedAt?: string;
  messages: DisputeMessage[];
}

export interface DisputeMessage {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  projectId: string;
  contractorId: string;
  contractorName: string;
  totalAmount: number;
  items: QuoteItem[];
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  projectType: string;
  totalBudget: number;
  spentBudget: number;
  currency: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  ownerId: string;
  phases: Phase[];
  collaborators: string[];
  createdAt: string;
  updatedAt: string;
  status: "planning" | "in_progress" | "on_hold" | "completed" | "disputed";
  completionPercentage: number;
  fundsLocked: number;
  fundsReleased: number;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  type: "phase" | "payment" | "evidence" | "dispute" | "comment" | "system";
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "approval" | "payment" | "evidence" | "dispute" | "phase" | "system";
  read: boolean;
  createdAt: string;
  projectId?: string;
}
