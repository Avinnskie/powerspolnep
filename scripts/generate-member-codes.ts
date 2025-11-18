/**
 * Script untuk generate member codes untuk existing users
 * Jalankan dengan: npx tsx scripts/generate-member-codes.ts
 */

import { PrismaClient } from "@prisma/client";
import { generateUniqueMemberCode } from "../src/lib/member-code";

const prisma = new PrismaClient();

async function generateMemberCodes() {
  try {
    console.log("🔄 Mengambil user yang belum punya member code...");

    const usersWithoutCode = await prisma.user.findMany({
      where: {
        memberCode: null,
      },
      select: {
        id: true,
        name: true,
        nim: true,
        angkatan: true,
        email: true,
        status: true,
      },
    });

    console.log(
      `📊 Ditemukan ${usersWithoutCode.length} user tanpa member code`,
    );

    if (usersWithoutCode.length === 0) {
      console.log("✅ Semua user sudah memiliki member code");
      return;
    }

    console.log("🚀 Mulai generate member codes...\n");

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutCode) {
      try {
        const memberCode = await generateUniqueMemberCode({
          nim: user.nim,
          name: user.name,
          angkatan: user.angkatan,
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { memberCode },
        });

        console.log(`✅ ${user.name} (${user.email}) → ${memberCode}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error untuk ${user.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📈 Hasil:`);
    console.log(`   ✅ Berhasil: ${successCount} user`);
    console.log(`   ❌ Error: ${errorCount} user`);
    console.log(`   📊 Total: ${usersWithoutCode.length} user`);

    if (successCount > 0) {
      console.log("\n🎉 Member codes berhasil di-generate!");

      // Show some examples
      console.log("\n📋 Contoh member codes yang baru dibuat:");
      const updatedUsers = await prisma.user.findMany({
        where: {
          id: { in: usersWithoutCode.slice(0, 5).map((u) => u.id) },
        },
        select: {
          name: true,
          memberCode: true,
          nim: true,
        },
      });

      updatedUsers.forEach((user) => {
        console.log(
          `   ${user.memberCode} - ${user.name}${user.nim ? ` (${user.nim})` : ""}`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Error during member code generation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Show current status
async function showStatus() {
  try {
    const totalUsers = await prisma.user.count();
    const usersWithCode = await prisma.user.count({
      where: { memberCode: { not: null } },
    });
    const usersWithoutCode = totalUsers - usersWithCode;

    console.log("\n📊 Status Member Codes:");
    console.log(`   👥 Total users: ${totalUsers}`);
    console.log(`   ✅ Dengan member code: ${usersWithCode}`);
    console.log(`   ❌ Tanpa member code: ${usersWithoutCode}`);
    console.log(
      `   📈 Progress: ${Math.round((usersWithCode / totalUsers) * 100)}%\n`,
    );

    if (usersWithCode > 0) {
      console.log("🔍 Contoh member codes yang ada:");
      const sampleUsers = await prisma.user.findMany({
        where: { memberCode: { not: null } },
        select: { name: true, memberCode: true, nim: true },
        take: 5,
        orderBy: { memberCode: "asc" },
      });

      sampleUsers.forEach((user) => {
        console.log(
          `   ${user.memberCode} - ${user.name}${user.nim ? ` (${user.nim})` : ""}`,
        );
      });
      console.log("");
    }
  } catch (error) {
    console.error("❌ Error showing status:", error);
  }
}

async function main() {
  console.log("🚀 POWERS Member Code Generator\n");

  await showStatus();
  await generateMemberCodes();

  console.log("\n" + "=".repeat(50));
  await showStatus();
}

// Run the script
main()
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
