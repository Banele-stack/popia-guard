import { NextRequest, NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, createOperator, type CreateOperatorInput } from "@/lib/api";

export async function POST(req: NextRequest) {
  let body: CreateOperatorInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const operator = await createOperator(body);
    return NextResponse.json(operator, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to create operator.") },
      { status: apiErrorStatus(err) },
    );
  }
}
