import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes that are locked during waitlist phase — redirect to waitlist
  const lockedPaths = ["/dashboard", "/login", "/signup", "/pricing", "/features", "/how-it-works"];
  const isLockedPath = lockedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isLockedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return Response.redirect(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
