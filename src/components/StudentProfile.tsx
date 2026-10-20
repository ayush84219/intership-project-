"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Save, 
  ExternalLink 
} from "lucide-react";
import { User, Profile } from "@/types";

interface StudentProfileProps {
  user: (User & { profile?: Profile | null; studentEndorsements?: any[] }) | null;
  onProfileUpdated?: () => void;
}

export default function StudentProfile({ user, onProfileUpdated }: StudentProfileProps) {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) return null;

  const isVerified = user.verificationStatus === "VERIFIED" || user.profile?.isAcademicVerified;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const nameInput = (document.getElementById("profileName") as HTMLInputElement)?.value;
      const collegeInput = (document.getElementById("profileCollege") as HTMLInputElement)?.value;
      const studentIdInput = (document.getElementById("profileStudentId") as HTMLInputElement)?.value;
      const degreeInput = (document.getElementById("profileDegree") as HTMLInputElement)?.value;
      const gpaInput = (document.getElementById("profileGpa") as HTMLInputElement)?.value;
      const skillsInput = (document.getElementById("profileSkills") as HTMLTextAreaElement)?.value;
      const targetRolesInput = (document.getElementById("profileRoles") as HTMLInputElement)?.value;
      const resumeUrlInput = (document.getElementById("profileResume") as HTMLInputElement)?.value;
      const githubInput = (document.getElementById("profileGithub") as HTMLInputElement)?.value;
      const linkedinInput = (document.getElementById("profileLinkedin") as HTMLInputElement)?.value;

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          collegeName: collegeInput,
          studentId: studentIdInput,
          degree: degreeInput,
          gpa: gpaInput,
          skills: skillsInput,
          targetRoles: targetRolesInput,
          resumeUrl: resumeUrlInput,
          githubUrl: githubInput,
          linkedinUrl: linkedinInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        if (onProfileUpdated) onProfileUpdated();
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile save error:", err);
      alert("An unexpected error occurred while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-3xl w-full mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-250 dark:border-zinc-900 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            My Student Profile & Academic Credentials
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 font-semibold mt-1">
            Manage your academic details, university verification, and view faculty endorsements.
          </p>
        </div>

        <span
          className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1 ${
            isVerified
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          }`}
        >
          {isVerified ? (
            <>
              <CheckCircle className="h-3 w-3" /> Officially Verified Student
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3" /> Verification In Review
            </>
          )}
        </span>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Profile details saved successfully!
        </div>
      )}

      {/* University & Institutional Verification Card */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-zinc-900 to-zinc-900 border border-cyan-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Academic Institution
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {user.collegeName || user.profile?.college || "University / College"}
              </h3>
              <div className="text-xs text-zinc-400 mt-0.5">
                Student ID: <span className="font-mono text-zinc-300 font-bold">{user.studentId || user.profile?.studentId || "Not Registered"}</span>
                {user.profile?.gpa && <span> &bull; GPA: <strong className="text-cyan-400">{user.profile.gpa}</strong></span>}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-zinc-400 block font-medium">Placement Status</span>
            <span className="text-xs font-bold text-emerald-400">Open for Summer 2026</span>
          </div>
        </div>
      </div>

      {/* Faculty Recommendations & Endorsements */}
      {user.studentEndorsements && user.studentEndorsements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Faculty Endorsements & Recommendations ({user.studentEndorsements.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {user.studentEndorsements.map((end: any) => (
              <div
                key={end.id}
                className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs shadow-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-300 text-sm">
                      {end.teacher?.name || "College Professor"}
                    </span>
                    <span className="text-zinc-500 text-[11px] ml-2">
                      {end.teacher?.designation || "Faculty Mentor"} &bull; {end.teacher?.department || "Department"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase">
                    ★ {end.rating || 5}.0 Faculty Rating
                  </span>
                </div>
                <p className="text-zinc-300 italic leading-relaxed text-xs">
                  &ldquo;{end.endorsement}&rdquo;
                </p>
                {end.skill && (
                  <div className="pt-1 text-[11px] text-zinc-400">
                    <span className="text-zinc-500">Endorsed Expertise:</span> <strong className="text-purple-300">{end.skill}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleProfileSave} className="space-y-6 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl">
        {/* Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="profileName" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
              Full Name
            </label>
            <input
              id="profileName"
              type="text"
              required
              defaultValue={user.name}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full bg-zinc-100/60 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 text-zinc-450 dark:text-zinc-500 px-4 py-3 rounded-xl text-sm font-semibold cursor-not-allowed"
            />
          </div>
        </div>

        {/* College & Roll No */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="profileCollege" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
              College / University
            </label>
            <input
              id="profileCollege"
              type="text"
              defaultValue={user.collegeName || user.profile?.college || ""}
              placeholder="e.g. IIT Delhi"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="profileStudentId" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
              Roll No / Student Registration
            </label>
            <input
              id="profileStudentId"
              type="text"
              defaultValue={user.studentId || user.profile?.studentId || ""}
              placeholder="e.g. 2024CS402"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-semibold font-mono"
            />
          </div>
        </div>

        {/* Degree Track & GPA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="profileDegree" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
              Degree Program / Major
            </label>
            <input
              id="profileDegree"
              type="text"
              required
              defaultValue={user.profile?.degree || "Computer Science"}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="profileGpa" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
              GPA / Academic Score
            </label>
            <input
              id="profileGpa"
              type="text"
              defaultValue={user.profile?.gpa || ""}
              placeholder="e.g. 9.2 / 10.0"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-semibold font-mono"
            />
          </div>
        </div>

        {/* Target Roles */}
        <div className="space-y-2">
          <label htmlFor="profileRoles" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
            Target Internship Roles (Comma separated)
          </label>
          <input
            id="profileRoles"
            type="text"
            required
            defaultValue={user.profile?.targetRoles || ""}
            placeholder="e.g. AI/ML Intern, Fullstack Intern, Software Developer"
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-semibold"
          />
        </div>

        {/* Skills Area */}
        <div className="space-y-2">
          <label htmlFor="profileSkills" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
            Skills Inventory (Comma separated)
          </label>
          <textarea
            id="profileSkills"
            rows={3}
            required
            defaultValue={user.profile?.skills || ""}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-medium leading-relaxed font-mono"
          />
        </div>

        {/* Links: Resume, GitHub, LinkedIn */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="profileResume" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
              Resume URL
            </label>
            <input
              id="profileResume"
              type="url"
              defaultValue={user.profile?.resumeUrl || ""}
              placeholder="https://drive.google.com/..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-2.5 rounded-xl text-xs font-semibold outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="profileGithub" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
              GitHub URL
            </label>
            <input
              id="profileGithub"
              type="url"
              defaultValue={user.profile?.githubUrl || ""}
              placeholder="https://github.com/..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-2.5 rounded-xl text-xs font-semibold outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="profileLinkedin" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
              LinkedIn URL
            </label>
            <input
              id="profileLinkedin"
              type="url"
              defaultValue={user.profile?.linkedinUrl || ""}
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-2.5 rounded-xl text-xs font-semibold outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-850 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/10 hover:scale-[1.01] cursor-pointer flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving Profile..." : "Save Student Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
