import { createClient } from "./client";
import type { Project, Phase, Milestone, Evidence, Payment, Activity, Dispute, DisputeMessage } from "@/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    location: row.location || "",
    address: row.address || "",
    projectType: row.project_type || "Residential",
    totalBudget: row.total_budget || 0,
    spentBudget: row.spent_budget || 0,
    currency: "NGN",
    startDate: row.start_date || "",
    expectedEndDate: row.expected_end_date || "",
    ownerId: row.owner_id || "",
    phases: [],
    collaborators: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status || "planning",
    completionPercentage: row.completion_percentage || 0,
    fundsLocked: row.funds_locked || 0,
    fundsReleased: row.funds_released || 0,
  };
}

function mapPhase(row: any): Phase {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description || "",
    order: row.order_index,
    budgetAllocation: row.budget_allocation || 0,
    budgetSpent: row.budget_spent || 0,
    status: row.status || "not_started",
    milestones: [],
    evidence: [],
    fundReleased: false,
    requiredDocuments: [],
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    fundedAt: row.funded_at,
  };
}

function mapMilestone(row: any): Milestone {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    completed: row.completed || false,
    completedAt: row.verified_at,
    completedBy: row.verified_by,
  };
}

function mapEvidence(row: any): Evidence {
  return {
    id: row.id,
    phaseId: row.phase_id,
    milestoneId: row.milestone_id,
    type: row.type,
    url: row.file_url || "",
    caption: row.description || "",
    uploadedBy: row.user_id || "",
    uploadedAt: row.created_at,
    verified: !!row.verified_by,
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
  };
}

function mapPayment(row: any): Payment {
  return {
    id: row.id,
    projectId: row.project_id,
    phaseId: row.phase_id,
    amount: row.amount,
    status: row.status === "released" ? "completed" : row.status === "held" ? "pending" : row.status,
    requestedBy: row.payer_id || "",
    approvedBy: row.payee_id,
    requestedAt: row.created_at,
    processedAt: row.released_at,
  };
}

function mapActivity(row: any): Activity {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    userName: "",
    action: row.action,
    details: row.details || "",
    timestamp: row.created_at,
    type: row.type,
  };
}

function mapDispute(row: any): Dispute {
  return {
    id: row.id,
    projectId: row.project_id,
    phaseId: row.phase_id,
    title: row.title,
    description: row.description || "",
    raisedBy: row.raised_by,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    messages: [],
  };
}

// ── Projects ─────────────────────────────────────────────────────────────────

export async function fetchProjects(userId: string): Promise<Project[]> {
  const supabase = createClient();

  const { data: owned } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  const { data: collabRows } = await supabase
    .from("project_collaborators")
    .select("project_id")
    .eq("user_id", userId);

  const collabIds = (collabRows || []).map((r) => r.project_id).filter(Boolean);
  let collabProjects: any[] = [];
  if (collabIds.length > 0) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .in("id", collabIds)
      .order("created_at", { ascending: false });
    collabProjects = data || [];
  }

  const seen = new Set<string>();
  const all: Project[] = [];
  for (const row of [...(owned || []), ...collabProjects]) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      all.push(mapProject(row));
    }
  }
  return all;
}

export async function fetchProjectWithPhases(projectId: string): Promise<Project | null> {
  const supabase = createClient();

  const { data: projRow } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!projRow) return null;

  const project = mapProject(projRow);

  const { data: phaseRows } = await supabase
    .from("phases")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index");

  if (!phaseRows) return project;

  const phases: Phase[] = [];
  for (const phaseRow of phaseRows) {
    const phase = mapPhase(phaseRow);

    const { data: msRows } = await supabase
      .from("milestones")
      .select("*")
      .eq("phase_id", phaseRow.id)
      .order("created_at");

    phase.milestones = (msRows || []).map(mapMilestone);

    const { data: evRows } = await supabase
      .from("evidence")
      .select("*")
      .eq("phase_id", phaseRow.id)
      .order("created_at", { ascending: false });

    phase.evidence = (evRows || []).map(mapEvidence);

    phases.push(phase);
  }

  project.phases = phases;
  return project;
}

export async function insertProject(data: {
  name: string;
  description?: string;
  location?: string;
  address?: string;
  project_type?: string;
  total_budget: number;
  start_date?: string;
  expected_end_date?: string;
  status?: string;
  funds_locked?: number;
}): Promise<Project | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: row, error } = await supabase
    .from("projects")
    .insert({
      name: data.name,
      description: data.description || "",
      location: data.location || "",
      total_budget: data.total_budget,
      status: data.status || "active",
      funds_locked: data.funds_locked || data.total_budget,
      owner_id: user?.id,
    })
    .select()
    .single();

  if (error || !row) {
    console.error("Failed to create project:", error?.message, error?.details, error?.hint);
    return null;
  }

  const { error: collabError } = await supabase.from("project_collaborators").insert({
    project_id: row.id,
    user_id: user?.id,
    role: "owner",
  });
  if (collabError) console.error("Failed to add collaborator:", collabError.message);

  return mapProject(row);
}

export async function insertPhase(data: {
  project_id: string;
  title: string;
  description?: string;
  order_index: number;
  budget_allocation: number;
  status?: string;
}): Promise<Phase | null> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("phases")
    .insert({
      project_id: data.project_id,
      title: data.title,
      description: data.description || "",
      order_index: data.order_index,
      budget_allocation: data.budget_allocation,
      status: data.status || "not_started",
    })
    .select()
    .single();

  if (error || !row) {
    console.error("Failed to create phase:", error);
    return null;
  }
  return mapPhase(row);
}

