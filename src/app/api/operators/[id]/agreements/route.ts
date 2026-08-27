import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4011";

/**
 * Proxies an operator-agreement file upload to popia-guard-api. Runs
 * server-side (Route Handler), so it can read the httpOnly session cookie
 * and attach it as the Authorization header — the browser never sees or
 * handles the JWT directly. The incoming multipart/form-data body is
 * forwarded through as-is rather than parsed and rebuilt here.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json({ message: "Expected multipart/form-data." }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${API_URL}/operators/${id}/agreements`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": contentType,
      },
      body: req.body,
      // @ts-expect-error -- required by undici when streaming a body through
      duplex: "half",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: `Could not reach the POPIAGuard API at ${API_URL}.` },
      { status: 502 },
    );
  }

  const body = await apiRes.json().catch(() => ({}));
  return NextResponse.json(body, { status: apiRes.status });
}
