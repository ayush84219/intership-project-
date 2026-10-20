export type Role = "STUDENT" | "COMPANY" | "TEACHER" | "ADMIN";
export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  verificationStatus?: string;
  collegeName?: string | null;
  companyName?: string | null;
  department?: string | null;
  designation?: string | null;
  employeeId?: string | null;
  studentId?: string | null;
  phone?: string | null;
  website?: string | null;
  bio?: string | null;
  profile?: Profile | null;
  companyProfile?: any;
  teacherProfile?: any;
  studentEndorsements?: any[];
}

export interface Profile {
  id: string;
  degree: string;
  college?: string | null;
  studentId?: string | null;
  skills: string;
  targetRoles: string;
  resumeUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  gpa?: string | null;
  graduationYear?: string | null;
  bio?: string | null;
  isAcademicVerified?: boolean;
}

export interface Job {
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

export interface Application {
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

export interface StudentEndorsement {
  id: string;
  rating: number;
  recommendation: string;
  skills: string;
  isVerified: boolean;
  createdAt: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    designation?: string | null;
    collegeName?: string | null;
  };
}

export interface TeacherProfileData {
  department?: string;
  designation?: string;
  facultyId?: string;
  collegeName?: string;
  totalStudentsEndorsed?: number;
}

export interface CompanyProfileData {
  companyName?: string;
  website?: string;
  industry?: string;
  location?: string;
  description?: string;
  size?: string;
}
