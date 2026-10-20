"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  GraduationCap, 
  Building2, 
  CheckCircle2,
  ArrowRight,
  Briefcase,
  BookOpen,
  Building,
  Globe,
  Award
} from "lucide-react";

type SignupRole = "STUDENT" | "COMPANY" | "TEACHER";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const queryRole = searchParams?.get("role")?.toUpperCase();
  let defaultRole: SignupRole = "STUDENT";
  if (queryRole === "COMPANY" || queryRole === "RECRUITER") defaultRole = "COMPANY";
  else if (queryRole === "TEACHER") defaultRole = "TEACHER";

  const [activePanel, setActivePanel] = useState<SignupRole>(defaultRole);

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Role-specific fields
  const [collegeName, setCollegeName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync role if query param changes
  useEffect(() => {
    if (queryRole === "COMPANY" || queryRole === "RECRUITER") {
      setActivePanel("COMPANY");
    } else if (queryRole === "TEACHER") {
      setActivePanel("TEACHER");
    } else if (queryRole === "STUDENT") {
      setActivePanel("STUDENT");
    }
  }, [queryRole]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          role: activePanel,
          collegeName: collegeName.trim(),
          companyName: companyName.trim(),
          department: department.trim(),
          designation: designation.trim(),
          employeeId: employeeId.trim(),
          studentId: studentId.trim(),
          website: website.trim(),
          bio: bio.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create account.");
      }

      // Redirect to login with active role panel
      router.push(`/login?role=${activePanel}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-foreground flex-col gap-4 font-sans transition-colors duration-300">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        <span className="text-sm font-semibold tracking-wider text-zinc-400 animate-pulse">Checking credentials session...</span>
      </div>
    );
  }

  const buttonGradient =
    activePanel === "STUDENT"
      ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-cyan-500/10"
      : activePanel === "COMPANY"
      ? "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black shadow-emerald-500/10"
      : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/10";

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background glow graphics */}
      <div 
        className={`absolute top-1/4 left-1/4 w-96 h-96 blur-[140px] rounded-full pointer-events-none transition-all duration-700 ${
          activePanel === "STUDENT" ? "bg-cyan-500/15" : activePanel === "COMPANY" ? "bg-emerald-500/15" : "bg-purple-500/15"
        }`} 
      />

      {/* Header / Brand */}
      <div className="flex flex-col items-center gap-3 mb-6 text-center z-10">
        <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shadow-xl shadow-black/40 p-2 group hover:scale-105 transition-transform duration-300">
          <img 
            src="/logo.png" 
            alt="Internverse Logo" 
            className="h-full w-auto object-contain" 
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-zinc-100 font-sans tracking-tight flex items-center justify-center gap-2">
            Internverse Registration
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-medium uppercase tracking-wider">
              Choose Role
            </span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Student &bull; Company Employer &bull; College Teacher / Faculty
          </p>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative z-10">
        
        {/* PANEL SELECTION TABS */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setActivePanel("STUDENT");
              setErrorMsg("");
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
              activePanel === "STUDENT"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <GraduationCap className={`h-4 w-4 mb-1 ${activePanel === "STUDENT" ? "text-black" : "text-cyan-400"}`} />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePanel("COMPANY");
              setErrorMsg("");
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
              activePanel === "COMPANY"
                ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <Building2 className={`h-4 w-4 mb-1 ${activePanel === "COMPANY" ? "text-black" : "text-emerald-400"}`} />
            <span>Company</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePanel("TEACHER");
              setErrorMsg("");
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
              activePanel === "TEACHER"
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <BookOpen className={`h-4 w-4 mb-1 ${activePanel === "TEACHER" ? "text-white" : "text-purple-400"}`} />
            <span>College Teacher</span>
          </button>
        </div>

        {/* Dynamic Header Note */}
        {activePanel === "STUDENT" && (
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 mb-6 flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Join as a Student Candidate</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Apply to verified internships, generate AI cover letters, and receive academic endorsements from your college faculty.
              </p>
            </div>
          </div>
        )}

        {activePanel === "COMPANY" && (
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 mb-6 flex items-start gap-3">
            <Building2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Join as an Employer / Company</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Post internships, review pre-endorsed university student resumes, and build your candidate hiring pipeline.
              </p>
            </div>
          </div>
        )}

        {activePanel === "TEACHER" && (
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 mb-6 flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Join as College Faculty / Placement Head</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Oversee student internship applications from your university, verify credentials, and write official faculty endorsements.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl border border-red-900/50 bg-red-950/30 text-red-400 text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                {activePanel === "STUDENT" ? "Student Full Name" : activePanel === "COMPANY" ? "Talent Lead / Contact" : "Faculty Name & Title"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-zinc-500" />
                </span>
                <input
                  type="text"
                  required
                  placeholder={activePanel === "STUDENT" ? "Aarav Sharma" : activePanel === "COMPANY" ? "Sarah Lin" : "Prof. Rajesh Verma"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                {activePanel === "STUDENT" ? "Student Email" : activePanel === "COMPANY" ? "Corporate Work Email" : "Institutional Email"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-500" />
                </span>
                <input
                  type="email"
                  required
                  placeholder={activePanel === "STUDENT" ? "student@university.edu" : activePanel === "COMPANY" ? "talent@company.com" : "faculty@university.edu"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Role Specific Fields */}
          {activePanel === "STUDENT" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  College / University Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. IIT Delhi, BITS Pilani, MIT"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Roll No / Student ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024CS104"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {activePanel === "COMPANY" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google LLC, Acme Tech"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500 text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Company Website
                </label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500 text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {activePanel === "TEACHER" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  College / University
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IIT Delhi"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Faculty Employee ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. FAC-IITD-8821"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Password (min. 6)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-500" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-500" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
            className={`w-full mt-3 py-3.5 font-bold rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed ${buttonGradient}`}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Register {activePanel === "STUDENT" ? "Student" : activePanel === "COMPANY" ? "Company" : "Teacher"} Account{" "}
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Footer link to login */}
        <p className="text-center text-xs text-zinc-500 font-semibold mt-6">
          Already registered?{" "}
          <Link 
            href={`/login?role=${activePanel}`} 
            className="font-bold text-cyan-400 hover:underline transition-colors"
          >
            Sign In to Your Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-foreground flex-col gap-4 font-sans">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
