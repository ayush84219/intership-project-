import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getApplicantsForRecruiter } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const applicants = await getApplicantsForRecruiter(session.user.email);
    return NextResponse.json({ success: true, applicants });
  } catch (error: any) {
    console.error("Error in GET /api/posted-jobs/applicants:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}
