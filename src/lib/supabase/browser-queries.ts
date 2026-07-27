import { createClient } from "./client";

export async function getProjects(userId: string) {
  const supabase = createClient();

  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  const { data: collabProjects } = await supabase
    .from("project_collaborators")
    .select("projects(*)")
    .eq("user_id", userId);

  const collabs = (collabProjects || []).map((c: any) => c.projects).filter(Boolean);

  const allProjects = [...(ownedProjects || [])];
  collabs.forEach((p: any) => {
    if (!allProjects.find((ap) => ap.id === p.id)) {
      allProjects.push(p);
    }
  });

  return allProjects;
}

export async function getProjectWithPhases(projectId: string) {
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) return null;

  const { data: phases } = await supabase
    .from("phases")
    .select("*, milestones(*)")
    .eq("project_id", projectId)
    .order("order_index");

  return { ...project, phases: phases || [] };
}

export async function getActivities(projectId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20);
  return data || [];
}

export async function getNotifications(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data || [];
}

export async function updateMilestone(milestoneId: string, completed: boolean) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("milestones")
    .update({
      completed,
      verified_by: completed ? user?.id : null,
      verified_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", milestoneId)
    .select()
    .single();

  return data;
}

export async function approvePhase(phaseId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: phase } = await supabase
    .from("phases")
    .select("*")
    .eq("id", phaseId)
    .single();

  if (!phase) return null;

  const { data: updatedPhase } = await supabase
    .from("phases")
    .update({ status: "completed" })
    .eq("id", phaseId)
    .select()
    .single();

  await supabase.from("payments").insert({
    project_id: phase.project_id,
    phase_id: phaseId,
    amount: phase.budget_allocation,
    status: "released",
    payer_id: user?.id,
    released_at: new Date().toISOString(),
  });

  await supabase.rpc("release_funds", {
    p_project_id: phase.project_id,
    p_amount: phase.budget_allocation,
  });

  await supabase.from("activities").insert({
    project_id: phase.project_id,
    user_id: user?.id,
    type: "phase",
    action: `Phase "${phase.title}" approved`,
    details: `Budget of ₦${phase.budget_allocation.toLocaleString()} released`,
  });

  return updatedPhase;
}

export async function createProject(projectData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .insert({ ...projectData, owner_id: user?.id })
    .select()
    .single();

  if (project) {
    await supabase.from("project_collaborators").insert({
      project_id: project.id,
      user_id: user?.id,
      role: "owner",
    });
  }

  return project;
}
