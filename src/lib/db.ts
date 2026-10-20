import { PrismaClient } from "@/generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// ── Singleton Prisma Client ──────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "STUDENT" | "COMPANY" | "TEACHER" | "ADMIN" | "RECRUITER";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface UserDoc {
  id?: string;
  email: string;
  name?: string | null;
  password?: string | null;
  role?: string | null;
  verificationStatus?: string;
  verificationNote?: string | null;
  collegeName?: string | null;
  companyName?: string | null;
  department?: string | null;
  designation?: string | null;
  employeeId?: string | null;
  studentId?: string | null;
  phone?: string | null;
  website?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// ── Helper: getDb (backward compat) ──────────────────────────────────────────
export async function getDb() {
  return prisma;
}

// ── User helpers ──────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string) {
  const emailClean = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: emailClean },
    include: {
      profile: true,
      companyProfile: true,
      teacherProfile: true,
      studentEndorsements: {
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
              collegeName: true,
              department: true,
              designation: true,
            },
          },
        },
      },
    },
  });
  if (!user) return null;
  return user;
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      companyProfile: true,
      teacherProfile: true,
      studentEndorsements: {
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
              collegeName: true,
              department: true,
              designation: true,
            },
          },
        },
      },
    },
  });
}

export async function createUser(data: {
  email: string;
  name?: string;
  password?: string;
  role?: string;
  collegeName?: string;
  companyName?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  studentId?: string;
  phone?: string;
  website?: string;
  bio?: string;
}) {
  const emailClean = data.email.toLowerCase().trim();
  
  // Normalize role
  let role = data.role ? data.role.toUpperCase() : "STUDENT";
  if (role === "RECRUITER") role = "COMPANY";
  if (!["STUDENT", "COMPANY", "TEACHER", "ADMIN"].includes(role)) {
    role = "STUDENT";
  }

  // Students and Admins auto-verified or default pending for companies and teachers
  let verificationStatus = "VERIFIED";
  if (role === "COMPANY" || role === "TEACHER") {
    verificationStatus = "PENDING";
  }

  const user = await prisma.user.create({
    data: {
      email: emailClean,
      name: data.name ?? "",
      password: data.password ?? "",
      role,
      verificationStatus,
      collegeName: data.collegeName ?? (role === "TEACHER" ? "University / College" : undefined),
      companyName: data.companyName ?? (role === "COMPANY" ? "Company / Firm" : undefined),
      department: data.department ?? "",
      designation: data.designation ?? "",
      employeeId: data.employeeId ?? "",
      studentId: data.studentId ?? "",
      phone: data.phone ?? "",
      website: data.website ?? "",
      bio: data.bio ?? "",
      // Create role-specific profiles
      ...(role === "STUDENT"
        ? {
            profile: {
              create: {
                degree: data.department || "Computer Science",
                college: data.collegeName || "",
                studentId: data.studentId || "",
                skills: "",
                targetRoles: "",
                resumeUrl: "",
                bio: data.bio || "",
              },
            },
          }
        : {}),
      ...(role === "COMPANY"
        ? {
            companyProfile: {
              create: {
                companyName: data.companyName || data.name || "Company Name",
                industry: "Technology & Professional Services",
                website: data.website || "",
                about: data.bio || "Employer hiring skilled interns and entry-level talent.",
              },
            },
          }
        : {}),
      ...(role === "TEACHER"
        ? {
            teacherProfile: {
              create: {
                collegeName: data.collegeName || "University / College",
                department: data.department || "Engineering & Management",
                designation: data.designation || "Faculty / Placement Officer",
                facultyId: data.employeeId || "",
                officialEmail: emailClean,
                bio: data.bio || "Academic faculty guiding students into internship placements.",
              },
            },
          }
        : {}),
    },
    include: {
      profile: true,
      companyProfile: true,
      teacherProfile: true,
    },
  });

  return user;
}

