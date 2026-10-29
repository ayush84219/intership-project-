"use client";

import React, { useState } from "react";
import { X, Sparkles, Building2, MapPin, DollarSign, FileText, Tag, Link2, CheckCircle, RefreshCw } from "lucide-react";

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobPosted: () => void;
}

export default function PostJobModal({ isOpen, onClose, onJobPosted }: PostJobModalProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [category, setCategory] = useState("Software Development");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [applyUrl, setApplyUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !location.trim() || !description.trim()) {
      setErrorMsg("Please fill in all required fields (Title, Company, Location, Description).");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/posted-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          salary: salary.trim() || "Competitive",
          category,
          description: description.trim(),
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          applyUrl: applyUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to post job.");
      }

      setSuccessMsg("Job opening posted successfully! Students can now view and apply.");
      setTimeout(() => {
        onJobPosted();
        onClose();
        // Reset form
        setTitle("");
        setCompany("");
        setLocation("");
        setSalary("");
        setDescription("");
        setSkills("");
        setApplyUrl("");
        setSuccessMsg("");
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Post an Internship Opening
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold uppercase tracking-wider">
                Recruiter Portal
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Publish internships directly to our verified student talent pool.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Job Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Job Title *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <FileText className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI / ML Engineering Intern"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 pl-10 pr-4 py-2.5 rounded-xl outline-none text-xs font-medium"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Company Name *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Building2 className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. TechCorp Solutions"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 pl-10 pr-4 py-2.5 rounded-xl outline-none text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Location */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Location *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ludhiana / Hybrid"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 pl-10 pr-4 py-2.5 rounded-xl outline-none text-xs font-medium"
                />
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Stipend / Salary
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. $30 - $45 / hr"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 pl-10 pr-4 py-2.5 rounded-xl outline-none text-xs font-medium"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl outline-none text-xs font-medium"
              >
                <option value="Software Development">Software Development</option>
                <option value="AI/ML">AI / Machine Learning</option>
                <option value="Human Resources">Human Resources (HR)</option>
                <option value="Marketing">Marketing & Sales</option>
                <option value="Finance">Finance & Accounting</option>
                <option value="Management">Management & Consulting</option>
                <option value="Design">UI/UX & Design</option>
              </select>
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
              Required Skills (comma separated)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Tag className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. Python, React, PyTorch, SQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 pl-10 pr-4 py-2.5 rounded-xl outline-none text-xs font-medium"
              />
            </div>
          </div>

          {/* External Apply Link (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
              External Apply Link (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Link2 className="h-4 w-4" />
              </span>
              <input
                type="url"
                placeholder="https://company.careers/job/123 (Leave blank for internal portal applications)"
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 pl-10 pr-4 py-2.5 rounded-xl outline-none text-xs font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
              Job Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Detail the role responsibilities, qualifications, requirements, and benefits..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 p-3 rounded-xl outline-none text-xs font-medium leading-relaxed resize-none"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" /> Publishing...
              </>
            ) : (
              <>
                Publish Job Listing <Sparkles className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
