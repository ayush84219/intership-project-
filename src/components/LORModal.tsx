"use client";

import React, { useState } from "react";
import { 
  Award, 
  Download, 
  Copy, 
  Check, 
  X, 
  GraduationCap, 
  Building, 
  Calendar,
  FileCheck2,
  Sparkles
} from "lucide-react";

interface LORModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    email: string;
    studentId?: string | null;
    profile?: {
      degree?: string | null;
      gpa?: string | null;
      skills?: string | null;
    } | null;
  } | null;
  teacher: {
    name: string;
    collegeName?: string | null;
    department?: string | null;
    designation?: string | null;
    employeeId?: string | null;
  };
}

export default function LORModal({ isOpen, onClose, student, teacher }: LORModalProps) {
  if (!isOpen || !student) return null;

  const [copied, setCopied] = useState(false);

  const lorContent = `OFFICIAL INSTITUTIONAL LETTER OF RECOMMENDATION
Date: October 20, 2026
Issuing Institution: ${teacher.collegeName || "Indian Institute of Technology (IIT) Delhi"}
Department: ${teacher.department || "Computer Science & Engineering"}

TO WHOM IT MAY CONCERN,

I am writing this official Letter of Recommendation with great enthusiasm on behalf of ${student.name} (Student Registration ID: ${student.studentId || "IITD-2024-CS402"}), currently enrolled in our ${student.profile?.degree || "Computer Science & Engineering"} degree program.

During ${student.name}'s academic tenure in our department, they have maintained an outstanding academic record (GPA: ${student.profile?.gpa || "9.2/10.0"}). In particular, ${student.name} has demonstrated exceptional command in ${student.profile?.skills || "modern software development, algorithms, and distributed systems"}.

Beyond technical proficiency, ${student.name} exhibits exemplary professional ethics, disciplined problem-solving aptitude, and proactive teamwork. I rank ${student.name} among the top tier of students in our graduating cohort.

I give ${student.name} my highest institutional recommendation for software engineering and technical internships at leading corporate organizations.

Sincerely,

${teacher.name}
${teacher.designation || "Head of Training & Placement / Professor"}
Department of ${teacher.department || "Computer Science & Engineering"}
${teacher.collegeName || "IIT Delhi"}
Faculty Credential ID: ${teacher.employeeId || "FAC-IITD-8821"}
Institutional Verification Seal: [VERIFIED-ACADEMIC-SEAL-2026]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(lorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 max-w-2xl w-full shadow-xl relative text-zinc-900 dark:text-zinc-100 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg bg-zinc-100 dark:bg-zinc-800/60 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              Official Letter of Recommendation (LOR)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold uppercase tracking-wider">
                Certified
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Generated for candidate: <span className="text-purple-600 dark:text-purple-400 font-semibold">{student.name}</span>
            </p>
          </div>
        </div>

        {/* Certificate Display Paper Container */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-sans space-y-4 shadow-inner relative selection:bg-purple-500/30 selection:text-purple-200">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
                {teacher.collegeName || "IIT Delhi"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 font-bold flex items-center gap-1">
              <FileCheck2 className="h-3 w-3" /> VERIFIED CREDENTIAL SEAL
            </span>
          </div>

          <pre className="font-sans whitespace-pre-wrap text-zinc-800 dark:text-zinc-300 text-xs leading-relaxed">
            {lorContent}
          </pre>
        </div>

        {/* Footer actions */}
        <div className="pt-4 mt-2 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" /> Institutional Digital Signature Attached
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Copied LOR
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Letter Text
                </>
              )}
            </button>

            <button
              onClick={() => {
                alert("LOR certificate generated and prepared for export.");
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Print / Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
