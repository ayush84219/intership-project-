import React from "react";
import { 
  Briefcase, 
  User, 
  CheckSquare, 
  Award, 
  Sun, 
  Moon, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Layers
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: {
    name: string;
    email: string;
    role?: string;
    verificationStatus?: string;
    collegeName?: string | null;
    companyName?: string | null;
    department?: string | null;
    profile?: {
      degree: string;
    } | null;
  } | null;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onOpenPostJobModal?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  theme,
  toggleTheme,
  onOpenPostJobModal,
}: SidebarProps) {
  const role = user?.role || "STUDENT";
  const isStudent = role === "STUDENT";
  const isCompany = role === "COMPANY" || role === "RECRUITER";
  const isTeacher = role === "TEACHER";
  const isAdmin = role === "ADMIN";

  const isVerified = user?.verificationStatus === "VERIFIED";

  // Navigation Items per role
  const studentMenuItems = [
    {
      id: "feed",
      label: "Find Internships",
      icon: Briefcase,
      description: "Search & apply all",
    },
    {
      id: "profile",
      label: "Student Profile",
      icon: User,
      description: "Academic credentials & endorsements",
    },
    {
      id: "applications",
      label: "Track Applications",
      icon: CheckSquare,
      description: "Live hiring status pipeline",
    },
  ];

  const companyMenuItems = [
    {
      id: "posted_jobs",
      label: "My Job Postings",
      icon: Briefcase,
      description: "Manage active openings",
    },
    {
      id: "applicants",
      label: "Candidate Pipeline",
      icon: Users,
      description: "Review student applications",
    },
    {
      id: "company_profile",
      label: "Company Profile",
      icon: Building2,
      description: "Employer branding & about",
    },
    {
      id: "feed",
      label: "Browse All Jobs",
      icon: Layers,
      description: "Portal marketplace feed",
    },
  ];

  const teacherMenuItems = [
    {
      id: "students",
      label: "Student Roster",
      icon: Users,
      description: "College students & profiles",
    },
    {
      id: "placements",
      label: "Placement Pipeline",
      icon: Briefcase,
      description: "Monitor student applications",
    },
    {
      id: "teacher_profile",
      label: "Faculty Profile",
      icon: BookOpen,
      description: "Department & credentials",
    },
    {
      id: "feed",
      label: "Explore Internships",
      icon: Layers,
      description: "Browse industry postings",
    },
  ];

  const adminMenuItems = [
    {
      id: "admin_verify",
      label: "Verification Queue",
      icon: ShieldCheck,
      description: "Approve companies & teachers",
    },
    {
      id: "admin_users",
      label: "User Directory & Roles",
      icon: Users,
      description: "Role manager & moderation",
    },
    {
      id: "admin_analytics",
      label: "Governance Insights",
      icon: Award,
      description: "Platform metrics & trust",
    },
    {
      id: "feed",
      label: "Job Marketplace",
      icon: Layers,
      description: "All live internship listings",
    },
  ];

  const menuItems = isAdmin
    ? adminMenuItems
    : isTeacher
    ? teacherMenuItems
    : isCompany
    ? companyMenuItems
    : studentMenuItems;

  return (
    <aside className="w-80 bg-zinc-900 border-r border-zinc-800 text-zinc-100 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-full bg-white border border-zinc-750/35 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
            <img 
              src="/logo.png" 
              alt="Internverse Logo" 
              className="h-14 w-auto object-cover object-top scale-[1.5] translate-y-[2px]" 
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent leading-none">
              Internverse
            </h1>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 leading-none">
              Role Ecosystem
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 hover:text-zinc-100 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 align-middle"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4.5 w-4.5 text-amber-400" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-cyan-400" />
          )}
        </button>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-6 pt-4">
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
            isAdmin
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : isTeacher
              ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
              : isCompany
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {isAdmin && <ShieldCheck className="h-4 w-4 text-amber-400" />}
            {isTeacher && <GraduationCap className="h-4 w-4 text-purple-400" />}
            {isCompany && <Building2 className="h-4 w-4 text-emerald-400" />}
            {isStudent && <User className="h-4 w-4 text-cyan-400" />}
            <span className="text-[11px] uppercase tracking-wider">
              {isAdmin
                ? "Admin Portal"
                : isTeacher
                ? "College Teacher"
                : isCompany
                ? "Company Hub"
                : "Student Portal"}
            </span>
          </div>

          <span
            className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
              isVerified
                ? "bg-emerald-400 text-black font-black"
                : "bg-amber-400 text-black font-black"
            }`}
          >
            {isVerified ? (
              <>
                <CheckCircle className="h-2.5 w-2.5" /> Verified
              </>
            ) : (
              <>
                <Clock className="h-2.5 w-2.5" /> Pending
              </>
            )}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? isAdmin
                    ? "bg-gradient-to-r from-amber-500/20 to-zinc-800 text-white shadow-md border-l-4 border-amber-400"
                    : isTeacher
                    ? "bg-gradient-to-r from-purple-500/20 to-zinc-800 text-white shadow-md border-l-4 border-purple-400"
                    : isCompany
                    ? "bg-gradient-to-r from-emerald-500/20 to-zinc-800 text-white shadow-md border-l-4 border-emerald-400"
                    : "bg-gradient-to-r from-cyan-500/20 to-zinc-800 text-white shadow-md border-l-4 border-cyan-400"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive
                    ? isAdmin
                      ? "text-amber-400"
                      : isTeacher
                      ? "text-purple-400"
                      : isCompany
                      ? "text-emerald-400"
                      : "text-cyan-400"
                    : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />
              <div>
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-zinc-500 font-normal">{item.description}</div>
              </div>
              {isActive && (
                <div
                  className={`absolute right-3 w-1.5 h-1.5 rounded-full animate-ping ${
                    isAdmin
                      ? "bg-amber-400"
                      : isTeacher
                      ? "bg-purple-400"
                      : isCompany
                      ? "bg-emerald-400"
                      : "bg-cyan-400"
                  }`}
                />
              )}
            </button>
          );
        })}

        {isCompany && onOpenPostJobModal && (
          <div className="mt-4">
            <button
              onClick={onOpenPostJobModal}
              className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              + Post New Job
            </button>
          </div>
        )}
      </nav>

      {/* User Status Card */}
      {user && (
        <div className="p-6 border-t border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center border font-bold text-xs uppercase ${
                isAdmin
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : isTeacher
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                  : isCompany
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              }`}
            >
              {user.name ? user.name.slice(0, 2) : "US"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-zinc-200">{user.name}</div>
              <div className="text-xs text-zinc-500 truncate">{user.email}</div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full mt-4 py-2 bg-zinc-800/50 hover:bg-red-950/20 border border-zinc-700/60 hover:border-red-900/40 text-zinc-400 hover:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
