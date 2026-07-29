import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.FLW_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("verif-hash");

    if (signature !== process.env.FLW_SECRET_HASH) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.completed") {
      const data = event.data;
      const email = data.customer?.email || "";
      const txId = String(data.id);
      const planId = String(data.plan || "");
      const amount = data.amount || 0;

      let planName = "starter";
      if (amount >= 100000) planName = "enterprise";
      else if (amount >= 25000) planName = "professional";

      // Find user by email from auth
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const user = authUsers?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        console.error("Webhook: No user found for email", email);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Upsert subscription
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabase.from("subscriptions").upsert(
        {
          user_id: user.id,
          customer_email: email,
          flutterwave_transaction_id: txId,
          flutterwave_plan_id: planId,
          plan_name: planName,
          status: "active",
          amount,
          currency: data.currency || "NGN",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        },
        { onConflict: "flutterwave_transaction_id" }
      );

      // Update user role based on subscription plan
      if (planName !== "starter") {
        const { error: roleError } = await supabase.rpc("update_user_role_for_subscription", {
          p_user_id: user.id,
          p_plan_name: planName,
        });
        if (roleError) {
          console.error("Failed to update user role:", roleError.message);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
