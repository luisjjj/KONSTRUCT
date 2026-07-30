import { NextResponse } from "next/server";

const TERMII_API_URL = "https://api.termii.com/api/sms/send";

interface SmsPayload {
  to: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const { to, message }: SmsPayload = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: "Missing 'to' or 'message'" }, { status: 400 });
    }

    const apiKey = process.env.TERMII_API_KEY;
    const senderId = process.env.TERMII_SENDER_ID || "Konstruct";

    if (!apiKey) {
      return NextResponse.json({ error: "SMS service not configured" }, { status: 503 });
    }

    const response = await fetch(TERMII_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        to,
        from: senderId,
        sms: message,
        type: "plain",
        channel: "generic",
      }),
    });

    const data = await response.json();

    if (data.code === "ok" || data.status === "success") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: data.message || "SMS failed" }, { status: 502 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
