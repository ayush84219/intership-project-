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
  Sparkles,
  Award,
  Globe,
  Clock,
  Video,
  Send,
  Building,
  Filter,
  CheckCircle2
} from "lucide-react";
import InterviewModal from "./InterviewModal";

interface PostedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  category: string;
  workType?: string;
  duration?: string;
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
  college?: string;
  degree?: string;
  resumeUrl?: string;
  skills?: string[];
  gpa?: string;
  endorsements?: any[];
  status: string;
  coverLetter?: string;
  appliedAt: string;
}

interface CompanyDashboardProps {
  user?: {
    id: string;
    name: string;
    email: string;
    companyName?: string | null;
    verificationStatus?: string;
    companyProfile?: any;
    website?: string | null;
    phone?: string | null;
    bio?: string | null;
  } | null;
  onOpenPostJobModal: () => void;
  onProfileUpdated?: () => void;
  currentTab?: "posted_jobs" | "applicants" | "profile";
  onTabChange?: (tab: "posted_jobs" | "applicants" | "profile") => void;
}

export default function CompanyDashboard({
  user,
  onOpenPostJobModal,
  onProfileUpdated,
  currentTab,
  onTabChange,
}: CompanyDashboardProps) {
  const [internalTab, setInternalTab] = useState<"posted_jobs" | "applicants" | "profile">(
    currentTab || "posted_jobs"
  );

  useEffect(() => {
    if (currentTab) {
      setInternalTab(currentTab);
    }
  }, [currentTab]);

  const activeTab = currentTab || internalTab;

  const handleTabSwitch = (t: "posted_jobs" | "applicants" | "profile") => {
    setInternalTab(t);
    if (onTabChange) {
      onTabChange(t);
    }
  };
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<Applicant | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Interview & Offer Modal State
  const [modalApplicant, setModalApplicant] = useState<Applicant | null>(null);
  const [modalMode, setModalMode] = useState<"interview" | "offer">("interview");

  // Company Profile Edit State
  const [compName, setCompName] = useState(user?.companyName || user?.companyProfile?.companyName || "");
  const [tagline, setTagline] = useState(user?.companyProfile?.tagline || "");
  const [industry, setIndustry] = useState(user?.companyProfile?.industry || "Software & Cloud AI");
  const [companySize, setCompanySize] = useState(user?.companyProfile?.companySize || "10,000+ employees");
  const [website, setWebsite] = useState(user?.website || user?.companyProfile?.website || "");
  const [headquarters, setHeadquarters] = useState(user?.companyProfile?.headquarters || "Mountain View, CA / Bengaluru, India");
  const [about, setAbout] = useState(user?.bio || user?.companyProfile?.about || "");
  const [savingCompanyProfile, setSavingCompanyProfile] = useState(false);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const jobsRes = await fetch("/api/posted-jobs");
      const jobsData = await jobsRes.json();
      if (jobsData.success) {
        setPostedJobs(jobsData.jobs || []);
      }

      const appsRes = await fetch("/api/posted-jobs/applicants");
      const appsData = await appsRes.json();
      if (appsData.success) {
        setApplicants(appsData.applicants || []);
      }
    } catch (err) {
      console.error("Error loading company data:", err);
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
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/posted-jobs/applicants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setApplicants((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompanyProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: compName,
          tagline,
          industry,
          companySize,
          website,
          headquarters,
          about,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Company profile updated successfully!");
        if (onProfileUpdated) onProfileUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCompanyProfile(false);
    }
  };

  const isVerifiedCompany = user?.verificationStatus === "VERIFIED";

  const filteredApplicants = applicants.filter((a) => {
    if (statusFilter === "ALL") return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner / Employer Status */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Building2 className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {user?.companyName || user?.companyProfile?.companyName || "Employer Talent Suite"}
                </h1>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-md flex items-center gap-1 ${isVerifiedCompany
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                      : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                    }`}
                >
                  {isVerifiedCompany ? (
                    <>
                      <CheckCircle className="h-3 w-3" /> Verified Employer
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" /> Pending Verification
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Manage your job postings, candidate pipelines, and company profile. Applications include verified university credentials and faculty endorsements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenPostJobModal}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Post New Internship
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="text-[11px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">Active Job Listings</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{postedJobs.length}</div>
          </div>
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="text-[11px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">Total Applicants</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{applicants.length}</div>
          </div>
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="text-[11px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">In Interview Stage</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {applicants.filter((a) => a.status === "Interviewing" || a.status === "Shortlisted").length}
            </div>
          </div>
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="text-[11px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">Offers Extended</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {applicants.filter((a) => a.status === "Offer").length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => handleTabSwitch("posted_jobs")}
          className={`flex items-center gap-2 pb-3 font-semibold text-xs tracking-wide transition-colors relative ${activeTab === "posted_jobs"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
        >
          <Briefcase className="h-4 w-4" />
          My Job Listings ({postedJobs.length})
        </button>

        <button
          onClick={() => handleTabSwitch("applicants")}
          className={`flex items-center gap-2 pb-3 font-semibold text-xs tracking-wide transition-colors relative ${activeTab === "applicants"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
        >
          <Users className="h-4 w-4" />
          Candidate Pipeline ({applicants.length})
        </button>

        <button
          onClick={() => handleTabSwitch("profile")}
          className={`flex items-center gap-2 pb-3 font-semibold text-xs tracking-wide transition-colors relative ${activeTab === "profile"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
        >
          <Building2 className="h-4 w-4" />
          Company Profile & Branding
        </button>
      </div>

      {/* TAB 1: POSTED JOBS */}
      {activeTab === "posted_jobs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Active Job Postings</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Manage your verified internship listings and view applicant volume.
              </p>
            </div>
            <button
              onClick={fetchCompanyData}
              disabled={loading}
              className="text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 shadow-2xs cursor-pointer transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Listings
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Loading job listings...</p>
            </div>
          ) : postedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center p-6 shadow-xs">
              <Briefcase className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No active listings posted yet</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mt-1 mb-4">
                Post an internship to reach university candidates and receive direct applications with verified academic records.
              </p>
              <button
                onClick={onOpenPostJobModal}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                + Post Your First Job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postedJobs.map((job) => {
                const jobApplicants = applicants.filter((a) => a.jobId === job.id);

                return (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-5 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase tracking-wider">
                            {job.category || "General"}
                          </span>
                          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-2">{job.title}</h3>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">{job.company}</div>
                        </div>

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingId === job.id}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          title="Delete Listing"
                        >
                          {deletingId === job.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <DollarSign className="h-3.5 w-3.5" /> {job.salary}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 font-medium border border-zinc-200/60 dark:border-zinc-700/60"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleTabSwitch("applicants")}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" /> {jobApplicants.length} Applicants
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CANDIDATE PIPELINE */}
      {activeTab === "applicants" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Candidate Pipeline & Recruitment Actions</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Review verified student credentials, schedule interviews, and issue official offer letters.
              </p>
            </div>

            {/* Filter by Status Pill Buttons */}
            <div className="flex flex-wrap items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
              {["ALL", "Applied", "Reviewing", "Shortlisted", "Interviewing", "Offer"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${statusFilter === st
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                >
                  {st === "ALL" ? "All Applicants" : st}
                </button>
              ))}
            </div>
          </div>

          {filteredApplicants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center p-6 shadow-xs">
              <Users className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No applicants matching this filter</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mt-1">
                Try selecting &ldquo;All Applicants&rdquo; to view candidates across all hiring stages.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredApplicants.map((app) => {
                const endorsement = app.endorsements?.[0];

                return (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-5 transition-all shadow-xs"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{app.applicantName}</h3>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                            {app.jobTitle}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                            95% Skill Match
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1 text-zinc-500">
                            <Mail className="h-3.5 w-3.5" /> {app.applicantEmail}
                          </span>
                          {app.college && (
                            <span className="flex items-center gap-1 font-medium text-zinc-800 dark:text-zinc-200">
                              <Building className="h-3.5 w-3.5 text-zinc-500" /> {app.college}
                            </span>
                          )}
                          {app.degree && <span>&bull; {app.degree}</span>}
                          {app.gpa && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&bull; GPA: {app.gpa}</span>}
                        </div>

                        {/* Resume and Links */}
                        <div className="flex items-center gap-2.5 pt-2 text-xs flex-wrap">
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium flex items-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5" /> View Resume PDF
                            </a>
                          )}
                          {app.coverLetter && (
                            <button
                              onClick={() => setSelectedCoverLetter(app)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium flex items-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Read Cover Letter
                            </button>
                          )}
                        </div>

                        {/* Teacher Endorsement Card */}
                        {endorsement && (
                          <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 text-xs">
                            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-semibold text-xs mb-1">
                              <Award className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Verified Faculty Endorsement ({endorsement.teacher?.name || "College Professor"})</span>
                            </div>
                            <p className="text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                              &ldquo;{endorsement.endorsement}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Quick Action Buttons & Status Selector */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                        {/* Status Dropdown */}
                        <div className="w-full sm:w-auto">
                          <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                            Current Stage
                          </label>
                          <select
                            value={app.status || "Applied"}
                            onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-600 cursor-pointer"
                          >
                            <option value="Applied">📄 Applied</option>
                            <option value="Reviewing">🔍 Under Review</option>
                            <option value="Shortlisted">⭐ Shortlisted</option>
                            <option value="Interviewing">💬 Interviewing</option>
                            <option value="Offer">🎉 Offer Extended</option>
                            <option value="Rejected">❌ Rejected</option>
                          </select>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => {
                              setModalApplicant(app);
                              setModalMode("interview");
                            }}
                            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Interview
                          </button>

                          <button
                            onClick={() => {
                              setModalApplicant(app);
                              setModalMode("offer");
                            }}
                            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Award className="h-3.5 w-3.5" />
                            Offer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPANY PROFILE & BRANDING */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 max-w-3xl shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">Company Profile & Employer Brand</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            Customize your corporate presence. Students see this information when browsing your job posts and receiving offers.
          </p>

          <form onSubmit={handleSaveCompanyProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Official Website
                </label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software, Financial Services, HealthTech"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Company Size
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500-1,000 employees"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Headquarters / Operating Locations
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA / Bengaluru, India"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Tagline / Mission Pitch
              </label>
              <input
                type="text"
                placeholder="e.g. Building enterprise-grade cloud platforms"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                About the Company
              </label>
              <textarea
                rows={4}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Describe your company culture, technology stack, and intern mentorship programs..."
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={savingCompanyProfile}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {savingCompanyProfile ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving Profile...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </form>
        </div>
      )}

      {/* COVER LETTER MODAL */}
      {selectedCoverLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-xl relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Candidate Cover Letter
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Applicant: <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{selectedCoverLetter.applicantName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCoverLetter(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-sans">
              {selectedCoverLetter.coverLetter}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedCoverLetter(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW / OFFER MODAL */}
      <InterviewModal
        isOpen={!!modalApplicant}
        onClose={() => setModalApplicant(null)}
        applicant={modalApplicant}
        mode={modalMode}
        onSuccess={(appId, newStatus, notes) => {
          setApplicants((prev) =>
            prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
          );
        }}
      />
    </div>
  );
}
