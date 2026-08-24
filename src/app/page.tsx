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
  MapPin
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import JobCard from "../components/JobCard";
import ApplyModal from "../components/ApplyModal";
import AIChatbot from "../components/AIChatbot";
import JobCardSkeleton from "../components/JobCardSkeleton";
import PostJobModal from "../components/PostJobModal";
import RecruiterDashboard from "../components/RecruiterDashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  degree: string;
  skills: string;
  targetRoles: string;
  resumeUrl?: string | null;
}

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  profile: Profile | null;
}

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

interface Application {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location?: string | null;
  source: string;
  applyUrl?: string | null;
  status: string;
  coverLetter?: string | null;
  appliedAt: string;
}

const COURSE_PRESETS: Record<string, {
  name: string;
  description: string;
  fields: string[];
  skills: string[];
}> = {
  "B.Tech": {
    name: "Bachelor of Technology (B.Tech)",
    description: "Technology, Engineering, Software & Computing tracks",
    fields: ["AI/ML", "Data Science", "Machine Learning", "Prompt Engineer", "Software Developer"],
    skills: ["React", "TypeScript", "Python", "TensorFlow", "PyTorch", "SQL", "Prompt Engineering"]
  },
  "MBA": {
    name: "Master of Business Administration (MBA)",
    description: "General Management, Strategy, Consulting & Executive tracks",
    fields: ["Manager", "Marketing Specialist", "Accountant", "SAP Specialist", "HR Manager"],
    skills: ["Leadership", "Marketing Strategy", "Financial Analysis", "SAP ERP", "Excel", "Project Management"]
  },
  "BBA": {
    name: "Bachelor of Business Administration (BBA)",
    description: "Business administration, corporate management & sales operations",
    fields: ["HR Intern", "Business Development", "Sales Executive", "Marketing Executive"],
    skills: ["Communication", "Excel", "PowerPoint", "Brand Strategy", "Recruitment"]
  },
  "B.Com": {
    name: "Bachelor of Commerce (B.Com)",
    description: "Accounting, finance, taxation & business auditing",
    fields: ["Accountant", "Financial Analyst", "Tax Consultant", "Audit Intern"],
    skills: ["Accounting", "Excel", "Tally", "Corporate Finance", "GST"]
  },
  "BA": {
    name: "Bachelor of Arts (BA)",
    description: "Social sciences, humanities, writing & creative media tracks",
    fields: ["Content Writer", "Social Media Specialist", "Graphic Designer", "HR Executive"],
    skills: ["Creative Writing", "Communication", "Social Media Marketing", "SEO", "Photoshop"]
  },
  "MA": {
    name: "Master of Arts (MA)",
    description: "Advanced humanities research, linguistics, writing & teaching",
    fields: ["Content Lead", "Public Relations Lead", "Research Associate", "Translator"],
    skills: ["Academic Writing", "Research", "Communication", "Copywriting", "Public Speaking"]
  }
};

