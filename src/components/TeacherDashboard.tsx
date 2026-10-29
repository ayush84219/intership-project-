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
  currentTab?: "students" | "placements" | "profile";
  onTabChange?: (tab: "students" | "placements" | "profile") => void;
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

export default function TeacherDashboard({ user, onProfileUpdated, currentTab, onTabChange }: TeacherDashboardProps) {
  const [internalTab, setInternalTab] = useState<"students" | "placements" | "profile">(
    currentTab || "students"
  );

  useEffect(() => {
    if (currentTab) {
      setInternalTab(currentTab);
    }
  }, [currentTab]);

  const activeTab = currentTab || internalTab;

  const handleTabSwitch = (t: "students" | "placements" | "profile") => {
    setInternalTab(t);
    if (onTabChange) {
      onTabChange(t);
    }
  };
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
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <GraduationCap className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {user.name || "Faculty Placement Officer"}
                </h1>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-md flex items-center gap-1 ${isVerifiedFaculty
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                    : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                    }`}
                >
                  {isVerifiedFaculty ? (
                    <>
                      <CheckCircle className="h-3 w-3" /> Verified Faculty
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" /> Pending Verification
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-1">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {user.collegeName || user.teacherProfile?.collegeName || "University Faculty"}
                </span>
                <span>&bull;</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{user.department || user.teacherProfile?.department || "Department Faculty"}</span>
                {user.employeeId && (
                  <>
                    <span>&bull;</span>
                    <span className="font-mono text-zinc-500">ID: {user.employeeId}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchStudents}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors border border-zinc-200 dark:border-zinc-700 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Student Roster
            </button>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="text-[11px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">Department Students</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{students.length}</div>
          </div>
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="text-[11px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">Endorsed & Verified</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {students.filter((s) => s.studentEndorsements && s.studentEndorsements.length > 0).length}
            </div>
          </div>
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="text-[11px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">Internship Applications</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{allCollegeApplications.length}</div>
          </div>
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="text-[11px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">Interviews & Offers</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {allCollegeApplications.filter((a) =>
                ["Interviewing", "Offer", "Shortlisted"].includes(a.status)
              ).length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => handleTabSwitch("students")}
          className={`flex items-center gap-2 pb-3 font-semibold text-xs tracking-wide transition-colors relative ${activeTab === "students"
            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
        >
          <Users className="h-4 w-4" />
          Student Roster & Recommendations ({students.length})
        </button>

        <button
          onClick={() => handleTabSwitch("placements")}
          className={`flex items-center gap-2 pb-3 font-semibold text-xs tracking-wide transition-colors relative ${activeTab === "placements"
            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
        >
          <Briefcase className="h-4 w-4" />
          Placement Pipeline & Analytics ({allCollegeApplications.length})
        </button>

        <button
          onClick={() => handleTabSwitch("profile")}
          className={`flex items-center gap-2 pb-3 font-semibold text-xs tracking-wide transition-colors relative ${activeTab === "profile"
            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
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
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Department Student Roster</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Review academic credentials, grant official faculty endorsements, and generate certified Letters of Recommendation.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student name, roll no, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <RefreshCw className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-spin mb-3" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Loading student roster...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center p-6 shadow-xs">
              <Users className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No Students Found</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mt-1">
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
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-5 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">{student.name}</h3>
                            {student.studentId && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-zinc-600 dark:text-zinc-300 font-medium border border-zinc-200 dark:border-zinc-700">
                                {student.studentId}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{student.email}</div>
                          <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                            {student.profile?.degree || "Engineering / Technology Track"}
                          </div>
                        </div>

                        {isEndorsed ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 shrink-0">
                            <CheckCircle className="h-3 w-3 text-emerald-600" /> Endorsed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shrink-0">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* GPA & Resume */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                        {student.profile?.gpa && (
                          <div className="px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium">
                            <span className="text-zinc-500">GPA:</span> {student.profile.gpa}
                          </div>
                        )}
                        {student.profile?.resumeUrl && (
                          <a
                            href={student.profile.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1 hover:underline text-xs"
                          >
                            <FileText className="h-3 w-3" /> Resume PDF
                          </a>
                        )}
                        {student.profile?.githubUrl && (
                          <a
                            href={student.profile.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 hover:underline text-xs font-medium"
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
                                className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 font-medium border border-zinc-200/60 dark:border-zinc-700/60"
                              >
                                {s.trim()}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Existing Faculty Endorsement Quote */}
                      {endorsement && (
                        <div className="mt-3.5 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 font-medium uppercase mb-1">
                            <span>Your Recommendation</span>
                            <div className="flex items-center text-amber-500">
                              {[...Array(endorsement.rating || 5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-zinc-700 dark:text-zinc-300 italic leading-relaxed text-xs">
                            &ldquo;{endorsement.endorsement}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => setLorStudent(student)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileCheck2 className="h-3.5 w-3.5 text-zinc-500" />
                        Generate LOR Certificate
                      </button>

                      <button
                        onClick={() => handleOpenEndorseModal(student)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${isEndorsed
                          ? "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                          }`}
                      >
                        <Award className="h-3.5 w-3.5" />
                        {isEndorsed ? "Update Recommendation" : "Endorse Student"}
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
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Student Internship Applications & Placement Pipeline
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Track real-time candidate hiring progress across corporate recruiters and internship listings.
              </p>
            </div>
          </div>

          {/* Placement Analytics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Placement Success Rate</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block mt-1">78.5%</span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">+12% vs previous term</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Average Monthly Stipend</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 block mt-1">₹1,25,000</span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">Software & Engineering</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Top Employer Partner</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 block mt-1">Google LLC</span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">2 Verified Openings</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-850/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Internship Opening</th>
                    <th className="py-3 px-4">Target Company</th>
                    <th className="py-3 px-4">Status Stage</th>
                    <th className="py-3 px-4">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-normal text-zinc-800 dark:text-zinc-200">
                  {allCollegeApplications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500 font-medium">
                        No student applications recorded yet.
                      </td>
                    </tr>
                  ) : (
                    allCollegeApplications.map((app, idx) => {
                      const isOffer = app.status === "Offer";
                      const isInterview = app.status === "Interviewing";
                      const isReview = app.status === "Reviewing";

                      return (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{app.studentName}</div>
                            <div className="text-[11px] text-zinc-500">{app.studentEmail}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">{app.title}</td>
                          <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-medium">
                            {app.company}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${isOffer
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
                                : isInterview
                                  ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50"
                                  : isReview
                                    ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50"
                                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                }`}
                            >
                              {app.status || "Applied"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-500 text-[11px]">
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
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 max-w-3xl shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">Teacher & Placement Coordinator Profile</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            Keep your academic and institutional affiliation details up-to-date for admin verification and student transparency.
          </p>

          <form onSubmit={handleSaveTeacherProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  College / University Name
                </label>
                <input
                  type="text"
                  required
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Department / Faculty
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Designation / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Head of Training & Placement / Professor"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Faculty Employee ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. FAC-IITD-8821"
                  value={editFacultyId}
                  onChange={(e) => setEditFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Official Institutional Email
                </label>
                <input
                  type="email"
                  value={editOfficialEmail}
                  onChange={(e) => setEditOfficialEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Faculty Bio / Placement Mission
              </label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Brief summary of your academic background and student mentorship objectives..."
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {savingProfile ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving Changes...
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
                className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${actionMsg.type === "success"
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
                      className={`p-2 rounded-xl border transition-all ${rating >= star
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
