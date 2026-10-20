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
}

export default function CompanyDashboard({ user, onOpenPostJobModal, onProfileUpdated }: CompanyDashboardProps) {
  const [activeTab, setActiveTab] = useState<"posted_jobs" | "applicants" | "profile">("posted_jobs");
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
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Banner / Employer Status */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-zinc-900 to-zinc-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-emerald-500/30 shrink-0">
              <Building2 className="h-8 w-8 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {user?.companyName || user?.companyProfile?.companyName || "Employer Talent Suite"}
                </h1>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isVerifiedCompany
                      ? "bg-emerald-400 text-black shadow-md shadow-emerald-500/20"
                      : "bg-amber-400 text-black shadow-md shadow-amber-500/20"
                  }`}
                >
                  {isVerifiedCompany ? (
                    <>
                      <CheckCircle className="h-3 w-3" /> VERIFIED EMPLOYER
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" /> Pending Admin Verification
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-medium mt-1.5 max-w-2xl leading-relaxed">
                Manage your job postings, candidate pipelines, and company profile. Applications include verified university credentials and faculty endorsements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPostJobModal}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Post New Internship
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800">
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Active Job Listings</div>
            <div className="text-2xl font-black text-white mt-0.5">{postedJobs.length}</div>
          </div>
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Total Applicants</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{applicants.length}</div>
          </div>
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">In Interview Stage</div>
            <div className="text-2xl font-black text-cyan-400 mt-0.5">
              {applicants.filter((a) => a.status === "Interviewing" || a.status === "Shortlisted").length}
            </div>
          </div>
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Offers Extended</div>
            <div className="text-2xl font-black text-teal-300 mt-0.5">
              {applicants.filter((a) => a.status === "Offer").length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab("posted_jobs")}
          className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative ${
            activeTab === "posted_jobs"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          My Job Listings ({postedJobs.length})
        </button>

        <button
          onClick={() => setActiveTab("applicants")}
          className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative ${
            activeTab === "applicants"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Users className="h-4 w-4" />
          Candidate Pipeline ({applicants.length})
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative ${
            activeTab === "profile"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-zinc-400 hover:text-zinc-200"
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
              <h2 className="text-lg font-black text-white">Active Job Postings</h2>
              <p className="text-xs text-zinc-300 mt-0.5">
                Manage your verified internship listings and view applicant volume.
              </p>
            </div>
            <button
              onClick={fetchCompanyData}
              disabled={loading}
              className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Listings
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/60 rounded-3xl border border-zinc-800">
              <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-xs text-zinc-300 font-semibold">Loading job listings...</p>
            </div>
          ) : postedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 text-center p-6">
              <Briefcase className="h-10 w-10 text-zinc-500 mb-3" />
              <h3 className="text-base font-bold text-white">No active listings posted yet</h3>
              <p className="text-xs text-zinc-400 max-w-md mt-1 mb-4">
                Post an internship to reach top university candidates and receive direct applications with verified academic records.
              </p>
              <button
                onClick={onOpenPostJobModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-bold text-xs uppercase tracking-wider"
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
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/40 rounded-3xl p-6 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                            {job.category || "General"}
                          </span>
                          <h3 className="text-base font-bold text-white mt-2">{job.title}</h3>
                          <div className="text-xs text-zinc-300 mt-0.5 font-medium">{job.company}</div>
                        </div>

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingId === job.id}
                          className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                          title="Delete Listing"
                        >
                          {deletingId === job.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-400">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> {job.salary}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 mt-2.5 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 text-[11px] text-zinc-200 font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 text-[11px]">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => setActiveTab("applicants")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/20 flex items-center gap-1.5 transition-colors"
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
              <h2 className="text-lg font-black text-white">Candidate Pipeline & Recruitment Actions</h2>
              <p className="text-xs text-zinc-300 mt-0.5">
                Review verified student credentials, schedule interviews, and issue official offer letters.
              </p>
            </div>

            {/* Filter by Status Pill Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              {["ALL", "Applied", "Reviewing", "Shortlisted", "Interviewing", "Offer"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === st
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {st === "ALL" ? "All Applicants" : st}
                </button>
              ))}
            </div>
          </div>

          {filteredApplicants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 text-center p-6">
              <Users className="h-10 w-10 text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-white">No applicants matching this filter</h3>
              <p className="text-xs text-zinc-400 max-w-md mt-1">
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
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 transition-all shadow-xl"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white">{app.applicantName}</h3>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            {app.jobTitle}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            ⚡ 95% AI Skill Match
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Mail className="h-3.5 w-3.5 text-zinc-500" /> {app.applicantEmail}
                          </span>
                          {app.college && (
                            <span className="flex items-center gap-1 font-semibold text-white">
                              <Building className="h-3.5 w-3.5 text-purple-400" /> {app.college}
                            </span>
                          )}
                          {app.degree && <span className="text-zinc-300">&bull; {app.degree}</span>}
                          {app.gpa && <span className="text-emerald-400 font-bold">&bull; GPA: {app.gpa}</span>}
                        </div>

                        {/* Resume and Links */}
                        <div className="flex items-center gap-2.5 pt-2 text-xs flex-wrap">
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1.5 hover:bg-cyan-900/40 transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5" /> View Resume PDF
                            </a>
                          )}
                          {app.coverLetter && (
                            <button
                              onClick={() => setSelectedCoverLetter(app)}
                              className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold flex items-center gap-1.5 hover:bg-zinc-700 transition-colors cursor-pointer"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Read AI Cover Letter
                            </button>
                          )}
                        </div>

                        {/* Teacher Endorsement Card */}
                        {endorsement && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs">
                            <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px] uppercase mb-1">
                              <Award className="h-3.5 w-3.5 text-purple-400" />
                              <span>Verified Faculty Endorsement ({endorsement.teacher?.name || "College Professor"})</span>
                            </div>
                            <p className="text-zinc-200 italic leading-relaxed">
                              &ldquo;{endorsement.endorsement}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Quick Action Buttons & Status Selector */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                        {/* Status Dropdown */}
                        <div className="w-full sm:w-auto">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                            Current Stage
                          </label>
                          <select
                            value={app.status || "Applied"}
                            onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-200 outline-none focus:border-emerald-400 cursor-pointer"
                          >
                            <option value="Applied">📄 Applied</option>
                            <option value="Reviewing">🔍 Under Review</option>
                            <option value="Shortlisted">⭐ Shortlisted</option>
                            <option value="Interviewing">💬 Interviewing</option>
                            <option value="Offer">🎉 Offer Extended</option>
                            <option value="Rejected">❌ Rejected</option>
                          </select>
                        </div>

                        {/* Quick 1-Click Action Buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => {
                              setModalApplicant(app);
                              setModalMode("interview");
                            }}
                            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Interview
                          </button>

                          <button
                            onClick={() => {
                              setModalApplicant(app);
                              setModalMode("offer");
                            }}
                            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-3xl shadow-xl">
          <h2 className="text-lg font-black text-white mb-1">Company Profile & Employer Brand</h2>
          <p className="text-xs text-zinc-300 mb-6 leading-relaxed">
            Customize your corporate presence. Students see this information when browsing your job posts and receiving offers.
          </p>

          <form onSubmit={handleSaveCompanyProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Official Website
                </label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Cloud Computing"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Company Size
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10,000+ employees"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Headquarters / Operating Locations
              </label>
              <input
                type="text"
                placeholder="e.g. Mountain View, CA / Bengaluru, India"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Tagline / Mission Pitch
              </label>
              <input
                type="text"
                placeholder="e.g. Organizing the world's information and building helpful AI"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                About the Company
              </label>
              <textarea
                rows={4}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Describe your company culture, technology stack, and intern mentorship programs..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-400 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={savingCompanyProfile}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40"
            >
              {savingCompanyProfile ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                "Save Company Profile"
              )}
            </button>
          </form>
        </div>
      )}

      {/* COVER LETTER MODAL */}
      {selectedCoverLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Candidate AI Cover Letter
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  From: <span className="text-emerald-400 font-bold">{selectedCoverLetter.applicantName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCoverLetter(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-sans">
              {selectedCoverLetter.coverLetter}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedCoverLetter(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase cursor-pointer"
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
