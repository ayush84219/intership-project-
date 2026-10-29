import React, { useState } from "react";
import { MapPin, Globe, DollarSign, ExternalLink, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  logo?: string;
  source: string;
  applyUrl?: string | null;
  description: string;
  skills: string[];
  salary?: string | null;
  category?: string;
}

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  userSkills: string;
  onQuickApply: () => void;
  isApplied: boolean;
}

export default function JobCard({
  job,
  isSelected,
  onSelectChange,
  userSkills,
  onQuickApply,
  isApplied
}: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse candidate skills
  const skillsArray = userSkills
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  // Calculate skill overlap match score
  let matchScore = 0;
  if (job.skills && job.skills.length > 0) {
    const matched = job.skills.filter(skill =>
      skillsArray.includes(skill.toLowerCase())
    );
    matchScore = Math.round((matched.length / job.skills.length) * 100);
  } else {
    matchScore = 70; // Fallback score
  }

  // Cap score between 30 and 100 for visual credibility
  matchScore = Math.max(30, Math.min(100, matchScore));

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
    if (score >= 50) return "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800";
    return "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700";
  };

  const getSourceBadgeColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("linkedin")) return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    if (s.includes("indeed")) return "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    if (s.includes("glassdoor")) return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    if (s.includes("naukri")) return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
    if (s.includes("internshala")) return "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    if (s.includes("apna")) return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    if (s.includes("shine")) return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    return "bg-slate-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
  };

  return (
    <div
      className={`border rounded-2xl p-6 transition-all duration-200 bg-white dark:bg-zinc-900 shadow-sm relative ${isSelected
        ? "border-blue-500 ring-1 ring-blue-500/20 bg-blue-50/20 dark:bg-zinc-900/90"
        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
        }`}
    >
      <div className="flex gap-4 items-start">
        {/* Selection Checkbox */}
        <button
          onClick={() => onSelectChange(!isSelected)}
          disabled={isApplied}
          className={`h-5 w-5 rounded border shrink-0 flex items-center justify-center transition-all ${isApplied
            ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
            : isSelected
              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
              : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 text-transparent"
            }`}
        >
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>

        {/* Company Logo / Initial Placeholder */}
        <div className="h-11 w-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden flex items-center justify-center relative">
          {job.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.logo} alt={job.company} className="h-full w-full object-contain p-1" />
          ) : (
            <span className="text-base font-bold text-zinc-500 dark:text-zinc-400">
              {job.company.charAt(0)}
            </span>
          )}
        </div>

        {/* Main Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {job.title}
              </h3>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{job.company}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              {(job as any).isRecruiterPosted && (
                <span className="text-xs px-2.5 py-0.5 rounded-md border font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shadow-sm">
                  <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  Direct Recruiter Posting
                </span>
              )}
              <span className={`text-xs px-2.5 py-0.5 rounded-md border font-semibold ${getMatchColor(matchScore)} flex items-center gap-1`}>
                <Sparkles className="h-3 w-3" />
                {matchScore}% Match
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-md border font-medium ${getSourceBadgeColor(job.source)}`}>
                {job.source}
              </span>
            </div>
          </div>

          {/* Inline Metadata */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
              <span>{job.location || "Remote"}</span>
            </div>
            {job.salary && job.salary !== "Not disclosed" && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
                <span>{job.salary}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-zinc-400" />
              <span>Internship</span>
            </div>
          </div>

          {/* Job Skills Tags */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3.5">
              {job.skills.map((skill, idx) => {
                const isMatched = skillsArray.includes(skill.toLowerCase());
                return (
                  <span
                    key={idx}
                    className={`text-[11px] px-2 py-0.5 rounded font-medium border transition-colors ${isMatched
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                      }`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          )}

          {/* Collapsible Job Description */}
          <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <p className={`text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
              {job.description}
            </p>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 mt-2 hover:underline cursor-pointer"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Read Description <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          </div>

          {/* Card Actions */}
          <div className="flex items-center justify-end gap-2.5 mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800">
            {job.applyUrl && (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors flex items-center gap-1.5 font-medium"
              >
                Origin Post <ExternalLink className="h-3 w-3" />
              </a>
            )}

            <button
              onClick={onQuickApply}
              disabled={isApplied}
              className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-all ${isApplied
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
                }`}
            >
              {isApplied ? "Applied ✓" : "Quick Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
