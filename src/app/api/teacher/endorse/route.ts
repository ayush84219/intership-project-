import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { endorseStudent, findUserByEmail, prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await findUserByEmail(session.user.email);
    if (!teacher || (teacher.role !== "TEACHER" && teacher.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "Forbidden: Teacher access required." }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, skill, endorsement, rating, verifyAcademic } = body;

    if (!studentId || !endorsement) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (studentId, endorsement text)." },
        { status: 400 }
      );
    }

    const result = await endorseStudent(teacher.email, studentId, {
      skill,
      endorsement,
      rating: rating ? Number(rating) : 5,
      verifyAcademic: verifyAcademic !== false,
    });

    return NextResponse.json({
      success: true,
      message: "Student endorsed and verified successfully.",
      endorsement: result,
    });
  } catch (error: any) {
    console.error("Error in POST /api/teacher/endorse:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await findUserByEmail(session.user.email);
    if (!teacher || (teacher.role !== "TEACHER" && teacher.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "Forbidden: Teacher access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const endorsementId = searchParams.get("id");

    if (!endorsementId) {
      return NextResponse.json({ success: false, error: "Missing endorsement ID." }, { status: 400 });
    }

    await prisma.studentEndorsement.deleteMany({
      where: { id: endorsementId, teacherId: teacher.id },
    });

    return NextResponse.json({ success: true, message: "Endorsement removed." });
  } catch (error: any) {
    console.error("Error in DELETE /api/teacher/endorse:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
