import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
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
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
