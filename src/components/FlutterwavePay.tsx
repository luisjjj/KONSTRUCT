"use client";

import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { useState } from "react";

interface FlutterwavePayProps {
  amount: number;
  currency?: string;
  planName: string;
  planId?: string;
  customerEmail: string;
  customerName: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  children: React.ReactNode;
  className?: string;
}

export default function FlutterwavePay({
  amount,
  currency = "NGN",
  planName,
  planId,
  customerEmail,
  customerName,
  onSuccess,
  onError,
  children,
  className = "",
}: FlutterwavePayProps) {
  const [loading, setLoading] = useState(false);

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || "",
    tx_ref: `KONSTRUCT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    amount,
    currency,
    payment_options: "card,banktransfer,ussd",
    payment_plan: planId || undefined,
    customer: {
      email: customerEmail,
      name: customerName,
      phone_number: "",
    },
    customizations: {
      title: "Konstruct",
      description: `${planName} Subscription`,
      logo: "https://konstruct-rust.vercel.app/icon.svg",
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handlePayment = async () => {
    if (!process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY) {
      alert("Payment is not configured yet. Please add your Flutterwave keys.");
      return;
    }
    if (amount === 0) {
      alert("You are already on the free Starter plan.");
      return;
    }
    setLoading(true);
    try {
      handleFlutterPayment({
        callback: async (response) => {
          closePaymentModal();
          if (response.status === "successful" || response.status === "completed") {
            try {
              const res = await fetch("/api/subscription/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactionId: response.transaction_id }),
              });
              const data = await res.json();
              onSuccess?.({ ...response, verified: data.success });
            } catch {
              onSuccess?.({ ...response, verified: false });
            }
          } else {
            onError?.(response);
          }
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      onError?.(err);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={className}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
