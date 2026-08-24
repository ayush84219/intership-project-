import React from "react";
import { Briefcase, User, CheckSquare, Award, Sun, Moon, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: {
    name: string;
    email: string;
    role?: string;
    profile?: {
      degree: string;
    } | null;
  } | null;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onOpenPostJobModal?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, theme, toggleTheme, onOpenPostJobModal }: SidebarProps) {
  const isRecruiter = user?.role === "RECRUITER";
  const isEngineering = user?.profile?.degree?.toLowerCase().includes("engineer") || 
                        user?.profile?.degree?.toLowerCase().includes("computer") ||
                        user?.profile?.degree?.toLowerCase().includes("tech");

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
      description: "Manage skills & resume",
    },
    {
      id: "applications",
      label: "Track Applications",
      icon: CheckSquare,
      description: "Cover letters & status",
    },
  ];

  const recruiterMenuItems = [
    {
      id: "posted_jobs",
      label: "My Posted Jobs",
      icon: Briefcase,
      description: "Manage job listings",
    },
    {
      id: "applicants",
      label: "Recruiter Applicants",
      icon: CheckSquare,
      description: "Review candidates",
    },
    {
      id: "feed",
      label: "Browse All Jobs",
      icon: User,
      description: "Portal job feed",
    },
  ];

  const menuItems = isRecruiter ? recruiterMenuItems : studentMenuItems;

  return (
    <aside className="w-80 bg-zinc-900 border-r border-zinc-800 text-zinc-100 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-full bg-white border border-zinc-750/35 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
            <img 
              src="/logo.png" 
              alt="Job Finder Logo" 
              className="h-14 w-auto object-cover object-top scale-[1.5] translate-y-[2px]" 
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent leading-none">
              Job Finder
            </h1>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 leading-none">Aggregator</span>
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
                  ? "bg-gradient-to-r from-zinc-800/80 to-zinc-800/30 text-white shadow-md border-l-4 border-cyan-500"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-cyan-400" : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />
              <div>
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-zinc-500 font-normal">{item.description}</div>
              </div>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>
          );
        })}
        {isRecruiter && onOpenPostJobModal && (
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
            <div className={`h-10 w-10 rounded-full flex items-center justify-center border relative group overflow-hidden ${
              isRecruiter 
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400 font-bold" 
                : "bg-zinc-800 border-zinc-700 text-zinc-300 font-semibold"
            }`}>
              <span className="text-sm">
                {user.name.split(" ").map(n => n[0]).join("")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-zinc-200">{user.name}</div>
              <div className="text-xs text-zinc-500 truncate">{user.email}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800/80">
            <Award className={`h-4 w-4 shrink-0 ${isRecruiter ? "text-emerald-400" : isEngineering ? "text-cyan-400" : "text-amber-400"}`} />
            <span className="text-xs font-semibold text-zinc-400 truncate">
              {isRecruiter ? "🏢 Recruiter / Employer" : isEngineering ? "🎓 Engineering Student" : "🎓 Business/BBA Student"}
            </span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full mt-3 py-2 bg-zinc-800/50 hover:bg-red-950/20 border border-zinc-700/60 hover:border-red-900/40 text-zinc-400 hover:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
