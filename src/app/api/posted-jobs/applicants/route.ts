import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getApplicantsForCompany, updateApplicationStatus } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const applicants = await getApplicantsForCompany(session.user.email);
    return NextResponse.json({ success: true, applicants });
  } catch (error: any) {
    console.error("Error in GET /api/posted-jobs/applicants:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing applicationId or status" },
        { status: 400 }
      );
    }

    const updated = await updateApplicationStatus(applicationId, status, notes);

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
      application: updated,
    });
  } catch (error: any) {
    console.error("Error in PUT /api/posted-jobs/applicants:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update application status" },
      { status: 500 }
    );
  }
}
