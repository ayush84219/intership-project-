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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-zinc-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
              mode === "interview"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {mode === "interview" ? <Video className="h-6 w-6" /> : <Award className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {mode === "interview" ? "Schedule Technical Interview" : "Extend Official Internship Offer"}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Candidate: <span className="text-white font-bold">{applicant.applicantName}</span> &bull; {applicant.jobTitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "interview" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Interview Date
                  </label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Time (IST / Local)
                  </label>
                  <div className="relative">
                    <Clock className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Virtual Meeting Link (Google Meet / Zoom)
                </label>
                <div className="relative">
                  <Video className="h-4 w-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Offered Stipend
                  </label>
                  <div className="relative">
                    <DollarSign className="h-4 w-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Joining Date
                  </label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Candidate Message / Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-400 leading-relaxed"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer ${
                mode === "interview"
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-cyan-500/20"
                  : "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black shadow-emerald-500/20"
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
