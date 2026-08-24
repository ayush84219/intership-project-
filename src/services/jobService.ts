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
}

export interface JobSearchQueryParams {
  query?: string;
  degree?: string;
  platform?: string;
  location?: string;
  excludeLocation?: string;
  datePosted?: string;
}

const MOCK_JOBS: Job[] = [
  {
    id: "mock-1",
    title: "AI/ML Research Intern",
    company: "Google DeepMind",
    location: "Ludhiana, Punjab (Hybrid)",
    logo: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    source: "LinkedIn",
    applyUrl: "https://careers.google.com/jobs/results/mock-ai-ml-intern",
    description: "Join the Google DeepMind team. You will work on training and evaluating state-of-the-art transformer models, exploring multi-modal generative systems, and improving inference latency for next-generation assistants. Requires proficiency in PyTorch/JAX and a solid understanding of LLM architectures.",
    skills: ["Python", "PyTorch", "JAX", "Transformers", "Deep Learning"],
    salary: "$45 - $60 / hr",
    category: "AI/ML",
    degreeType: "engineering"
  },
  {
    id: "mock-2",
    title: "Generative AI Engineering Intern",
    company: "Microsoft",
    location: "Redmond, WA (Remote)",
    logo: "",
    source: "Indeed",
    applyUrl: "https://careers.microsoft.com/jobs/results/mock-gen-ai-intern",
    description: "Work on Azure AI services. You will build and optimize large-scale language model workflows, deploy fine-tuned open-source models, and integrate generative search experiences into Microsoft Office suite. Experience with LangChain, Semantic Kernel, and vector databases is a plus.",
    skills: ["Python", "LLMs", "LangChain", "Vector Databases", "Azure"],
    salary: "$42 - $55 / hr",
    category: "AI/ML",
    degreeType: "engineering"
  },
  {
    id: "mock-3",
    title: "Software Engineer Intern (Frontend)",
    company: "Meta",
    location: "Ludhiana, Punjab (Onsite)",
    logo: "",
    source: "LinkedIn",
    applyUrl: "https://careers.meta.com/jobs/results/mock-swe-intern",
    description: "Collaborate with product teams to build highly responsive user interfaces for billions of global users. You will work extensively with React, TypeScript, and modern CSS frameworks, focusing on performance, accessibility, and internationalization.",
    skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind"],
    salary: "$40 - $52 / hr",
    category: "Software Development",
    degreeType: "engineering"
  },
  {
    id: "mock-4",
    title: "AI Alignment & Safety Intern",
    company: "OpenAI",
    location: "San Francisco, CA (Onsite)",
    logo: "",
    source: "Glassdoor",
    applyUrl: "https://openai.com/careers/mock-alignment-safety-intern",
    description: "Conduct research on model safety, alignment techniques, reinforcement learning from human feedback (RLHF), and reward modeling. Help us build systems that behave beneficially and conform to human values.",
    skills: ["PyTorch", "Python", "RLHF", "Reinforcement Learning", "Model Safety"],
    salary: "$50 - $70 / hr",
    category: "AI/ML",
    degreeType: "engineering"
  },
  {
    id: "mock-5",
    title: "Fullstack Developer Intern",
    company: "Stripe",
    location: "New York, NY (Hybrid)",
    logo: "",
    source: "Jooble",
    applyUrl: "https://stripe.com/jobs/results/mock-fullstack-intern",
    description: "Build developer-focused payment APIs and dashboard interfaces. Work closely with product, engineering, and operations across React, Ruby on Rails, and Go to enable global commerce.",
    skills: ["React", "TypeScript", "Ruby", "Go", "SQL", "REST APIs"],
    salary: "$38 - $50 / hr",
    category: "Software Development",
    degreeType: "engineering"
  },
  {
    id: "mock-6",
    title: "HR Talent Acquisition Intern",
    company: "Deloitte",
    location: "Ludhiana, Punjab (Onsite)",
    logo: "",
    source: "LinkedIn",
    applyUrl: "https://careers.deloitte.com/jobs/results/mock-hr-intern",
    description: "Assist with talent acquisition, campus recruitment drives, onboarding, and employee engagement initiatives. Work closely with human resource managers to filter resumes, coordinate interviews, and maintain database integrity.",
    skills: ["Communication", "Talent Acquisition", "Excel", "Onboarding", "HR Management"],
    salary: "$25 - $32 / hr",
    category: "Human Resources",
    degreeType: "bba"
  },
  {
    id: "mock-7",
    title: "Management Consultant Intern",
    company: "McKinsey & Company",
    location: "Boston, MA",
    logo: "",
    source: "Glassdoor",
    applyUrl: "https://careers.mckinsey.com/jobs/results/mock-consultant-intern",
    description: "Help leading organizations solve their most complex strategic and operational challenges. You will perform market research, build financial models, analyze organizational workflows, and present findings to leadership.",
    skills: ["Financial Modeling", "Market Research", "Strategy", "Excel", "PowerPoint"],
    salary: "$30 - $40 / hr",
    category: "Management",
    degreeType: "bba"
  },
  {
    id: "mock-8",
    title: "Digital Brand Specialist Intern",
    company: "Nike",
    location: "Beaverton, OR (Hybrid)",
    logo: "",
    source: "Indeed",
    applyUrl: "https://careers.nike.com/jobs/results/mock-brand-intern",
    description: "Join the digital marketing team on global sports campaigns. Assist with social media management, content briefs, campaign tracking, athlete partnerships, and customer sentiment analytics.",
    skills: ["Social Media Marketing", "Content Strategy", "Brand Strategy", "Data Analysis"],
    salary: "$24 - $30 / hr",
    category: "Marketing",
    degreeType: "bba"
  },
  {
    id: "mock-9",
    title: "Financial Analyst Intern",
    company: "PepsiCo",
    location: "Mohali, Punjab (Hybrid)",
    logo: "",
    source: "LinkedIn",
    applyUrl: "https://careers.pepsico.com/jobs/results/mock-finance-intern",
    description: "Analyze product line performance, manage budget forecasts, and assist with monthly and quarterly financial reporting. Work closely with the corporate finance division to identify cost optimization opportunities.",
    skills: ["Corporate Finance", "Excel", "Data Analysis", "Accounting", "Financial Reporting"],
    salary: "$26 - $33 / hr",
    category: "Finance",
    degreeType: "bba"
  },
  {
    id: "mock-10",
    title: "UI/UX Product Design Intern",
    company: "Apple",
    location: "Cupertino, CA",
    logo: "",
    source: "LinkedIn",
    applyUrl: "https://careers.apple.com/jobs/results/mock-design-intern",
    description: "Collaborate with hardware and software engineering teams to design next-generation user interfaces for iOS and macOS systems. Create wireframes, interactive prototypes, and compile UI style guidelines in Figma.",
    skills: ["Figma", "UI Design", "UX Research", "Wireframing", "Prototyping"],
    salary: "$35 - $48 / hr",
    category: "Design",
    degreeType: "engineering"
  }
];

