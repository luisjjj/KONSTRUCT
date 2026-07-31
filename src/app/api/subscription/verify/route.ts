import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`verify:${ip}`, 60 * 60 * 1000, 30); // 30 per hour
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
    }

    if (!process.env.FLW_SECRET_KEY) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.status === "success") {
      return NextResponse.json({
        success: true,
        amount: data.data.amount,
        currency: data.data.currency,
        customer: data.data.customer,
      });
    }

    return NextResponse.json({ success: false, message: data.message });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
