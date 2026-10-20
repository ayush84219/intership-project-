import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createPostedJob, getPostedJobs, deletePostedJob } from "@/lib/db";

// GET: list recruiter / company posted jobs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recruiterEmail = searchParams.get("recruiterEmail") || undefined;

    const jobs = await getPostedJobs(recruiterEmail);
    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error("Error in GET /api/posted-jobs:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch posted jobs" },
      { status: 500 }
    );
  }
}

// POST: post a new job (company/recruiter action)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as a company or recruiter." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      company, 
      location, 
      salary, 
      category, 
      workType, 
      duration, 
      description, 
      skills, 
      requirements, 
      applyUrl 
    } = body;

    if (!title || !company || !location || !description) {
      return NextResponse.json(
        { success: false, error: "Title, company, location, and description are required." },
        { status: 400 }
      );
    }

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const newJob = await createPostedJob({
      recruiterEmail: session.user.email,
      recruiterName: session.user.name || undefined,
      title,
      company,
      location,
      salary: salary || "Competitive Stipend",
      category: category || "Software Development",
      workType: workType || "Remote",
      duration: duration || "3 Months",
      description,
      skills: parsedSkills,
      requirements: requirements || "",
      applyUrl: applyUrl || "",
    });

    return NextResponse.json({ success: true, job: newJob });
  } catch (error: any) {
    console.error("Error in POST /api/posted-jobs:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to post job" },
      { status: 500 }
    );
  }
}

// DELETE: delete a posted job by ID
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("id");

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required." },
        { status: 400 }
      );
    }

    await deletePostedJob(jobId, session.user.email);
    return NextResponse.json({ success: true, message: "Job deleted successfully." });
  } catch (error: any) {
    console.error("Error in DELETE /api/posted-jobs:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete job" },
      { status: 500 }
    );
  }
}
