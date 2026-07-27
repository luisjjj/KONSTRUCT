import { createClient } from "./server";

export async function getProjects(userId: string) {
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}

export async function getPayments(projectId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getDisputes(projectId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("disputes")
    .select("*, dispute_messages(*)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile || {
    id: user.id,
    full_name: user.user_metadata?.full_name || "User",
    role: user.user_metadata?.role || "owner",
  };
}