export async function updateUserProfile(
  email: string,
  data: {
    name?: string;
    phone?: string;
    bio?: string;
    degree?: string;
    skills?: string;
    targetRoles?: string;
    resumeUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    collegeName?: string;
    studentId?: string;
    gpa?: string;
    graduationYear?: string;
  }
) {
  const emailClean = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: emailClean } });
  if (!user) return null;

  // Update User fields
  const userUpdates: Record<string, any> = {};
  if (data.name !== undefined) userUpdates.name = data.name;
  if (data.phone !== undefined) userUpdates.phone = data.phone;
  if (data.bio !== undefined) userUpdates.bio = data.bio;
  if (data.collegeName !== undefined) userUpdates.collegeName = data.collegeName;
  if (data.studentId !== undefined) userUpdates.studentId = data.studentId;

  if (Object.keys(userUpdates).length > 0) {
    await prisma.user.update({
      where: { email: emailClean },
      data: userUpdates,
    });
  }

  // Update Profile fields
  const profileUpdates: Record<string, any> = {};
  if (data.degree !== undefined) profileUpdates.degree = data.degree;
  if (data.skills !== undefined) profileUpdates.skills = data.skills;
  if (data.targetRoles !== undefined) profileUpdates.targetRoles = data.targetRoles;
  if (data.resumeUrl !== undefined) profileUpdates.resumeUrl = data.resumeUrl;
  if (data.githubUrl !== undefined) profileUpdates.githubUrl = data.githubUrl;
  if (data.linkedinUrl !== undefined) profileUpdates.linkedinUrl = data.linkedinUrl;
  if (data.portfolioUrl !== undefined) profileUpdates.portfolioUrl = data.portfolioUrl;
  if (data.collegeName !== undefined) profileUpdates.college = data.collegeName;
  if (data.studentId !== undefined) profileUpdates.studentId = data.studentId;
  if (data.gpa !== undefined) profileUpdates.gpa = data.gpa;
  if (data.graduationYear !== undefined) profileUpdates.graduationYear = data.graduationYear;
  if (data.bio !== undefined) profileUpdates.bio = data.bio;

  if (Object.keys(profileUpdates).length > 0) {
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: profileUpdates,
      create: {
        userId: user.id,
        degree: data.degree ?? "",
        college: data.collegeName ?? user.collegeName ?? "",
        studentId: data.studentId ?? user.studentId ?? "",
        skills: data.skills ?? "",
        targetRoles: data.targetRoles ?? "",
        resumeUrl: data.resumeUrl ?? "",
        githubUrl: data.githubUrl ?? "",
        linkedinUrl: data.linkedinUrl ?? "",
        portfolioUrl: data.portfolioUrl ?? "",
        gpa: data.gpa ?? "",
        graduationYear: data.graduationYear ?? "",
        bio: data.bio ?? "",
      },
    });
  }

  return findUserByEmail(emailClean);
}

export async function updateCompanyProfile(
  email: string,
  data: {
    name?: string;
    companyName?: string;
    tagline?: string;
    industry?: string;
    companySize?: string;
    website?: string;
    headquarters?: string;
    about?: string;
    foundedYear?: string;
    logoUrl?: string;
    phone?: string;
  }
) {
  const emailClean = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: emailClean } });
  if (!user) return null;

  await prisma.user.update({
    where: { email: emailClean },
    data: {
      name: data.name ?? user.name,
      companyName: data.companyName ?? user.companyName,
      website: data.website ?? user.website,
      phone: data.phone ?? user.phone,
      bio: data.about ?? user.bio,
    },
  });

  await prisma.companyProfile.upsert({
    where: { userId: user.id },
    update: {
      companyName: data.companyName ?? user.companyName ?? "Company",
      tagline: data.tagline,
      industry: data.industry,
      companySize: data.companySize,
      website: data.website,
      headquarters: data.headquarters,
      about: data.about,
      foundedYear: data.foundedYear,
      logoUrl: data.logoUrl,
    },
    create: {
      userId: user.id,
      companyName: data.companyName ?? user.companyName ?? "Company",
      tagline: data.tagline ?? "",
      industry: data.industry ?? "",
      companySize: data.companySize ?? "",
      website: data.website ?? "",
      headquarters: data.headquarters ?? "",
      about: data.about ?? "",
      foundedYear: data.foundedYear ?? "",
      logoUrl: data.logoUrl ?? "",
    },
  });

  return findUserByEmail(emailClean);
}

