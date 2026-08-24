import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { processJobApplications, getUserApplicationHistory } from "@/services/applicationService";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobs } = body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { success: false, error: "No jobs selected for application." },
        { status: 400 }
      );
    }

    const { applications, logs } = await processJobApplications(session.user.email, jobs);

    return NextResponse.json({
      success: true,
      applications,
      logs
    });
  } catch (error: any) {
    console.error("Error in POST /api/apply:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process applications" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const applications = await getUserApplicationHistory(session.user.email);
    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error("Error in GET /api/apply:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load application history" },
      { status: 500 }
    );
  }
}
