import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { 
  getAllUsers, 
  updateUserRole, 
  updateVerificationStatus, 
  deleteUser, 
  findUserByEmail 
} from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await findUserByEmail(session.user.email);
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role") || "ALL";

    const users = await getAllUsers(roleFilter);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const { userId, role, verificationStatus, note } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId." }, { status: 400 });
    }

    if (role) {
      await updateUserRole(userId, role);
    }

    if (verificationStatus) {
      await updateVerificationStatus(userId, verificationStatus, note);
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/users:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await findUserByEmail(session.user.email);
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    await deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/users:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
