import { MongoClient, Db, ObjectId } from "mongodb";

const uri = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/internship_portal";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === "development") {
  if (!globalForMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalForMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const conn = await clientPromise;
  return conn.db();
}

export interface UserDoc {
  _id?: ObjectId;
  id?: string;
  email: string;
  name?: string;
  password?: string;
  role?: string; // "STUDENT" | "RECRUITER"
  profile?: ProfileDoc | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PostedJobDoc {
  _id?: ObjectId;
  id?: string;
  recruiterEmail: string;
  recruiterName?: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  category: string;
  description: string;
  skills: string[];
  applyUrl?: string;
  createdAt: Date;
}

export interface ProfileDoc {
  _id?: ObjectId;
  userId?: string;
  degree: string;
  skills: string;
  targetRoles: string;
  resumeUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper methods to replace database queries seamlessly

export async function findUserByEmail(email: string) {
  const db = await getDb();
  const emailClean = email.toLowerCase().trim();
  const user = await db.collection<UserDoc>("users").findOne({ email: emailClean });
  if (!user) return null;

  const userIdStr = user._id?.toString();
  const profile = await db.collection<ProfileDoc>("profiles").findOne({ userId: userIdStr });

  return {
    ...user,
    id: userIdStr,
    role: user.role || "STUDENT",
    profile: profile ? { ...profile, id: profile._id?.toString() } : null
  };
}

export async function createUser(data: { email: string; name?: string; password?: string; role?: string }) {
  const db = await getDb();
  const emailClean = data.email.toLowerCase().trim();
  const role = data.role === "RECRUITER" ? "RECRUITER" : "STUDENT";
  const now = new Date();

  const userResult = await db.collection("users").insertOne({
    email: emailClean,
    name: data.name || "",
    password: data.password || "",
    role,
    createdAt: now,
    updatedAt: now,
  });

  const userId = userResult.insertedId.toString();

  const profileResult = await db.collection("profiles").insertOne({
    userId,
    degree: "",
    skills: "",
    targetRoles: "",
    resumeUrl: "",
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: userId,
    email: emailClean,
    name: data.name,
    role,
    profile: {
      id: profileResult.insertedId.toString(),
      degree: "",
      skills: "",
      targetRoles: "",
      resumeUrl: ""
    }
  };
}

export async function updateUserProfile(
  email: string,
  data: { name?: string; degree?: string; skills?: string; targetRoles?: string; resumeUrl?: string }
) {
  const db = await getDb();
  const emailClean = email.toLowerCase().trim();
  const user = await db.collection<UserDoc>("users").findOne({ email: emailClean });

  if (!user) return null;
  const userId = user._id!.toString();
  const now = new Date();

  if (data.name !== undefined) {
    await db.collection("users").updateOne({ _id: user._id }, { $set: { name: data.name, updatedAt: now } });
  }

  const profileUpdates: any = { updatedAt: now };
  if (data.degree !== undefined) profileUpdates.degree = data.degree;
  if (data.skills !== undefined) profileUpdates.skills = data.skills;
  if (data.targetRoles !== undefined) profileUpdates.targetRoles = data.targetRoles;
  if (data.resumeUrl !== undefined) profileUpdates.resumeUrl = data.resumeUrl;

  await db.collection("profiles").updateOne(
    { userId },
    { $set: profileUpdates, $setOnInsert: { userId, createdAt: now } },
    { upsert: true }
  );

  return findUserByEmail(emailClean);
}

export async function upsertApplication(userEmail: string, appData: any) {
  const db = await getDb();
  const user = await findUserByEmail(userEmail);
  if (!user) throw new Error("User not found");

  const userId = user.id!;
  const { jobId, title, company, location, source, applyUrl, status, coverLetter } = appData;
  const now = new Date();

  const filter = { userId, jobId };
  const update = {
    $set: {
      userId,
      jobId,
      title,
      company,
      location: location || "Remote",
      source: source || "Direct Link",
      applyUrl: applyUrl || "",
      status: status || "Applied",
      coverLetter: coverLetter || "",
      appliedAt: now
    }
  };

  const res = await db.collection("applications").updateOne(filter, update, { upsert: true });

  return {
    id: res.upsertedId ? res.upsertedId.toString() : jobId,
    userId,
    jobId,
    title,
    company,
    location,
    source,
    applyUrl,
    status,
    coverLetter,
    appliedAt: now
  };
}

export async function getUserApplications(userEmail: string) {
  const user = await findUserByEmail(userEmail);
  if (!user) return [];

  const db = await getDb();
  const apps = await db.collection("applications")
    .find({ userId: user.id })
    .sort({ appliedAt: -1 })
    .toArray();

  return apps.map(app => ({
    ...app,
    id: app._id?.toString() || app.jobId
  }));
}

export async function updateUserPassword(email: string, hashedPassword: string) {
  const db = await getDb();
  const emailClean = email.toLowerCase().trim();
  await db.collection("users").updateOne(
    { email: emailClean },
    { $set: { password: hashedPassword, updatedAt: new Date() } }
  );
}

// --- Recruiter Job Posting & Management ---

export async function createPostedJob(data: {
  recruiterEmail: string;
  recruiterName?: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  category?: string;
  description: string;
  skills: string[];
  applyUrl?: string;
}) {
  const db = await getDb();
  const now = new Date();

  const doc = {
    recruiterEmail: data.recruiterEmail.toLowerCase().trim(),
    recruiterName: data.recruiterName || "",
    title: data.title.trim(),
    company: data.company.trim(),
    location: data.location.trim(),
    salary: data.salary ? data.salary.trim() : "Competitive / Disclosed on Interview",
    category: data.category ? data.category.trim() : "General",
    description: data.description.trim(),
    skills: data.skills || [],
    applyUrl: data.applyUrl ? data.applyUrl.trim() : "",
    createdAt: now,
  };

  const res = await db.collection("posted_jobs").insertOne(doc);
  const id = res.insertedId.toString();

  return {
    id,
    ...doc,
    source: "Direct Recruiter Posting",
    isRecruiterPosted: true,
  };
}

export async function getPostedJobs(recruiterEmail?: string) {
  const db = await getDb();
  const filter: any = {};
  if (recruiterEmail) {
    filter.recruiterEmail = recruiterEmail.toLowerCase().trim();
  }

  const docs = await db.collection("posted_jobs")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((d) => ({
    id: d._id.toString(),
    title: d.title,
    company: d.company,
    location: d.location,
    salary: d.salary || "Competitive",
    category: d.category || "General",
    description: d.description,
    skills: d.skills || [],
    applyUrl: d.applyUrl || "",
    source: "Direct Recruiter Posting",
    isRecruiterPosted: true,
    recruiterEmail: d.recruiterEmail,
    recruiterName: d.recruiterName,
    createdAt: d.createdAt,
  }));
}

export async function deletePostedJob(jobId: string, recruiterEmail: string) {
  const db = await getDb();
  let queryId: ObjectId | string = jobId;
  try {
    queryId = new ObjectId(jobId);
  } catch {
    // string id fallback
  }

  await db.collection("posted_jobs").deleteOne({
    _id: queryId as any,
    recruiterEmail: recruiterEmail.toLowerCase().trim(),
  });

  return true;
}

export async function getApplicantsForRecruiter(recruiterEmail: string) {
  const db = await getDb();
  const emailClean = recruiterEmail.toLowerCase().trim();

  // Find all jobs posted by this recruiter
  const recruiterJobs = await db.collection("posted_jobs")
    .find({ recruiterEmail: emailClean })
    .toArray();

  const jobIds = recruiterJobs.map((j) => j._id.toString());
  if (jobIds.length === 0) return [];

  // Find applications matching these jobIds
  const apps = await db.collection("applications")
    .find({ jobId: { $in: jobIds } })
    .sort({ appliedAt: -1 })
    .toArray();

  // Fetch applicant user details
  const userIds = Array.from(new Set(apps.map((a) => a.userId)));
  const objectIds = userIds.map((id) => {
    try { return new ObjectId(id); } catch { return null; }
  }).filter(Boolean);

  const users = await db.collection("users").find({ _id: { $in: objectIds as ObjectId[] } }).toArray();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return apps.map((app) => {
    const applicant = userMap.get(app.userId);
    return {
      id: app._id.toString(),
      jobId: app.jobId,
      jobTitle: app.title,
      company: app.company,
      applicantName: applicant?.name || "Student Applicant",
      applicantEmail: applicant?.email || "Unknown Email",
      status: app.status || "Applied",
      coverLetter: app.coverLetter || "",
      appliedAt: app.appliedAt,
    };
  });
}
