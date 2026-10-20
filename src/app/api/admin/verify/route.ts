import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { 
  getAdminStats, 
  getPendingVerifications, 
  updateVerificationStatus, 
  findUserByEmail 
} from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await findUserByEmail(session.user.email);
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const [stats, pendingUsers] = await Promise.all([
      getAdminStats(),
      getPendingVerifications(),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      pendingUsers,
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/verify:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await findUserByEmail(session.user.email);
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { userId, status, note } = body;

    if (!userId || !["VERIFIED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid parameters. status must be VERIFIED, REJECTED, or PENDING." },
        { status: 400 }
      );
    }

    const updated = await updateVerificationStatus(userId, status, note);

    return NextResponse.json({
      success: true,
      message: `User account has been ${status.toLowerCase()}.`,
      user: updated,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/verify:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
