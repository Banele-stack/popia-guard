import { NextRequest, NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, updateBreach, type UpdateBreachInput } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: UpdateBreachInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const breach = await updateBreach(id, body);
    return NextResponse.json(breach);
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to update breach.") },
      { status: apiErrorStatus(err) },
    );
  }
}
