import { NextRequest, NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, createBreach, type CreateBreachInput } from "@/lib/api";

export async function POST(req: NextRequest) {
  let body: CreateBreachInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const breach = await createBreach(body);
    return NextResponse.json(breach, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to log breach.") },
      { status: apiErrorStatus(err) },
    );
  }
}
