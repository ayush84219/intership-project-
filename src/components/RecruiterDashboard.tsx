"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Briefcase, 
  Users, 
  Plus, 
  Trash2, 
  FileText, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  RefreshCw, 
  Search,
  ExternalLink,
  Mail,
  Calendar,
  Sparkles
} from "lucide-react";

interface PostedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  category: string;
  description: string;
  skills: string[];
  applyUrl?: string;
  createdAt: string;
}

interface Applicant {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  coverLetter?: string;
  appliedAt: string;
}

interface RecruiterDashboardProps {
  onOpenPostJobModal: () => void;
}

export default function RecruiterDashboard({ onOpenPostJobModal }: RecruiterDashboardProps) {
  const [activeTab, setActiveTab] = useState<"posted_jobs" | "applicants">("posted_jobs");
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<Applicant | null>(null);

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const fetchRecruiterData = async () => {
    setLoading(true);
    try {
      // Fetch posted jobs
      const jobsRes = await fetch("/api/posted-jobs");
      const jobsData = await jobsRes.json();
      if (jobsData.success) {
        setPostedJobs(jobsData.jobs || []);
      }

      // Fetch applicants
      const appsRes = await fetch("/api/posted-jobs/applicants");
      const appsData = await appsRes.json();
      if (appsData.success) {
        setApplicants(appsData.applicants || []);
      }
    } catch (err) {
      console.error("Error loading recruiter data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job listing?")) return;
    setDeletingId(jobId);
    try {
      const res = await fetch(`/api/posted-jobs?id=${jobId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPostedJobs((prev) => prev.filter((j) => j.id !== jobId));
      } else {
        alert(data.error || "Failed to delete job.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting job.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Building2 className="h-3.5 w-3.5" /> Recruiter Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
              Manage Hiring & Postings
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Create job opportunities, manage active postings, and connect with top talent across engineering, business, and design.
            </p>
          </div>

          <button
            onClick={onOpenPostJobModal}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3]" /> Post New Job
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80">
            <div className="flex items-center gap-2.5 text-zinc-400 text-xs font-semibold">
              <Briefcase className="h-4 w-4 text-emerald-400" /> Posted Jobs
            </div>
            <div className="text-2xl font-black text-zinc-100 mt-2">{postedJobs.length}</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80">
            <div className="flex items-center gap-2.5 text-zinc-400 text-xs font-semibold">
              <Users className="h-4 w-4 text-cyan-400" /> Applicants Received
            </div>
            <div className="text-2xl font-black text-zinc-100 mt-2">{applicants.length}</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 text-zinc-400 text-xs font-semibold">
              <Sparkles className="h-4 w-4 text-amber-400" /> Hiring Status
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" /> Active Recruiting
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab("posted_jobs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "posted_jobs"
              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
          }`}
        >
          <Briefcase className="h-4 w-4" /> My Posted Jobs ({postedJobs.length})
        </button>

        <button
          onClick={() => setActiveTab("applicants")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "applicants"
              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
          }`}
        >
          <Users className="h-4 w-4" /> Applicants Received ({applicants.length})
        </button>

        <button
          onClick={fetchRecruiterData}
          className="ml-auto p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* Loading indicator */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-500 gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
          <span className="text-xs font-bold tracking-wider">Loading recruiter records...</span>
        </div>
      ) : activeTab === "posted_jobs" ? (
        /* MY POSTED JOBS TAB */
        <div>
          {postedJobs.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800">
              <Building2 className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-300">No Job Openings Posted Yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                Click below to publish your first internship or job role directly to student candidates.
              </p>
              <button
                onClick={onOpenPostJobModal}
                className="mt-5 px-5 py-2.5 bg-emerald-500 text-black font-bold rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4 stroke-[3]" /> Post First Job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postedJobs.map((job) => {
                const jobApplicantsCount = applicants.filter((a) => a.jobId === job.id).length;
                return (
                  <div
                    key={job.id}
                    className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-4 relative group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                            {job.category}
                          </span>
                          <h3 className="text-base font-bold text-zinc-100 mt-2 group-hover:text-emerald-400 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs font-semibold text-zinc-400">{job.company}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingId === job.id}
                          className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900/50 transition-colors cursor-pointer"
                          title="Delete Job Listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400 font-medium mt-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{job.salary}</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-semibold">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Users className="h-3.5 w-3.5" /> {jobApplicantsCount} Applicants Received
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* APPLICANTS RECEIVED TAB */
        <div>
          {applicants.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800">
              <Users className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-300">No Applicants Yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                When students apply to your posted jobs, their information, emails, and generated cover letters will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applicants.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-100">{app.applicantName}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 font-bold">
                        Applied
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-zinc-500" /> {app.applicantEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-zinc-500" /> {app.jobTitle}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(app.appliedAt).toLocaleDateString()}
                    </span>

                    {app.coverLetter && (
                      <button
                        onClick={() => setSelectedCoverLetter(app)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-cyan-400 text-xs font-bold border border-zinc-700/60 transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5" /> View Cover Letter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cover Letter Modal View for Recruiter */}
      {selectedCoverLetter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedCoverLetter(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" /> Cover Letter & Application Details
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Applicant: <span className="font-bold text-zinc-200">{selectedCoverLetter.applicantName}</span> ({selectedCoverLetter.applicantEmail})
            </p>
            <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto font-sans">
              {selectedCoverLetter.coverLetter}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedCoverLetter(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl hover:bg-zinc-700"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
