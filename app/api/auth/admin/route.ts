import { NextRequest, NextResponse } from "next/server";
import { createToken, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// POST — login
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limit: max 5 login attempts per 15 minutes per IP
  const limit = checkRateLimit(`login:${ip}`, { max: 5, windowSeconds: 900 });
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many login attempts. Try again in ${limit.retryAfterSeconds}s.`,
      },
      { status: 429 }
    );
  }

  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { success: false, error: "Admin access is not configured." },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      const token = await createToken();
      const response = NextResponse.json({ success: true });
      return setSessionCookie(response, token);
    }

    return NextResponse.json(
      { success: false, error: "Incorrect password." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication failed." },
      { status: 500 }
    );
  }
}

// DELETE — logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}