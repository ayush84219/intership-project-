import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTeacherCollegeStudents, findUserByEmail } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await findUserByEmail(session.user.email);
    if (!teacher || (teacher.role !== "TEACHER" && teacher.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "Forbidden: Teacher access required." }, { status: 403 });
    }

    const students = await getTeacherCollegeStudents(teacher.email);

    return NextResponse.json({
      success: true,
      collegeName: teacher.collegeName,
      department: teacher.department,
      students,
    });
  } catch (error: any) {
    console.error("Error in GET /api/teacher/students:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
