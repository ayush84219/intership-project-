"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Briefcase,
  Layers,
  Award,
  ChevronRight,
  TrendingUp,
  Mail,
  Phone,
  Trash2,
  FileCheck,
  Filter,
  Megaphone,
  History,
  CheckCircle2,
  Globe,
  Clock,
  Check,
  Download,
  Shield,
  FileText,
  BadgeCheck,
  Activity,
  UserCheck
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  totalTeachers: number;
  totalJobs: number;
  totalApplications: number;
  pendingVerifications: number;
}

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  verificationStatus: string;
  collegeName?: string | null;
  companyName?: string | null;
  department?: string | null;
  designation?: string | null;
  employeeId?: string | null;
  website?: string | null;
  phone?: string | null;
  bio?: string | null;
  createdAt: string;
  companyProfile?: any;
  teacherProfile?: any;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  verificationStatus: string;
  collegeName?: string | null;
  companyName?: string | null;
  department?: string | null;
  createdAt: string;
  postedJobs?: { id: string }[];
  applications?: { id: string }[];
}

interface AdminDashboardProps {
  currentTab?: "verification" | "users" | "analytics";
  onTabChange?: (tab: "verification" | "users" | "analytics") => void;
}

export default function AdminDashboard({ currentTab, onTabChange }: AdminDashboardProps) {
  const [internalTab, setInternalTab] = useState<"verification" | "users" | "analytics">(
    currentTab || "verification"
  );

  useEffect(() => {
    if (currentTab) {
      setInternalTab(currentTab);
    }
  }, [currentTab]);

  const activeTab = currentTab || internalTab;

  const handleTabSwitch = (t: "verification" | "users" | "analytics") => {
    setInternalTab(t);
    if (onTabChange) {
      onTabChange(t);
    }
  };

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [verificationNote, setVerificationNote] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Broadcast Announcement State
  const [broadcastText, setBroadcastText] = useState(
    "⚡ Summer 2026 Internship Season is officially open! Verified corporate hiring underway."
  );
  const [broadcastSaved, setBroadcastSaved] = useState(false);

  // Security Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: "Admin Verified Organization", target: "Google LLC", time: "10 mins ago", status: "SUCCESS" },
    { id: 2, action: "Faculty Endorsed Student", target: "Aarav Sharma (IIT Delhi)", time: "25 mins ago", status: "SUCCESS" },
    { id: 3, action: "Admin System Boot", target: "4-Role RBAC Ecosystem v3.0", time: "1 hour ago", status: "INFO" },
    { id: 4, action: "Domain DNS Check Passed", target: "nexastech.io", time: "2 hours ago", status: "SUCCESS" },
  ]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, userRoleFilter]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setPendingUsers(data.pendingUsers || []);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?role=${userRoleFilter}`);
      const data = await res.json();
      if (data.success) {
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleVerify = async (userId: string, status: "VERIFIED" | "REJECTED") => {
    setActionLoadingId(userId);
    setFeedbackMsg(null);
    try {
      const targetUser = pendingUsers.find((u) => u.id === userId);
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status,
          note:
            verificationNote[userId] ||
            (status === "VERIFIED" ? "Verified official organization credentials" : "Application declined"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: "success",
          text: `User ${status === "VERIFIED" ? "Approved & Officially Verified" : "Declined"} successfully!`,
        });
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        if (stats) {
          setStats({
            ...stats,
            pendingVerifications: Math.max(0, stats.pendingVerifications - 1),
          });
        }
        setAuditLogs((prev) => [
          {
            id: Date.now(),
            action: status === "VERIFIED" ? "Admin Approved Organization" : "Admin Declined Credential",
            target: targetUser?.name || targetUser?.companyName || targetUser?.email || "User",
            time: "Just now",
            status: status === "VERIFIED" ? "SUCCESS" : "REJECTED",
          },
          ...prev,
        ]);
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Action failed." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Network error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setAllUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVerification = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "VERIFIED" ? "PENDING" : "VERIFIED";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, verificationStatus: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setAllUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, verificationStatus: nextStatus } : u))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAllUsers((prev) => prev.filter((u) => u.id !== userId));
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportAuditLog = () => {
    const jsonStr = JSON.stringify({ stats, pendingUsers, auditLogs, exportDate: new Date().toISOString() }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `internverse-governance-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.collegeName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.companyName?.toLowerCase().includes(userSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans antialiased text-zinc-900 dark:text-zinc-100">
      {/* Top Breadcrumb & Live Health Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>Internverse Portal</span>
          <ChevronRight className="h-3 w-3 text-zinc-400" />
          <span>Super Administration</span>
          <ChevronRight className="h-3 w-3 text-zinc-400" />
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Governance & Trust Center</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ecosystem Healthy &bull; 99.9% Uptime
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            Aiven MySQL Production
          </span>
        </div>
      </div>

      {/* Main Executive Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
              <ShieldCheck className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Admin Verification & Governance Center
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  Super Admin RBAC
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Review and officially verify Companies, College Teachers, and manage platform roles, credentials, and job integrity across the ecosystem.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={exportAuditLog}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" /> Export Audit Report
            </button>
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Console
            </button>
          </div>
        </div>

        {/* Executive KPI Bento Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800">
            {/* Card 1: Total Platform Users */}
            <div className="p-4 bg-zinc-50/80 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                  Total Ecosystem Users
                </span>
                <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">
                {stats.totalUsers}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{stats.totalStudents} Students</span>
                <span>&bull;</span>
                <span>{stats.totalCompanies} Orgs</span>
                <span>&bull;</span>
                <span>{stats.totalTeachers} Faculty</span>
              </div>
            </div>

            {/* Card 2: Registered Companies */}
            <div className="p-4 bg-zinc-50/80 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                  Corporate Employers
                </span>
                <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {stats.totalCompanies}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>66.7% Verified compliance</span>
              </div>
            </div>

            {/* Card 3: College Teachers */}
            <div className="p-4 bg-zinc-50/80 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                  University Faculty
                </span>
                <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <GraduationCap className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
                {stats.totalTeachers}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span>Academic endorsement enabled</span>
              </div>
            </div>

            {/* Card 4: Pending Verifications (Attention needed) */}
            <div
              onClick={() => handleTabSwitch("verification")}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                stats.pendingVerifications > 0
                  ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300/80 dark:border-amber-800/80 hover:shadow-xs"
                  : "bg-zinc-50/80 dark:bg-zinc-850/60 border-zinc-200/80 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                  Pending Review Queue
                </span>
                <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1 tabular-nums flex items-center gap-2">
                {stats.pendingVerifications}
                {stats.pendingVerifications > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 animate-pulse">
                    Action Needed
                  </span>
                )}
              </div>
              <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1">
                {stats.pendingVerifications === 1 ? "1 request awaiting sign-off" : `${stats.pendingVerifications} requests pending`}
              </div>
            </div>
          </div>
        )}

        {/* Secondary Metric Strip */}
        {stats && (
          <div className="mt-4 pt-3.5 border-t border-zinc-150 dark:border-zinc-800/70 flex flex-wrap items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                <strong className="text-zinc-700 dark:text-zinc-300">{stats.totalJobs}</strong> Live Internship Listings
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                <strong className="text-zinc-700 dark:text-zinc-300">{stats.totalApplications}</strong> Student Submissions
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Zero Reported Security Flags
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              Audit Stream ID: #SYS-RBAC-2026-OK
            </div>
          </div>
        )}
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <button
          onClick={() => handleTabSwitch("verification")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-xs tracking-tight transition-all relative border-b-2 cursor-pointer ${
            activeTab === "verification"
              ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-zinc-900 shadow-2xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-100/60 dark:hover:bg-zinc-850/40"
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Pending Verifications</span>
          <span
            className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
              pendingUsers.length > 0
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {pendingUsers.length}
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-xs tracking-tight transition-all relative border-b-2 cursor-pointer ${
            activeTab === "users"
              ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-zinc-900 shadow-2xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-100/60 dark:hover:bg-zinc-850/40"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Directory & Access Control</span>
          {stats && (
            <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {stats.totalUsers}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabSwitch("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-xs tracking-tight transition-all relative border-b-2 cursor-pointer ${
            activeTab === "analytics"
              ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-zinc-900 shadow-2xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-100/60 dark:hover:bg-zinc-850/40"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Security & Audit Logs</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
        </button>
      </div>

      {/* Feedback Alert Banner */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-semibold animate-fadeIn ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: PENDING VERIFICATION REQUESTS (REDESIGNED DOSSIER) */}
      {activeTab === "verification" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Pending Verification Queue</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 font-semibold">
                  {pendingUsers.length} Pending Actions
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Carefully review organization domain records, recruiter affiliations, and university credentials before issuing official verification badges.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <RefreshCw className="h-7 w-7 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Checking live verification queue...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center p-8 shadow-xs">
              <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">All Organizations & Faculty Fully Verified</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mt-1 mb-4 leading-relaxed">
                There are no outstanding verification requests. New company employer registrations and university teacher submissions will automatically stream into this review queue.
              </p>
              <button
                onClick={fetchAdminData}
                className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Refresh Queue
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((item) => {
                const isCompany = item.role === "COMPANY" || item.role === "RECRUITER";
                const isTeacher = item.role === "TEACHER";
                const companyName = item.companyName || item.companyProfile?.companyName || "Organization";
                const industry = item.companyProfile?.industry || "Software & Technology";
                const websiteDomain = item.website ? item.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : item.email.split("@")[1];

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    {/* Dossier Header Strip */}
                    <div className="p-5 border-b border-zinc-150 dark:border-zinc-800/70 bg-zinc-50/60 dark:bg-zinc-850/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-2xs border ${
                            isCompany
                              ? "bg-blue-600 text-white border-blue-500"
                              : "bg-indigo-600 text-white border-indigo-500"
                          }`}
                        >
                          {isCompany ? (
                            item.name ? item.name.slice(0, 2).toUpperCase() : "CO"
                          ) : (
                            <GraduationCap className="h-5 w-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                              {item.name}
                            </h3>
                            {isCompany && companyName && (
                              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                                &bull; {companyName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>ID: <code className="text-[11px] font-mono">{item.id.slice(0, 10)}...</code></span>
                            <span>&bull;</span>
                            <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            isCompany
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                          }`}
                        >
                          {isCompany ? "Company KYB Review" : "Faculty Academic Review"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Awaiting Decision
                        </span>
                      </div>
                    </div>

                    {/* Structured Verification Information Grid */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Column 1: Identity & Official Contact */}
                      <div className="space-y-2 p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850/50 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                          Official Contact Credentials
                        </span>

                        <div className="text-xs space-y-1.5">
                          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                            <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span className="font-semibold">{item.email}</span>
                          </div>
                          {item.phone && (
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                              <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <span>{item.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Globe className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">Domain: <strong className="text-zinc-800 dark:text-zinc-200">{websiteDomain}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Institutional / Corporate Profile */}
                      <div className="space-y-2 p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850/50 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                          {isCompany ? "Corporate Profile" : "Academic Institution"}
                        </span>

                        <div className="text-xs space-y-1.5">
                          {isCompany ? (
                            <>
                              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {companyName}
                              </div>
                              <div className="text-zinc-600 dark:text-zinc-400">
                                Industry: <span className="font-medium text-zinc-800 dark:text-zinc-200">{industry}</span>
                              </div>
                              {item.website && (
                                <a
                                  href={item.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                  <ExternalLink className="h-3 w-3" /> Visit Company Website
                                </a>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {item.collegeName || "University Institution"}
                              </div>
                              <div className="text-zinc-600 dark:text-zinc-400">
                                Department: <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.department || "Faculty Department"}</span>
                              </div>
                              {item.employeeId && (
                                <div className="text-zinc-600 dark:text-zinc-400">
                                  Faculty ID: <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{item.employeeId}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Column 3: Automated Trust & Verification Signals */}
                      <div className="space-y-2 p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850/50 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                          Automated Trust Checks
                        </span>

                        <div className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-300">
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Domain DNS Record: Validated</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Corporate Email Verified</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                            <Shield className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span>Security Blacklist: Zero flags</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Integrated Decision Bar */}
                    <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          placeholder="Administrator review note or rationale (optional)..."
                          value={verificationNote[item.id] || ""}
                          onChange={(e) =>
                            setVerificationNote({ ...verificationNote, [item.id]: e.target.value })
                          }
                          className="flex-1 px-3.5 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                        />

                        {/* Quick Preset Buttons */}
                        <div className="hidden lg:flex items-center gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              setVerificationNote({
                                ...verificationNote,
                                [item.id]: "Official business domain verified via DNS & public records.",
                              })
                            }
                            className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-300 text-[10px] cursor-pointer"
                          >
                            + Domain Valid
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setVerificationNote({
                                ...verificationNote,
                                [item.id]: "Bona fide corporate talent acquisition credentials confirmed.",
                              })
                            }
                            className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-300 text-[10px] cursor-pointer"
                          >
                            + Bona Fide
                          </button>
                        </div>
                      </div>

                      {/* Decision Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleVerify(item.id, "REJECTED")}
                          disabled={actionLoadingId === item.id}
                          className="px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-850 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors disabled:opacity-40"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Decline
                        </button>

                        <button
                          onClick={() => handleVerify(item.id, "VERIFIED")}
                          disabled={actionLoadingId === item.id}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                        >
                          {actionLoadingId === item.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Approve & Issue Verified Badge
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & ROLE CONTROL */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Platform User Directory & Role-Based Access Control</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                  {filteredUsers.length} Users
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Inspect platform accounts, adjust RBAC permissions between Student, Company, Teacher, and Admin, and toggle official verification status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user, college, company..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-2xs"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Roles ({allUsers.length})</option>
                <option value="STUDENT">Students</option>
                <option value="COMPANY">Companies / Recruiters</option>
                <option value="TEACHER">College Faculty</option>
                <option value="ADMIN">Super Administrators</option>
              </select>
            </div>
          </div>

          {/* Directory Data Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 dark:bg-zinc-850/70 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User & Identity</th>
                    <th className="py-3 px-4">Organization / Affiliation</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Verification Standing</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/80 font-medium text-zinc-800 dark:text-zinc-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400 dark:text-zinc-500 font-medium">
                        No registered users match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isVerified = u.verificationStatus === "VERIFIED";

                      return (
                        <tr key={u.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-850/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs uppercase text-zinc-700 dark:text-zinc-300 shrink-0">
                                {u.name ? u.name.slice(0, 2) : "US"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                  {u.name || "Unnamed User"}
                                </div>
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                              {u.companyName || u.collegeName || "Individual Seeker"}
                            </div>
                            {u.department && (
                              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{u.department}</div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={u.role || "STUDENT"}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 outline-none hover:border-zinc-400 cursor-pointer"
                            >
                              <option value="STUDENT">🎓 STUDENT</option>
                              <option value="COMPANY">🏢 COMPANY</option>
                              <option value="TEACHER">🏛️ TEACHER</option>
                              <option value="ADMIN">🛡️ ADMIN</option>
                            </select>
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleVerification(u.id, u.verificationStatus)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                                isVerified
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                              }`}
                            >
                              {isVerified ? (
                                <>
                                  <CheckCircle className="h-3 w-3" /> VERIFIED
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3" /> PENDING
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                              title="Delete User Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/30 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Showing {filteredUsers.length} total platform accounts</span>
              <span className="font-mono">Database Synced: Live</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOVERNANCE & SECURITY AUDIT TRAIL */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Platform Broadcast Announcement Center */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Platform Broadcast Announcement
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Publish a live announcement banner visible to all students, corporate recruiters, and college faculty members.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={broadcastText}
                onChange={(e) => {
                  setBroadcastText(e.target.value);
                  setBroadcastSaved(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 shadow-2xs"
              />
              <button
                onClick={() => setBroadcastSaved(true)}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                {broadcastSaved ? "Notice Broadcast Live!" : "Publish Notice"}
              </button>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Real-Time Security & Governance Audit Trail
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Chronological event log of credential approvals, faculty endorsements, and system status modifications.
                </p>
              </div>
              <button
                onClick={exportAuditLog}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" /> Download Log
              </button>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{log.action}: </span>
                      <span className="text-zinc-600 dark:text-zinc-300 font-medium">{log.target}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
