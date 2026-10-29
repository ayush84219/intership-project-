export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  logo: string;
  source: string;
  applyUrl: string;
  description: string;
  skills: string[];
  salary: string;
  category: string;
  degreeType?: string;
  postedDaysAgo?: number;
  createdAt?: string;
  isRecruiterPosted?: boolean;
  isVerified?: boolean;
}

export interface JobSearchQueryParams {
  query?: string;
  degree?: string;
  platform?: string;
  location?: string;
  excludeLocation?: string;
  datePosted?: string;
}

const NOW = Date.now();
const ONE_DAY = 24 * 60 * 60 * 1000;

export const REGION_CLUSTERS: Record<string, string[]> = {
  "delhi ncr": ["delhi", "new delhi", "noida", "gurugram", "gurgaon", "ghaziabad", "faridabad", "ncr"],
  "delhi": ["delhi", "new delhi", "ncr", "delhi ncr", "noida", "gurugram", "gurgaon"],
  "punjab": ["punjab", "ludhiana", "mohali", "chandigarh", "amritsar", "jalandhar", "patiala"],
  "karnataka": ["karnataka", "bengaluru", "bangalore", "mysore", "mangalore"],
  "maharashtra": ["maharashtra", "mumbai", "pune", "nagpur", "navi mumbai", "thane"],
  "tamil nadu": ["tamil nadu", "chennai", "coimbatore"],
  "telangana": ["telangana", "hyderabad", "secunderabad"],
  "uttar pradesh": ["uttar pradesh", "noida", "greater noida", "lucknow", "kanpur"],
  "haryana": ["haryana", "gurugram", "gurgaon", "faridabad", "panipat"]
};

export function matchesLocation(jobLocation: string | undefined | null, targetLocation: string | undefined | null): boolean {
  if (!targetLocation || !targetLocation.trim()) return true;
  if (!jobLocation) return false;

  const loc = jobLocation.toLowerCase();
  const target = targetLocation.toLowerCase().trim();

  // Remote, WFH or Anywhere opportunities are valid across all location filters
  if (loc.includes("remote") || loc.includes("wfh") || loc.includes("anywhere")) {
    return true;
  }

  // Direct substring match
  if (loc.includes(target) || target.includes(loc)) {
    return true;
  }

  // Check regional city clusters
  for (const [region, cities] of Object.entries(REGION_CLUSTERS)) {
    // If target is or contains region (e.g. "Delhi NCR")
    if (target.includes(region) || target === region) {
      if (cities.some(c => loc.includes(c))) return true;
    }
    // If target is a city inside that cluster (e.g. "Noida") and job says "Delhi NCR" or "Noida"
    if (cities.includes(target)) {
      if (loc.includes(region) || cities.some(c => loc.includes(c))) return true;
    }
  }

  // Check individual words with length >= 3
  const targetWords = target.split(/[\s,]+/).filter(w => w.length >= 3);
  if (targetWords.some(w => loc.includes(w))) {
    return true;
  }

  return false;
}

export function isLocationExcluded(jobLocation: string | undefined | null, excludeLocation: string | undefined | null): boolean {
  if (!excludeLocation || !excludeLocation.trim()) return false;
  if (!jobLocation) return false;

  const loc = jobLocation.toLowerCase();
  const exclude = excludeLocation.toLowerCase().trim();

  if (loc.includes(exclude)) return true;

  for (const [region, cities] of Object.entries(REGION_CLUSTERS)) {
    if (exclude.includes(region) || exclude === region) {
      if (cities.some(c => loc.includes(c))) return true;
    }
    if (cities.includes(exclude)) {
      if (loc.includes(region) || cities.some(c => loc.includes(c))) return true;
    }
  }

  return false;
}

