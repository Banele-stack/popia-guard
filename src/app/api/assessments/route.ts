import { NextRequest, NextResponse } from "next/server";
import { createAssessment, type CreateAssessmentInput } from "@/lib/api";

export async function POST(req: NextRequest) {
  let body: CreateAssessmentInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const assessment = await createAssessment(body);
    return NextResponse.json(assessment, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create assessment.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
