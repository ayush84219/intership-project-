import React from "react";

export default function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)] animate-pulse">
      {/* Left side info block */}
      <div className="flex gap-4 items-start flex-1 min-w-0">
        {/* Company Logo placeholder */}
        <div className="w-14 h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />

        {/* Text descriptions */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Title line */}
            <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            {/* Source badge */}
            <div className="h-4.5 w-16 bg-zinc-150 dark:bg-zinc-850 rounded-md" />
          </div>

          <div className="flex items-center gap-3">
            {/* Company name */}
            <div className="h-4 w-32 bg-zinc-150 dark:bg-zinc-850 rounded-md" />
            {/* Location dot separator & text */}
            <div className="h-3 w-3 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-4 w-28 bg-zinc-150 dark:bg-zinc-850 rounded-md" />
          </div>

          {/* Sub description details */}
          <div className="pt-1.5 space-y-1.5 max-w-xl">
            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-850 rounded" />
            <div className="h-3 w-5/6 bg-zinc-100 dark:bg-zinc-850 rounded" />
          </div>

          {/* Skills tags list */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <div className="h-6 w-14 bg-zinc-100 dark:bg-zinc-850 rounded-lg" />
            <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-850 rounded-lg" />
            <div className="h-6 w-20 bg-zinc-100 dark:bg-zinc-850 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Right side apply action block */}
      <div className="flex md:flex-col items-end gap-3 shrink-0 self-start md:self-center w-full md:w-auto border-t md:border-0 border-zinc-100 dark:border-zinc-850 pt-4 md:pt-0">
        {/* Salary marker */}
        <div className="h-5 w-24 bg-zinc-150 dark:bg-zinc-850 rounded-md" />
        {/* Apply CTA action button */}
        <div className="h-10 w-full md:w-28 bg-zinc-200 dark:bg-zinc-850 rounded-xl" />
      </div>
    </div>
  );
}
