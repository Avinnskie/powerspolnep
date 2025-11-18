import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Powers Divisions...");

  const predefinedDivisions = [
    {
      name: "Education",
      description:
        "Divisi yang bertugas mengelola kegiatan akademik, pelatihan, workshop, dan pengembangan kapasitas anggota POWERS dalam bidang teknologi dan akademik.",
    },
    {
      name: "Public Relation",
      description:
        "Divisi yang bertugas mengelola hubungan masyarakat, komunikasi eksternal, branding organisasi, dan menjalin kerjasama dengan pihak luar.",
    },
    {
      name: "Member Development Division",
      description:
        "Divisi yang fokus pada pengembangan anggota internal, mentoring, team building, dan peningkatan soft skill anggota POWERS.",
    },
    {
      name: "Event Organizer Division",
      description:
        "Divisi yang bertugas merencanakan, mengorganisir, dan mengelola berbagai event dan kegiatan yang diselenggarakan oleh POWERS.",
    },
  ];

  for (const division of predefinedDivisions) {
    const existingDivision = await prisma.powersDivision.findUnique({
      where: { name: division.name },
    });

    if (!existingDivision) {
      const createdDivision = await prisma.powersDivision.create({
        data: division,
      });
      console.log(`✅ Created division: ${createdDivision.name}`);
    } else {
      console.log(`⏭️  Division already exists: ${division.name}`);
    }
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
