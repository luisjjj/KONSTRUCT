import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const templates = {
  welcome: (name: string) => ({
    subject: "Welcome to Konstruct",
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: #0f172a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <span style="color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">Konstruct</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">Welcome${name ? ", " + name : ""}!</h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px;">
          Your account is set up and ready to go. You can now create your first construction project, track phases, upload evidence, and manage funds — all in one place.
        </p>
        <a href="https://konstruct-rust.vercel.app/dashboard" style="display: inline-block; background: #0f172a; color: white; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none;">Go to Dashboard</a>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 32px; line-height: 1.5;">
          If you have any questions, reply to this email or reach us at support@konstruct.app
        </p>
      </div>
    `,
  }),

  projectCreated: (name: string, projectType: string) => ({
    subject: `Project "${name}" Created`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: #0f172a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <span style="color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">Konstruct</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">Project Created</h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 8px;">
          Your <strong>${projectType}</strong> project <strong>"${name}"</strong> has been created successfully. Funds are locked and ready for phase-by-phase release.
        </p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px;">
          Add phases, upload evidence, and track progress from your dashboard.
        </p>
        <a href="https://konstruct-rust.vercel.app/dashboard/projects" style="display: inline-block; background: #0f172a; color: white; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none;">View Projects</a>
      </div>
    `,
  }),

  subscriptionConfirmed: (planName: string) => ({
    subject: `Subscription Confirmed — ${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: #0f172a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <span style="color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">Konstruct</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">Subscription Confirmed</h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px;">
          Your <strong>${planName.charAt(0).toUpperCase() + planName.slice(1)}</strong> subscription is now active. You have access to all features in your plan.
        </p>
        <a href="https://konstruct-rust.vercel.app/dashboard" style="display: inline-block; background: #0f172a; color: white; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none;">Go to Dashboard</a>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 32px; line-height: 1.5;">
          Manage your subscription anytime from Settings.
        </p>
      </div>
    `,
  }),
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`email:${ip}`, 60 * 60 * 1000, 20); // 20 per hour
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const { type, to, name, projectName, projectType, planName } = await request.json();

    if (!type || !to) {
      return NextResponse.json({ error: "Missing type or to" }, { status: 400 });
    }

    let template;
    switch (type) {
      case "welcome":
        template = templates.welcome(name || "");
        break;
      case "projectCreated":
        template = templates.projectCreated(projectName || "Project", projectType || "Residential");
        break;
      case "subscriptionConfirmed":
        template = templates.subscriptionConfirmed(planName || "professional");
        break;
      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Konstruct" <${process.env.GMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
