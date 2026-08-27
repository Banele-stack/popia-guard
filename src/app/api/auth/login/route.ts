import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4011";

/**
 * Proxies login to popia-guard-api and stores the returned JWT as an
 * httpOnly cookie — the browser never holds the raw token in JS-readable
 * storage.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: `Could not reach the POPIAGuard API at ${API_URL}. Is popia-guard-api running?` },
      { status: 502 },
    );
  }

  if (!apiRes.ok) {
    const errBody = await apiRes.json().catch(() => ({ message: "Login failed." }));
    return NextResponse.json(errBody, { status: apiRes.status });
  }

  const { accessToken, user } = await apiRes.json();

  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
