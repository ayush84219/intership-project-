import { NextResponse } from "next/server";
import { updateUserPassword } from "@/lib/db";
import crypto from "crypto";
import { resetCodesCache } from "../request/route";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();
    const cachedInfo = resetCodesCache.get(emailClean);

    if (!cachedInfo) {
      return NextResponse.json(
        { success: false, error: "Reset session expired or not requested. Please request again." },
        { status: 400 }
      );
    }

    if (Date.now() > cachedInfo.expires) {
      resetCodesCache.delete(emailClean);
      return NextResponse.json(
        { success: false, error: "Verification code expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (cachedInfo.code !== code.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code. Please check and try again." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(newPassword);
    await updateUserPassword(emailClean, hashedPassword);

    resetCodesCache.delete(emailClean);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully."
    });
  } catch (error: any) {
    console.error("Error in forgot-password reset API:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
