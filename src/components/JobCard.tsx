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
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-255/10 dark:border-emerald-800/40";
    if (score >= 50) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-255/10 dark:border-amber-800/40";
    return "text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/40";
  };

  const getSourceBadgeColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("linkedin")) return "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800/50";
    if (s.includes("indeed")) return "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50";
    if (s.includes("glassdoor")) return "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 border-green-200 dark:border-green-800/50";
    if (s.includes("naukri")) return "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800/50";
    if (s.includes("internshala")) return "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50";
    if (s.includes("apna")) return "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50";
    if (s.includes("shine")) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
    return "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800/50";
  };

  return (
    <div
      className={`border rounded-2xl p-6 transition-all duration-300 bg-white dark:bg-zinc-900/40 relative overflow-hidden ${
        isSelected
          ? "border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.1)] bg-cyan-50/20 dark:bg-zinc-900/80"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60"
      }`}
    >
      {/* Glow Effect for High Matches */}
      {matchScore >= 80 && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[50px] pointer-events-none rounded-full" />
      )}

      <div className="flex gap-4 items-start">
        {/* Selection Checkbox */}
        <button
          onClick={() => onSelectChange(!isSelected)}
          disabled={isApplied}
          className={`h-6 w-6 rounded-lg border shrink-0 flex items-center justify-center transition-all ${
            isApplied
              ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
              : isSelected
                ? "bg-cyan-500 border-cyan-400 text-black shadow-md shadow-cyan-500/20"
                : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-transparent"
          }`}
        >
          <Check className="h-4 w-4 stroke-[3]" />
        </button>

        {/* Company Logo / Initial Placeholder */}
        <div className="h-12 w-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden flex items-center justify-center relative group">
          {job.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.logo} alt={job.company} className="h-full w-full object-contain p-1" />
          ) : (
            <span className="text-lg font-bold text-zinc-400 dark:text-zinc-500 group-hover:text-cyan-400 transition-colors">
              {job.company.charAt(0)}
            </span>
          )}
        </div>

        {/* Main Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div>
              <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100 truncate hover:text-cyan-600 dark:hover:text-white transition-colors">
                {job.title}
              </h3>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">{job.company}</p>
            </div>
            
            {/* Badges */}
            <div className="flex items-center gap-2">
              {(job as any).isRecruiterPosted && (
                <span className="text-xs px-2.5 py-0.5 rounded-md border font-extrabold bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1 shadow-sm">
                  <Sparkles className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                  Direct Recruiter Posting
                </span>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getMatchColor(matchScore)} flex items-center gap-1`}>
                <Sparkles className="h-3 w-3" />
                {matchScore}% Match
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-md border font-semibold ${getSourceBadgeColor(job.source)}`}>
                {job.source}
              </span>
            </div>
          </div>

          {/* Inline Metadata */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-500 font-medium mt-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location || "Remote"}</span>
            </div>
            {job.salary && job.salary !== "Not disclosed" && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                <span>{job.salary}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              <span>Internship</span>
            </div>
          </div>

          {/* Job Skills Tags */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {job.skills.map((skill, idx) => {
                const isMatched = skillsArray.includes(skill.toLowerCase());
                return (
                  <span
                    key={idx}
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border transition-colors ${
                      isMatched
                        ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50"
                        : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-zinc-850"
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          )}

          {/* Collapsible Job Description */}
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/40">
            <p className={`text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
              {job.description}
            </p>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center gap-1 mt-2.5 hover:underline"
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
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/60">
            {job.applyUrl && (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all flex items-center gap-1.5"
              >
                Origin Post <ExternalLink className="h-3 w-3" />
              </a>
            )}
            
            <button
              onClick={onQuickApply}
              disabled={isApplied}
              className={`text-xs px-4 py-1.5 rounded-lg font-bold transition-all ${
                isApplied
                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 cursor-not-allowed"
                  : "bg-cyan-500 text-black hover:bg-cyan-400 shadow-md shadow-cyan-500/10 cursor-pointer"
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
