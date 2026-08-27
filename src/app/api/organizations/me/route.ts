import { NextRequest, NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, updateOwnOrganization, type UpdateOrganizationInput } from "@/lib/api";

export async function PATCH(req: NextRequest) {
  let body: UpdateOrganizationInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const organization = await updateOwnOrganization(body);
    return NextResponse.json(organization);
  } catch (err) {
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to update organization settings.") },
      { status: apiErrorStatus(err) },
    );
  }
}
