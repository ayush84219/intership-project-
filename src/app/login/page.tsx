"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  Users
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  // Active panel: 'STUDENT' or 'RECRUITER'
  const [activePanel, setActivePanel] = useState<"STUDENT" | "RECRUITER">("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
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
        setErrorMsg(res.error || "Incorrect credentials");
        setLoading(false);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
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

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background glow graphics */}
      <div 
        className={`absolute top-1/4 left-1/4 w-96 h-96 blur-[130px] rounded-full pointer-events-none transition-all duration-700 ${
          activePanel === "STUDENT" ? "bg-cyan-500/15" : "bg-emerald-500/15"
        }`} 
      />
      <div 
        className={`absolute bottom-1/4 right-1/4 w-96 h-96 blur-[130px] rounded-full pointer-events-none transition-all duration-700 ${
          activePanel === "STUDENT" ? "bg-blue-600/15" : "bg-purple-600/15"
        }`} 
      />

      {/* Header / Brand */}
      <div className="flex flex-col items-center gap-3 mb-6 text-center z-10">
        <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shadow-xl shadow-black/40 p-2 group hover:scale-105 transition-transform duration-300">
          <img 
            src="/logo.png" 
            alt="Job Finder Logo" 
            className="h-full w-auto object-contain" 
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-zinc-100 font-sans tracking-tight flex items-center justify-center gap-2">
            Job Finder
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-medium uppercase tracking-wider">
              Portal v2.0
            </span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Dual-Mode Career Platform &bull; Select Your Gateway Panel
          </p>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-zinc-900/80 border border-zinc-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative z-10">
        
        {/* PANEL SELECTION TABS */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 mb-8">
          <button
            type="button"
            onClick={() => {
              setActivePanel("STUDENT");
              setErrorMsg("");
            }}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
              activePanel === "STUDENT"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <GraduationCap className={`h-4.5 w-4.5 ${activePanel === "STUDENT" ? "text-black" : "text-cyan-400"}`} />
            <div className="text-left leading-tight">
              <div>Student Panel</div>
              <div className={`text-[10px] font-normal ${activePanel === "STUDENT" ? "text-black/80" : "text-zinc-500"}`}>Get a Job</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePanel("RECRUITER");
              setErrorMsg("");
            }}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
              activePanel === "RECRUITER"
                ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <Building2 className={`h-4.5 w-4.5 ${activePanel === "RECRUITER" ? "text-black" : "text-emerald-400"}`} />
            <div className="text-left leading-tight">
              <div>Recruiter Panel</div>
              <div className={`text-[10px] font-normal ${activePanel === "RECRUITER" ? "text-black/80" : "text-zinc-500"}`}>Post & Hire</div>
            </div>
          </button>
        </div>

        {/* Dynamic Header Information based on Active Panel */}
        {activePanel === "STUDENT" ? (
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 mb-6 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-cyan-300">Student & Job Seeker Gateway</h2>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Discover live tech & business opportunities, auto-generate AI cover letters, and track applications in real-time.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 mb-6 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-300">Recruiter & Employer Gateway</h2>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Post job openings, review student candidates, access candidate resumes, and manage your hiring pipeline.
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              {activePanel === "STUDENT" ? "Student Email Address" : "Recruiter Work Email"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-zinc-500" />
              </span>
              <input
                type="email"
                required
                placeholder={activePanel === "STUDENT" ? "student@university.edu" : "recruiter@company.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Password
              </label>
              <Link href="/forgot-password" className="text-[10px] font-bold text-cyan-400 hover:underline transition-all">
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
                className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className={`w-full mt-3 py-3.5 text-black font-bold rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed ${
              activePanel === "STUDENT"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/10"
                : "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-emerald-500/10"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-black" /> Authenticating...
              </>
            ) : (
              <>
                {activePanel === "STUDENT" ? "Sign In as Student" : "Sign In as Recruiter"}{" "}
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Panel Features Checklist */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-2 gap-3 text-[11px] text-zinc-400 font-medium">
          {activePanel === "STUDENT" ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Search & Filter All Jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>1-Click AI Cover Letter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Track Application Status</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Course Presets (B.Tech, MBA)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Post Unlimited Job Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Review Student Applicants</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Direct Hire & Contact</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Manage Posted Openings</span>
              </div>
            </>
          )}
        </div>

        {/* Footer link to signup */}
        <p className="text-center text-xs text-zinc-500 font-semibold mt-6">
          Don&apos;t have an account yet?{" "}
          <Link 
            href={`/signup?role=${activePanel}`} 
            className={`font-bold hover:underline transition-colors ${
              activePanel === "STUDENT" ? "text-cyan-400" : "text-emerald-400"
            }`}
          >
            Create {activePanel === "STUDENT" ? "Student" : "Recruiter"} Account
          </Link>
        </p>
      </div>
    </div>
  );
}
