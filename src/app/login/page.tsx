"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Lock, 
  Mail, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  CheckCircle2,
  ArrowRight,
  Search,
  Zap,
  UserCheck,
  ShieldCheck,
  BookOpen
} from "lucide-react";

type RoleType = "STUDENT" | "COMPANY" | "TEACHER" | "ADMIN";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const queryRole = searchParams?.get("role")?.toUpperCase();
  let defaultRole: RoleType = "STUDENT";
  if (queryRole === "COMPANY" || queryRole === "RECRUITER") defaultRole = "COMPANY";
  else if (queryRole === "TEACHER") defaultRole = "TEACHER";
  else if (queryRole === "ADMIN") defaultRole = "ADMIN";

  const [activePanel, setActivePanel] = useState<RoleType>(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync role if query string changes
  useEffect(() => {
    if (queryRole === "COMPANY" || queryRole === "RECRUITER") {
      setActivePanel("COMPANY");
    } else if (queryRole === "TEACHER") {
      setActivePanel("TEACHER");
    } else if (queryRole === "ADMIN") {
      setActivePanel("ADMIN");
    } else if (queryRole === "STUDENT") {
      setActivePanel("STUDENT");
    }
  }, [queryRole]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/?searching=true");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg(res.error || "Incorrect email or password");
        setLoading(false);
      } else {
        router.push("/?searching=true");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Authentication service unavailable. Please check your network.");
      setLoading(false);
    }
  };

  const handleDemoFill = (role: RoleType) => {
    setActivePanel(role);
    setErrorMsg("");
    if (role === "STUDENT") {
      setEmail("student@university.edu");
      setPassword("student123");
    } else if (role === "COMPANY") {
      setEmail("company@google.com");
      setPassword("company123");
    } else if (role === "TEACHER") {
      setEmail("teacher@university.edu");
      setPassword("teacher123");
    } else if (role === "ADMIN") {
      setEmail("admin@internverse.com");
      setPassword("admin123");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-foreground flex-col gap-4 font-sans transition-colors duration-300">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        <span className="text-sm font-semibold tracking-wider text-zinc-400 animate-pulse">
          Validating active portal session...
        </span>
      </div>
    );
  }

  // Active theme classes based on role
  const glowTopColor =
    activePanel === "STUDENT"
      ? "bg-cyan-500/15"
      : activePanel === "COMPANY"
      ? "bg-emerald-500/15"
      : activePanel === "TEACHER"
      ? "bg-purple-500/15"
      : "bg-amber-500/15";

  const glowBottomColor =
    activePanel === "STUDENT"
      ? "bg-blue-600/15"
      : activePanel === "COMPANY"
      ? "bg-teal-600/15"
      : activePanel === "TEACHER"
      ? "bg-indigo-600/15"
      : "bg-orange-600/15";

  const buttonGradient =
    activePanel === "STUDENT"
      ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/20"
      : activePanel === "COMPANY"
      ? "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-emerald-500/20"
      : activePanel === "TEACHER"
      ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/20"
      : "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-amber-500/20";

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Glow Graphics */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 blur-[140px] rounded-full pointer-events-none transition-all duration-700 ${glowTopColor}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 blur-[140px] rounded-full pointer-events-none transition-all duration-700 ${glowBottomColor}`} />

      {/* Header / Branding */}
      <div className="flex flex-col items-center gap-3 mb-6 text-center z-10">
        <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shadow-2xl shadow-black p-2 group hover:scale-105 transition-transform duration-300">
          <img 
            src="/logo.png" 
            alt="Internverse Logo" 
            className="h-full w-auto object-contain" 
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-zinc-100 font-sans tracking-tight flex items-center justify-center gap-2">
            Internverse Portal
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-800/90 border border-zinc-700 text-zinc-300 font-semibold uppercase tracking-wider">
              4-Role RBAC v3.0
            </span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Student &bull; Company Profile &bull; College Teacher &bull; Admin Verification
          </p>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.7)] relative z-10">
        
        {/* 4 ROLE SELECTION TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-zinc-950/90 rounded-2xl border border-zinc-800/80 mb-6">
          {/* 1. Student */}
          <button
            type="button"
            onClick={() => {
              setActivePanel("STUDENT");
              setErrorMsg("");
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activePanel === "STUDENT"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <GraduationCap className={`h-4 w-4 mb-1 ${activePanel === "STUDENT" ? "text-zinc-950" : "text-cyan-400"}`} />
            <span className="text-[11px] leading-none">Student</span>
            <span className={`text-[9px] font-normal mt-0.5 ${activePanel === "STUDENT" ? "text-zinc-950/80" : "text-zinc-500"}`}>Seeker</span>
          </button>

          {/* 2. Company */}
          <button
            type="button"
            onClick={() => {
              setActivePanel("COMPANY");
              setErrorMsg("");
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activePanel === "COMPANY"
                ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/20 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <Building2 className={`h-4 w-4 mb-1 ${activePanel === "COMPANY" ? "text-zinc-950" : "text-emerald-400"}`} />
            <span className="text-[11px] leading-none">Company</span>
            <span className={`text-[9px] font-normal mt-0.5 ${activePanel === "COMPANY" ? "text-zinc-950/80" : "text-zinc-500"}`}>Recruiter</span>
          </button>

          {/* 3. College Teacher */}
          <button
            type="button"
            onClick={() => {
              setActivePanel("TEACHER");
              setErrorMsg("");
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activePanel === "TEACHER"
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <BookOpen className={`h-4 w-4 mb-1 ${activePanel === "TEACHER" ? "text-white" : "text-purple-400"}`} />
            <span className="text-[11px] leading-none">Teacher</span>
            <span className={`text-[9px] font-normal mt-0.5 ${activePanel === "TEACHER" ? "text-white/80" : "text-zinc-500"}`}>College Faculty</span>
          </button>

          {/* 4. Admin */}
          <button
            type="button"
            onClick={() => {
              setActivePanel("ADMIN");
              setErrorMsg("");
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activePanel === "ADMIN"
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 shadow-md shadow-amber-500/20 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <ShieldCheck className={`h-4 w-4 mb-1 ${activePanel === "ADMIN" ? "text-zinc-950" : "text-amber-400"}`} />
            <span className="text-[11px] leading-none">Admin</span>
            <span className={`text-[9px] font-normal mt-0.5 ${activePanel === "ADMIN" ? "text-zinc-950/80" : "text-zinc-500"}`}>Verification</span>
          </button>
        </div>

        {/* Dynamic Role Info Header */}
        {activePanel === "STUDENT" && (
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 mb-6 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Student Candidate Portal</h2>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                Search internships, auto-generate AI cover letters, track application stages, and showcase teacher endorsements.
              </p>
            </div>
          </div>
        )}

        {activePanel === "COMPANY" && (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 mb-6 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Company Profile & Employer Hub</h2>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                Post internships, review student candidate resumes, inspect faculty academic endorsements, and advance candidates.
              </p>
            </div>
          </div>
        )}

        {activePanel === "TEACHER" && (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 mb-6 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-purple-300 uppercase tracking-wider">College Teacher & Placement Suite</h2>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                View your college student roster, grant official academic endorsements and ratings, and monitor placement outcomes.
              </p>
            </div>
          </div>
        )}

        {activePanel === "ADMIN" && (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 mb-6 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Super Admin Verification Hub</h2>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                Officially verify pending Company registrations, approve College Teacher credentials, manage roles, and govern the ecosystem.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl border border-red-900/60 bg-red-950/40 text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              {activePanel === "STUDENT"
                ? "Student Email Address"
                : activePanel === "COMPANY"
                ? "Company / Recruiter Email"
                : activePanel === "TEACHER"
                ? "College Faculty Official Email"
                : "Super Admin Email"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-zinc-500" />
              </span>
              <input
                type="email"
                required
                placeholder={
                  activePanel === "STUDENT"
                    ? "student@university.edu"
                    : activePanel === "COMPANY"
                    ? "company@google.com"
                    : activePanel === "TEACHER"
                    ? "teacher@university.edu"
                    : "admin@internverse.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-100 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Password
              </label>
              <Link href="/forgot-password" className="text-[10px] font-bold text-zinc-400 hover:underline transition-all">
                Forgot Password?
              </Link>
            </div>
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
                className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-100 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className={`w-full mt-3 py-3.5 text-zinc-950 font-bold rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed ${buttonGradient}`}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-zinc-950" /> Authenticating Role...
              </>
            ) : (
              <>
                Sign In to {activePanel === "STUDENT" ? "Student Portal" : activePanel === "COMPANY" ? "Company Hub" : activePanel === "TEACHER" ? "Faculty Suite" : "Admin Console"}{" "}
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* 1-CLICK DEMO CREDENTIAL FAST FILL FOR ALL 4 ROLES */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-zinc-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> 1-Click Role Demo Logins:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("STUDENT")}
              className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500/40 text-[11px] font-bold text-cyan-400 hover:bg-zinc-800/60 transition-all flex flex-col items-center gap-1 text-center"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Aarav (Student)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill("COMPANY")}
              className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 text-[11px] font-bold text-emerald-400 hover:bg-zinc-800/60 transition-all flex flex-col items-center gap-1 text-center"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Google (Company)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill("TEACHER")}
              className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/40 text-[11px] font-bold text-purple-400 hover:bg-zinc-800/60 transition-all flex flex-col items-center gap-1 text-center"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Prof. Verma (Teacher)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill("ADMIN")}
              className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-[11px] font-bold text-amber-400 hover:bg-zinc-800/60 transition-all flex flex-col items-center gap-1 text-center"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Super Admin</span>
            </button>
          </div>
        </div>

        {/* Footer link to signup */}
        <p className="text-center text-xs text-zinc-500 font-semibold mt-6">
          Don&apos;t have an account yet?{" "}
          <Link 
            href={`/signup?role=${activePanel}`} 
            className="font-bold text-cyan-400 hover:underline transition-colors"
          >
            Create New Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-foreground flex-col gap-4 font-sans">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        <span className="text-xs text-zinc-500 font-medium">Loading Portal...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