export const MOCK_JOBS: Job[] = [
  // ── Tech / Engineering Track ───────────────────────────────────────────────
  {
    id: "tech-1",
    title: "AI/ML Research Intern",
    company: "Google DeepMind",
    location: "Ludhiana, Punjab (Hybrid)",
    logo: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    source: "LinkedIn",
    applyUrl: "https://careers.google.com/jobs/results/mock-ai-ml-intern",
    description: "Work on training and evaluating state-of-the-art multimodal transformer models, exploring LLM reasoning capabilities, and optimizing inference pipelines for edge devices.",
    skills: ["Python", "PyTorch", "JAX", "Transformers", "Deep Learning"],
    salary: "₹1,20,000 / month",
    category: "AI/ML & Data Science",
    degreeType: "engineering",
    postedDaysAgo: 1,
    createdAt: new Date(NOW - 1 * ONE_DAY).toISOString()
  },
  {
    id: "tech-2",
    title: "Frontend React & Next.js Intern",
    company: "Zomato",
    location: "Delhi NCR (Remote)",
    logo: "",
    source: "Internshala.com",
    applyUrl: "https://internshala.com/internship/detail/frontend-react-intern-zomato",
    description: "Develop responsive, accessible, high-performance customer-facing interfaces using React 19, Next.js App Router, TypeScript, and Tailwind CSS for millions of daily active diners.",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript"],
    salary: "₹45,000 / month",
    category: "Software Development",
    degreeType: "engineering",
    postedDaysAgo: 0,
    createdAt: new Date(NOW).toISOString()
  },
  {
    id: "tech-3",
    title: "Full Stack Web Developer Intern",
    company: "Flipkart",
    location: "Bengaluru, Karnataka (Hybrid)",
    logo: "",
    source: "Naukri.com",
    applyUrl: "https://www.naukri.com/job-listings-flipkart-fullstack-intern",
    description: "Collaborate with core marketplace engineering teams building scalable microservices in Node.js, distributed caches with Redis, and reactive user dashboards with React.",
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "Express", "Redis"],
    salary: "₹65,000 / month",
    category: "Software Development",
    degreeType: "engineering",
    postedDaysAgo: 2,
    createdAt: new Date(NOW - 2 * ONE_DAY).toISOString()
  },
  {
    id: "tech-4",
    title: "Python & Machine Learning Intern",
    company: "Swiggy",
    location: "Bengaluru, Karnataka (Onsite)",
    logo: "",
    source: "Apna.com",
    applyUrl: "https://apna.co/jobs/swiggy-python-ml-intern",
    description: "Build algorithmic routing systems, ETA prediction models, and demand-forecasting algorithms using Python, Scikit-Learn, PyTorch, and Apache Kafka streaming.",
    skills: ["Python", "Machine Learning", "PyTorch", "Data Science", "SQL"],
    salary: "₹50,000 / month",
    category: "AI/ML & Data Science",
    degreeType: "engineering",
    postedDaysAgo: 3,
    createdAt: new Date(NOW - 3 * ONE_DAY).toISOString()
  },
  {
    id: "tech-5",
    title: "Cloud & DevOps Infrastructure Intern",
    company: "Paytm",
    location: "Noida, Delhi NCR (Hybrid)",
    logo: "",
    source: "Shine.com",
    applyUrl: "https://www.shine.com/jobs/paytm-cloud-devops-intern",
    description: "Help automate CI/CD release pipelines on AWS and GCP. Deploy containerized microservices via Kubernetes, manage Terraform infrastructure as code, and monitor Prometheus metrics.",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform"],
    salary: "₹40,000 / month",
    category: "DevOps & Cloud",
    degreeType: "engineering",
    postedDaysAgo: 4,
    createdAt: new Date(NOW - 4 * ONE_DAY).toISOString()
  },
  {
    id: "tech-6",
    title: "Mobile App Developer Intern (Flutter)",
    company: "Zepto",
    location: "Mumbai, Maharashtra (Onsite)",
    logo: "",
    source: "Internshala.com",
    applyUrl: "https://internshala.com/internship/detail/flutter-developer-zepto",
    description: "Ship ultra-fast, smooth 60fps mobile interfaces for delivery rider and consumer apps. Work with Dart, Flutter state management (Bloc/Riverpod), and real-time WebSockets.",
    skills: ["Flutter", "Dart", "Mobile App", "REST APIs", "Git"],
    salary: "₹55,000 / month",
    category: "Mobile Development",
    degreeType: "engineering",
    postedDaysAgo: 1,
    createdAt: new Date(NOW - 1 * ONE_DAY).toISOString()
  },
  {
    id: "tech-7",
    title: "Backend Node.js & Go Intern",
    company: "Razorpay",
    location: "Bengaluru, Karnataka (Remote)",
    logo: "",
    source: "Naukri.com",
    applyUrl: "https://www.naukri.com/job-listings-razorpay-backend-intern",
    description: "Build robust transactional APIs handling high-volume payments. Focus on database concurrency, fault-tolerant webhook dispatchers, and PostgreSQL query optimizations.",
    skills: ["Node.js", "Go", "PostgreSQL", "REST APIs", "System Design"],
    salary: "₹75,000 / month",
    category: "Software Development",
    degreeType: "engineering",
    postedDaysAgo: 5,
    createdAt: new Date(NOW - 5 * ONE_DAY).toISOString()
  },
  {
    id: "tech-8",
    title: "Data Engineering & Analytics Intern",
    company: "PhonePe",
    location: "Bengaluru, Karnataka (Hybrid)",
    logo: "",
    source: "Apna.com",
    applyUrl: "https://apna.co/jobs/phonepe-data-engineering-intern",
    description: "Construct scalable data lakes, ETL pipelines, and reporting marts using Apache Spark, BigQuery, and Snowflake for real-time payment fraud anomaly detection.",
    skills: ["SQL", "Python", "ETL", "Spark", "Data Analysis", "Snowflake"],
    salary: "₹60,000 / month",
    category: "AI/ML & Data Science",
    degreeType: "engineering",
    postedDaysAgo: 2,
    createdAt: new Date(NOW - 2 * ONE_DAY).toISOString()
  },
  {
    id: "tech-9",
    title: "Cybersecurity & Systems Intern",
    company: "Infosys",
    location: "Mohali, Punjab (Hybrid)",
    logo: "",
    source: "Shine.com",
    applyUrl: "https://www.shine.com/jobs/infosys-security-intern",
    description: "Perform vulnerability assessments, review application security posture, assist in SOC analysis, and draft automated incident response playbooks.",
    skills: ["Network Security", "Linux", "Python", "Vulnerability Assessment", "Cybersecurity"],
    salary: "₹35,000 / month",
    category: "Cybersecurity",
    degreeType: "engineering",
    postedDaysAgo: 6,
    createdAt: new Date(NOW - 6 * ONE_DAY).toISOString()
  },
  {
    id: "tech-10",
    title: "UI/UX Product Design Intern",
    company: "Urban Company",
    location: "Gurugram, Delhi NCR (Hybrid)",
    logo: "",
    source: "Internshala.com",
    applyUrl: "https://internshala.com/internship/detail/ui-ux-design-urban-company",
    description: "Create design systems, interactive prototypes in Figma, conduct user interviews, and translate complex service booking workflows into intuitive user experiences.",
    skills: ["Figma", "UI Design", "UX Research", "Wireframing", "Prototyping"],
    salary: "₹40,000 / month",
    category: "Design",
    degreeType: "engineering",
    postedDaysAgo: 1,
    createdAt: new Date(NOW - 1 * ONE_DAY).toISOString()
  },
  {
    id: "tech-11",
    title: "Software Engineer Intern (Frontend)",
    company: "Meta",
    location: "Ludhiana, Punjab (Onsite)",
    logo: "",
    source: "LinkedIn",
    applyUrl: "https://careers.meta.com/jobs/results/mock-swe-intern",
    description: "Collaborate with international product engineering teams to build accessible, ultra-responsive web applications with React, TypeScript, and Relay GraphQL.",
    skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "GraphQL"],
    salary: "₹1,10,000 / month",
    category: "Software Development",
    degreeType: "engineering",
    postedDaysAgo: 8,
    createdAt: new Date(NOW - 8 * ONE_DAY).toISOString()
  },
  {
    id: "tech-12",
    title: "UI/UX & Product Design Intern",
    company: "Zomato",
    location: "Delhi NCR (Hybrid)",
    logo: "",
    source: "Naukri.com",
    applyUrl: "https://www.naukri.com/job-listings-zomato-ui-ux-intern",
    description: "Design sleek, customer-centric food ordering flows, design system components in Figma, and build interactive high-fidelity micro-interactions.",
    skills: ["Figma", "UI Design", "UX Research", "Prototyping", "Wireframing"],
    salary: "₹45,000 / month",
    category: "Design",
    degreeType: "engineering",
    postedDaysAgo: 1,
    createdAt: new Date(NOW - 1 * ONE_DAY).toISOString()
  },
  {
    id: "tech-13",
    title: "Product Designer (UI/UX) Intern",
    company: "Swiggy",
    location: "Bengaluru, Karnataka (Onsite)",
    logo: "",
    source: "Apna.com",
    applyUrl: "https://apna.co/jobs/swiggy-product-design-intern",
    description: "Work with quick-commerce product managers and user researchers to design delightful consumer checkout flows, typography scales, and motion prototypes in Figma.",
    skills: ["UI Design", "UX Research", "Figma", "Design Systems", "Prototyping"],
    salary: "₹50,000 / month",
    category: "Design",
    degreeType: "engineering",
    postedDaysAgo: 2,
    createdAt: new Date(NOW - 2 * ONE_DAY).toISOString()
  },
  {
    id: "tech-14",
    title: "UI/UX Interaction Design Intern",
    company: "Zepto",
    location: "Mumbai, Maharashtra (Hybrid)",
    logo: "",
    source: "Shine.com",
    applyUrl: "https://www.shine.com/jobs/zepto-ui-ux-design-intern",
    description: "Create rapid user journey wireframes, design intuitive delivery tracking animations, and conduct A/B testing on checkout funnel screens.",
    skills: ["UI Design", "Figma", "User Journey", "Wireframing", "Interaction Design"],
    salary: "₹42,000 / month",
    category: "Design",
    degreeType: "engineering",
    postedDaysAgo: 3,
    createdAt: new Date(NOW - 3 * ONE_DAY).toISOString()
  },
  {
    id: "tech-15",
    title: "UX Research & Visual Design Intern",
    company: "Infosys",
    location: "Mohali, Punjab (Hybrid)",
    logo: "",
    source: "Internshala.com",
    applyUrl: "https://internshala.com/internship/detail/infosys-ux-design-intern",
    description: "Conduct stakeholder interviews, build usability test plans, document UX heuristic evaluations, and deliver high-fidelity responsive web screens in Figma.",
    skills: ["UX Research", "UI Design", "Figma", "Heuristic Evaluation", "Visual Design"],
    salary: "₹30,000 / month",
    category: "Design",
    degreeType: "engineering",
    postedDaysAgo: 2,
    createdAt: new Date(NOW - 2 * ONE_DAY).toISOString()
  },

  // ── Business / Management / BBA Track ──────────────────────────────────────
  {
    id: "biz-1",
    title: "Human Resources (HR) Generalist Intern",
    company: "Tata Group",
    location: "Mumbai, Maharashtra (Hybrid)",
    logo: "",
    source: "Internshala.com",
    applyUrl: "https://internshala.com/internship/detail/hr-generalist-tata",
    description: "Coordinate campus recruitment cycles, organize employee engagement activities, update HRIS systems, and assist in talent onboarding and compliance documentation.",
    skills: ["HR Management", "Communication", "Talent Acquisition", "Excel", "Onboarding"],
    salary: "₹30,000 / month",
    category: "Human Resources",
    degreeType: "bba",
    postedDaysAgo: 0,
    createdAt: new Date(NOW).toISOString()
  },
  {
    id: "biz-2",
    title: "Management Consulting Intern",
    company: "McKinsey & Company",
    location: "Gurugram, Delhi NCR (Onsite)",
    logo: "",
    source: "Naukri.com",
    applyUrl: "https://www.naukri.com/job-listings-mckinsey-consulting-intern",
    description: "Conduct primary market research, build executive financial models in Excel, analyze supply chain bottlenecks, and synthesize findings for Fortune 500 leadership.",
    skills: ["Management Consulting", "Financial Modeling", "Market Research", "Strategy", "PowerPoint"],
    salary: "₹80,000 / month",
    category: "Management",
    degreeType: "bba",
    postedDaysAgo: 1,
    createdAt: new Date(NOW - 1 * ONE_DAY).toISOString()
  },
  {
    id: "biz-3",
    title: "Digital Brand & Growth Marketing Intern",
    company: "Nykaa",
    location: "Mumbai, Maharashtra (Hybrid)",
    logo: "",
    source: "Apna.com",
    applyUrl: "https://apna.co/jobs/nykaa-brand-marketing-intern",
    description: "Spearhead influencer outreach, craft social media campaigns across Instagram/YouTube, analyze Google Analytics acquisition funnels, and assist in brand collaborations.",
    skills: ["Brand Marketing", "Social Media Marketing", "Content Strategy", "Google Analytics", "Communication"],
    salary: "₹35,000 / month",
    category: "Marketing",
    degreeType: "bba",
    postedDaysAgo: 2,
    createdAt: new Date(NOW - 2 * ONE_DAY).toISOString()
  },
  {
    id: "biz-4",
    title: "Corporate Financial Analyst Intern",
    company: "HDFC Bank",
    location: "Mumbai, Maharashtra (Onsite)",
    logo: "",
    source: "Shine.com",
    applyUrl: "https://www.shine.com/jobs/hdfc-financial-analyst-intern",
    description: "Perform credit appraisal reviews, variance analysis of quarterly branch financials, budget forecasting, and compile comprehensive risk assessment reports.",
    skills: ["Financial Analyst", "Corporate Finance", "Excel", "Accounting", "Financial Modeling"],
    salary: "₹42,000 / month",
    category: "Finance",
    degreeType: "bba",
    postedDaysAgo: 3,
    createdAt: new Date(NOW - 3 * ONE_DAY).toISOString()
  },
  {
    id: "biz-5",
    title: "HR Talent Acquisition Intern",
    company: "Deloitte",
    location: "Ludhiana, Punjab (Onsite)",
    logo: "",
    source: "LinkedIn",
    applyUrl: "https://careers.deloitte.com/jobs/results/mock-hr-intern",
    description: "Assist with university recruitment drives, resume screening across ATS portals, scheduling behavioral interviews, and tracking candidate pipeline metrics.",
    skills: ["HR Generalist", "Talent Acquisition", "Recruitment", "Communication", "Excel"],
    salary: "₹35,000 / month",
    category: "Human Resources",
    degreeType: "bba",
    postedDaysAgo: 1,
    createdAt: new Date(NOW - 1 * ONE_DAY).toISOString()
  },
  {
    id: "biz-6",
    title: "Operations & Business Strategy Intern",
    company: "Reliance Retail",
    location: "Delhi NCR (Hybrid)",
    logo: "",
    source: "Internshala.com",
    applyUrl: "https://internshala.com/internship/detail/operations-reliance-retail",
    description: "Analyze retail store inventory metrics, streamline vendor onboarding workflows, track delivery SLAs, and prepare weekly performance reports for regional heads.",
    skills: ["Operations", "Business Strategy", "Supply Chain", "Data Analysis", "Excel"],
    salary: "₹32,000 / month",
    category: "Management",
    degreeType: "bba",
    postedDaysAgo: 2,
    createdAt: new Date(NOW - 2 * ONE_DAY).toISOString()
  },
  {
    id: "biz-7",
    title: "Product Marketing & Communications Intern",
    company: "Unacademy",
    location: "Bengaluru, Karnataka (Remote)",
    logo: "",
    source: "Naukri.com",
    applyUrl: "https://www.naukri.com/job-listings-unacademy-product-marketing",
    description: "Design email newsletters, collaborate with product managers on feature launch playbooks, draft case studies, and measure user retention across cohorts.",
    skills: ["Product Marketing", "Content Writing", "Brand Strategy", "Email Marketing", "SEO"],
    salary: "₹38,000 / month",
    category: "Marketing",
    degreeType: "bba",
    postedDaysAgo: 4,
    createdAt: new Date(NOW - 4 * ONE_DAY).toISOString()
  },
  {
    id: "biz-8",
    title: "Talent Sourcing & Campus Recruiter Intern",
    company: "Wipro",
    location: "Mohali, Punjab (Hybrid)",
    logo: "",
    source: "Apna.com",
    applyUrl: "https://apna.co/jobs/wipro-campus-recruiter-intern",
    description: "Engage with college placement cells across northern state universities, manage candidate assessments, and support HR compliance and pre-employment verifications.",
    skills: ["HR Generalist", "Campus Recruitment", "Candidate Screening", "Communication", "HR Management"],
    salary: "₹28,000 / month",
    category: "Human Resources",
    degreeType: "bba",
    postedDaysAgo: 5,
    createdAt: new Date(NOW - 5 * ONE_DAY).toISOString()
  },
  {
    id: "biz-9",
    title: "Investment Banking & Equity Research Intern",
    company: "Kotak Mahindra Bank",
    location: "Mumbai, Maharashtra (Onsite)",
    logo: "",
    source: "Shine.com",
    applyUrl: "https://www.shine.com/jobs/kotak-equity-research-intern",
    description: "Conduct fundamental valuation on mid-cap listed entities, review balance sheets, track macroeconomic policy updates, and build DCF discounted cash flow models.",
    skills: ["Equity Research", "Financial Analyst", "Valuation", "Corporate Finance", "Excel"],
    salary: "₹50,000 / month",
    category: "Finance",
    degreeType: "bba",
    postedDaysAgo: 3,
    createdAt: new Date(NOW - 3 * ONE_DAY).toISOString()
  },
  {
    id: "biz-10",
    title: "Financial Analyst Intern",
    company: "PepsiCo",
    location: "Mohali, Punjab (Hybrid)",
    logo: "",
    source: "LinkedIn",
    applyUrl: "https://careers.pepsico.com/jobs/results/mock-finance-intern",
    description: "Audit manufacturing plant operational budgets, reconcile supplier invoices, assist with monthly variance reporting, and identify cost-saving initiatives.",
    skills: ["Financial Analyst", "Excel", "Data Analysis", "Cost Accounting", "Corporate Finance"],
    salary: "₹40,000 / month",
    category: "Finance",
    degreeType: "bba",
    postedDaysAgo: 7,
    createdAt: new Date(NOW - 7 * ONE_DAY).toISOString()
  }
];

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

