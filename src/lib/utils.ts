export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-NG").format(num);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateStr);
}

export function getPhaseStatusColor(status: string): string {
  switch (status) {
    case "completed": return "text-emerald-600 bg-emerald-50";
    case "approved": return "text-blue-600 bg-blue-50";
    case "funded": return "text-indigo-600 bg-indigo-50";
    case "submitted_for_review": return "text-amber-600 bg-amber-50";
    case "in_progress": return "text-orange-600 bg-orange-50";
    default: return "text-slate-400 bg-slate-50";
  }
}

export function getPhaseStatusLabel(status: string): string {
  switch (status) {
    case "not_started": return "Not Started";
    case "in_progress": return "In Progress";
    case "submitted_for_review": return "Submitted for Review";
    case "approved": return "Approved";
    case "funded": return "Funded";
    case "completed": return "Completed";
    default: return status;
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case "owner": return "Project Owner";
    case "contractor": return "Contractor";
    case "architect": return "Architect";
    case "project_manager": return "Project Manager";
    case "enterprise_admin": return "Enterprise Admin";
    default: return role;
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case "owner": return "bg-indigo-100 text-indigo-700";
    case "contractor": return "bg-amber-100 text-amber-700";
    case "architect": return "bg-cyan-100 text-cyan-700";
    case "project_manager": return "bg-emerald-100 text-emerald-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
