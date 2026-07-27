import type { Metadata } from "next";
import "./globals.css";
import BackgroundLayer from "@/components/BackgroundLayer";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Konstruct — Phase-Gated Construction Ledger",
  description: "A shared real-time dashboard for construction projects in Nigeria. Transparent phase-based project control with evidence-backed progress verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <BackgroundLayer />
          <div className="relative z-10">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