export async function updateTeacherProfile(
  email: string,
  data: {
    name?: string;
    collegeName?: string;
    department?: string;
    designation?: string;
    facultyId?: string;
    officialEmail?: string;
    officeLocation?: string;
    bio?: string;
    phone?: string;
  }
) {
  const emailClean = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: emailClean } });
  if (!user) return null;

  await prisma.user.update({
    where: { email: emailClean },
    data: {
      name: data.name ?? user.name,
      collegeName: data.collegeName ?? user.collegeName,
      department: data.department ?? user.department,
      designation: data.designation ?? user.designation,
      employeeId: data.facultyId ?? user.employeeId,
      phone: data.phone ?? user.phone,
      bio: data.bio ?? user.bio,
    },
  });

  await prisma.teacherProfile.upsert({
    where: { userId: user.id },
    update: {
      collegeName: data.collegeName ?? user.collegeName ?? "College",
      department: data.department ?? user.department ?? "",
      designation: data.designation ?? user.designation ?? "",
      facultyId: data.facultyId ?? user.employeeId ?? "",
      officialEmail: data.officialEmail ?? emailClean,
      officeLocation: data.officeLocation,
      bio: data.bio,
    },
    create: {
      userId: user.id,
      collegeName: data.collegeName ?? user.collegeName ?? "College",
      department: data.department ?? user.department ?? "",
      designation: data.designation ?? user.designation ?? "",
      facultyId: data.facultyId ?? user.employeeId ?? "",
      officialEmail: data.officialEmail ?? emailClean,
      officeLocation: data.officeLocation ?? "",
      bio: data.bio ?? "",
    },
  });

  return findUserByEmail(emailClean);
}

export async function updateUserPassword(email: string, hashedPassword: string) {
  const emailClean = email.toLowerCase().trim();
  await prisma.user.update({
    where: { email: emailClean },
    data: { password: hashedPassword },
  });
}

// ── Application helpers ───────────────────────────────────────────────────────

export async function upsertApplication(userEmail: string, appData: any) {
  const user = await findUserByEmail(userEmail);
  if (!user) throw new Error("User not found");

  const {
    jobId,
    title,
    company,
    location,
    source,
    applyUrl,
    status,
    coverLetter,
  } = appData;

  const result = await prisma.application.upsert({
    where: { userId_jobId: { userId: user.id, jobId } },
    update: {
      title,
      company,
      location: location ?? "Remote",
      source: source ?? "Direct Link",
      applyUrl: applyUrl ?? "",
      status: status ?? "Applied",
      coverLetter: coverLetter ?? "",
      appliedAt: new Date(),
    },
    create: {
      userId: user.id,
      jobId,
      title,
      company,
      location: location ?? "Remote",
      source: source ?? "Direct Link",
      applyUrl: applyUrl ?? "",
      status: status ?? "Applied",
      coverLetter: coverLetter ?? "",
    },
  });

  return result;
}

export async function getUserApplications(userEmail: string) {
  const user = await findUserByEmail(userEmail);
  if (!user) return [];

  return prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { appliedAt: "desc" },
  });
}

// ── Company / Recruiter / Posted Job helpers ──────────────────────────────────

export async function createPostedJob(data: {
  recruiterEmail: string;
  recruiterName?: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  category?: string;
  workType?: string;
  duration?: string;
  description: string;
  skills: string[];
  requirements?: string;
  applyUrl?: string;
}) {
  const user = await findUserByEmail(data.recruiterEmail);

  const job = await prisma.postedJob.create({
    data: {
      recruiterId: user?.id,
      recruiterEmail: data.recruiterEmail.toLowerCase().trim(),
      recruiterName: data.recruiterName ?? user?.name ?? "",
      title: data.title.trim(),
      company: data.company.trim(),
      location: data.location.trim(),
      salary: data.salary?.trim() ?? "Competitive / Disclosed on Interview",
      category: data.category?.trim() ?? "General",
      workType: data.workType ?? "Remote",
      duration: data.duration ?? "3 Months",
      description: data.description.trim(),
      skills: Array.isArray(data.skills) ? data.skills.join(",") : (data.skills || ""),
      requirements: data.requirements ?? "",
      applyUrl: data.applyUrl?.trim() ?? "",
      isVerified: user?.verificationStatus === "VERIFIED",
    },
  });

  return {
    ...job,
    skills: job.skills ? job.skills.split(",") : [],
    source: "Direct Recruiter Posting",
    isRecruiterPosted: true,
  };
}

