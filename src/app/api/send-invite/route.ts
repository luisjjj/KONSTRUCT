import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`invite:${ip}`, 60 * 60 * 1000, 10); // 10 per hour
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const { to, projectName, inviterName, role } = await req.json();

    if (!to || !projectName || !inviterName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to.trim())) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://konstruct.name.ng";
    const roleLabel = role === "contractor" ? "Contractor" : "Verifier";

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Konstruct" <${process.env.GMAIL_USER}>`,
      to: to.trim(),
      subject: `You've been invited to "${projectName}" on Konstruct`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="max-width:500px;margin:40px auto;background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
            <div style="background:#0f172a;padding:32px;text-align:center;">
              <h1 style="color:white;font-size:24px;margin:0;font-weight:700;">Konstruct</h1>
            </div>
            <div style="padding:32px;">
              <h2 style="color:#0f172a;font-size:20px;margin:0 0 8px;">Project Invitation</h2>
              <p style="color:#64748b;font-size:14px;margin:0 0 24px;">
                <strong>${inviterName}</strong> has invited you to join <strong>${projectName}</strong> as a <strong>${roleLabel}</strong>.
              </p>
              <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:0 0 24px;">
                <p style="color:#334155;font-size:14px;margin:0;">
                  <strong>Project:</strong> ${projectName}<br>
                  <strong>Your Role:</strong> ${roleLabel}
                </p>
              </div>
              <a href="${siteUrl}/login" style="display:inline-block;background:#0f172a;color:white;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Accept Invitation</a>
              <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">
                You'll need to log in or create an account to accept this invitation.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
