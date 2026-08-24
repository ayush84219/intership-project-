import { NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();
    const existingUser = await findUserByEmail(emailClean);

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    const user = await createUser({
      email: emailClean,
      name: name.trim(),
      password: hashedPassword,
      role: role === "RECRUITER" ? "RECRUITER" : "STUDENT"
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      userId: user.id
    });
  } catch (error: any) {
    console.error("Error in signup POST:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create user." },
      { status: 500 }
    );
  }
}
