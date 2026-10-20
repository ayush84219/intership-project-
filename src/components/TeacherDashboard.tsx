"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Users,
  Award,
  CheckCircle,
  Clock,
  Star,
  ExternalLink,
  Search,
  BookOpen,
  Briefcase,
  FileText,
  Mail,
  Building,
  UserCheck,
  Send,
  RefreshCw,
  Plus,
  AlertCircle,
  TrendingUp,
  FileCheck2,
  DollarSign
} from "lucide-react";
import LORModal from "./LORModal";

interface TeacherDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    collegeName?: string | null;
    department?: string | null;
    designation?: string | null;
    employeeId?: string | null;
    verificationStatus?: string;
    teacherProfile?: any;
  };
  onProfileUpdated?: () => void;
}

interface StudentItem {
  id: string;
  name: string;
  email: string;
  studentId?: string | null;
  collegeName?: string | null;
  phone?: string | null;
  bio?: string | null;
  profile?: {
    id: string;
    degree: string;
    skills: string;
    targetRoles: string;
    resumeUrl?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
    gpa?: string | null;
    graduationYear?: string | null;
    isAcademicVerified?: boolean;
  } | null;
  applications?: any[];
  studentEndorsements?: {
    id: string;
    skill?: string | null;
    endorsement: string;
    rating: number;
    verifiedAcademic: boolean;
    createdAt: string;
  }[];
}

