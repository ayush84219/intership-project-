"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { 
  Zap, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  ShieldCheck, 
  RefreshCw 
} from "lucide-react";

interface RoleSwitcherBarProps {
  currentRole?: string;
}

export default function RoleSwitcherBar({ currentRole }: RoleSwitcherBarProps) {
  const [switching, setSwitching] = useState<string | null>(null);

  const roles = [
    {
      id: "STUDENT",
      label: "Student",
      sub: "Aarav Sharma",
      email: "student@university.edu",
      password: "student123",
      icon: GraduationCap,
      color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20",
      activeBg: "bg-cyan-500 text-black shadow-lg shadow-cyan-500/25",
    },
    {
      id: "COMPANY",
      label: "Company",
      sub: "Google LLC",
      email: "company@google.com",
      password: "company123",
      icon: Building2,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20",
      activeBg: "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25",
    },
    {
      id: "TEACHER",
      label: "Teacher",
      sub: "Prof. Verma",
      email: "teacher@university.edu",
      password: "teacher123",
      icon: BookOpen,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20",
      activeBg: "bg-purple-500 text-white shadow-lg shadow-purple-500/25",
    },
    {
      id: "ADMIN",
      label: "Admin",
      sub: "Verification Hub",
      email: "admin@internverse.com",
      password: "admin123",
      icon: ShieldCheck,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20",
      activeBg: "bg-amber-500 text-black shadow-lg shadow-amber-500/25",
    },
  ];

  const handleSwitch = async (r: (typeof roles)[0]) => {
    if (switching) return;
    setSwitching(r.id);
    try {
      const res = await signIn("credentials", {
        email: r.email,
        password: r.password,
        redirect: false,
      });
      if (!res?.error) {
        window.location.href = "/?switched=" + r.id;
      } else {
        alert("Switch failed: " + res.error);
        setSwitching(null);
      }
    } catch (err) {
      console.error(err);
      setSwitching(null);
    }
  };

  const normalizedCurrent = currentRole === "RECRUITER" ? "COMPANY" : (currentRole || "STUDENT");

  return (
    <aside aria-label="Role Simulation Switcher" className="w-full bg-zinc-950/95 border-b border-zinc-800/90 py-2 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 text-xs z-30 shadow-md">
      <div className="flex items-center gap-2">
        <span className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Zap className="h-3.5 w-3.5 fill-current" />
        </span>
        <span className="font-extrabold text-white text-[11px] tracking-wide uppercase">
          Live Role Switcher:
        </span>
        <span className="text-zinc-400 text-[11px] hidden sm:inline">
          Test any portal view in 1-click &rarr;
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = normalizedCurrent === r.id;
          const isPending = switching === r.id;

          return (
            <button
              key={r.id}
              onClick={() => handleSwitch(r)}
              disabled={!!switching}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                isActive
                  ? r.activeBg
                  : `border ${r.color}`
              } disabled:opacity-50`}
            >
              {isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>{r.label}</span>
              <span className={`text-[10px] font-normal ${isActive ? "opacity-80" : "text-zinc-400"} hidden md:inline`}>
                ({r.sub})
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