export async function insertMilestone(data: {
  phase_id: string;
  title: string;
  description?: string;
}): Promise<Milestone | null> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("milestones")
    .insert({
      phase_id: data.phase_id,
      title: data.title,
      description: data.description || "",
    })
    .select()
    .single();

  if (error || !row) {
    console.error("Failed to create milestone:", error);
    return null;
  }
  return mapMilestone(row);
}

// ── Milestones ───────────────────────────────────────────────────────────────

export async function toggleMilestone(milestoneId: string, completed: boolean): Promise<Milestone | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: row } = await supabase
    .from("milestones")
    .update({
      completed,
      verified_by: completed ? user?.id : null,
      verified_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", milestoneId)
    .select()
    .single();

  return row ? mapMilestone(row) : null;
}

// ── Phases ───────────────────────────────────────────────────────────────────

export async function approvePhaseInDB(phaseId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: phase } = await supabase
    .from("phases")
    .select("*")
    .eq("id", phaseId)
    .single();

  if (!phase) return false;

  await supabase
    .from("phases")
    .update({ status: "approved", approved_by: user?.id, approved_at: new Date().toISOString() })
    .eq("id", phaseId);

  await supabase.from("activities").insert({
    project_id: phase.project_id,
    user_id: user?.id,
    type: "phase",
    action: `Phase "${phase.title}" approved`,
    details: `Budget of ₦${(phase.budget_allocation || 0).toLocaleString()} approved for release`,
  });

  return true;
}

export async function releasePhaseFundInDB(phaseId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: phase } = await supabase
    .from("phases")
    .select("*")
    .eq("id", phaseId)
    .single();

  if (!phase || phase.status !== "approved") return false;

  await supabase
    .from("phases")
    .update({ status: "funded", funded_at: new Date().toISOString() })
    .eq("id", phaseId);

  await supabase.from("payments").insert({
    project_id: phase.project_id,
    phase_id: phaseId,
    amount: phase.budget_allocation,
    status: "released",
    payer_id: user?.id,
    released_at: new Date().toISOString(),
  });

  try {
    await supabase.rpc("release_funds", {
      p_project_id: phase.project_id,
      p_amount: phase.budget_allocation,
    });
  } catch {
    // RPC may not exist yet, update project manually
    const { data: proj } = await supabase.from("projects").select("funds_released, funds_locked, spent_budget").eq("id", phase.project_id).single();
    if (proj) {
      await supabase.from("projects").update({
        funds_released: (proj.funds_released || 0) + phase.budget_allocation,
        funds_locked: Math.max(0, (proj.funds_locked || 0) - phase.budget_allocation),
        spent_budget: (proj.spent_budget || 0) + (phase.budget_spent || 0),
      }).eq("id", phase.project_id);
    }
  }

  await supabase.from("activities").insert({
    project_id: phase.project_id,
    user_id: user?.id,
    type: "payment",
    action: `Funds released for "${phase.title}"`,
    details: `₦${(phase.budget_allocation || 0).toLocaleString()} released`,
  });

  return true;
}

// ── Evidence ─────────────────────────────────────────────────────────────────

export async function insertEvidence(data: {
  phase_id: string;
  type: string;
  file_url: string;
  description: string;
  user_id: string;
}): Promise<Evidence | null> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("evidence")
    .insert({
      phase_id: data.phase_id,
      type: data.type,
      file_url: data.file_url,
      description: data.description,
      user_id: data.user_id,
    })
    .select()
    .single();

  if (error || !row) {
    console.error("Failed to insert evidence:", error);
    return null;
  }

  const { data: phase } = await supabase.from("phases").select("project_id, title").eq("id", data.phase_id).single();
  if (phase) {
    await supabase.from("activities").insert({
      project_id: phase.project_id,
      user_id: data.user_id,
      type: "evidence",
      action: `Evidence uploaded for "${phase.title}"`,
      details: data.description,
    });
  }

  return mapEvidence(row);
}

// ── Disputes ─────────────────────────────────────────────────────────────────

export async function fetchDisputes(projectId: string): Promise<Dispute[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("disputes")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return (rows || []).map(mapDispute);
}

export async function insertDispute(data: {
  project_id: string;
  phase_id?: string;
  raised_by: string;
  title: string;
  description: string;
}): Promise<Dispute | null> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("disputes")
    .insert({
      project_id: data.project_id,
      phase_id: data.phase_id || null,
      raised_by: data.raised_by,
      title: data.title,
      description: data.description,
    })
    .select()
    .single();

  if (error || !row) {
    console.error("Failed to create dispute:", error);
    return null;
  }
  return mapDispute(row);
}

export async function fetchDisputeMessages(disputeId: string): Promise<DisputeMessage[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("dispute_messages")
    .select("*")
    .eq("dispute_id", disputeId)
    .order("created_at");

  return (rows || []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    content: r.message,
    createdAt: r.created_at,
  }));
}

export async function insertDisputeMessage(disputeId: string, userId: string, message: string): Promise<DisputeMessage | null> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("dispute_messages")
    .insert({ dispute_id: disputeId, user_id: userId, message })
    .select()
    .single();

  if (error || !row) return null;
  return { id: row.id, userId: row.user_id, content: row.message, createdAt: row.created_at };
}

// ── Activities ───────────────────────────────────────────────────────────────

export async function fetchActivities(projectId: string): Promise<Activity[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("activities")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (rows || []).map(mapActivity);
}

// ── Payments ─────────────────────────────────────────────────────────────────

export async function fetchPayments(projectId: string): Promise<Payment[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("payments")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return (rows || []).map(mapPayment);
}
