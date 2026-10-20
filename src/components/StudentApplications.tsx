"use client";

import React from "react";
import { 
  RefreshCw, 
  FileText, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Video 
} from "lucide-react";
import { Application } from "@/types";
import { APPLICATION_STAGES, getAppStageIndex } from "@/lib/constants";

interface StudentApplicationsProps {
  applications: Application[];
  loading: boolean;
  onRefresh: () => void;
  onViewCoverLetter: (app: Application) => void;
}

export default function StudentApplications({
  applications,
  loading,
  onRefresh,
  onViewCoverLetter,
}: StudentApplicationsProps) {
  const interviewCount = applications.filter(a => (a.status || "").toLowerCase().includes("interview")).length;
  const offerCount = applications.filter(a => {
    const s = (a.status || "").toLowerCase();
    return s.includes("offer") || s.includes("hired") || s.includes("accepted");
  }).length;

  return (
    <div className="p-8 space-y-6 max-w-5xl w-full mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-250 dark:border-zinc-900 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            Track Applications
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 font-semibold mt-1">
            Real-time pipeline tracking and AI cover letter management.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh Applications"
        >
          <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Total Submissions</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">{applications.length}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <FileText className="h-5 w-5 text-cyan-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Interview Rounds</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">{interviewCount}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Video className="h-5 w-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Offers Extended</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{offerCount}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-10">
          <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin mx-auto mb-2" />
          <span className="text-xs text-zinc-500">Loading submission records...</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-3xl space-y-3 bg-white dark:bg-zinc-950/20">
          <FileText className="h-10 w-10 text-zinc-400 dark:text-zinc-650 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-550 dark:text-zinc-400">No Submissions Recorded</h3>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 max-w-xs mx-auto">
            Use the &apos;One-Click Apply&apos; tool on the Search Feed to submit batch applications first.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const stageIdx = getAppStageIndex(app.status);
            const isRejected = (app.status || "").toLowerCase().includes("reject");

            return (
              <div
                key={app.id}
                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded-2xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
              >
                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{app.title}</h4>
                      {isRejected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase">
                          Not Selected
                        </span>
                      ) : stageIdx === 4 ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Offer Extended
                        </span>
                      ) : stageIdx === 3 ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold uppercase flex items-center gap-1">
                          <Video className="w-3 h-3" /> Interview Stage
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-bold uppercase">
                          {app.status || "Applied"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-1">
                      {app.company} • {app.location || "Remote"}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
                      <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-750">
                        {app.source}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {app.coverLetter && (
                      <button
                        onClick={() => onViewCoverLetter(app)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
                      >
                        <FileText className="h-3.5 w-3.5" /> Cover Letter
                      </button>
                    )}
                    {app.applyUrl && (
                      <a
                        href={app.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 font-bold"
                      >
                        Job Link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* 5-Stage Hiring Progress Stepper */}
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Recruitment Progress</span>
                    <span>Stage {Math.min(stageIdx + 1, 5)} of 5: {APPLICATION_STAGES[stageIdx]?.label}</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="relative flex items-center justify-between px-2 py-3">
                    {/* Background Track */}
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-zinc-200 dark:bg-zinc-800 z-0 rounded-full" />
                    {/* Active Filled Track */}
                    <div 
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-emerald-400 z-0 rounded-full transition-all duration-500"
                      style={{ 
                        width: isRejected 
                          ? "0%" 
                          : `calc(${(stageIdx / (APPLICATION_STAGES.length - 1)) * 100}% - 2rem)` 
                      }}
                    />

                    {APPLICATION_STAGES.map((stg, i) => {
                      const isCompleted = i <= stageIdx && !isRejected;
                      const isCurrent = i === stageIdx && !isRejected;

                      return (
                        <div key={stg.key} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                              isCurrent
                                ? "bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/40 ring-4 ring-cyan-500/20"
                                : isCompleted
                                ? "bg-emerald-500 text-black border-emerald-400"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700"
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : i + 1}
                          </div>
                          <span
                            className={`mt-1.5 text-[10px] font-semibold whitespace-nowrap ${
                              isCurrent
                                ? "text-cyan-400 font-bold"
                                : isCompleted
                                ? "text-emerald-400"
                                : "text-zinc-400 dark:text-zinc-500"
                            }`}
                          >
                            {stg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Stage Callouts */}
                  {stageIdx === 3 && (
                    <div className="mt-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300">
                      <div className="flex items-center gap-2.5">
                        <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>
                          <strong>Interview Round Active:</strong> Google Meet invite has been scheduled.
                        </span>
                      </div>
                      <span className="font-semibold text-cyan-400 text-[11px] underline cursor-pointer">
                        View Schedule
                      </span>
                    </div>
                  )}

                  {stageIdx === 4 && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong>Formal Offer Extended:</strong> You received an official internship offer!
                        </span>
                      </div>
                      <span className="font-semibold text-emerald-400 text-[11px] underline cursor-pointer">
                        Review Offer Letter
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