let requestCounter = 0;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
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
    "C++", "AWS", "Docker", "Git", "Project Management", "Marketing", "HR"
  ];
  const detectedSkills = skillPool.filter(skill => descriptionLower.includes(skill.toLowerCase()));

  if (detectedSkills.length === 0) {
    if (query.toLowerCase().includes("ai") || query.toLowerCase().includes("ml")) {
      detectedSkills.push("Python", "PyTorch", "Machine Learning");
    } else if (query.toLowerCase().includes("hr") || query.toLowerCase().includes("manager")) {
      detectedSkills.push("Communication", "HR Management", "Excel");
    } else {
      detectedSkills.push("JavaScript", "TypeScript", "Problem Solving");
    }
  }

  return detectedSkills;
}

export async function searchJobs(params: JobSearchQueryParams): Promise<{ jobs: Job[]; source: string }> {
  const rawQuery = params.query || "";
  const degree = (params.degree || "engineering").toLowerCase();
  const platform = (params.platform || "all").toLowerCase();
  const filterLocation = params.location || "";
  const excludeLocation = params.excludeLocation || "";
  const datePosted = params.datePosted || "";

  let query = rawQuery.trim();
  let isDefaultQuery = false;
  if (!query) {
    isDefaultQuery = true;
    if (degree.includes("bba") || degree.includes("business") || degree.includes("mba") || degree.includes("commerce")) {
      query = "HR Marketing Manager Finance";
    } else if (degree.includes("design") || degree.includes("ui") || degree.includes("ux")) {
      query = "UI UX Design Product";
    } else {
      query = "AI ML Software Web Developer";
    }
  }

  let searchQuery = isDefaultQuery ? `${query} internship` : query;
  const isIndianPlatform = ["naukri", "internshala", "apna", "shine"].includes(platform);
  if (isIndianPlatform) {
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    searchQuery = `${searchQuery} ${platformName}`;
  }

  const serpapiKey = process.env.SERPAPI_API_KEY;
  const apiKey = process.env.JSEARCH_API_KEY;
  const apiHost = process.env.JSEARCH_API_HOST || "jsearch.p.rapidapi.com";

  const trySerpApi = !!(serpapiKey && serpapiKey !== "" && !serpapiKey.startsWith("YOUR_"));
  const tryJSearch = !!(apiKey && apiKey !== "" && !apiKey.startsWith("YOUR_"));

  requestCounter++;
  const serpApiFirst = requestCounter % 2 === 0;
  const order = serpApiFirst ? ["serp", "jsearch"] : ["jsearch", "serp"];

  for (const apiType of order) {
    if (apiType === "serp" && trySerpApi) {
      try {
        let serpQuery = searchQuery;
        let locationParam = isIndianPlatform ? "India" : "United States";
        let domainParam = isIndianPlatform ? "google.co.in" : "google.com";
        let glParam = isIndianPlatform ? "in" : "us";

        if (filterLocation) {
          locationParam = `${filterLocation}, India`;
          domainParam = "google.co.in";
          glParam = "in";
          serpQuery = `${serpQuery} ${filterLocation}`;
        }

        if (excludeLocation) {
          serpQuery = `${serpQuery} -"${excludeLocation}"`;
        }

        let searchUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(serpQuery)}&location=${encodeURIComponent(locationParam)}&google_domain=${domainParam}&hl=en&gl=${glParam}&api_key=${serpapiKey}`;
        if (datePosted) {
          searchUrl += `&chips=${encodeURIComponent(`date_posted:${datePosted}`)}`;
        }

        const response = await fetchWithTimeout(searchUrl, { method: "GET" }, 2500);
        if (response.ok) {
          const result = await response.json();
          if (result.jobs_results && Array.isArray(result.jobs_results)) {
            const jobs: Job[] = result.jobs_results.map((job: any, index: number) => {
              const detectedSkills = detectSkillsFromDescription(job.description || "", query);
              let salary = "Not disclosed";
              if (job.detected_extensions?.salary) {
                salary = job.detected_extensions.salary;
              } else if (job.extensions && job.extensions.length > 0) {
                const salaryExt = job.extensions.find((ext: string) => 
                  ext.includes("$") || ext.includes("hour") || ext.includes("year") || /\d+–\d+/.test(ext) || /\d+-\d+/.test(ext)
                );
                if (salaryExt) salary = salaryExt;
              }

              let applyUrl = job.source_link || "";
              if (job.apply_options && job.apply_options.length > 0) {
                applyUrl = job.apply_options[0].link || applyUrl;
              }

              return {
                id: job.job_id || `serp-${index}-${Date.now()}`,
                title: job.job_title,
                company: job.company_name,
                location: job.location || "United States",
                logo: job.thumbnail || "",
                source: job.via || "Google Jobs",
                applyUrl,
                description: job.description || "",
                skills: detectedSkills,
                salary,
                category: job.detected_extensions?.schedule_type || "Internship"
              };
            });

            return { jobs, source: "live_api (SerpApi)" };
          }
        }
      } catch {
        // Clean warn log without verbose stack trace dump
        console.warn("[Job API] SerpApi live search skipped or timed out, falling back.");
      }
    } else if (apiType === "jsearch" && tryJSearch) {
      try {
        let jsearchQuery = searchQuery;
        if (filterLocation) {
          jsearchQuery = `${jsearchQuery} in ${filterLocation}`;
        }
        const searchUrl = `https://${apiHost}/search?query=${encodeURIComponent(jsearchQuery)}&page=1&num_pages=1`;
        const response = await fetchWithTimeout(searchUrl, {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": apiHost,
          },
        }, 2500);

        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            const jobs: Job[] = result.data.map((job: any) => {
              const detectedSkills = detectSkillsFromDescription(job.job_description || "", query);
              return {
                id: job.job_id,
                title: job.job_title,
                company: job.employer_name,
                location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", "),
                logo: job.employer_logo || "",
                source: job.job_publisher || "Direct Link",
                applyUrl: job.job_apply_link,
                description: job.job_description,
                skills: detectedSkills,
                salary: job.job_min_salary && job.job_max_salary 
                  ? `$${job.job_min_salary} - $${job.job_max_salary} / yr` 
                  : "Not disclosed",
                category: job.job_employment_type || "Internship",
                degreeType: degree
              };
            });

            return { jobs, source: "live_api (JSearch)" };
          }
        }
      } catch {
        // Clean warn log without verbose stack trace dump
        console.warn("[Job API] JSearch live search skipped or timed out, falling back.");
      }
    }
  }

  // Fallback Mock Filtering
  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let filteredMockJobs = MOCK_JOBS.filter(job => {
    const degreeMatch = (degree.includes("bba") || degree.includes("business") || degree.includes("mba"))
      ? job.degreeType === "bba"
      : (degree.includes("design") || degree.includes("ui") || degree.includes("ux"))
        ? job.category.toLowerCase().includes("design")
        : job.degreeType === "engineering";

    if (!rawQuery) return degreeMatch;

    const textToSearch = `${job.title} ${job.description} ${job.company} ${job.skills.join(" ")}`.toLowerCase();
    return searchTerms.some(term => textToSearch.includes(term));
  });

  if (filteredMockJobs.length === 0) {
    filteredMockJobs = MOCK_JOBS.filter(job => {
      if (degree.includes("bba") || degree.includes("business") || degree.includes("mba")) {
        return job.degreeType === "bba";
      }
      return job.degreeType === "engineering";
    });
  }

  if (filterLocation) {
    filteredMockJobs = filteredMockJobs.filter(job => 
      (job.location || "").toLowerCase().includes(filterLocation.toLowerCase())
    );
  }

  if (excludeLocation) {
    filteredMockJobs = filteredMockJobs.filter(job => 
      !(job.location || "").toLowerCase().includes(excludeLocation.toLowerCase())
    );
  }

  return { jobs: filteredMockJobs, source: "mock_database" };
}
