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
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            My Student Profile & Academic Credentials
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Manage your academic details, university verification, and view faculty endorsements.
          </p>
        </div>

        <span
          className={`text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1 ${isVerified
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
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
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Profile details saved successfully!
        </div>
      )}

      {/* University & Institutional Verification Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 tracking-wider">
                Academic Institution
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {user.collegeName || user.profile?.college || "University / College"}
              </h3>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Student ID: <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{user.studentId || user.profile?.studentId || "Not Registered"}</span>
                {user.profile?.gpa && <span> &bull; GPA: <strong className="text-blue-600 dark:text-blue-400">{user.profile.gpa}</strong></span>}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">Placement Status</span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Open for Summer 2026</span>
          </div>
        </div>
      </div>

      {/* Faculty Recommendations & Endorsements */}
      {user.studentEndorsements && user.studentEndorsements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Faculty Endorsements & Recommendations ({user.studentEndorsements.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {user.studentEndorsements.map((end: any) => (
              <div
                key={end.id}
                className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-xs shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-indigo-950 dark:text-indigo-200 text-sm">
                      {end.teacher?.name || "College Professor"}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px] ml-2">
                      {end.teacher?.designation || "Faculty Mentor"} &bull; {end.teacher?.department || "Department"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 font-semibold text-[10px] uppercase">
                    ★ {end.rating || 5}.0 Faculty Rating
                  </span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 italic leading-relaxed text-xs">
                  &ldquo;{end.endorsement}&rdquo;
                </p>
                {end.skill && (
                  <div className="pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="text-zinc-500 mr-1">Endorsed Expertise:</span> <strong className="text-indigo-700 dark:text-indigo-300">{end.skill}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleProfileSave} className="space-y-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-7 rounded-2xl shadow-sm">
        {/* Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="profileName" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Full Name
            </label>
            <input
              id="profileName"
              type="text"
              required
              defaultValue={user.name}
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed"
            />
          </div>
        </div>

        {/* College & Roll No */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="profileCollege" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              College / University
            </label>
            <input
              id="profileCollege"
              type="text"
              defaultValue={user.collegeName || user.profile?.college || ""}
              placeholder="e.g. IIT Delhi"
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profileStudentId" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Roll No / Student Registration
            </label>
            <input
              id="profileStudentId"
              type="text"
              defaultValue={user.studentId || user.profile?.studentId || ""}
              placeholder="e.g. 2024CS402"
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl outline-none transition-all text-sm font-medium font-mono"
            />
          </div>
        </div>

        {/* Degree Track & GPA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="profileDegree" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Degree Program / Major
            </label>
            <input
              id="profileDegree"
              type="text"
              required
              defaultValue={user.profile?.degree || "Computer Science"}
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profileGpa" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              GPA / Academic Score
            </label>
            <input
              id="profileGpa"
              type="text"
              defaultValue={user.profile?.gpa || ""}
              placeholder="e.g. 9.2 / 10.0"
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl outline-none transition-all text-sm font-medium font-mono"
            />
          </div>
        </div>

        {/* Target Roles */}
        <div className="space-y-1.5">
          <label htmlFor="profileRoles" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Target Internship Roles (Comma separated)
          </label>
          <input
            id="profileRoles"
            type="text"
            required
            defaultValue={user.profile?.targetRoles || ""}
            placeholder="e.g. AI/ML Intern, Fullstack Intern, Software Developer"
            className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl outline-none transition-all text-sm font-medium"
          />
        </div>

        {/* Skills Area */}
        <div className="space-y-1.5">
          <label htmlFor="profileSkills" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Skills Inventory (Comma separated)
          </label>
          <textarea
            id="profileSkills"
            rows={3}
            required
            defaultValue={user.profile?.skills || ""}
            className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl outline-none transition-all text-sm font-medium leading-relaxed font-mono"
          />
        </div>

        {/* Links: Resume, GitHub, LinkedIn */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="profileResume" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Resume URL
            </label>
            <input
              id="profileResume"
              type="url"
              defaultValue={user.profile?.resumeUrl || ""}
              placeholder="https://drive.google.com/..."
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-xl text-xs font-medium outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profileGithub" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              GitHub URL
            </label>
            <input
              id="profileGithub"
              type="url"
              defaultValue={user.profile?.githubUrl || ""}
              placeholder="https://github.com/..."
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-xl text-xs font-medium outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profileLinkedin" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              LinkedIn URL
            </label>
            <input
              id="profileLinkedin"
              type="url"
              defaultValue={user.profile?.linkedinUrl || ""}
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-xl text-xs font-medium outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving Profile..." : "Save Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