function detectSkillsFromDescription(description: string, query: string): string[] {
  const descriptionLower = (description || "").toLowerCase();
  const skillPool = [
    "Python", "React", "TypeScript", "JavaScript", "PyTorch", "TensorFlow",
    "Node.js", "SQL", "Excel", "Figma", "UI Design", "Communication", "Java",
    "C++", "AWS", "Docker", "Git", "Project Management", "Marketing", "HR",
    "Financial Modeling", "Brand Strategy", "Data Analysis", "Accounting",
    "UX Research", "Wireframing", "Prototyping"
  ];
  const detectedSkills = skillPool.filter(skill => descriptionLower.includes(skill.toLowerCase()));

  if (detectedSkills.length === 0) {
    if (query.toLowerCase().includes("ai") || query.toLowerCase().includes("ml")) {
      detectedSkills.push("Python", "PyTorch", "Machine Learning");
    } else if (query.toLowerCase().includes("hr") || query.toLowerCase().includes("manager") || query.toLowerCase().includes("business")) {
      detectedSkills.push("Communication", "HR Management", "Excel");
    } else if (query.toLowerCase().includes("ui") || query.toLowerCase().includes("ux") || query.toLowerCase().includes("design")) {
      detectedSkills.push("Figma", "UI Design", "UX Research");
    } else {
      detectedSkills.push("Problem Solving", "Teamwork", "Analytical Skills");
    }
  }

  return detectedSkills;
}

