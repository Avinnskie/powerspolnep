/**
 * Utility functions untuk generate kode unik anggota POWERS
 * Format: PWR + 4 digit (contoh: PWR2301, PWR2302, etc.)
 */

import { prisma } from "./prisma";

/**
 * Generate kode anggota unik berdasarkan tahun dan urutan
 * Format: PWR + 2 digit tahun + 2 digit urutan
 * Contoh: PWR2301, PWR2302, PWR2401
 */
export async function generateMemberCode(angkatan?: string): Promise<string> {
  // Gunakan tahun saat ini jika angkatan tidak ada
  const year = angkatan
    ? angkatan.slice(-2)
    : new Date().getFullYear().toString().slice(-2);

  // Cari kode terakhir dengan prefix tahun yang sama
  const lastMember = await prisma.user.findFirst({
    where: {
      memberCode: {
        startsWith: `PWR${year}`,
      },
    },
    orderBy: {
      memberCode: "desc",
    },
  });

  let sequence = 1;

  if (lastMember?.memberCode) {
    // Extract sequence number dari kode terakhir
    const lastSequence = parseInt(lastMember.memberCode.slice(-2));
    sequence = lastSequence + 1;
  }

  // Format sequence menjadi 2 digit
  const sequenceStr = sequence.toString().padStart(2, "0");

  return `PWR${year}${sequenceStr}`;
}

/**
 * Generate kode berdasarkan NIM (jika ada)
 * Format: PWR + 4 digit terakhir NIM
 * Contoh: PWR2345 (dari NIM 20232345)
 */
export function generateMemberCodeFromNIM(nim: string): string {
  // Ambil 4 digit terakhir dari NIM
  const lastFourDigits = nim.slice(-4);
  return `PWR${lastFourDigits}`;
}

/**
 * Generate kode berdasarkan nama
 * Format: PWR + 4 karakter dari nama (huruf pertama + 3 digit random)
 * Contoh: PWRA123, PWRB456
 */
export function generateMemberCodeFromName(name: string): string {
  const firstLetter = name.charAt(0).toUpperCase();
  const randomNumber = Math.floor(100 + Math.random() * 900); // 3 digit random
  return `PWR${firstLetter}${randomNumber}`;
}

/**
 * Validasi apakah kode anggota sudah digunakan
 */
export async function isMemberCodeExists(memberCode: string): Promise<boolean> {
  const existingUser = await prisma.user.findUnique({
    where: { memberCode },
  });

  return !!existingUser;
}

/**
 * Generate kode unik yang belum digunakan
 * Prioritas: NIM -> Sequential -> Name-based
 */
export async function generateUniqueMemberCode(user: {
  nim?: string | null;
  name: string;
  angkatan?: string | null;
}): Promise<string> {
  let memberCode: string;

  // Prioritas 1: Gunakan NIM jika ada
  if (user.nim) {
    memberCode = generateMemberCodeFromNIM(user.nim);

    // Check apakah sudah digunakan
    if (!(await isMemberCodeExists(memberCode))) {
      return memberCode;
    }
  }

  // Prioritas 2: Generate sequential berdasarkan angkatan
  memberCode = await generateMemberCode(user.angkatan || undefined);

  // Check apakah sudah digunakan
  if (!(await isMemberCodeExists(memberCode))) {
    return memberCode;
  }

  // Prioritas 3: Generate berdasarkan nama dengan retry
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    memberCode = generateMemberCodeFromName(user.name);

    if (!(await isMemberCodeExists(memberCode))) {
      return memberCode;
    }

    attempts++;
  }

  // Fallback: sequential dengan timestamp
  const timestamp = Date.now().toString().slice(-3);
  memberCode = `PWR${timestamp}`;

  // Jika masih conflict, tambah random
  while (await isMemberCodeExists(memberCode)) {
    const random = Math.floor(Math.random() * 100);
    memberCode = `PWR${timestamp}${random}`;
  }

  return memberCode;
}

/**
 * Update member code untuk user yang belum punya
 */
export async function generateMemberCodeForExistingUsers(): Promise<void> {
  const usersWithoutCode = await prisma.user.findMany({
    where: {
      memberCode: null,
      status: "ACTIVE",
    },
  });

  for (const user of usersWithoutCode) {
    const memberCode = await generateUniqueMemberCode(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { memberCode },
    });

    console.log(`Generated code ${memberCode} for user ${user.name}`);
  }
}
