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
  Search
} from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const initialRole = searchParams.get("role") === "RECRUITER" ? "RECRUITER" : "STUDENT";
  const [activePanel, setActivePanel] = useState<"STUDENT" | "RECRUITER">(initialRole);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Update role if query param changes
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "RECRUITER" || roleParam === "STUDENT") {
      setActivePanel(roleParam);
    }
  }, [searchParams]);

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

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background glow graphics */}
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
              Registration
            </span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Create Your Account &bull; Select Your Operating Role
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
              <div>Student Account</div>
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
              <div>Recruiter Account</div>
              <div className={`text-[10px] font-normal ${activePanel === "RECRUITER" ? "text-black/80" : "text-zinc-500"}`}>Post Jobs & Hire</div>
            </div>
          </button>
        </div>

        {/* Header Information based on Panel */}
        {activePanel === "STUDENT" ? (
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 mb-6 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-cyan-300">Join as a Student Job Seeker</h2>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Build your profile, auto-match with internships, and apply directly to top recruiters and job boards.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 mb-6 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-300">Join as an Employer / Recruiter</h2>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Post job listings directly to our student base, review candidate applications, and hire talent efficiently.
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
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              {activePanel === "STUDENT" ? "Student Full Name" : "Recruiter / Company Name"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-zinc-500" />
              </span>
              <input
                type="text"
                required
                placeholder={activePanel === "STUDENT" ? "Alex Johnson" : "Jane Doe (Acme Corp)"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              {activePanel === "STUDENT" ? "Student Email Address" : "Company Work Email"}
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
            className={`w-full mt-3 py-3.5 text-black font-bold rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed ${
              activePanel === "STUDENT"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/10"
                : "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-emerald-500/10"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-black" /> Creating Account...
              </>
            ) : (
              <>
                Register {activePanel === "STUDENT" ? "Student" : "Recruiter"} Account{" "}
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
            className={`font-bold hover:underline transition-colors ${
              activePanel === "STUDENT" ? "text-cyan-400" : "text-emerald-400"
            }`}
          >
            Sign In to {activePanel === "STUDENT" ? "Student" : "Recruiter"} Panel
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