export default function TeacherDashboard({ user, onProfileUpdated }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<"students" | "placements" | "profile">("students");
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Endorsement Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [skill, setSkill] = useState("");
  const [endorsementText, setEndorsementText] = useState("");
  const [rating, setRating] = useState(5);
  const [verifyAcademic, setVerifyAcademic] = useState(true);
  const [submittingEndorsement, setSubmittingEndorsement] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // LOR Modal State
  const [lorStudent, setLorStudent] = useState<StudentItem | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState(user.name || "");
  const [editCollege, setEditCollege] = useState(user.collegeName || user.teacherProfile?.collegeName || "");
  const [editDept, setEditDept] = useState(user.department || user.teacherProfile?.department || "");
  const [editDesignation, setEditDesignation] = useState(user.designation || user.teacherProfile?.designation || "");
  const [editFacultyId, setEditFacultyId] = useState(user.employeeId || user.teacherProfile?.facultyId || "");
  const [editOfficialEmail, setEditOfficialEmail] = useState(user.teacherProfile?.officialEmail || user.email);
  const [editBio, setEditBio] = useState(user.teacherProfile?.bio || "");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/students");
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEndorseModal = (student: StudentItem) => {
    setSelectedStudent(student);
    const existing = student.studentEndorsements?.[0];
    if (existing) {
      setSkill(existing.skill || "");
      setEndorsementText(existing.endorsement);
      setRating(existing.rating || 5);
      setVerifyAcademic(existing.verifiedAcademic);
    } else {
      setSkill("Full Stack Engineering & System Design");
      setEndorsementText(
        `${student.name} has demonstrated excellent academic consistency and technical aptitude in our department coursework. Highly recommended for industry internships.`
      );
      setRating(5);
      setVerifyAcademic(true);
    }
    setActionMsg(null);
  };

  const handleSubmitEndorsement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !endorsementText.trim()) return;

    setSubmittingEndorsement(true);
    setActionMsg(null);
    try {
      const res = await fetch("/api/teacher/endorse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          skill: skill.trim(),
          endorsement: endorsementText.trim(),
          rating,
          verifyAcademic,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: "success", text: "Student officially endorsed and verified!" });
        fetchStudents();
        setTimeout(() => setSelectedStudent(null), 1200);
      } else {
        setActionMsg({ type: "error", text: data.error || "Failed to endorse." });
      }
    } catch (err: any) {
      setActionMsg({ type: "error", text: err.message || "Network error" });
    } finally {
      setSubmittingEndorsement(false);
    }
  };

  const handleSaveTeacherProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          collegeName: editCollege,
          department: editDept,
          designation: editDesignation,
          facultyId: editFacultyId,
          officialEmail: editOfficialEmail,
          bio: editBio,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Teacher profile updated successfully!");
        if (onProfileUpdated) onProfileUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const allCollegeApplications = students.flatMap((s) =>
    (s.applications || []).map((app) => ({
      ...app,
      studentName: s.name,
      studentEmail: s.email,
      degree: s.profile?.degree,
      studentId: s.studentId,
    }))
  );

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      (s.profile?.degree && s.profile.degree.toLowerCase().includes(q)) ||
      (s.profile?.skills && s.profile.skills.toLowerCase().includes(q))
    );
  });

  const isVerifiedFaculty = user.verificationStatus === "VERIFIED";

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-500/20 via-zinc-900 to-zinc-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {user.name || "Faculty Placement Officer"}
                </h1>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isVerifiedFaculty
                      ? "bg-emerald-400 text-black shadow-md shadow-emerald-500/20"
                      : "bg-amber-400 text-black shadow-md shadow-amber-500/20"
                  }`}
                >
                  {isVerifiedFaculty ? (
                    <>
                      <CheckCircle className="h-3 w-3" /> VERIFIED FACULTY
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" /> Pending Admin Verification
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 font-medium mt-1.5">
                <span className="font-bold text-white">
                  {user.collegeName || user.teacherProfile?.collegeName || "Indian Institute of Technology (IIT) Delhi"}
                </span>
                <span>&bull;</span>
                <span className="text-purple-300 font-semibold">{user.department || user.teacherProfile?.department || "Computer Science & Engineering"}</span>
                {user.employeeId && (
                  <>
                    <span>&bull;</span>
                    <span className="text-zinc-400 font-mono">ID: {user.employeeId}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStudents}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all border border-zinc-700 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Student Roster
            </button>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800">
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Department Students</div>
            <div className="text-2xl font-black text-white mt-0.5">{students.length}</div>
          </div>
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Endorsed & Verified</div>
            <div className="text-2xl font-black text-purple-300 mt-0.5">
              {students.filter((s) => s.studentEndorsements && s.studentEndorsements.length > 0).length}
            </div>
          </div>
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Internship Applications</div>
            <div className="text-2xl font-black text-cyan-300 mt-0.5">{allCollegeApplications.length}</div>
          </div>
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Interviews & Offers</div>
            <div className="text-2xl font-black text-emerald-300 mt-0.5">
              {allCollegeApplications.filter((a) =>
                ["Interviewing", "Offer", "Shortlisted"].includes(a.status)
              ).length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative ${
            activeTab === "students"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Users className="h-4 w-4" />
          Student Roster & Recommendations ({students.length})
        </button>

        <button
          onClick={() => setActiveTab("placements")}
          className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative ${
            activeTab === "placements"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Placement Pipeline & Analytics ({allCollegeApplications.length})
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative ${
            activeTab === "profile"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Teacher & Department Profile
        </button>
      </div>

      {/* TAB 1: STUDENT ROSTER */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Department Student Roster</h2>
              <p className="text-xs text-zinc-300 mt-0.5">
                Review academic credentials, grant official faculty endorsements, and generate certified Letters of Recommendation.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, roll no, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-purple-400 placeholder:text-zinc-600"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/60 rounded-3xl border border-zinc-800">
              <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mb-3" />
              <p className="text-xs text-zinc-300 font-semibold">Loading student roster...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 text-center p-6">
              <Users className="h-10 w-10 text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-white">No Students Found</h3>
              <p className="text-xs text-zinc-400 max-w-md mt-1">
                No students match your filter. Registered students from your college will automatically appear in this roster.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((student) => {
                const endorsement = student.studentEndorsements?.[0];
                const isEndorsed = Boolean(endorsement);

                return (
                  <div
                    key={student.id}
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/40 rounded-3xl p-6 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{student.name}</h3>
                            {student.studentId && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 font-mono text-zinc-300 font-bold">
                                {student.studentId}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5">{student.email}</div>
                          <div className="text-xs font-semibold text-purple-300 mt-1">
                            {student.profile?.degree || "Engineering / Technology Track"}
                          </div>
                        </div>

                        {isEndorsed ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <CheckCircle className="h-3 w-3 text-emerald-400" /> Verified & Endorsed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                            Unverified
                          </span>
                        )}
                      </div>

                      {/* GPA & Resume */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-zinc-800 text-xs">
                        {student.profile?.gpa && (
                          <div className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200">
                            <span className="text-zinc-500 font-bold">GPA:</span> {student.profile.gpa}
                          </div>
                        )}
                        {student.profile?.resumeUrl && (
                          <a
                            href={student.profile.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1 hover:underline"
                          >
                            <FileText className="h-3 w-3" /> Resume PDF
                          </a>
                        )}
                        {student.profile?.githubUrl && (
                          <a
                            href={student.profile.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-1 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> GitHub
                          </a>
                        )}
                      </div>

                      {/* Skills */}
                      {student.profile?.skills && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {student.profile.skills
                            .split(",")
                            .slice(0, 5)
                            .map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 text-[11px] text-zinc-200 font-medium"
                              >
                                {s.trim()}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Existing Faculty Endorsement Quote */}
                      {endorsement && (
                        <div className="mt-3.5 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold uppercase mb-1">
                            <span>Your Recommendation</span>
                            <div className="flex items-center text-amber-400">
                              {[...Array(endorsement.rating || 5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-zinc-200 italic leading-relaxed">
                            &ldquo;{endorsement.endorsement}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => setLorStudent(student)}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileCheck2 className="h-3.5 w-3.5" />
                        Generate LOR Certificate
                      </button>

                      <button
                        onClick={() => handleOpenEndorseModal(student)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                          isEndorsed
                            ? "bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-zinc-700"
                            : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20"
                        }`}
                      >
                        <Award className="h-3.5 w-3.5" />
                        {isEndorsed ? "Update Recommendation" : "Endorse & Verify"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLACEMENT & INTERNSHIP TRACKER */}
      {activeTab === "placements" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">
                Student Internship Applications & Placement Pipeline
              </h2>
              <p className="text-xs text-zinc-300 mt-0.5">
                Track real-time candidate hiring progress across corporate recruiters and internship listings.
              </p>
            </div>
          </div>

          {/* Interactive Placement Analytics Widget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Placement Success Rate</span>
                <span className="text-2xl font-black text-emerald-400 block mt-1">78.5%</span>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">+12% vs previous term</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Average Monthly Stipend</span>
                <span className="text-2xl font-black text-cyan-400 block mt-1">₹1,25,000</span>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">Software & AI tracks</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Top Recruiter Partner</span>
                <span className="text-2xl font-black text-purple-400 block mt-1">Google LLC</span>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">2 Verified Openings</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Building className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-300 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Internship Opening</th>
                    <th className="py-3.5 px-4">Target Company</th>
                    <th className="py-3.5 px-4">Status Stage</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 font-medium text-zinc-200">
                  {allCollegeApplications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400 font-semibold">
                        No student applications recorded yet.
                      </td>
                    </tr>
                  ) : (
                    allCollegeApplications.map((app, idx) => {
                      const isOffer = app.status === "Offer";
                      const isInterview = app.status === "Interviewing";
                      const isReview = app.status === "Reviewing";

                      return (
                        <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{app.studentName}</div>
                            <div className="text-[11px] text-zinc-400">{app.studentEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-200">{app.title}</td>
                          <td className="py-3.5 px-4 text-purple-300 font-semibold flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-zinc-400" />
                            {app.company}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isOffer
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : isInterview
                                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                  : isReview
                                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                  : "bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              {app.status || "Applied"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEACHER & DEPARTMENT PROFILE */}
      {activeTab === "profile" && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-3xl shadow-xl">
          <h2 className="text-lg font-black text-white mb-1">Teacher & Placement Coordinator Profile</h2>
          <p className="text-xs text-zinc-300 mb-6 leading-relaxed">
            Keep your academic and institutional affiliation details up-to-date for admin verification and student transparency.
          </p>

          <form onSubmit={handleSaveTeacherProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  College / University Name
                </label>
                <input
                  type="text"
                  required
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Department / Faculty
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Designation / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Head of Training & Placement / Professor"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Faculty Employee ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. FAC-IITD-8821"
                  value={editFacultyId}
                  onChange={(e) => setEditFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Official Institutional Email
                </label>
                <input
                  type="email"
                  value={editOfficialEmail}
                  onChange={(e) => setEditOfficialEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Faculty Bio / Placement Mission
              </label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Brief summary of your academic background and student mentorship objectives..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-purple-400 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-purple-500/20 disabled:opacity-40"
            >
              {savingProfile ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                "Save Teacher Profile"
              )}
            </button>
          </form>
        </div>
      )}

      {/* ENDORSEMENT MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  Endorse & Verify Student
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Recommendation for: <span className="text-purple-300 font-bold">{selectedStudent.name}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {actionMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  actionMsg.type === "success"
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/40"
                    : "bg-red-950/40 text-red-300 border border-red-500/40"
                }`}
              >
                {actionMsg.type === "success" ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span>{actionMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEndorsement} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Domain / Focus Skill Endorsed
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Engineering, AI Research, Business Strategy"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Faculty Recommendation Statement
                </label>
                <textarea
                  rows={4}
                  required
                  value={endorsementText}
                  onChange={(e) => setEndorsementText(e.target.value)}
                  placeholder="Write your recommendation about this student's skills, ethics, and potential..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-purple-400 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Faculty Academic Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl border transition-all ${
                        rating >= star
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                          : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-zinc-300 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifyAcademic}
                  onChange={(e) => setVerifyAcademic(e.target.checked)}
                  className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-zinc-200 block">Grant Official Academic Verification Badge</span>
                  <span className="text-zinc-400 text-[11px]">
                    Certifies that {selectedStudent.name} is a bona fide enrolled student of your department.
                  </span>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEndorsement}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-500/20 cursor-pointer"
                >
                  {submittingEndorsement ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Award className="h-4 w-4" />
                  )}
                  Publish Endorsement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOR GENERATOR MODAL */}
      <LORModal
        isOpen={!!lorStudent}
        onClose={() => setLorStudent(null)}
        student={lorStudent}
        teacher={{
          name: user.name || "Prof. Rajesh Verma",
          collegeName: user.collegeName || "IIT Delhi",
          department: user.department || "Computer Science & Engineering",
          designation: user.designation || "Head of Training & Placement / Professor",
          employeeId: user.employeeId || "FAC-IITD-8821",
        }}
      />
    </div>
  );
}
