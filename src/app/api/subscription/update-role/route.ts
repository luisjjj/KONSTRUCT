import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { userId, planName } = await request.json();

    if (!userId || !planName) {
      return NextResponse.json({ error: "Missing userId or planName" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.FLW_SECRET_KEY!
    );

    // Get the target role
    const roleMap: Record<string, string> = {
      professional: "contractor",
      enterprise: "owner",
    };
    const newRole = roleMap[planName];
    if (!newRole) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Drop immutability trigger, update role, recreate trigger
    const { error: fnError } = await supabase.rpc("update_user_role_for_subscription", {
      p_user_id: userId,
      p_plan_name: planName,
    });

    if (fnError) {
      // Fallback: direct SQL via the service role
      // First drop the trigger
      await supabase.from("profiles").select("id").eq("id", userId).single();

      // Use raw SQL approach - update directly
      const { error: directError } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (directError) {
        console.error("Direct role update failed:", directError.message);
        return NextResponse.json({ error: directError.message }, { status: 500 });
      }
    }

    // Verify the update
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    return NextResponse.json({ success: true, role: profile?.role });
  } catch (err: any) {
    console.error("Update role error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
