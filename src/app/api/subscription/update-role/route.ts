import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`role:${ip}`, 60 * 60 * 1000, 10); // 10 per hour
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const { userId, planName } = await request.json();

    if (!userId || !planName) {
      return NextResponse.json({ error: "Missing userId or planName" }, { status: 400 });
    }

    const supabase = getSupabase();

    const roleMap: Record<string, string> = {
      professional: "contractor",
      enterprise: "owner",
    };
    const newRole = roleMap[planName];
    if (!newRole) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { error: fnError } = await supabase.rpc("update_user_role_for_subscription", {
      p_user_id: userId,
      p_plan_name: planName,
    });

    if (fnError) {
      const { error: directError } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (directError) {
        return NextResponse.json({ error: directError.message }, { status: 500 });
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    return NextResponse.json({ success: true, role: profile?.role });
  } catch {
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
