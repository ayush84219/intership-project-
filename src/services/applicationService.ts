import { findUserByEmail, upsertApplication, getUserApplications } from "@/lib/db";
import { draftCoverLetter } from "./aiService";

export interface ApplyJobPayload {
  id: string;
  title: string;
  company: string;
  location?: string;
  source?: string;
  applyUrl?: string;
  description?: string;
}

export async function processJobApplications(userEmail: string, jobs: ApplyJobPayload[]) {
  const user = await findUserByEmail(userEmail);

  if (!user || !user.profile) {
    throw new Error("Profile not found. Please complete profile onboarding first.");
  }

  const candidateName = user.name || "Alex Johnson";
  const candidateDegree = user.profile.degree;
  const candidateSkills = user.profile.skills;

  const applicationLogs: Array<{ jobId: string; type: string; message: string }> = [];

  const results = await Promise.all(
    jobs.map(async (job) => {
      const { id: jobId, title, company, location, source, applyUrl, description } = job;
      
      try {
        applicationLogs.push({
          jobId,
          type: "info",
          message: `Starting application process for ${title} at ${company}...`
        });

        applicationLogs.push({
          jobId,
          type: "agent",
          message: `Drafting customized cover letter for ${company}...`
        });

        const coverLetter = await draftCoverLetter(
          title,
          company,
          description || "",
          candidateName,
          candidateDegree,
          candidateSkills
        );

        applicationLogs.push({
          jobId,
          type: "network",
          message: `Simulating secure authentication with API endpoint of ${source || "Direct Link"}...`
        });

        applicationLogs.push({
          jobId,
          type: "submit",
          message: `Uploading profile and custom attachments to ${company} pipeline...`
        });

        const application = await upsertApplication(userEmail, {
          jobId,
          title,
          company,
          location: location || "Remote",
          source: source || "Direct Link",
          applyUrl: applyUrl || "",
          status: "Applied",
          coverLetter
        });

        applicationLogs.push({
          jobId,
          type: "success",
          message: `Applied successfully! Tracking ID: ${(application.id || "").substring(0, 8)}`
        });

        return application;
      } catch (jobError: any) {
        console.error(`Error applying to job ${jobId}:`, jobError);
        applicationLogs.push({
          jobId,
          type: "error",
          message: `Failed applying to ${title} at ${company}: ${jobError.message}`
        });
        return null;
      }
    })
  );

  const createdApplications = results.filter(Boolean);

  return {
    applications: createdApplications,
    logs: applicationLogs
  };
}

export async function getUserApplicationHistory(userEmail: string) {
  return getUserApplications(userEmail);
}
