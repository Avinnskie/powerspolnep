import { User } from "@/types/auth";
import { prisma } from "@/lib/prisma";
import type { User as PrismaUser } from "@prisma/client";

export async function getAllUsers(): Promise<PrismaUser[]> {
  return prisma.user.findMany();
}

export async function getUserByEmail(
  email: string,
): Promise<PrismaUser | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function getUserById(id: string): Promise<PrismaUser | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(user: Partial<User>): Promise<PrismaUser> {
  try {
    const data: {
      id?: string;
      email: string;
      name: string;
      password: string;
      role: "ADMIN" | "CORE" | "COMMITTEE" | "RANGERS";
      nim?: string | null;
      memberCode?: string | null;
      phone?: string | null;
      avatar?: string | null;
      powersDivisionId?: string | null;
      position?: string | null;
      angkatan?: string | null;
      status: string;
    } = {
      email: user.email!.toLowerCase(),
      name: user.name!,
      password: user.password || "",
      role: user.role || "RANGERS",
      nim: user.nim,
      memberCode: user.memberCode,
      phone: user.phone,
      avatar: user.avatar,
      powersDivisionId: user.powersDivisionId,
      position: user.position,
      angkatan: user.angkatan,
      status: user.status || "ACTIVE",
    };

    // Only set ID if provided (otherwise Prisma generates CUID)
    if (user.id) {
      data.id = user.id;
    }

    return await prisma.user.create({ data });
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Email already exists");
    }
    throw error;
  }
}

export async function updateUser(
  id: string,
  data: Partial<User>,
): Promise<PrismaUser> {
  const updateData: {
    email?: string;
    name?: string;
    password?: string;
    role?: "ADMIN" | "CORE" | "COMMITTEE" | "RANGERS";
    nim?: string | null;
    memberCode?: string | null;
    phone?: string | null;
    avatar?: string | null;
    powersDivisionId?: string | null;
    position?: string | null;
    angkatan?: string | null;
    status?: string;
  } = {};
  if (data.email) updateData.email = data.email.toLowerCase();
  if (data.name) updateData.name = data.name;
  if (data.password) updateData.password = data.password;
  if (data.role) updateData.role = data.role;
  if (data.nim !== undefined) updateData.nim = data.nim;
  if (data.memberCode !== undefined) updateData.memberCode = data.memberCode;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.powersDivisionId !== undefined)
    updateData.powersDivisionId = data.powersDivisionId;
  if (data.position !== undefined) updateData.position = data.position;
  if (data.angkatan !== undefined) updateData.angkatan = data.angkatan;
  if (data.status !== undefined) updateData.status = data.status;

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });
}

// Backward compatibility aliases
export const getAllCommittees = getAllUsers;
export const getCommitteeByEmail = getUserByEmail;
export const getCommitteeById = getUserById;
export const createCommittee = createUser;
export const updateCommittee = updateUser;
export const deleteCommittee = deleteUser;

export { prisma };
