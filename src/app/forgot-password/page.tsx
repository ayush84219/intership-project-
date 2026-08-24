"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Recovery stages: "request" | "reset" | "success"
  const [stage, setStage] = useState<"request" | "reset" | "success">("request");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Simulated email notification
  const [mockEmail, setMockEmail] = useState<{ show: boolean; code: string }>({
    show: false,
    code: "",
  });

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to request code.");
      }

      // Display the mock notification containing the generated code
      setMockEmail({ show: true, code: data.code });
      setStage("reset");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !newPassword.trim()) return;

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setStage("success");
      setMockEmail({ show: false, code: "" });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Simulated Email Box Toast Overlay */}
      {mockEmail.show && (
        <div className="fixed top-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-cyan-500/30 rounded-2xl p-5 shadow-[0_10px_30px_rgba(6,182,212,0.15)] z-50 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Simulated Mail Server</span>
          </div>
          <h4 className="text-xs font-bold text-zinc-150">To: {email}</h4>
          <p className="text-xs text-zinc-300 font-semibold mt-2.5 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono">
            Subject: Reset Password OTP Code<br />
            Your recovery verification code is: <span className="text-cyan-400 font-bold text-sm tracking-widest">{mockEmail.code}</span>
          </p>
          <p className="text-[9px] text-zinc-500 mt-2 font-medium">This toast simulates a server SMTP email dispatch for development.</p>
        </div>
      )}

      <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-3xl p-10 shadow-[0_4px_30px_rgba(0,0,0,0.4)] relative z-10 animate-fade-in">
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="h-20 w-20 rounded-full bg-white border border-zinc-800/80 overflow-hidden flex items-center justify-center shadow-lg shadow-black/25 shrink-0">
            <img 
              src="/logo.png" 
              alt="Job Finder Logo" 
              className="h-24 w-auto object-cover object-top scale-[1.5] translate-y-[3px]" 
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 font-sans tracking-tight">Job Finder</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Account Recovery &bull; Secure Portal</p>
          </div>
        </div>

        {stage === "request" && (
          <>
            <h2 className="text-xl font-bold text-zinc-150 tracking-tight">Forgot Password?</h2>
            <p className="text-xs text-zinc-450 mt-1.5 font-semibold">Enter your email address and we&apos;ll dispatch a 6-digit recovery code.</p>

            {errorMsg && (
              <div className="mt-5 p-3 rounded-xl border border-red-950 bg-red-950/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestCode} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-500" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-black" /> Requesting...
                  </>
                ) : (
                  <>
                    Request Recovery Code <Sparkles className="h-4.5 w-4.5 fill-black" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {stage === "reset" && (
          <>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Set New Password</h2>
            <p className="text-xs text-zinc-400 mt-1.5 font-semibold">Enter the 6-digit recovery code and configure a new password.</p>

            {errorMsg && (
              <div className="mt-5 p-3 rounded-xl border border-red-950 bg-red-950/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  6-Digit Recovery Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold text-center tracking-widest font-mono"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-500" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Confirm Password */}
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
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !code.trim() || !newPassword.trim() || !confirmPassword.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-black" /> Resetting...
                  </>
                ) : (
                  <>
                    Update Password <CheckCircle2 className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {stage === "success" && (
          <div className="text-center py-6 animate-scale-in">
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Reset Successful!</h2>
            <p className="text-xs text-zinc-400 mt-2 font-semibold">Your password has been successfully updated in the database.</p>
            <button
              onClick={() => router.push("/login")}
              className="w-full mt-8 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-xs uppercase tracking-wider"
            >
              Sign In Now
            </button>
          </div>
        )}

        {stage !== "success" && (
          <p className="text-center text-xs text-zinc-500 font-semibold mt-8">
            <Link href="/login" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
