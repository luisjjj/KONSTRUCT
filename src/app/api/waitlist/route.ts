import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function waitlistWelcomeEmail(name?: string) {
  const displayName = name || "there";
  return {
    subject: "You're on the list! Konstruct is coming soon",
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: #0f172a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <span style="color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">Konstruct</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">You're in, ${displayName}!</h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
          Thank you for joining the Konstruct waitlist. We're building the trust engine for construction delivery in Nigeria — a platform that locks funds into milestones, verifies work with evidence, and keeps every naira accountable.
        </p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px;">
          We'll notify you the moment we launch. Early members will get exclusive access and founding member pricing.
        </p>
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #64748b; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">What's coming</p>
          <ul style="font-size: 14px; color: #475569; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Phase-gated fund locking</li>
            <li>Evidence-backed progress verification</li>
            <li>Real-time project dashboards</li>
            <li>Contractor and owner collaboration</li>
          </ul>
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 32px; line-height: 1.5;">
          Questions? Reply to this email — we'd love to hear from you.
        </p>
      </div>
    `,
  };
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error: insertError } = await supabase
      .from("waitlist")
      .insert({ email: trimmed, name: name?.trim() || null, source: "landing" });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ success: true, duplicate: true });
      }
      return NextResponse.json({ error: "Failed to sign up" }, { status: 500 });
    }

    const template = waitlistWelcomeEmail(name?.trim());
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Konstruct" <${process.env.GMAIL_USER}>`,
        to: trimmed,
        subject: template.subject,
        html: template.html,
      });
    } catch {
      // Email failure shouldn't block signup
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const { count } = await supabase
      .from("waitlist")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
