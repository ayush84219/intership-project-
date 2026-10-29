"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  FileText,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  CheckCircle,
  ExternalLink,
  X,
  Upload,
  Plus,
  Check,
  BookOpen,
  MapPin,
  Video,
  Award,
  Clock,
  ShieldCheck
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import JobCard from "../components/JobCard";
import ApplyModal from "../components/ApplyModal";
import AIChatbot from "../components/AIChatbot";
import JobCardSkeleton from "../components/JobCardSkeleton";
import PostJobModal from "../components/PostJobModal";
import RecruiterDashboard from "../components/RecruiterDashboard";
import AdminDashboard from "../components/AdminDashboard";
import TeacherDashboard from "../components/TeacherDashboard";
import StudentProfile from "../components/StudentProfile";
import StudentApplications from "../components/StudentApplications";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Profile, Job, Application } from "@/types";
import { COURSE_PRESETS, LOCATION_DATA } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  const [activeTab, setActiveTab] = useState("feed");
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    }
    return "dark";
  });
  
  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Search, Track & Selection states
  const [activeTrack, setActiveTrack] = useState<"engineering" | "bba">("engineering");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedJobIds, setSelectedJobIds] = useState<Record<string, boolean>>({});
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  
  // Start-up splash/flash screen loading state
  const [showFlash, setShowFlash] = useState(true);
  const [viewingCoverLetterApp, setViewingCoverLetterApp] = useState<Application | null>(null);

  // Onboarding wizard states
  const [skippedOnboarding, setSkippedOnboarding] = useState(false);
  const [onboardingName, setOnboardingName] = useState("");
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [resumeName, setResumeName] = useState<string>("");
  const [customFieldInput, setCustomFieldInput] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  
  // Location selector states
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [excludeLocation, setExcludeLocation] = useState("");
  const [datePosted, setDatePosted] = useState("");

  // Load profile and default jobs on mount
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
      fetchApplications();
    }

    // Auto-dismiss startup splash overlay
    const timer = setTimeout(() => {
      setShowFlash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [status, router, theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", nextTheme);
    }
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  };

  async function fetchProfile() {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setOnboardingName(data.user.name || "");
        if (data.user.role === "ADMIN") {
          setActiveTab("admin_verify");
        } else if (data.user.role === "TEACHER") {
          setActiveTab("students");
        } else if (data.user.role === "COMPANY" || data.user.role === "RECRUITER") {
          setActiveTab("posted_jobs");
        } else {
          setActiveTab("feed");
        }
        // Pre-fetch jobs based on user profile degree if they have one, or default degree if not
        const userDegree = data.user.profile?.degree || "";
        const isBus = userDegree.toLowerCase().includes("bba") || 
                      userDegree.toLowerCase().includes("business") || 
                      userDegree.toLowerCase().includes("mba") || 
                      userDegree.toLowerCase().includes("commerce") || 
                      userDegree.toLowerCase().includes("marketing") || 
                      userDegree.toLowerCase().includes("finance");
        const detectedTrack = isBus ? "bba" : "engineering";
        setActiveTrack(detectedTrack);

        const targetDegree = userDegree || (isBus ? "Bachelor of Business Administration (BBA)" : "Bachelor of Technology (B.Tech)");
        fetchJobs(targetDegree);
      } else {
        fetchJobs("Bachelor of Technology (B.Tech)");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      fetchJobs("Bachelor of Technology (B.Tech)");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function fetchJobs(
    degree?: string, 
    customQuery?: string, 
    platform?: string, 
    location?: string,
    exclude?: string,
    dateFilter?: string
  ) {
    setLoadingJobs(true);
    try {
      const currentTrackDegree = activeTrack === "engineering" 
        ? "Bachelor of Technology (B.Tech)" 
        : "Bachelor of Business Administration (BBA)";
      const degreeParam = degree !== undefined && degree !== "" 
        ? degree 
        : (user?.profile?.degree || currentTrackDegree);
      const queryParam = customQuery !== undefined ? customQuery : searchQuery;
      const platformParam = platform !== undefined ? platform : selectedPlatform;
      const locationParam = location !== undefined ? location : activeLocation;
      const excludeParam = exclude !== undefined ? exclude : excludeLocation;
      const dateParam = dateFilter !== undefined ? dateFilter : datePosted;
      
      let url = `/api/jobs?degree=${encodeURIComponent(degreeParam)}&query=${encodeURIComponent(queryParam)}&platform=${encodeURIComponent(platformParam)}`;
      if (locationParam) {
        url += `&location=${encodeURIComponent(locationParam)}`;
      }
      if (excludeParam) {
        url += `&excludeLocation=${encodeURIComponent(excludeParam)}`;
      }
      if (dateParam) {
        url += `&datePosted=${encodeURIComponent(dateParam)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
        // Clear selections
        setSelectedJobIds({});
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  }

  async function fetchApplications() {
    setLoadingApplications(true);
    try {
      const res = await fetch("/api/apply");
      const data = await res.json();
      if (data.success && data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoadingApplications(false);
    }
  }

  const handleCourseSelect = (courseKey: string) => {
    setSelectedCourse(courseKey);
    setSelectedFields(COURSE_PRESETS[courseKey].fields);
    setSelectedSkills(COURSE_PRESETS[courseKey].skills);
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomField = () => {
    if (customFieldInput.trim() && !selectedFields.includes(customFieldInput.trim())) {
      setSelectedFields(prev => [...prev, customFieldInput.trim()]);
      setCustomFieldInput("");
    }
  };

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills(prev => [...prev, customSkillInput.trim()]);
      setCustomSkillInput("");
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeName(file.name);
    }
  };

  const handleStateChange = async (stateVal: string) => {
    setSelectedState(stateVal);
    setSelectedCity("");
    setCustomLocation("");
    setActiveLocation(stateVal);
    
    await fetchJobs(undefined, searchQuery, selectedPlatform, stateVal, excludeLocation, datePosted);
  };

  const handleCityChange = async (cityVal: string) => {
    setSelectedCity(cityVal);
    setCustomLocation("");
    const loc = cityVal ? `${cityVal}, ${selectedState}` : selectedState;
    setActiveLocation(loc);
    
    await fetchJobs(undefined, searchQuery, selectedPlatform, loc, excludeLocation, datePosted);
  };

  const handleCustomLocationChange = (val: string) => {
    setCustomLocation(val);
    setSelectedState("");
    setSelectedCity("");
    setActiveLocation(val);
  };

  const handleExcludeLocationChange = (val: string) => {
    setExcludeLocation(val);
  };

  const handleDatePostedChange = async (val: string) => {
    setDatePosted(val);
    await fetchJobs(undefined, searchQuery, selectedPlatform, activeLocation, excludeLocation, val);
  };

  const clearLocationFilter = async () => {
    setSelectedState("");
    setSelectedCity("");
    setCustomLocation("");
    setExcludeLocation("");
    setDatePosted("");
    setActiveLocation("");
    
    await fetchJobs(undefined, searchQuery, selectedPlatform, "", "", "");
  };

  // Debounced search when user types custom location
  useEffect(() => {
    if (customLocation === "") return;
    const timer = setTimeout(() => {
      fetchJobs(undefined, searchQuery, selectedPlatform, customLocation, excludeLocation, datePosted);
    }, 450);
    return () => clearTimeout(timer);
  }, [customLocation]);

  // Debounced search when user types exclude location
  useEffect(() => {
    if (excludeLocation === "") return;
    const timer = setTimeout(() => {
      fetchJobs(undefined, searchQuery, selectedPlatform, activeLocation, excludeLocation, datePosted);
    }, 450);
    return () => clearTimeout(timer);
  }, [excludeLocation]);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingName.trim() || !selectedCourse) return;

    setSavingProfile(true);
    try {
      const courseName = COURSE_PRESETS[selectedCourse].name;
      const skillsStr = selectedSkills.join(", ");
      const fieldsStr = selectedFields.join(", ");
      const resumeUrlStr = resumeName ? `/uploads/${resumeName}` : "";

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: onboardingName,
          degree: courseName,
          skills: skillsStr,
          targetRoles: fieldsStr,
          resumeUrl: resumeUrlStr,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        await fetchJobs(courseName, "", "all");
      }
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSkipOnboarding = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Immediately toggle skipped state so the website dashboard renders instantly
    setSkippedOnboarding(true);

    const defaultCourse = selectedCourse ? (COURSE_PRESETS[selectedCourse]?.name || "Bachelor of Technology (B.Tech)") : "Bachelor of Technology (B.Tech)";
    const defaultSkills = selectedSkills.length > 0 ? selectedSkills.join(", ") : "React, TypeScript, Python, Communication";
    const defaultFields = selectedFields.length > 0 ? selectedFields.join(", ") : "Software Developer, AI/ML, General Intern";
    const nameToSave = onboardingName.trim() || user?.name || "Internverse Member";

    // Set user profile in state immediately
    setUser(prev => ({
      id: prev?.id || "user",
      email: prev?.email || "user@example.com",
      name: nameToSave,
      profile: {
        id: prev?.profile?.id || "skipped",
        degree: defaultCourse,
        skills: defaultSkills,
        targetRoles: defaultFields,
        resumeUrl: resumeName ? `/uploads/${resumeName}` : null,
      }
    }));

    // Trigger jobs fetch immediately
    fetchJobs(defaultCourse, "", "all");

    // Save profile to backend in background
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameToSave,
          degree: defaultCourse,
          skills: defaultSkills,
          targetRoles: defaultFields,
          resumeUrl: resumeName ? `/uploads/${resumeName}` : "",
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Background profile save failed:", err);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.profile) return;

    setSavingProfile(true);
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
      if (data.success && data.user) {
        setUser(data.user);
        alert("Student profile updated successfully!");
        if (data.user.profile?.degree) {
          fetchJobs(data.user.profile.degree);
        }
      }
    } catch (err) {
      console.error("Profile save failed:", err);
      alert("Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Toggle selection for a specific job
  const handleJobSelectToggle = (jobId: string, selected: boolean) => {
    setSelectedJobIds(prev => ({
      ...prev,
      [jobId]: selected
    }));
  };

  // Select/Deselect all jobs currently in search results
  const handleSelectAllToggle = (checked: boolean) => {
    const nextSelected: Record<string, boolean> = {};
    if (checked) {
      jobs.forEach(job => {
        const alreadyApplied = applications.some(app => app.jobId === job.id);
        if (!alreadyApplied) {
          nextSelected[job.id] = true;
        }
      });
    }
    setSelectedJobIds(nextSelected);
  };

  const getSelectedJobsCount = () => {
    return Object.values(selectedJobIds).filter(Boolean).length;
  };

  const handleBatchApplyOpen = () => {
    if (getSelectedJobsCount() === 0) return;
    setIsApplyModalOpen(true);
  };

  // Trigger quick apply for a single card
  const handleQuickApply = (job: Job) => {
    setSelectedJobIds({ [job.id]: true });
    setIsApplyModalOpen(true);
  };

  const handleApplyModalClose = () => {
    setIsApplyModalOpen(false);
    // Reload applications list to see the fresh submissions
    fetchApplications();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(undefined, searchQuery);
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    fetchJobs(undefined, undefined, platform);
  };

  const handleTrackSwitch = async (track: "engineering" | "bba") => {
    setActiveTrack(track);
    setSearchQuery("");
    setSelectedPlatform("all");

    const defaultDegree = track === "engineering" 
      ? "Bachelor of Technology (B.Tech)" 
      : "Bachelor of Business Administration (BBA)";

    // Immediately fetch jobs for the switched track!
    await fetchJobs(defaultDegree, "", "all", activeLocation, excludeLocation, datePosted);

    // Sync to user profile in background if logged in
    if (user) {
      const defaultSkills = track === "engineering"
        ? "React, TypeScript, Python, TensorFlow, PyTorch, SQL"
        : "HR Management, Excel, Communication, Brand Strategy, Recruitment";

      const defaultTargetRoles = track === "engineering"
        ? "AI/ML Intern, Software Developer Intern"
        : "HR Intern, Assistant Manager Intern";

      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            degree: defaultDegree,
            skills: defaultSkills,
            targetRoles: defaultTargetRoles,
          }),
        });

        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.warn("Track switch background profile sync:", err);
      }
    }
  };

  // Check if profile exists and has a degree configured or onboarding skipped (Admins, Teachers, Companies skip directly)
  const isOnboarded =
    skippedOnboarding ||
    !!user?.profile?.degree ||
    user?.role === "ADMIN" ||
    user?.role === "TEACHER" ||
    user?.role === "COMPANY" ||
    user?.role === "RECRUITER";

  // Compile selected job objects
  const selectedJobsList = jobs.filter(job => selectedJobIds[job.id]);

  // Startup Splash Flash Screen overlay & Session Initializer
  if (showFlash || status === "loading" || (status === "authenticated" && loadingProfile)) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans select-none overflow-hidden">
        {/* Ambient Radial Mesh Background */}
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-cyan-500/10 dark:from-blue-600/15 dark:via-indigo-600/10 dark:to-cyan-400/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Central Brand Emblem Card */}
        <div className="flex flex-col items-center gap-5 animate-fade-in relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 rounded-3xl blur-lg opacity-30 dark:opacity-40 animate-pulse pointer-events-none" />
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 p-3.5 flex items-center justify-center shadow-xl dark:shadow-2xl shadow-blue-500/10">
              <img 
                src="/logo.png" 
                alt="Internverse Logo" 
                className="h-full w-full object-contain filter drop-shadow-xs" 
              />
            </div>
          </div>

          {/* Brand Identity */}
          <div className="text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
                Internverse
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                Portal
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
              Unified University &amp; Corporate Talent Network
            </p>
          </div>

          {/* High-Tech Shimmer Progress Loader */}
          <div className="w-56 sm:w-64 mt-4 space-y-2.5">
            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative shadow-inner">
              <div className="h-full w-1/2 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full animate-shimmer-progress shadow-sm" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium px-0.5">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                <span>Initializing gateway...</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">v3.0</span>
            </div>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="absolute bottom-6 flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Institutional Single Sign-On &bull; Role-Based Governance</span>
        </div>
      </div>
    );
  }

  // ONBOARDING SCREEN
  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-300">
        {/* Background glow graphics */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md rounded-3xl p-10 shadow-2xl relative z-10 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-250 dark:border-zinc-800 pb-5 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shadow-xs shrink-0 p-1.5">
                <img 
                  src="/logo.png" 
                  alt="Internverse Logo" 
                  className="h-full w-auto object-contain" 
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans leading-none">Internverse</h1>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 block leading-none">Setup Career Gateway</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 font-bold uppercase tracking-wider">
                Step {wizardStep} of 5
              </span>
              <button
                type="button"
                onClick={handleSkipOnboarding}
                disabled={savingProfile}
                className="text-xs px-3.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-cyan-500 hover:text-black border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                title="Skip onboarding and go directly to website"
              >
                <span>Skip to Website</span>
                <span className="text-sm font-bold">&rarr;</span>
              </button>
            </div>
            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    s === wizardStep
                      ? "w-8 bg-cyan-500"
                      : s < wizardStep
                      ? "w-2.5 bg-emerald-500"
                      : "w-2.5 bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            {/* STEP 1: Name Input */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-zinc-850 dark:text-zinc-100 tracking-tight">Let&apos;s start with your name</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Please enter your full name to personalize your workspace dashboard.</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="onboardName" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <input
                    id="onboardName"
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={onboardingName}
                    onChange={(e) => setOnboardingName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3.5 rounded-xl outline-none transition-all text-xs font-semibold"
                  />
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSkipOnboarding}
                    disabled={savingProfile}
                    className="text-xs font-bold text-zinc-500 hover:text-cyan-500 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    Skip setup & show website direct &rarr;
                  </button>
                  <button
                    type="button"
                    disabled={!onboardingName.trim()}
                    onClick={() => setWizardStep(2)}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-cyan-500/10"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Course Selection */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-zinc-850 dark:text-zinc-100 tracking-tight">Choose your academic course</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Select your active degree course program. This customizes recommended skills and roles.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(COURSE_PRESETS).map((courseKey) => {
                    const isSelected = selectedCourse === courseKey;
                    return (
                      <button
                        key={courseKey}
                        type="button"
                        onClick={() => handleCourseSelect(courseKey)}
                        className={`p-4.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/20 dark:bg-zinc-950/20"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
                          isSelected ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500"
                        }`}>
                          <BookOpen className="h-4.5 w-4.5" />
                        </div>
                        <h3 className="font-bold text-xs mt-3.5 text-zinc-800 dark:text-zinc-200">{courseKey}</h3>
                        <p className="text-[10px] text-zinc-450 mt-1 line-clamp-2 leading-relaxed">{COURSE_PRESETS[courseKey].description}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSkipOnboarding}
                      className="text-xs font-bold text-zinc-500 hover:text-cyan-500 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      Skip setup &rarr;
                    </button>
                    <button
                      type="button"
                      disabled={!selectedCourse}
                      onClick={() => setWizardStep(3)}
                      className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-cyan-500/10"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Job Field Customization */}
            {wizardStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-zinc-850 dark:text-zinc-100 tracking-tight">Configure target job fields</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Select recommended fields matching {selectedCourse} or input custom fields below.</p>
                </div>

                {/* Preset choices as tag pills */}
                <div className="flex flex-wrap gap-2 py-2">
                  {COURSE_PRESETS[selectedCourse]?.fields.map((field) => {
                    const isSelected = selectedFields.includes(field);
                    return (
                      <button
                        key={field}
                        type="button"
                        onClick={() => toggleField(field)}
                        className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                            : "bg-zinc-950/40 border-zinc-850 text-zinc-450 hover:text-zinc-300 hover:border-zinc-750"
                        }`}
                      >
                        {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {field}
                      </button>
                    );
                  })}
                </div>

                {/* Custom target roles field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    Custom Target Fields
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. UX Designer, Content Lead"
                      value={customFieldInput}
                      onChange={(e) => setCustomFieldInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomField())}
                      className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 rounded-xl outline-none transition-all text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={addCustomField}
                      className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-750"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected summary */}
                {selectedFields.length > 0 && (
                  <div className="p-3.5 bg-zinc-950/30 border border-zinc-900 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Active Target Fields:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFields.map(f => (
                        <span key={f} className="text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSkipOnboarding}
                      className="text-xs font-bold text-zinc-500 hover:text-cyan-500 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      Skip setup &rarr;
                    </button>
                    <button
                      type="button"
                      disabled={selectedFields.length === 0}
                      onClick={() => setWizardStep(4)}
                      className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-cyan-500/10"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Key Skills Customization */}
            {wizardStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-zinc-850 dark:text-zinc-100 tracking-tight">Configure core skills</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Select skills or add specific professional assets to match job listings.</p>
                </div>

                {/* Preset skills */}
                <div className="flex flex-wrap gap-2 py-2">
                  {COURSE_PRESETS[selectedCourse]?.skills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                            : "bg-zinc-950/40 border-zinc-850 text-zinc-450 hover:text-zinc-300 hover:border-zinc-750"
                        }`}
                      >
                        {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>

                {/* Custom skills */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    Custom Core Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Docker, Photoshop, Financial Modeling"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                      className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 rounded-xl outline-none transition-all text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-750"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected summary */}
                {selectedSkills.length > 0 && (
                  <div className="p-3.5 bg-zinc-950/30 border border-zinc-900 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Active Core Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkills.map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSkipOnboarding}
                      className="text-xs font-bold text-zinc-500 hover:text-cyan-500 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      Skip setup &rarr;
                    </button>
                    <button
                      type="button"
                      disabled={selectedSkills.length === 0}
                      onClick={() => setWizardStep(5)}
                      className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-cyan-500/10"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Resume Upload */}
            {wizardStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-zinc-850 dark:text-zinc-100 tracking-tight">Upload your resume</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Provide your resume to activate one-click AI application draft features.</p>
                </div>

                {/* File Upload Box */}
                <div className="border-2 border-dashed border-zinc-250 dark:border-zinc-800 hover:border-cyan-500/50 bg-zinc-50/50 dark:bg-zinc-950/20 hover:bg-zinc-50 dark:hover:bg-zinc-950/45 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all relative group overflow-hidden">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl group-hover:scale-105 transition-transform text-zinc-400 group-hover:text-cyan-400">
                    <Upload className="h-5 w-5" />
                  </div>
                  {resumeName ? (
                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 justify-center">
                        <CheckCircle className="h-4 w-4" /> Ready for Upload
                      </span>
                      <p className="text-[11px] font-mono text-zinc-650 dark:text-zinc-300 max-w-[280px] truncate">{resumeName}</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-zinc-600 dark:text-zinc-350">Drag and drop file here</p>
                      <p className="text-[10px] text-zinc-550 dark:text-zinc-500">Supports PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
                  >
                    {savingProfile ? (
                      <span className="flex items-center gap-1.5 justify-center"><RefreshCw className="h-4 w-4 animate-spin text-black" /> Creating Gateway...</span>
                    ) : (
                      "Complete Onboarding"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD LAYOUT
  const isEngineering = activeTrack === "engineering";

  const totalSelectedCount = getSelectedJobsCount();
  const selectAllChecked = jobs.length > 0 && jobs.every(job => 
    applications.some(app => app.jobId === job.id) || selectedJobIds[job.id]
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative transition-colors duration-200">
        {/* Sleek Top Header Bar */}
        <header className="h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 transition-colors">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Internverse Portal</span>
            <span>/</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 capitalize">
              {activeTab === "feed" ? "Internship Marketplace" : activeTab.replace(/admin_|teacher_|_jobs/g, " ").replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Operational</span>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-zinc-100 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-750">
              {user?.role || "STUDENT"}
            </span>
          </div>
        </header>

        {/* ADMIN GOVERNANCE & VERIFICATION DASHBOARD */}
        {(activeTab === "admin_verify" || activeTab === "admin_users" || activeTab === "admin_analytics") && (
          <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto">
            <AdminDashboard
              currentTab={
                activeTab === "admin_users"
                  ? "users"
                  : activeTab === "admin_analytics"
                  ? "analytics"
                  : "verification"
              }
              onTabChange={(t) => {
                if (t === "users") setActiveTab("admin_users");
                else if (t === "analytics") setActiveTab("admin_analytics");
                else setActiveTab("admin_verify");
              }}
            />
          </div>
        )}

        {/* COLLEGE TEACHER DASHBOARD */}
        {(activeTab === "students" || activeTab === "placements" || activeTab === "teacher_profile") && (
          <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto">
            <TeacherDashboard
              user={user as any}
              onProfileUpdated={fetchProfile}
              currentTab={
                activeTab === "placements"
                  ? "placements"
                  : activeTab === "teacher_profile"
                  ? "profile"
                  : "students"
              }
              onTabChange={(t) => {
                if (t === "placements") setActiveTab("placements");
                else if (t === "profile") setActiveTab("teacher_profile");
                else setActiveTab("students");
              }}
            />
          </div>
        )}

        {/* COMPANY / RECRUITER DASHBOARD */}
        {(activeTab === "posted_jobs" || activeTab === "applicants" || activeTab === "company_profile") && (
          <div className="p-6 sm:p-8 max-w-5xl w-full mx-auto">
            <RecruiterDashboard
              user={user as any}
              onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
              onProfileUpdated={fetchProfile}
              currentTab={
                activeTab === "applicants"
                  ? "applicants"
                  : activeTab === "company_profile"
                  ? "profile"
                  : "posted_jobs"
              }
              onTabChange={(t) => {
                if (t === "applicants") setActiveTab("applicants");
                else if (t === "profile") setActiveTab("company_profile");
                else setActiveTab("posted_jobs");
              }}
            />
          </div>
        )}

        {/* Tab 1: INTERNSHIP FEED */}
        {activeTab === "feed" && (
          <div className="p-8 space-y-6 max-w-5xl w-full mx-auto">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  Find Internships
                  <span className="text-xs px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                    {isEngineering ? "Tech Feed" : "Business Feed"}
                  </span>
                </h2>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 font-semibold mt-1">
                  Showing openings aggregated from major job pipelines
                </p>
              </div>

              {/* Quick Switch Track Toggle */}
              <div className="flex items-center bg-zinc-200 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-300 dark:border-zinc-850 self-start">
                <button
                  onClick={() => handleTrackSwitch("engineering")}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    isEngineering
                      ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/10"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Tech Track
                </button>
                <button
                  onClick={() => handleTrackSwitch("bba")}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    !isEngineering
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  Business Track
                </button>
              </div>
            </div>

            {/* Live Search & Filter Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-zinc-450 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder={
                    isEngineering
                      ? "Search AI/ML, Fullstack, Frontend, UI/UX Design, skills..."
                      : "Search HR, Brand Manager, Consultant, Digital Marketing, skills..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 focus:border-cyan-500 text-zinc-900 dark:text-zinc-200 pl-11 pr-10 py-3 rounded-xl outline-none text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      fetchJobs(undefined, "");
                    }}
                    className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer p-0.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-300 hover:text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shrink-0 shadow-md cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Geographic Location Filtering */}
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850/80 p-4.5 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5 self-start sm:self-center">
                <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-zinc-855 dark:text-zinc-250 leading-none">Filter by Location</h4>
                    {(activeLocation || excludeLocation || datePosted) && (
                      <button
                        type="button"
                        onClick={clearLocationFilter}
                        className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/25 transition-all font-bold cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-550 dark:text-zinc-500 font-medium mt-1 leading-none">Filter locations and date posted for jobs</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full sm:w-auto flex-1 justify-end">
                {/* Custom location input */}
                <div className="relative flex-1 min-w-[140px] sm:max-w-[150px]">
                  <input
                    type="text"
                    placeholder="Type location..."
                    value={customLocation}
                    onChange={(e) => handleCustomLocationChange(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-3.5 pr-8 py-2.5 rounded-xl outline-none text-xs font-semibold"
                  />
                  {customLocation && (
                    <button 
                      type="button" 
                      onClick={() => handleCustomLocationChange("")}
                      className="absolute right-2 top-3.5 text-zinc-400 hover:text-zinc-100 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Exclude location input */}
                <div className="relative flex-1 min-w-[140px] sm:max-w-[150px]">
                  <input
                    type="text"
                    placeholder="Exclude location..."
                    value={excludeLocation}
                    onChange={(e) => handleExcludeLocationChange(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 focus:border-red-500 text-zinc-805 dark:text-zinc-200 px-3.5 pr-8 py-2.5 rounded-xl outline-none text-xs font-semibold"
                  />
                  {excludeLocation && (
                    <button 
                      type="button" 
                      onClick={() => handleExcludeLocationChange("")}
                      className="absolute right-2 top-3.5 text-zinc-400 hover:text-zinc-100 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Date Posted Selector */}
                <select
                  value={datePosted}
                  onChange={(e) => handleDatePostedChange(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-3.5 py-2.5 rounded-xl outline-none text-xs font-semibold cursor-pointer"
                >
                  <option value="">Any Time</option>
                  <option value="today">Last 24 Hours</option>
                  <option value="3days">Last 3 Days</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>

                <div className="flex gap-3 w-full sm:w-auto">
                  {/* State selector */}
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="flex-1 sm:flex-initial bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-3.5 py-2.5 rounded-xl outline-none text-xs font-semibold cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {Object.keys(LOCATION_DATA).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>

                  {/* City selector */}
                  <select
                    value={selectedCity}
                    disabled={!selectedState}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="flex-1 sm:flex-initial bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-3.5 py-2.5 rounded-xl outline-none text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="">Select City</option>
                    {selectedState && LOCATION_DATA[selectedState].map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Popular Filter Tags (Click to Search) */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Quick Filters:</span>
              {(isEngineering
                ? ["AI/ML", "React Developer", "UI UX Design", "Fullstack Intern"]
                : ["HR Generalist", "Brand Marketing", "Financial Analyst", "Management Intern"]
              ).map((tag, idx) => {
                const isActive = searchQuery.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        setSearchQuery("");
                        fetchJobs(undefined, "");
                      } else {
                        setSearchQuery(tag);
                        fetchJobs(undefined, tag);
                      }
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-md border font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-cyan-100/60 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-400 dark:border-cyan-700 shadow-xs"
                        : "bg-white dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Source Platforms Filter */}
            <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-zinc-150 dark:border-zinc-850/40 mt-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Source Platforms:</span>
              {[
                { name: "All Platforms", value: "all" },
                { name: "Direct Recruiters", value: "recruiter" },
                { name: "Internshala.com", value: "internshala" },
                { name: "Naukri.com", value: "naukri" },
                { name: "Apna.com", value: "apna" },
                { name: "Shine.com", value: "shine" }
              ].map((platform, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePlatformChange(platform.value)}
                  className={`text-[10px] px-3 py-1 rounded-md border font-bold transition-all cursor-pointer ${
                    selectedPlatform === platform.value
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/10"
                      : "bg-white dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-450 border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {platform.name}
                </button>
              ))}
            </div>

            {/* Select All & One-Click Apply Panel */}
            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectAllChecked}
                  onChange={(e) => handleSelectAllToggle(e.target.checked)}
                  disabled={jobs.length === 0}
                  className="h-4.5 w-4.5 rounded border-zinc-300 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300">Select All Available Jobs</span>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">Bypasses already applied roles</p>
                </div>
              </div>

              <button
                onClick={handleBatchApplyOpen}
                disabled={totalSelectedCount === 0}
                className={`py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  totalSelectedCount > 0
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/10 cursor-pointer scale-100 hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500 border border-zinc-250 dark:border-zinc-850 cursor-not-allowed"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                One-Click Apply All ({totalSelectedCount})
              </button>
            </div>

            {/* Jobs List Grid */}
            {loadingJobs ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <JobCardSkeleton key={n} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 px-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 bg-white dark:bg-zinc-900/40 shadow-xs animate-fade-in">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Internships Found</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                    {searchQuery && activeLocation 
                      ? `No matching openings for "${searchQuery}" in ${activeLocation}.`
                      : searchQuery 
                        ? `No matching openings found for "${searchQuery}".`
                        : activeLocation
                          ? `No openings currently available in ${activeLocation}.`
                          : "No openings match your current filter combination."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {activeLocation && (
                    <button
                      type="button"
                      onClick={clearLocationFilter}
                      className="text-xs px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-250 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear Location ({activeLocation})
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        fetchJobs(undefined, "");
                      }}
                      className="text-xs px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-250 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear Search Query
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedPlatform("all");
                      setSelectedState("");
                      setSelectedCity("");
                      setCustomLocation("");
                      setExcludeLocation("");
                      setDatePosted("");
                      setActiveLocation("");
                      fetchJobs(undefined, "", "all", "", "", "");
                    }}
                    className="text-xs px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-md shadow-cyan-500/10 transition-all cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const isApplied = applications.some(app => app.jobId === job.id);
                  return (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSelected={!!selectedJobIds[job.id]}
                      onSelectChange={(selected) => handleJobSelectToggle(job.id, selected)}
                      userSkills={user?.profile?.skills || ""}
                      onQuickApply={() => handleQuickApply(job)}
                      isApplied={isApplied}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: PROFILE PAGE */}
        {activeTab === "profile" && user && (
          <StudentProfile user={user as any} onProfileUpdated={fetchProfile} />
        )}

        {/* Tab 3: APPLICATIONS DASHBOARD */}
        {activeTab === "applications" && (
          <StudentApplications
            applications={applications}
            loading={loadingApplications}
            onRefresh={fetchApplications}
            onViewCoverLetter={(app) => setViewingCoverLetterApp(app)}
          />
        )}
      </main>

      {/* COVER LETTER PREVIEW MODAL */}
      {viewingCoverLetterApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden flex flex-col max-h-[80vh] shadow-[0_0_30px_rgba(0,0,0,0.15)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/30">
              <div>
                <h3 className="font-bold text-sm text-zinc-850 dark:text-zinc-200">Custom Generated Cover Letter</h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">For {viewingCoverLetterApp.title} at {viewingCoverLetterApp.company}</p>
              </div>
              <button
                onClick={() => setViewingCoverLetterApp(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-450 hover:text-zinc-850 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto text-xs text-zinc-700 dark:text-zinc-300 font-semibold whitespace-pre-wrap leading-relaxed select-text font-serif bg-zinc-50/30 dark:bg-transparent">
              {viewingCoverLetterApp.coverLetter}
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-850 flex justify-end bg-zinc-50 dark:bg-zinc-900/10">
              <button
                onClick={() => setViewingCoverLetterApp(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Cover Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH APPLY CONSOLE MODAL */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={handleApplyModalClose}
        selectedJobs={selectedJobsList}
        onComplete={fetchApplications}
      />

      {/* RECRUITER POST JOB MODAL */}
      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onJobPosted={() => {
          if (user?.profile?.degree) {
            fetchJobs(user.profile.degree);
          } else {
            fetchJobs("engineering");
          }
        }}
      />

      {/* FLOATING AI CHATBOT OVERVIEW PANEL */}
      <AIChatbot />
    </div>
  );
}
