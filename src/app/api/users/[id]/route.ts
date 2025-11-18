import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nim: true,
        phone: true,
        avatar: true,
        position: true,
        angkatan: true,
        status: true,
        powersDivision: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PUT /api/users/[id] - Update user (Admin/Core only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userRole = request.headers.get("x-user-role");
    const currentUserId = request.headers.get("x-user-id");

    // Users can update themselves, or ADMIN and CORE can update anyone
    const isSelfUpdate = currentUserId === id;
    const isAdminOrCore = userRole === "ADMIN" || userRole === "CORE";

    if (!isSelfUpdate && !isAdminOrCore) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      email,
      name,
      password,
      role,
      nim,
      phone,
      avatar,
      position,
      powersDivisionId,
      angkatan,
      status,
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // If email is being changed, check if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email already exists" },
          { status: 400 },
        );
      }
    }

    // If NIM is being changed, check if it's already taken
    if (nim && nim !== existingUser.nim) {
      const nimExists = await prisma.user.findUnique({
        where: { nim },
      });

      if (nimExists) {
        return NextResponse.json(
          { success: false, message: "NIM already exists" },
          { status: 400 },
        );
      }
    }

    // Users updating themselves can only update certain fields
    if (isSelfUpdate && !isAdminOrCore) {
      // Non-admin/core users cannot change these sensitive fields
      if (role || status) {
        return NextResponse.json(
          { success: false, message: "You cannot change role or status" },
          { status: 403 },
        );
      }
    }

    // Only ADMIN can change roles
    if (role && userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only admin can change user roles" },
        { status: 403 },
      );
    }

    // Prepare update data
    const updateData: {
      email?: string;
      name?: string;
      password?: string;
      role?: Role;
      nim?: string | null;
      phone?: string | null;
      avatar?: string | null;
      position?: string | null;
      powersDivisionId?: string | null;
      angkatan?: string | null;
      status?: string;
    } = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) updateData.password = await hashPassword(password);
    if (role) updateData.role = role as Role;
    if (nim !== undefined) updateData.nim = nim;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (position !== undefined) updateData.position = position;
    if (powersDivisionId !== undefined)
      updateData.powersDivisionId = powersDivisionId;
    if (angkatan !== undefined) updateData.angkatan = angkatan;
    if (status !== undefined) updateData.status = status;

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nim: true,
        phone: true,
        avatar: true,
        position: true,
        angkatan: true,
        status: true,
        powersDivision: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    // Log more details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update user",
        error:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}

// DELETE /api/users/[id] - Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userRole = request.headers.get("x-user-role");

    // Only ADMIN can delete users
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 },
    );
  }
}
