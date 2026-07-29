import { NextResponse } from "next/server";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    amount: 0,
    currency: "NGN",
    interval: "monthly",
    description: "For individual projects",
    features: ["1 project", "Up to 5 phases", "Basic evidence upload", "Email support", "Mobile access"],
  },
  {
    id: "professional",
    name: "Professional",
    amount: 25000,
    currency: "NGN",
    interval: "monthly",
    flw_plan_id: process.env.FLW_PROFESSIONAL_PLAN_ID || "",
    description: "For active teams",
    features: ["10 projects", "Unlimited phases", "Advanced analytics", "Priority support", "Quote comparison", "Dispute tracking"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    amount: 100000,
    currency: "NGN",
    interval: "monthly",
    flw_plan_id: process.env.FLW_ENTERPRISE_PLAN_ID || "",
    description: "For large portfolios",
    features: ["Unlimited projects", "Team management", "Audit logs & reports", "Custom integrations", "Dedicated account manager", "SLA guarantee"],
  },
];

export async function GET() {
  return NextResponse.json(PLANS);
}
