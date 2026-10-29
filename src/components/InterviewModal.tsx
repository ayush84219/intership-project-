"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Video, 
  Send, 
  X, 
  Sparkles, 
  Award, 
  DollarSign, 
  CheckCircle2,
  FileCheck
} from "lucide-react";

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: {
    id: string;
    applicantName: string;
    applicantEmail: string;
    jobTitle: string;
    company: string;
  } | null;
  mode: "interview" | "offer";
  onSuccess: (appId: string, status: string, notes: string) => void;
}

export default function InterviewModal({
  isOpen,
  onClose,
  applicant,
  mode,
  onSuccess,
}: InterviewModalProps) {
  if (!isOpen || !applicant) return null;

  const [date, setDate] = useState("2026-10-25");
  const [time, setTime] = useState("14:00");
  const [meetLink, setMeetLink] = useState("https://meet.google.com/int-vwxr-qaz");
  const [stipend, setStipend] = useState("₹1,25,000 / month");
  const [joiningDate, setJoiningDate] = useState("2026-06-01");
  const [notes, setNotes] = useState(
    mode === "interview"
      ? `Hi ${applicant.applicantName}, we were impressed by your profile and faculty recommendations. We would love to invite you for a 45-minute technical discussion.`
      : `Congratulations ${applicant.applicantName}! Google LLC is delighted to extend you an official Summer 2026 Internship Offer.`
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newStatus = mode === "interview" ? "Interviewing" : "Offer";
    const fullNote =
      mode === "interview"
        ? `Interview Scheduled on ${date} at ${time}. Meet link: ${meetLink}. Note: ${notes}`
        : `Official Offer Extended! Stipend: ${stipend}, Joining: ${joiningDate}. Note: ${notes}`;

    try {
      const res = await fetch("/api/posted-jobs/applicants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: applicant.id,
          status: newStatus,
          notes: fullNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(applicant.id, newStatus, fullNote);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-xl relative text-zinc-900 dark:text-zinc-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg bg-zinc-100 dark:bg-zinc-800/60 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center ${
              mode === "interview"
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
            }`}
          >
            {mode === "interview" ? <Video className="h-5 w-5" /> : <Award className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {mode === "interview" ? "Schedule Technical Interview" : "Extend Official Internship Offer"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Candidate: <span className="text-zinc-900 dark:text-white font-semibold">{applicant.applicantName}</span> &bull; {applicant.jobTitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "interview" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Interview Date
                  </label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Time (IST / Local)
                  </label>
                  <div className="relative">
                    <Clock className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Virtual Meeting Link (Google Meet / Zoom)
                </label>
                <div className="relative">
                  <Video className="h-4 w-4 text-blue-600 dark:text-blue-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="url"
                    required
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Offered Stipend
                  </label>
                  <div className="relative">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Joining Date
                  </label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Candidate Message / Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 leading-relaxed"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 shadow-xs cursor-pointer ${
                mode === "interview"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {loading ? (
                "Processing..."
              ) : mode === "interview" ? (
                <>
                  <Send className="h-4 w-4" /> Send Interview Invite
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Issue Offer Letter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
