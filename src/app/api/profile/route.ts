import { NextResponse } from "next/server";
import { 
  findUserByEmail, 
  updateUserProfile, 
  updateCompanyProfile, 
  updateTeacherProfile 
} from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = session.user.email;
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Error in GET /api/profile:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = session.user.email;
    const body = await request.json();
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let updatedUser;
    const role = user.role || "STUDENT";

    if (role === "COMPANY" || role === "RECRUITER") {
      updatedUser = await updateCompanyProfile(email, {
        name: body.name,
        companyName: body.companyName,
        tagline: body.tagline,
        industry: body.industry,
        companySize: body.companySize,
        website: body.website,
        headquarters: body.headquarters,
        about: body.about || body.bio,
        foundedYear: body.foundedYear,
        logoUrl: body.logoUrl,
        phone: body.phone,
      });
    } else if (role === "TEACHER") {
      updatedUser = await updateTeacherProfile(email, {
        name: body.name,
        collegeName: body.collegeName,
        department: body.department,
        designation: body.designation,
        facultyId: body.facultyId || body.employeeId,
        officialEmail: body.officialEmail,
        officeLocation: body.officeLocation,
        bio: body.bio,
        phone: body.phone,
      });
    } else {
      // STUDENT or others
      updatedUser = await updateUserProfile(email, {
        name: body.name,
        phone: body.phone,
        bio: body.bio,
        degree: body.degree,
        skills: body.skills,
        targetRoles: body.targetRoles,
        resumeUrl: body.resumeUrl,
        githubUrl: body.githubUrl,
        linkedinUrl: body.linkedinUrl,
        portfolioUrl: body.portfolioUrl,
        collegeName: body.collegeName,
        studentId: body.studentId,
        gpa: body.gpa,
        graduationYear: body.graduationYear,
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Error in POST /api/profile:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