export async function getPostedJobs(recruiterEmail?: string) {
  const jobs = await prisma.postedJob.findMany({
    where: recruiterEmail
      ? { recruiterEmail: recruiterEmail.toLowerCase().trim() }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return jobs.map((j) => ({
    ...j,
    skills: j.skills ? j.skills.split(",") : [],
    source: "Direct Recruiter Posting",
    isRecruiterPosted: true,
  }));
}

export async function updatePostedJob(jobId: string, recruiterEmail: string, data: any) {
  return prisma.postedJob.updateMany({
    where: {
      id: jobId,
      recruiterEmail: recruiterEmail.toLowerCase().trim(),
    },
    data: {
      ...data,
      skills: Array.isArray(data.skills) ? data.skills.join(",") : data.skills,
    },
  });
}

export async function deletePostedJob(jobId: string, recruiterEmail: string) {
  await prisma.postedJob.deleteMany({
    where: {
      id: jobId,
      recruiterEmail: recruiterEmail.toLowerCase().trim(),
    },
  });
  return true;
}

export async function getApplicantsForCompany(companyEmail: string) {
  const emailClean = companyEmail.toLowerCase().trim();

  // Find all jobs for this company/recruiter
  const companyJobs = await prisma.postedJob.findMany({
    where: { recruiterEmail: emailClean },
    select: { id: true, title: true, company: true },
  });

  const jobIds = companyJobs.map((j) => j.id);
  if (jobIds.length === 0) return [];

  const apps = await prisma.application.findMany({
    where: { jobId: { in: jobIds } },
    include: {
      user: {
        include: {
          profile: true,
          studentEndorsements: {
            include: {
              teacher: {
                select: { name: true, collegeName: true, department: true },
              },
            },
          },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  return apps.map((app) => ({
    id: app.id,
    jobId: app.jobId,
    jobTitle: app.title,
    company: app.company,
    applicantName: app.user?.name ?? "Student Candidate",
    applicantEmail: app.user?.email ?? "Unknown Email",
    college: app.user?.collegeName || app.user?.profile?.college || "Academic University",
    degree: app.user?.profile?.degree || "Engineering / Technology",
    resumeUrl: app.user?.profile?.resumeUrl,
    skills: app.user?.profile?.skills ? app.user.profile.skills.split(",") : [],
    gpa: app.user?.profile?.gpa,
    endorsements: app.user?.studentEndorsements ?? [],
    status: app.status ?? "Applied",
    coverLetter: app.coverLetter ?? "",
    appliedAt: app.appliedAt,
  }));
}

export async function updateApplicationStatus(appId: string, status: string, notes?: string) {
  return prisma.application.update({
    where: { id: appId },
    data: {
      status,
      notes: notes !== undefined ? notes : undefined,
    },
  });
}

// ── College Teacher helpers ───────────────────────────────────────────────────

export async function getTeacherCollegeStudents(teacherEmail: string) {
  const teacher = await findUserByEmail(teacherEmail);
  if (!teacher) return [];

  // Match students by collegeName or by student profile college
  const collegeName = teacher.collegeName?.trim();
  if (!collegeName) return [];

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: [
        { collegeName: { contains: collegeName } },
        { profile: { college: { contains: collegeName } } },
      ],
    },
    include: {
      profile: true,
      applications: true,
      studentEndorsements: {
        where: { teacherId: teacher.id },
      },
    },
    orderBy: { name: "asc" },
  });

  // If no exact match (e.g. testing), return all students so the teacher has a roster
  if (students.length === 0) {
    return prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        profile: true,
        applications: true,
        studentEndorsements: {
          where: { teacherId: teacher.id },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  return students;
}

export async function endorseStudent(
  teacherEmail: string,
  studentId: string,
  data: {
    skill?: string;
    endorsement: string;
    rating?: number;
    verifyAcademic?: boolean;
  }
) {
  const teacher = await findUserByEmail(teacherEmail);
  if (!teacher) throw new Error("Teacher not found");

  // Create or update endorsement
  const existing = await prisma.studentEndorsement.findFirst({
    where: { teacherId: teacher.id, studentId },
  });

  let endorsementRecord;
  if (existing) {
    endorsementRecord = await prisma.studentEndorsement.update({
      where: { id: existing.id },
      data: {
        skill: data.skill ?? "Academic Excellence & Performance",
        endorsement: data.endorsement,
        rating: data.rating ?? 5,
        verifiedAcademic: data.verifyAcademic ?? true,
      },
    });
  } else {
    endorsementRecord = await prisma.studentEndorsement.create({
      data: {
        teacherId: teacher.id,
        studentId,
        skill: data.skill ?? "Academic Excellence & Performance",
        endorsement: data.endorsement,
        rating: data.rating ?? 5,
        verifiedAcademic: data.verifyAcademic ?? true,
      },
    });
  }

  // Also update student profile academic verification
  if (data.verifyAcademic) {
    await prisma.profile.updateMany({
      where: { userId: studentId },
      data: { isAcademicVerified: true },
    });
  }

  return endorsementRecord;
}

// ── Admin Verification & Management helpers ───────────────────────────────────

export async function getAdminStats() {
  const [
    totalUsers,
    totalStudents,
    totalCompanies,
    totalTeachers,
    totalJobs,
    totalApplications,
    pendingVerifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: { in: ["COMPANY", "RECRUITER"] } } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.postedJob.count(),
    prisma.application.count(),
    prisma.user.count({ where: { verificationStatus: "PENDING" } }),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalCompanies,
    totalTeachers,
    totalJobs,
    totalApplications,
    pendingVerifications,
  };
}

export async function getPendingVerifications() {
  return prisma.user.findMany({
    where: { verificationStatus: "PENDING" },
    include: {
      companyProfile: true,
      teacherProfile: true,
      profile: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateVerificationStatus(
  userId: string,
  status: "VERIFIED" | "REJECTED" | "PENDING",
  note?: string
) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: status,
      verificationNote: note,
    },
  });

  // If company, update verified timestamp & jobs
  if (updatedUser.role === "COMPANY" || updatedUser.role === "RECRUITER") {
    if (status === "VERIFIED") {
      await prisma.companyProfile.updateMany({
        where: { userId },
        data: { verifiedAt: new Date() },
      });
      await prisma.postedJob.updateMany({
        where: { recruiterEmail: updatedUser.email },
        data: { isVerified: true },
      });
    } else {
      await prisma.postedJob.updateMany({
        where: { recruiterEmail: updatedUser.email },
        data: { isVerified: false },
      });
    }
  }

  // If teacher, update teacherProfile
  if (updatedUser.role === "TEACHER" && status === "VERIFIED") {
    await prisma.teacherProfile.updateMany({
      where: { userId },
      data: { verifiedAt: new Date() },
    });
  }

  return updatedUser;
}

export async function getAllUsers(roleFilter?: string) {
  let roleCondition: any = undefined;
  if (roleFilter && roleFilter !== "ALL") {
    if (roleFilter === "COMPANY") {
      roleCondition = { in: ["COMPANY", "RECRUITER"] };
    } else {
      roleCondition = roleFilter;
    }
  }

  return prisma.user.findMany({
    where: roleCondition ? { role: roleCondition } : undefined,
    include: {
      profile: true,
      companyProfile: true,
      teacherProfile: true,
      postedJobs: { select: { id: true } },
      applications: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserRole(userId: string, newRole: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });
}

export async function deleteUser(userId: string) {
  return prisma.user.delete({
    where: { id: userId },
  });
}