export async function searchJobs(params: JobSearchQueryParams): Promise<{ jobs: Job[]; source: string }> {
  const rawQuery = params.query ? params.query.trim() : "";
  const degree = (params.degree || "engineering").toLowerCase();
  const platform = (params.platform || "all").toLowerCase();
  const filterLocation = params.location ? params.location.trim() : "";
  const excludeLocation = params.excludeLocation ? params.excludeLocation.trim() : "";
  const datePosted = params.datePosted ? params.datePosted.trim() : "";

  const isBusinessTrack = 
    degree.includes("bba") || 
    degree.includes("business") || 
    degree.includes("mba") || 
    degree.includes("commerce") || 
    degree.includes("marketing") || 
    degree.includes("finance") || 
    degree.includes("management");

  // Format live search query
  let searchQuery = rawQuery;
  if (!searchQuery) {
    searchQuery = isBusinessTrack ? "HR Marketing Business Management Intern" : "Software Developer Engineer Intern";
  } else {
    if (!searchQuery.toLowerCase().includes("intern")) {
      searchQuery = `${searchQuery} internship`;
    }
  }

  // Include location name in query string so Google handles natural geography without rejecting parameters
  if (filterLocation) {
    searchQuery = `${searchQuery} ${filterLocation}`;
  }

  if (platform !== "all" && platform !== "recruiter" && platform !== "direct") {
    searchQuery = `${searchQuery} ${platform}`;
  }

  // Live SerpApi Search
  const serpapiKey = process.env.SERPAPI_API_KEY;
  const trySerpApi = !!(serpapiKey && serpapiKey !== "" && !serpapiKey.startsWith("YOUR_"));

  if (trySerpApi) {
    try {
      let serpQuery = searchQuery;
      // Always pass standard India location to avoid "Unsupported location" API rejection
      let locationParam = "India";
      let domainParam = "google.co.in";
      let glParam = "in";

      if (excludeLocation) {
        serpQuery = `${serpQuery} -"${excludeLocation}"`;
      }

      let searchUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(serpQuery)}&location=${encodeURIComponent(locationParam)}&google_domain=${domainParam}&hl=en&gl=${glParam}&api_key=${serpapiKey}`;
      if (datePosted) {
        searchUrl += `&chips=${encodeURIComponent(`date_posted:${datePosted}`)}`;
      }

      const response = await fetchWithTimeout(searchUrl, { method: "GET" }, 4500);
      if (response.ok) {
        const result = await response.json();
        if (result.jobs_results && Array.isArray(result.jobs_results) && result.jobs_results.length > 0) {
          let jobs: Job[] = result.jobs_results.map((job: any, index: number) => {
            const detectedSkills = detectSkillsFromDescription(job.description || "", rawQuery || searchQuery);
            let salary = "Not disclosed";
            if (job.detected_extensions?.salary) {
              salary = job.detected_extensions.salary;
            } else if (job.extensions && job.extensions.length > 0) {
              const salaryExt = job.extensions.find((ext: string) => 
                ext.includes("₹") || ext.includes("$") || ext.includes("month") || ext.includes("year") || ext.includes("hour")
              );
              if (salaryExt) salary = salaryExt;
            }

            let applyUrl = job.source_link || job.share_link || "";
            if (job.apply_options && job.apply_options.length > 0) {
              applyUrl = job.apply_options[0].link || applyUrl;
            }

            let cleanSource = job.via ? job.via.replace(/^via\s+/i, "") : "Google Jobs";

            return {
              id: job.job_id || `serp-${index}-${Date.now()}`,
              title: job.title || job.job_title,
              company: job.company_name,
              location: job.location || "India",
              logo: job.thumbnail || "",
              source: cleanSource,
              applyUrl,
              description: job.description || "",
              skills: detectedSkills,
              salary,
              category: job.detected_extensions?.schedule_type || (isBusinessTrack ? "Business" : "Engineering"),
              degreeType: isBusinessTrack ? "bba" : "engineering"
            };
          });

          // Filter live results
          if (excludeLocation) {
            jobs = jobs.filter(j => !isLocationExcluded(j.location, excludeLocation));
          }
          if (filterLocation) {
            jobs = jobs.filter(j => matchesLocation(j.location, filterLocation));
          }
          if (platform !== "all" && platform !== "recruiter" && platform !== "direct") {
            jobs = jobs.filter(j => (j.source || "").toLowerCase().includes(platform));
          }

          if (jobs.length > 0) {
            return { jobs, source: "live_google_jobs" };
          }
        }
      }
    } catch {
      // Clean fallback without crashing
    }
  }

  // ── Curated Platform Catalog Fallback ──────────────────────────────────────
  let filteredCatalog = MOCK_JOBS.filter(job => {
    // 1. Strict Track / Degree Matching
    const trackMatch = isBusinessTrack ? job.degreeType === "bba" : job.degreeType === "engineering";
    return trackMatch;
  });

  // 2. Keyword Search Query Matching
  if (rawQuery) {
    const qNormalized = rawQuery.toLowerCase().replace(/[\/\-_]/g, " ");
    const terms = qNormalized.split(/\s+/).filter(Boolean);
    filteredCatalog = filteredCatalog.filter(job => {
      const text = `${job.title} ${job.company} ${job.description} ${job.category} ${job.skills.join(" ")}`.toLowerCase().replace(/[\/\-_]/g, " ");
      return terms.every(term => text.includes(term)) || terms.some(term => text.includes(term) && term.length > 2) || text.includes(qNormalized);
    });
  }

  // 3. Platform Filter Matching
  if (platform !== "all" && platform !== "recruiter" && platform !== "direct") {
    filteredCatalog = filteredCatalog.filter(job => 
      (job.source || "").toLowerCase().includes(platform)
    );
  }

  // 4. Location Inclusion Filter (Using regional cluster intelligence)
  if (filterLocation) {
    filteredCatalog = filteredCatalog.filter(job => 
      matchesLocation(job.location, filterLocation)
    );
  }

  // 5. Exclude Location Filter
  if (excludeLocation) {
    filteredCatalog = filteredCatalog.filter(job => 
      !isLocationExcluded(job.location, excludeLocation)
    );
  }

  // 6. Date Posted Filter
  if (datePosted) {
    filteredCatalog = filteredCatalog.filter(job => {
      const days = job.postedDaysAgo ?? 0;
      if (datePosted === "today") return days <= 1;
      if (datePosted === "3days") return days <= 3;
      if (datePosted === "week") return days <= 7;
      if (datePosted === "month") return days <= 30;
      return true;
    });
  }

  return { jobs: filteredCatalog, source: "verified_portal_catalog" };
}
