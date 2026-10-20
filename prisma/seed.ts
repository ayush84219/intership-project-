import { PrismaClient } from "../src/generated/client";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Starting database seeding...");

  // 1. Admin User
  const adminPassword = hashPassword("admin123");
  const admin = await prisma.user.upsert({
    where: { email: "admin@internverse.com" },
    update: {
      name: "Super Admin",
      role: "ADMIN",
      verificationStatus: "VERIFIED",
      verificationNote: "Platform Master Administrator",
      password: adminPassword,
    },
    create: {
      email: "admin@internverse.com",
      name: "Super Admin",
      password: adminPassword,
      role: "ADMIN",
      verificationStatus: "VERIFIED",
      verificationNote: "Platform Master Administrator",
      bio: "Chief Administrator of Internverse Ecosystem.",
    },
  });
  console.log("✔ Admin created:", admin.email);

  // 2. Verified College Teacher
  const teacherPassword = hashPassword("teacher123");
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@university.edu" },
    update: {
      name: "Prof. Rajesh Verma",
      role: "TEACHER",
      verificationStatus: "VERIFIED",
      collegeName: "Indian Institute of Technology (IIT) Delhi",
      department: "Computer Science & Engineering",
      designation: "Head of Training & Placement / Professor",
      employeeId: "FAC-IITD-8821",
      phone: "+91 98765 43210",
      password: teacherPassword,
    },
    create: {
      email: "teacher@university.edu",
      name: "Prof. Rajesh Verma",
      password: teacherPassword,
      role: "TEACHER",
      verificationStatus: "VERIFIED",
      verificationNote: "Verified by Admin - Official Faculty ID verified",
      collegeName: "Indian Institute of Technology (IIT) Delhi",
      department: "Computer Science & Engineering",
      designation: "Head of Training & Placement / Professor",
      employeeId: "FAC-IITD-8821",
      phone: "+91 98765 43210",
      bio: "Guiding over 800+ engineering and technology students into premier industry internships and research roles.",
      teacherProfile: {
        create: {
          collegeName: "Indian Institute of Technology (IIT) Delhi",
          department: "Computer Science & Engineering",
          designation: "Head of Training & Placement / Professor",
          facultyId: "FAC-IITD-8821",
          officialEmail: "rverma.tpo@iitd.ac.in",
          officeLocation: "Block IV, Academic Hall, IIT Delhi",
          bio: "Specializing in Distributed Systems & AI. Placement coordinator for B.Tech & M.Tech batches.",
          verifiedAt: new Date(),
        },
      },
    },
  });
  console.log("✔ College Teacher created:", teacher.email);

  // 3. Verified Company
  const companyPassword = hashPassword("company123");
  const company = await prisma.user.upsert({
    where: { email: "company@google.com" },
    update: {
      name: "Sarah Lin (Google Talent)",
      role: "COMPANY",
      verificationStatus: "VERIFIED",
      companyName: "Google LLC",
      location: "Bengaluru, India / Mountain View, CA",
      website: "https://careers.google.com",
      phone: "+1 650-253-0000",
      password: companyPassword,
    },
    create: {
      email: "company@google.com",
      name: "Sarah Lin (Google Talent)",
      password: companyPassword,
      role: "COMPANY",
      verificationStatus: "VERIFIED",
      verificationNote: "Official corporate domain & registration approved.",
      companyName: "Google LLC",
      location: "Bengaluru, India / Mountain View, CA",
      website: "https://careers.google.com",
      phone: "+1 650-253-0000",
      bio: "Senior Technical Talent Partner at Google Cloud & AI Labs.",
      companyProfile: {
        create: {
          companyName: "Google LLC",
          tagline: "Organizing the world's information and building helpful AI.",
          industry: "Cloud, AI & Software Engineering",
          companySize: "10,000+ employees",
          website: "https://careers.google.com",
          headquarters: "Mountain View, California",
          about: "Google is an American multinational technology company focusing on artificial intelligence, search engine technology, cloud computing, computer software, and consumer electronics.",
          foundedYear: "1998",
          verifiedAt: new Date(),
        },
      },
    },
  });

  // Also maintain recruiter@company.com compatibility
  await prisma.user.upsert({
    where: { email: "recruiter@company.com" },
    update: {
      role: "COMPANY",
      verificationStatus: "VERIFIED",
      password: hashPassword("recruiter123"),
      companyName: "Acme Innovations Corp",
    },
    create: {
      email: "recruiter@company.com",
      name: "Jane Doe (Acme Corp)",
      password: hashPassword("recruiter123"),
      role: "COMPANY",
      verificationStatus: "VERIFIED",
      companyName: "Acme Innovations Corp",
      location: "Bengaluru, India",
      website: "https://acmecorp.tech",
      companyProfile: {
        create: {
          companyName: "Acme Innovations Corp",
          tagline: "Leading modern software & analytics solutions",
          industry: "Software Engineering & Cloud",
          companySize: "50-200 employees",
          website: "https://acmecorp.tech",
          headquarters: "Bengaluru, India",
          about: "High-growth product company building modern analytics & cloud native solutions.",
          verifiedAt: new Date(),
        },
      },
    },
  });
  console.log("✔ Companies created:", company.email, "and recruiter@company.com");

  // 4. Verified Student
  const studentPassword = hashPassword("student123");
  const student = await prisma.user.upsert({
    where: { email: "student@university.edu" },
    update: {
      name: "Aarav Sharma",
      role: "STUDENT",
      verificationStatus: "VERIFIED",
      collegeName: "Indian Institute of Technology (IIT) Delhi",
      studentId: "IITD-2024-CS402",
      password: studentPassword,
    },
    create: {
      email: "student@university.edu",
      name: "Aarav Sharma",
      password: studentPassword,
      role: "STUDENT",
      verificationStatus: "VERIFIED",
      verificationNote: "Academic credentials confirmed by IIT Delhi faculty.",
      collegeName: "Indian Institute of Technology (IIT) Delhi",
      studentId: "IITD-2024-CS402",
      phone: "+91 91234 56789",
      bio: "Passionate Full-Stack & Machine Learning developer building responsive web applications and AI tools.",
      profile: {
        create: {
          degree: "Computer Science & Engineering",
          college: "Indian Institute of Technology (IIT) Delhi",
          studentId: "IITD-2024-CS402",
          skills: "React, Next.js, TypeScript, Node.js, Python, PostgreSQL, Prisma, TailwindCSS, Docker",
          targetRoles: "Full Stack Intern, Frontend Developer, AI Engineering Intern",
          resumeUrl: "https://example.com/resume-aarav-sharma.pdf",
          githubUrl: "https://github.com/aaravsharma-dev",
          linkedinUrl: "https://linkedin.com/in/aaravsharma-dev",
          portfolioUrl: "https://aaravsharma.dev",
          gpa: "9.2 / 10.0",
          graduationYear: "2026",
          bio: "Third-year Computer Science undergraduate passionate about full-stack engineering, scalable APIs, and applied AI.",
          isAcademicVerified: true,
        },
      },
    },
  });
  console.log("✔ Student created:", student.email);

  // 5. Additional Pending Accounts for Admin Verification testing
  await prisma.user.upsert({
    where: { email: "hr@nexastech.io" },
    update: {},
    create: {
      email: "hr@nexastech.io",
      name: "Marcus Vance",
      password: hashPassword("company123"),
      role: "COMPANY",
      verificationStatus: "PENDING",
      companyName: "Nexas Technologies",
      location: "San Francisco, CA",
      website: "https://nexastech.io",
      phone: "+1 415-555-0199",
      bio: "Next-generation generative AI infrastructure company.",
      companyProfile: {
        create: {
          companyName: "Nexas Technologies",
          tagline: "Enterprise Generative AI acceleration platform",
          industry: "Artificial Intelligence",
          companySize: "11-50 employees",
          website: "https://nexastech.io",
          headquarters: "San Francisco, CA",
          about: "Nexas Technologies is building low-latency inference pipelines for global enterprises.",
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "faculty@mit.edu" },
    update: {},
    create: {
      email: "faculty@mit.edu",
      name: "Dr. Elena Rostova",
      password: hashPassword("teacher123"),
      role: "TEACHER",
      verificationStatus: "PENDING",
      collegeName: "Massachusetts Institute of Technology (MIT)",
      department: "Electrical Engineering & Computer Science",
      designation: "Associate Professor & Research Advisor",
      employeeId: "MIT-EECS-4410",
      phone: "+1 617-253-1000",
      bio: "Focus on neural algorithmic reasoning and undergraduate research internships.",
      teacherProfile: {
        create: {
          collegeName: "Massachusetts Institute of Technology (MIT)",
          department: "Electrical Engineering & Computer Science",
          designation: "Associate Professor & Research Advisor",
          facultyId: "MIT-EECS-4410",
          officialEmail: "rostova@mit.edu",
          officeLocation: "Stata Center, Building 32",
          bio: "Faculty advisor mentoring undergrads in systems programming and AI.",
        },
      },
    },
  });

  // 6. Teacher Endorsement for Student
  await prisma.studentEndorsement.deleteMany({
    where: { studentId: student.id, teacherId: teacher.id },
  });
  await prisma.studentEndorsement.create({
    data: {
      studentId: student.id,
      teacherId: teacher.id,
      skill: "Full Stack Web Development & System Design",
      endorsement: "Aarav is among the top 5% of students in our Computer Science cohort. Exceptionally strong in React, TypeScript, and modern backend architectures. Highly recommended for top-tier software internships.",
      rating: 5,
      verifiedAcademic: true,
    },
  });
  console.log("✔ Teacher Endorsement added for Student");

  // 7. Seed Sample Verified Posted Jobs by Google
  const existingGoogleJobs = await prisma.postedJob.findMany({
    where: { recruiterEmail: "company@google.com" },
  });
  if (existingGoogleJobs.length === 0) {
    const job1 = await prisma.postedJob.create({
      data: {
        recruiterId: company.id,
        recruiterEmail: "company@google.com",
        recruiterName: "Sarah Lin (Google Talent)",
        title: "Software Engineering Intern - Summer 2026",
        company: "Google LLC",
        location: "Bengaluru, India (Hybrid)",
        salary: "₹1,25,000 / month + Benefits",
        category: "Software Development",
        workType: "Hybrid",
        duration: "3 Months (Summer 2026)",
        description: "Join Google's Core Engineering organization to develop high-performance web applications and backend systems at internet scale. You will collaborate directly with seasoned engineers, participate in code reviews, and ship features that touch billions of users.",
        skills: "React, TypeScript, Node.js, Python, Distributed Systems, Algorithms",
        requirements: "Enrolled in B.Tech/M.Tech in Computer Science or related degree. Strong foundation in data structures, algorithms, and web technologies.",
        applyUrl: "https://careers.google.com/jobs/results/",
        status: "ACTIVE",
        isVerified: true,
      },
    });

    const job2 = await prisma.postedJob.create({
      data: {
        recruiterId: company.id,
        recruiterEmail: "company@google.com",
        recruiterName: "Sarah Lin (Google Talent)",
        title: "AI & Machine Learning Research Intern",
        company: "Google LLC",
        location: "Bengaluru, India / Remote",
        salary: "₹1,40,000 / month + Hardware Allowance",
        category: "AI/ML & Data Science",
        workType: "Remote",
        duration: "6 Months",
        description: "Work with Google DeepMind and Google Research teams on multimodal models, LLM evaluations, and efficient inference algorithms.",
        skills: "Python, PyTorch, TensorFlow, LLMs, NLP, Prompt Engineering",
        requirements: "Experience with PyTorch, transformer architectures, and numerical optimization. Research publications or strong open-source portfolio is a plus.",
        applyUrl: "https://careers.google.com/jobs/results/",
        status: "ACTIVE",
        isVerified: true,
      },
    });

    // Create a sample student application for job1
    await prisma.application.upsert({
      where: { userId_jobId: { userId: student.id, jobId: job1.id } },
      update: {},
      create: {
        userId: student.id,
        jobId: job1.id,
        title: job1.title,
        company: job1.company,
        location: job1.location,
        source: "Internverse Verified Direct",
        applyUrl: job1.applyUrl,
        status: "Reviewing",
        coverLetter: "Dear Hiring Team at Google, I am writing to enthusiastically express my interest in the Software Engineering Summer Internship. As a Computer Science undergraduate at IIT Delhi with proven experience in TypeScript, React, and scalable distributed systems, I am eager to contribute to Google's engineering excellence.",
      },
    });
    console.log("✔ Sample Verified Jobs and Student Application created");
  }

  console.log("✅ Seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
