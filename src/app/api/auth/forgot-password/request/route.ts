import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";

export const resetCodesCache = new Map<string, { code: string; expires: number }>();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();
    const user = await findUserByEmail(emailClean);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email address." },
        { status: 404 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000;

    resetCodesCache.set(emailClean, { code, expires });

    return NextResponse.json({
      success: true,
      message: "Simulated recovery code generated.",
      code
    });
  } catch (error: any) {
    console.error("Error in forgot-password request API:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
