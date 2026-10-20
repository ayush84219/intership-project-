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
  CheckCircle2
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"verification" | "users" | "analytics">("verification");
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
  const [broadcastText, setBroadcastText] = useState("⚡ Summer 2026 Internship Season is officially open! Verified corporate hiring underway.");
  const [broadcastSaved, setBroadcastSaved] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: "Admin Verified Organization", target: "Google LLC", time: "10 mins ago", status: "SUCCESS" },
    { id: 2, action: "Faculty Endorsed Student", target: "Aarav Sharma (IIT Delhi)", time: "25 mins ago", status: "SUCCESS" },
    { id: 3, action: "Admin System Boot", target: "4-Role RBAC Ecosystem v3.0", time: "1 hour ago", status: "INFO" },
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
      const targetUser = pendingUsers.find(u => u.id === userId);
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status,
          note: verificationNote[userId] || (status === "VERIFIED" ? "Verified by Administrator" : "Application declined"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: "success",
          text: `User ${status === "VERIFIED" ? "Approved & Verified" : "Rejected"} successfully!`,
        });
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        if (stats) {
          setStats({
            ...stats,
            pendingVerifications: Math.max(0, stats.pendingVerifications - 1),
          });
        }
        // Add to audit log
        setAuditLogs((prev) => [
          {
            id: Date.now(),
            action: status === "VERIFIED" ? "Admin Approved Credential" : "Admin Declined Credential",
            target: targetUser?.name || targetUser?.email || "User",
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

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.collegeName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.companyName?.toLowerCase().includes(userSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-zinc-900 to-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/30 shrink-0">
              <ShieldCheck className="h-8 w-8 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Admin Verification & Governance Center
                </h1>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-black shadow-md shadow-amber-500/20">
                  ADMIN MASTER
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-medium mt-1.5 max-w-2xl leading-relaxed">
                Review and officially verify Companies, College Teachers, and manage platform roles, credentials, and job integrity across the ecosystem.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all border border-zinc-700 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Console
            </button>
          </div>
        </div>

        {/* Global KPI Metrics */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-6 border-t border-zinc-800">
            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Users</div>
              <div className="text-xl font-black text-white mt-0.5">{stats.totalUsers}</div>
            </div>
            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Students</div>
              <div className="text-xl font-black text-cyan-300 mt-0.5">{stats.totalStudents}</div>
            </div>
            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Companies</div>
              <div className="text-xl font-black text-emerald-300 mt-0.5">{stats.totalCompanies}</div>
            </div>
            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Teachers</div>
              <div className="text-xl font-black text-purple-300 mt-0.5">{stats.totalTeachers}</div>
            </div>
            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Job Posts</div>
              <div className="text-xl font-black text-blue-300 mt-0.5">{stats.totalJobs}</div>
            </div>
            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Applications</div>
              <div className="text-xl font-black text-teal-300 mt-0.5">{stats.totalApplications}</div>
            </div>
            <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Pending Review</div>
              <div className="text-xl font-black text-amber-300 mt-0.5">{stats.pendingVerifications}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab("verification")}
          className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative ${
            activeTab === "verification"
              ? "text-amber-400 border-b-2 border-amber-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileCheck className="h-4 w-4" />
          Pending Verifications ({pendingUsers.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative ${
            activeTab === "users"
              ? "text-amber-400 border-b-2 border-amber-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Users className="h-4 w-4" />
          All User Directory & Roles
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative ${
            activeTab === "analytics"
              ? "text-amber-400 border-b-2 border-amber-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Governance & Audit Logs
        </button>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border border-red-500/40 text-red-300"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* TAB 1: PENDING VERIFICATIONS */}
      {activeTab === "verification" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">
                Pending Verification Requests ({pendingUsers.length})
              </h2>
              <p className="text-xs text-zinc-300 mt-0.5">
                Carefully verify organization domains, faculty IDs, and business affiliations before granting verified status.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/60 rounded-3xl border border-zinc-800">
              <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mb-3" />
              <p className="text-xs text-zinc-300 font-semibold">Loading verification pipeline...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 text-center p-6">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">All Clear! No Pending Requests</h3>
              <p className="text-xs text-zinc-400 max-w-md mt-1">
                All companies and college teachers are fully verified. New registration requests will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingUsers.map((item) => {
                const isCompany = item.role === "COMPANY" || item.role === "RECRUITER";
                const isTeacher = item.role === "TEACHER";

                return (
                  <div
                    key={item.id}
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 transition-all shadow-xl"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Organization & Identity Details */}
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            isCompany
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}
                        >
                          {isCompany ? <Building2 className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-white">{item.name}</h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isCompany
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              }`}
                            >
                              {isCompany ? "Company Application" : "College Teacher Application"}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                              Pending Review
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
                            <span className="flex items-center gap-1 text-zinc-400">
                              <Mail className="h-3.5 w-3.5 text-zinc-500" /> {item.email}
                            </span>
                            {item.phone && (
                              <span className="flex items-center gap-1 text-zinc-400">
                                <Phone className="h-3.5 w-3.5 text-zinc-500" /> {item.phone}
                              </span>
                            )}
                            {item.website && (
                              <a
                                href={item.website}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-cyan-400 hover:underline"
                              >
                                <ExternalLink className="h-3.5 w-3.5" /> {item.website}
                              </a>
                            )}
                          </div>

                          {/* Role Specific Meta */}
                          {isCompany && (
                            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                              <div className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-semibold">
                                <span className="text-zinc-500">Company:</span> {item.companyName || item.companyProfile?.companyName || "N/A"}
                              </div>
                              {item.companyProfile?.industry && (
                                <div className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-semibold">
                                  <span className="text-zinc-500">Industry:</span> {item.companyProfile.industry}
                                </div>
                              )}
                            </div>
                          )}

                          {isTeacher && (
                            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                              <div className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-semibold">
                                <span className="text-zinc-500">Institution:</span> {item.collegeName || item.teacherProfile?.collegeName || "N/A"}
                              </div>
                              <div className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-semibold">
                                <span className="text-zinc-500">Dept:</span> {item.department || item.teacherProfile?.department || "N/A"}
                              </div>
                              {item.employeeId && (
                                <div className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-semibold">
                                  <span className="text-zinc-500">Faculty ID:</span> {item.employeeId}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                        <input
                          type="text"
                          placeholder="Verification note / reason"
                          value={verificationNote[item.id] || ""}
                          onChange={(e) =>
                            setVerificationNote({ ...verificationNote, [item.id]: e.target.value })
                          }
                          className="w-full sm:w-56 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 outline-none focus:border-amber-400 placeholder:text-zinc-600"
                        />

                        <button
                          onClick={() => handleVerify(item.id, "VERIFIED")}
                          disabled={actionLoadingId === item.id}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-40"
                        >
                          {actionLoadingId === item.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                          )}
                          Verify & Approve
                        </button>

                        <button
                          onClick={() => handleVerify(item.id, "REJECTED")}
                          disabled={actionLoadingId === item.id}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-red-950 hover:text-red-300 border border-zinc-700 hover:border-red-800 text-zinc-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                          Reject
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

      {/* TAB 2: ALL USER DIRECTORY & ROLES */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Platform User Directory & Role Control</h2>
              <p className="text-xs text-zinc-300 mt-0.5">
                Switch user permissions between Student, Company, Teacher, and Admin on demand.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user, college, company..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-amber-400 placeholder:text-zinc-600"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="COMPANY">Companies / Recruiters</option>
                <option value="TEACHER">College Teachers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-300 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">User / Name</th>
                    <th className="py-3.5 px-4">Organization / Affiliation</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 font-medium text-zinc-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400 font-semibold">
                        No users match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isVerified = u.verificationStatus === "VERIFIED";

                      return (
                        <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{u.name || "Unnamed User"}</div>
                            <div className="text-[11px] text-zinc-400">{u.email}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-zinc-200 font-medium">
                              {u.companyName || u.collegeName || "—"}
                            </div>
                            {u.department && (
                              <div className="text-[10px] text-zinc-400">{u.department}</div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={u.role || "STUDENT"}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-bold text-zinc-200 outline-none hover:border-zinc-700 cursor-pointer"
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
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                                isVerified
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
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
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                              title="Delete User"
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
          </div>
        </div>
      )}

      {/* TAB 3: GOVERNANCE & AUDIT LOGS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Platform Broadcast Announcement Center */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-400" />
              Platform Broadcast Announcement
            </h3>
            <p className="text-xs text-zinc-300 mb-4">
              Publish a live announcement banner visible to all students, companies, and teachers.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={broadcastText}
                onChange={(e) => {
                  setBroadcastText(e.target.value);
                  setBroadcastSaved(false);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-amber-400"
              />
              <button
                onClick={() => setBroadcastSaved(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                {broadcastSaved ? "Broadcast Live!" : "Publish Notice"}
              </button>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <History className="h-5 w-5 text-cyan-400" />
              Real-Time Security & Governance Audit Trail
            </h3>
            <p className="text-xs text-zinc-300 mb-4">
              Log of credential approvals, faculty endorsements, and system status changes.
            </p>

            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <span className="font-bold text-white">{log.action}: </span>
                      <span className="text-zinc-300">{log.target}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
