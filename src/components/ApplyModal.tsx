import React, { useEffect, useState, useRef } from "react";
import { X, Play, Terminal, Loader2, CheckCircle2, ChevronRight } from "lucide-react";

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
}

interface LogMessage {
  jobId: string;
  type: string;
  message: string;
  timestamp: string;
}

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJobs: Job[];
  onComplete: () => void;
}

export default function ApplyModal({ isOpen, onClose, selectedJobs, onComplete }: ApplyModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<LogMessage[]>([]);
  const [appliedJobsStatus, setAppliedJobsStatus] = useState<Record<string, "pending" | "running" | "success" | "error">>({});
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Initialize status map when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialStatus: Record<string, "pending" | "running" | "success" | "error"> = {};
      selectedJobs.forEach(job => {
        initialStatus[job.id] = "pending";
      });
      setAppliedJobsStatus(initialStatus);
      setTerminalLogs([
        {
          jobId: "system",
          type: "info",
          message: `Ready to process ${selectedJobs.length} batch application(s). Click 'Start Auto-Apply' to run.`,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setIsRunning(false);
      setCurrentJobIndex(0);
      setProgress(0);
    }
  }, [isOpen, selectedJobs]);

  // Scroll to bottom of terminal when logs update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  if (!isOpen) return null;

  const startAutoApply = async () => {
    setIsRunning(true);
    setTerminalLogs(prev => [
      ...prev,
      {
        jobId: "system",
        type: "system",
        message: "Initializing Job Finder Application Agent v1.0.0...",
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);

    try {
      // Call apply API
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: selectedJobs }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Batch submission failed");
      }

      // Stream / Playback the API logs with realistic delays for immersion
      const rawLogs = data.logs || [];
      
      // Let's group logs by jobId
      const jobsQueue = selectedJobs;
      
      for (let i = 0; i < jobsQueue.length; i++) {
        const job = jobsQueue[i];
        setCurrentJobIndex(i);
        setAppliedJobsStatus(prev => ({ ...prev, [job.id]: "running" }));

        // Filter logs related to this job
        const jobLogs = rawLogs.filter((log: any) => log.jobId === job.id);
        
        // Output each log message with a delay
        for (const log of jobLogs) {
          setTerminalLogs(prev => [
            ...prev,
            {
              jobId: job.id,
              type: log.type,
              message: log.message,
              timestamp: new Date().toLocaleTimeString(),
            }
          ]);
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Complete job status
        const hasError = jobLogs.some((log: any) => log.type === "error");
        setAppliedJobsStatus(prev => ({
          ...prev,
          [job.id]: hasError ? "error" : "success"
        }));

        setProgress(Math.round(((i + 1) / jobsQueue.length) * 100));
      }

      // Complete all logs
      setTerminalLogs(prev => [
        ...prev,
        {
          jobId: "system",
          type: "success",
          message: "All batch submissions finished successfully! Database status synced.",
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      
      setIsRunning(false);
      onComplete();
    } catch (err: any) {
      console.error(err);
      setTerminalLogs(prev => [
        ...prev,
        {
          jobId: "system",
          type: "error",
          message: `Fatal error: ${err.message || "Failed execution pipeline"}`,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setIsRunning(false);
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "success": return "text-emerald-400 font-bold";
      case "error": return "text-red-400 font-bold";
      case "agent": return "text-cyan-400 font-semibold";
      case "network": return "text-amber-400 font-mono";
      case "submit": return "text-purple-400 font-medium";
      default: return "text-zinc-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">
              <Terminal className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                One-Click Batch Apply
              </h2>
              <p className="text-xs text-zinc-400 font-medium">Auto-applying to {selectedJobs.length} selected internship(s)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Split Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-5 h-full">
          
          {/* Left panel: Queue status */}
          <div className="md:col-span-2 border-r border-zinc-850/80 p-5 overflow-y-auto space-y-4 bg-zinc-950/80">
            <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-3">Application Queue</h3>
            
            <div className="space-y-2.5">
              {selectedJobs.map((job, idx) => {
                const status = appliedJobsStatus[job.id] || "pending";
                return (
                  <div
                    key={job.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      idx === currentJobIndex && isRunning
                        ? "border-cyan-500/50 bg-cyan-950/10 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                        : status === "success"
                          ? "border-emerald-800/40 bg-emerald-950/5"
                          : "border-zinc-850 bg-zinc-900/20"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-zinc-200 truncate">{job.title}</div>
                      <div className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">{job.company} • {job.source}</div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {status === "pending" && (
                        <span className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-md font-bold uppercase">Pending</span>
                      )}
                      {status === "running" && (
                        <span className="text-[10px] text-cyan-400 border border-cyan-900/60 px-2 py-0.5 rounded-md font-bold uppercase flex items-center gap-1">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" /> Active
                        </span>
                      )}
                      {status === "success" && (
                        <span className="text-[10px] text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded-md font-bold uppercase">Applied ✓</span>
                      )}
                      {status === "error" && (
                        <span className="text-[10px] text-red-400 border border-red-950 px-2 py-0.5 rounded-md font-bold uppercase">Failed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Run Button Panel */}
            {!isRunning && progress === 0 && (
              <button
                onClick={startAutoApply}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <Play className="h-4 w-4 fill-black" />
                Start Auto-Apply
              </button>
            )}
          </div>

          {/* Right panel: Terminal logger console */}
          <div className="md:col-span-3 flex flex-col overflow-hidden bg-black font-mono">
            {/* Terminal Top bar */}
            <div className="bg-zinc-900 px-4 py-2 flex items-center gap-2 border-b border-zinc-850 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[10px] text-zinc-500 ml-2">jobfinder-agent-sh</span>
            </div>

            {/* Logs Body */}
            <div className="flex-1 p-4 overflow-y-auto text-xs space-y-2 select-text scrollbar-thin scrollbar-thumb-zinc-800">
              {terminalLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-zinc-600 select-none">[{log.timestamp}]</span>
                  <span className="text-cyan-600 select-none">&gt;</span>
                  <span className={getLogTypeColor(log.type)}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Progress Bar Footer */}
            {progress > 0 && (
              <div className="p-4 border-t border-zinc-850 bg-zinc-950/80">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 mb-1.5 font-sans">
                  <span className="uppercase tracking-wider flex items-center gap-1.5">
                    {progress === 100 ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Auto-Apply Completed
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-cyan-400" /> Processing Application Queue
                      </>
                    )}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Finished / Close Footer */}
        {progress === 100 && !isRunning && (
          <div className="p-5 border-t border-zinc-850 flex items-center justify-end bg-zinc-900/20">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-1.5"
            >
              Close Console <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
