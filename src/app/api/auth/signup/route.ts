import { NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      role, 
      collegeName, 
      companyName, 
      department, 
      designation, 
      employeeId, 
      studentId, 
      phone, 
      website, 
      bio 
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (email, password, name)." },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();
    const existingUser = await findUserByEmail(emailClean);

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    const user = await createUser({
      email: emailClean,
      name: name.trim(),
      password: hashedPassword,
      role: role || "STUDENT",
      collegeName: collegeName?.trim(),
      companyName: companyName?.trim(),
      department: department?.trim(),
      designation: designation?.trim(),
      employeeId: employeeId?.trim(),
      studentId: studentId?.trim(),
      phone: phone?.trim(),
      website: website?.trim(),
      bio: bio?.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error: any) {
    console.error("Error in signup POST:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create user account." },
      { status: 500 }
    );
  }
}
