import { NextRequest, NextResponse } from "next/server";
import {
  apiErrorMessage,
  apiErrorStatus,
  createProcessingActivity,
  type CreateProcessingActivityInput,
} from "@/lib/api";

export async function POST(req: NextRequest) {
  let body: CreateProcessingActivityInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const activity = await createProcessingActivity(body);
    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to create processing activity.") },
      { status: apiErrorStatus(err) },
    );
  }
}