const LOCATION_DATA: Record<string, string[]> = {
  "Punjab": ["Ludhiana", "Mohali", "Amritsar", "Jalandhar", "Patiala"],
  "Delhi NCR": ["New Delhi", "Noida", "Gurugram", "Ghaziabad"],
  "Karnataka": ["Bengaluru", "Mysore", "Mangalore"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Tamil Nadu": ["Chennai", "Coimbatore"]
};

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
      return savedTheme || "dark";
    }
    return "dark";
  });
  
  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Search & Selection states
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
    } else {
      document.documentElement.classList.remove("dark");
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
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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
        if (data.user.role === "RECRUITER") {
          setActiveTab("posted_jobs");
        }
        // Pre-fetch jobs based on user profile degree if they have one, or default degree if not
        const targetDegree = data.user.profile?.degree || "Bachelor of Technology (B.Tech)";
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
    degree: string, 
    customQuery?: string, 
    platform?: string, 
    location?: string,
    exclude?: string,
    dateFilter?: string
  ) {
    setLoadingJobs(true);
    try {
      const queryParam = customQuery !== undefined ? customQuery : searchQuery;
      const platformParam = platform !== undefined ? platform : selectedPlatform;
      const locationParam = location !== undefined ? location : activeLocation;
      const excludeParam = exclude !== undefined ? exclude : excludeLocation;
      const dateParam = dateFilter !== undefined ? dateFilter : datePosted;
      
      let url = `/api/jobs?degree=${encodeURIComponent(degree)}&query=${encodeURIComponent(queryParam)}&platform=${encodeURIComponent(platformParam)}`;
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
    
    const degree = user?.profile?.degree || "";
    await fetchJobs(degree, searchQuery, selectedPlatform, stateVal, excludeLocation, datePosted);
  };

  const handleCityChange = async (cityVal: string) => {
    setSelectedCity(cityVal);
    setCustomLocation("");
    const loc = cityVal ? `${cityVal}, ${selectedState}` : selectedState;
    setActiveLocation(loc);
    
    const degree = user?.profile?.degree || "";
    await fetchJobs(degree, searchQuery, selectedPlatform, loc, excludeLocation, datePosted);
  };

  const handleCustomLocationChange = async (val: string) => {
    setCustomLocation(val);
    setSelectedState("");
    setSelectedCity("");
    setActiveLocation(val);
    
    const degree = user?.profile?.degree || "";
    await fetchJobs(degree, searchQuery, selectedPlatform, val, excludeLocation, datePosted);
  };

  const handleExcludeLocationChange = async (val: string) => {
    setExcludeLocation(val);
    
    const degree = user?.profile?.degree || "";
    await fetchJobs(degree, searchQuery, selectedPlatform, activeLocation, val, datePosted);
  };

  const handleDatePostedChange = async (val: string) => {
    setDatePosted(val);
    
    const degree = user?.profile?.degree || "";
    await fetchJobs(degree, searchQuery, selectedPlatform, activeLocation, excludeLocation, val);
  };

  const clearLocationFilter = async () => {
    setSelectedState("");
    setSelectedCity("");
    setCustomLocation("");
    setExcludeLocation("");
    setDatePosted("");
    setActiveLocation("");
    
    const degree = user?.profile?.degree || "";
    await fetchJobs(degree, searchQuery, selectedPlatform, "", "");
  };

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
    const nameToSave = onboardingName.trim() || user?.name || "Job Finder User";

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
      const degreeInput = (document.getElementById("profileDegree") as HTMLInputElement)?.value;
      const skillsInput = (document.getElementById("profileSkills") as HTMLTextAreaElement)?.value;
      const targetRolesInput = (document.getElementById("profileRoles") as HTMLInputElement)?.value;

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          degree: degreeInput,
          skills: skillsInput,
          targetRoles: targetRolesInput,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        alert("Profile updated successfully!");
        fetchJobs(data.user.profile.degree);
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
    if (user?.profile?.degree) {
      fetchJobs(user.profile.degree);
    }
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    if (user?.profile?.degree) {
      fetchJobs(user.profile.degree, undefined, platform);
    }
  };

  const handleTrackSwitch = async (track: "engineering" | "bba") => {
    if (!user) return;
    setLoadingJobs(true);
    try {
      const defaultDegree = track === "engineering" 
        ? "Computer Science & Engineering" 
        : "Bachelor of Business Administration (BBA)";
        
      const defaultSkills = track === "engineering"
        ? "React, TypeScript, Python, TensorFlow, PyTorch, SQL"
        : "HR Management, Excel, Communication, Brand Strategy, Recruitment";

      const defaultTargetRoles = track === "engineering"
        ? "AI/ML Intern, Software Developer Intern"
        : "HR Intern, Assistant Manager Intern";

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
        setSearchQuery("");
        setSelectedPlatform("all");
        await fetchJobs(defaultDegree, "", "all");
      }
    } catch (err) {
      console.error("Track switch failed:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Check if profile exists and has a degree configured or onboarding skipped
  const isOnboarded = skippedOnboarding || !!user?.profile?.degree;

  // Compile selected job objects
  const selectedJobsList = jobs.filter(job => selectedJobIds[job.id]);

  // Startup Splash Flash Screen overlay
  if (showFlash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 transition-opacity duration-500 ease-in-out">
        {/* Glow decoration behind logo */}
        <div className="absolute w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Logo Circle Badge */}
        <div className="flex flex-col items-center gap-4 animate-fade-in relative z-10">
          <div className="h-24 w-24 rounded-full bg-white border border-zinc-800/80 overflow-hidden flex items-center justify-center shadow-2xl shadow-cyan-500/10 shrink-0">
            <img 
              src="/logo.png" 
              alt="Job Finder Logo" 
              className="h-28 w-auto object-cover object-top scale-[1.5] translate-y-[4px]" 
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent font-sans">
            Job Finder
          </h1>
        </div>
        
        {/* Spinner & subtitle */}
        <div className="mt-8 flex flex-col items-center gap-3 relative z-10">
          <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center mt-1">Career Paths Made Simple</span>
        </div>
      </div>
    );
  }

  if (status === "loading" || (status === "authenticated" && loadingProfile)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground flex-col gap-4 font-sans transition-colors duration-300">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        <span className="text-sm font-semibold tracking-wider animate-pulse">Initializing Job Finder Portal...</span>
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
              <div className="h-12 w-12 rounded-full bg-white border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center shadow-sm shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Job Finder Logo" 
                  className="h-14 w-auto object-cover object-top scale-[1.5] translate-y-[2px]" 
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-855 dark:text-zinc-100 font-sans leading-none">Job Finder</h1>
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
  const isEngineering = user?.profile?.degree?.toLowerCase().includes("engineer") || 
                        user?.profile?.degree?.toLowerCase().includes("computer") ||
                        user?.profile?.degree?.toLowerCase().includes("tech");

  const totalSelectedCount = getSelectedJobsCount();
  const selectAllChecked = jobs.length > 0 && jobs.every(job => 
    applications.some(app => app.jobId === job.id) || selectedJobIds[job.id]
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/20 relative">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 dark:bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* RECRUITER DASHBOARD TAB */}
        {(activeTab === "posted_jobs" || activeTab === "applicants") && (
          <div className="p-8 max-w-5xl w-full mx-auto">
            <RecruiterDashboard onOpenPostJobModal={() => setIsPostJobModalOpen(true)} />
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
                      ? "Search AI/ML, Fullstack, Frontend, UI/UX Design..."
                      : "Search HR, Brand Manager, Consultant, Digital Marketing..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 focus:border-cyan-500 text-zinc-900 dark:text-zinc-200 pl-11 pr-4 py-3 rounded-xl outline-none text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                />
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
              ).map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    fetchJobs(user?.profile?.degree || "", tag);
                  }}
                  className={`text-[10px] px-2.5 py-1 rounded-md border font-semibold transition-all cursor-pointer ${
                    searchQuery === tag
                      ? "bg-cyan-100/50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800/60"
                      : "bg-white dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Source Platforms Filter */}
            <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-zinc-150 dark:border-zinc-850/40 mt-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Source Platforms:</span>
              {[
                { name: "All Platforms", value: "all" },
                { name: "Naukri.com", value: "naukri" },
                { name: "Internshala.com", value: "internshala" },
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
              <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-3xl space-y-3 bg-white dark:bg-zinc-950/20">
                <AlertCircle className="h-10 w-10 text-zinc-400 dark:text-zinc-650 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No Internships Found</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
                  Try adjusting search keywords or changing the track toggle to reload default roles.
                </p>
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
        {activeTab === "profile" && user && user.profile && (
          <div className="p-8 space-y-6 max-w-3xl w-full mx-auto">
            <div className="border-b border-zinc-250 dark:border-zinc-900 pb-6">
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                My Student Profile
              </h2>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 font-semibold mt-1">
                Customize your academic details, skills, and target roles to optimize job matching.
              </p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6 bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
              {/* Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="profileName" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="profileName"
                    type="text"
                    required
                    defaultValue={user.name}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-semibold"
                  />
                </div>

                {/* Email Address (Read-only) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-zinc-100/60 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 text-zinc-450 dark:text-zinc-500 px-4 py-3 rounded-xl text-sm font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Degree Track */}
              <div className="space-y-2">
                <label htmlFor="profileDegree" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
                  Degree / Track Spec
                </label>
                <input
                  id="profileDegree"
                  type="text"
                  required
                  defaultValue={user.profile.degree}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-semibold"
                />
              </div>

              {/* Target Roles */}
              <div className="space-y-2">
                <label htmlFor="profileRoles" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
                  Target Internship Roles (Comma separated)
                </label>
                <input
                  id="profileRoles"
                  type="text"
                  required
                  defaultValue={user.profile.targetRoles}
                  placeholder="e.g. AI/ML Intern, Data Analyst Intern"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-semibold"
                />
              </div>

              {/* Skills Area */}
              <div className="space-y-2">
                <label htmlFor="profileSkills" className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
                  Skills Inventory (Comma separated)
                </label>
                <textarea
                  id="profileSkills"
                  rows={4}
                  required
                  defaultValue={user.profile.skills}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl outline-none transition-all text-sm font-medium leading-relaxed font-mono"
                />
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold">Used directly for computing match scores and tailoring Cover Letters via Gemini AI.</p>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-850 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/10 hover:scale-[1.01] cursor-pointer"
                >
                  {savingProfile ? "Saving Profile..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: APPLICATIONS DASHBOARD */}
        {activeTab === "applications" && (
          <div className="p-8 space-y-6 max-w-5xl w-full mx-auto">
            <div className="border-b border-zinc-250 dark:border-zinc-900 pb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  Track Applications
                </h2>
                <p className="text-xs text-zinc-555 dark:text-zinc-400 font-semibold mt-1">
                  Track batch apply history and generated AI cover letters.
                </p>
              </div>
              <button
                onClick={fetchApplications}
                disabled={loadingApplications}
                className="p-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-4.5 w-4.5 ${loadingApplications ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                <div>
                  <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Submitted Apps</span>
                  <span className="text-2xl font-black text-zinc-850 dark:text-zinc-100 mt-1 block">{applications.length}</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                <div>
                  <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Completed Gen</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {applications.filter(app => app.coverLetter).length}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-555 dark:text-emerald-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                <div>
                  <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Avg Match Score</span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">85%</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Applications List */}
            {loadingApplications ? (
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
              <div className="space-y-3.5">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-zinc-850 dark:text-zinc-200">{app.title}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">{app.company} • {app.location || "Remote"}</p>
                      
                      <div className="flex items-center gap-3 text-[10px] text-zinc-450 dark:text-zinc-500 mt-2 font-semibold">
                        <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">{app.source}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {app.coverLetter && (
                        <button
                          onClick={() => setViewingCoverLetterApp(app)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
                        >
                          <FileText className="h-3.5 w-3.5" /> Cover Letter
                        </button>
                      )}
                      
                      {app.applyUrl && (
                        <a
                          href={app.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5 font-bold animate-pulse"
                        >
                          Job Link <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      <span className="text-[10px] px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-705 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 rounded-md font-bold uppercase shrink-0">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
