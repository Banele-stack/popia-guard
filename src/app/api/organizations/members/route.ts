import { NextRequest, NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, inviteMember, type InviteMemberInput } from "@/lib/api";

export async function POST(req: NextRequest) {
  let body: InviteMemberInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const member = await inviteMember(body);
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to invite team member.") },
      { status: apiErrorStatus(err) },
    );
  }
}
