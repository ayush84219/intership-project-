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

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      window.location.href = "/login";
    }
  };

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
    <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 flex flex-col shrink-0 h-screen select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 p-1.5 shadow-xs">
            <img
              src="/logo.png"
              alt="Internverse Logo"
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
              Internverse
            </h1>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider mt-1.5 leading-none">
              {isAdmin ? "Admin Console" : isTeacher ? "Faculty Portal" : isCompany ? "Company Hub" : "Student Portal"}
            </span>
          </div>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-5 pt-4">
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/60 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            {isAdmin && <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            {isTeacher && <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
            {isCompany && <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            {isStudent && <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            <span className="text-[11px] font-semibold">
              {isAdmin
                ? "Admin Portal"
                : isTeacher
                  ? "College Faculty"
                  : isCompany
                    ? "Employer Hub"
                    : "Student Candidate"}
            </span>
          </div>

          <span
            className={`text-[10px] px-2 py-0.5 rounded font-medium ${isVerified
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
              : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
              }`}
          >
            {isVerified ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-2.5 w-2.5" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> Pending
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-5 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 ${isActive
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-semibold border-l-3 border-blue-600 dark:border-blue-400 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
            >
              <Icon
                className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"
                  }`}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate leading-tight">{item.label}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal truncate mt-0.5">{item.description}</div>
              </div>
            </button>
          );
        })}

        {isCompany && onOpenPostJobModal && (
          <div className="pt-3">
            <button
              onClick={onOpenPostJobModal}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition-colors text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              + Post New Internship
            </button>
          </div>
        )}
      </nav>

      {/* Professional Theme Switcher Control */}
      <div className="px-5 py-3 border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1.5">
          <span>Interface Theme</span>
          <span className="text-[10px] uppercase font-bold tracking-wider">{theme} Mode</span>
        </div>
        <div className="p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl flex items-center gap-1 text-xs border border-zinc-200/60 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => theme !== "light" && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer ${
              theme === "light"
                ? "bg-white text-zinc-900 shadow-xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => theme !== "dark" && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-zinc-900 text-white shadow-xs font-semibold dark:bg-zinc-700"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Moon className="h-3.5 w-3.5 text-blue-400" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* User Status Card */}
      {user && (
        <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs uppercase shrink-0 shadow-2xs">
                {user.name ? user.name.slice(0, 2) : "US"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate text-zinc-900 dark:text-zinc-100">{user.name}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Sign Out of Portal"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
