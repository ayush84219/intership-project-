export const COURSE_PRESETS: Record<string, {
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

export const APPLICATION_STAGES = [
  { key: "Applied", label: "Applied" },
  { key: "Reviewing", label: "Reviewing" },
  { key: "Shortlisted", label: "Shortlisted" },
  { key: "Interviewing", label: "Interview" },
  { key: "Offer", label: "Offer" },
];

export function getAppStageIndex(status?: string): number {
  const s = (status || "").toLowerCase();
  if (s.includes("offer") || s.includes("hired") || s.includes("accepted")) return 4;
  if (s.includes("interview")) return 3;
  if (s.includes("shortlist")) return 2;
  if (s.includes("review")) return 1;
  return 0; // Default Applied
}

export const LOCATION_DATA: Record<string, string[]> = {
  "Punjab": ["Ludhiana", "Mohali", "Amritsar", "Jalandhar", "Patiala"],
  "Delhi NCR": ["New Delhi", "Noida", "Gurugram", "Ghaziabad"],
  "Karnataka": ["Bengaluru", "Mysore", "Mangalore"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Tamil Nadu": ["Chennai", "Coimbatore"]
};

