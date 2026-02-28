import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD || "fallback-secret-change-me"
);

const COOKIE_NAME = "admin_session";
const EXPIRY = "24h";

/**
 * Create a signed JWT token for admin session.
 */
export async function createToken(): Promise<string> {
  return new SignJWT({ role: "admin", iat: Date.now() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

/**
 * Verify the JWT token from cookies.
 * Returns true if valid, false otherwise.
 */
export async function verifyToken(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

/**
 * Set the admin session cookie on a response.
 */
export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,         // JavaScript cannot access this cookie
    secure: process.env.NODE_ENV === "production",  // HTTPS only in prod
    sameSite: "strict",     // Prevents CSRF
    path: "/",
    maxAge: 60 * 60 * 24,  // 24 hours
  });
  return response;
}

/**
 * Clear the admin session cookie.
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}

/**
 * Helper: return 401 if not authenticated.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  const isValid = await verifyToken(request);
  if (!isValid) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please login." },
      { status: 401 }
    );
  }
  return null; // null means authenticated
}