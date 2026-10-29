import { NextResponse } from "next/server";
import { searchJobs, matchesLocation, isLocationExcluded } from "@/services/jobService";
import { getPostedJobs } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const degree = searchParams.get("degree")?.trim() || "engineering";
    const platform = searchParams.get("platform")?.toLowerCase().trim() || "all";
    const location = searchParams.get("location")?.toLowerCase().trim() || "";
    const excludeLocation = searchParams.get("excludeLocation")?.toLowerCase().trim() || "";
    const datePosted = searchParams.get("datePosted")?.trim() || "";

    const degreeLower = degree.toLowerCase();
    const isBusinessTrack = 
      degreeLower.includes("bba") || 
      degreeLower.includes("business") || 
      degreeLower.includes("mba") || 
      degreeLower.includes("commerce") || 
      degreeLower.includes("marketing") || 
      degreeLower.includes("finance") || 
      degreeLower.includes("management");

    // Fetch external / curated catalog jobs
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
      // Only include direct recruiter DB jobs if platform is "all", "recruiter", or "direct"
      if (platform === "all" || platform === "recruiter" || platform === "direct") {
        const rawDbJobs = await getPostedJobs();
        
        // 1. Only ACTIVE postings
        dbJobs = rawDbJobs.filter((j: any) => (j.status || "ACTIVE") === "ACTIVE");

        // 2. Strict Track Filtering
        dbJobs = dbJobs.filter((j: any) => {
          const text = `${j.category || ""} ${j.title || ""} ${j.description || ""} ${(j.skills || []).join(" ")}`.toLowerCase();

          // If user searched for a specific query, prioritize keyword match
          if (query) {
            const qLower = query.toLowerCase();
            const terms = qLower.split(/\s+/).filter(Boolean);
            const matchesQuery = terms.every((t: string) => text.includes(t)) || text.includes(qLower);
            if (!matchesQuery) return false;
          }

          const isTechJob = 
            text.includes("software") || 
            text.includes("engineer") || 
            text.includes("developer") || 
            text.includes("frontend") || 
            text.includes("backend") || 
            text.includes("fullstack") || 
            text.includes("ai/ml") || 
            text.includes("data science") || 
            text.includes("b.tech") || 
            text.includes("cse") || 
            text.includes("react") || 
            text.includes("python") || 
            text.includes("node") ||
            (j.category || "").toLowerCase().includes("software") ||
            (j.category || "").toLowerCase().includes("data");

          const isBusinessJob = 
            text.includes("hr") || 
            text.includes("human resources") || 
            text.includes("marketing") || 
            text.includes("brand") || 
            text.includes("sales") || 
            text.includes("finance") || 
            text.includes("consultant") || 
            text.includes("operations") || 
            text.includes("management") || 
            (j.category || "").toLowerCase().includes("human") ||
            (j.category || "").toLowerCase().includes("marketing") ||
            (j.category || "").toLowerCase().includes("finance");

          if (isBusinessTrack) {
            // Under Business Track, never show pure engineering/tech roles unless explicitly queried
            if (isTechJob && !isBusinessJob && !query) return false;
            if (!query && isTechJob) return false;
            return true;
          } else {
            // Under Tech Track, never show pure business roles unless explicitly queried
            if (isBusinessJob && !isTechJob && !query) return false;
            if (!query && isBusinessJob) return false;
            return true;
          }
        });

        // 3. Location Filter for dbJobs (Using regional cluster matching)
        if (location) {
          dbJobs = dbJobs.filter((j: any) => matchesLocation(j.location, location));
        }

        // 4. Exclude Location Filter for dbJobs
        if (excludeLocation) {
          dbJobs = dbJobs.filter((j: any) => !isLocationExcluded(j.location, excludeLocation));
        }

        // 5. Date Posted Filter for dbJobs
        if (datePosted) {
          const now = Date.now();
          const maxAgeMap: Record<string, number> = {
            today: 24 * 60 * 60 * 1000,
            "3days": 3 * 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
          };
          const maxAge = maxAgeMap[datePosted];
          if (maxAge) {
            dbJobs = dbJobs.filter((j: any) => {
              const createdAt = j.createdAt ? new Date(j.createdAt).getTime() : now;
              return now - createdAt <= maxAge;
            });
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch recruiter DB jobs:", e);
    }

    // Combine jobs:
    // If user clicked "Direct Recruiters", only show recruiter DB jobs
    // If user clicked "All Platforms", show recruiter DB jobs + external jobs
    // If user clicked a specific portal (e.g. Internshala, Naukri, Apna, Shine), show only those platform jobs
    let combinedJobs: any[] = [];
    if (platform === "recruiter" || platform === "direct") {
      combinedJobs = dbJobs;
    } else if (platform === "all") {
      combinedJobs = [...dbJobs, ...externalJobs];
    } else {
      combinedJobs = externalJobs;
    }

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
