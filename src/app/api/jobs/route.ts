import { NextResponse } from "next/server";
import { searchJobs } from "@/services/jobService";
import { getPostedJobs } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const degree = searchParams.get("degree") || "engineering";
    const platform = searchParams.get("platform") || "all";
    const location = searchParams.get("location") || "";
    const excludeLocation = searchParams.get("excludeLocation") || "";
    const datePosted = searchParams.get("datePosted") || "";

    const { jobs: externalJobs, source } = await searchJobs({
      query,
      degree,
      platform,
      location,
      excludeLocation,
      datePosted
    });

    let dbJobs: any[] = [];
    try {
      dbJobs = await getPostedJobs();
      if (query || location) {
        const qLower = query.toLowerCase();
        const locLower = location.toLowerCase();
        dbJobs = dbJobs.filter((j) => {
          const matchQuery = !qLower || `${j.title} ${j.company} ${j.description} ${(j.skills || []).join(" ")}`.toLowerCase().includes(qLower);
          const matchLoc = !locLower || (j.location || "").toLowerCase().includes(locLower);
          return matchQuery && matchLoc;
        });
      }
    } catch (e) {
      console.warn("Failed to fetch recruiter DB jobs:", e);
    }

    const combinedJobs = [...dbJobs, ...externalJobs];

    return NextResponse.json({
      success: true,
      jobs: combinedJobs,
      source: dbJobs.length > 0 ? `recruiter_db + ${source}` : source
    });
  } catch (error: any) {
    console.error("Error in GET /api/jobs:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search jobs" },
      { status: 500 }
    );
  }
}
