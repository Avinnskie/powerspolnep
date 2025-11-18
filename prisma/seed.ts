import { PrismaClient, Role } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { seedLearningSystem } from "./learning-seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const hashedPassword = await bcryptjs.hash("password123", 10);

  // First, create PowersDivisions
  const divisions = [
    {
      name: "Programming",
      description: "Software development and programming",
    },
    { name: "Design", description: "UI/UX design and visual communication" },
    {
      name: "Multimedia",
      description: "Video editing, photography, and multimedia content",
    },
  ];

  const createdDivisions = [];
  for (const division of divisions) {
    const createdDivision = await prisma.powersDivision.upsert({
      where: { name: division.name },
      update: {},
      create: division,
    });
    createdDivisions.push(createdDivision);
    console.log(`✅ Created division: ${createdDivision.name}`);
  }

  const users = [
    // Admin
    {
      email: "admin@powerspolnep.com",
      name: "Admin POWERS",
      password: hashedPassword,
      role: Role.ADMIN,
      nim: null,
      phone: "081234567890",
      avatar: null,
      position: "Administrator",
      angkatan: null,
      status: "ACTIVE",
    },
    // Core - Ketua Umum
    {
      email: "ketua@powerspolnep.com",
      name: "Ahmad Fauzi",
      password: hashedPassword,
      role: Role.CORE,
      nim: "2301001",
      phone: "081234567891",
      avatar: null,
      position: "Ketua Umum",
      angkatan: "2023",
      status: "ACTIVE",
    },
    // Core - Sekretaris
    {
      email: "sekretaris@powerspolnep.com",
      name: "Siti Nurhaliza",
      password: hashedPassword,
      role: Role.CORE,
      nim: "2301002",
      phone: "081234567892",
      avatar: null,
      position: "Sekretaris",
      angkatan: "2023",
      status: "ACTIVE",
    },
    // Core - Bendahara
    {
      email: "bendahara@powerspolnep.com",
      name: "Budi Santoso",
      password: hashedPassword,
      role: Role.CORE,
      nim: "2301003",
      phone: "081234567893",
      avatar: null,
      position: "Bendahara",
      angkatan: "2023",
      status: "ACTIVE",
    },
    // Core - Ketua Divisi Programming
    {
      email: "kadiv.programming@powerspolnep.com",
      name: "Rina Wati",
      password: hashedPassword,
      role: Role.CORE,
      nim: "2301004",
      phone: "081234567894",
      avatar: null,
      powersDivisionId: createdDivisions.find((d) => d.name === "Programming")
        ?.id,
      position: "Ketua Divisi",
      angkatan: "2023",
      status: "ACTIVE",
    },
    // Core - Ketua Divisi Design
    {
      email: "kadiv.design@powerspolnep.com",
      name: "Andi Pratama",
      password: hashedPassword,
      role: Role.CORE,
      nim: "2301005",
      phone: "081234567895",
      avatar: null,
      powersDivisionId: createdDivisions.find((d) => d.name === "Design")?.id,
      position: "Ketua Divisi",
      angkatan: "2023",
      status: "ACTIVE",
    },
    // Core - Ketua Divisi Multimedia
    {
      email: "kadiv.multimedia@powerspolnep.com",
      name: "Dewi Lestari",
      password: hashedPassword,
      role: Role.CORE,
      nim: "2301006",
      phone: "081234567896",
      avatar: null,
      powersDivisionId: createdDivisions.find((d) => d.name === "Multimedia")
        ?.id,
      position: "Ketua Divisi",
      angkatan: "2023",
      status: "ACTIVE",
    },
    // Members - Programming Division
    {
      email: "member1@powerspolnep.com",
      name: "Raka Pratama",
      password: hashedPassword,
      role: Role.RANGERS,
      nim: "2401001",
      phone: "081234567897",
      avatar: null,
      powersDivisionId: createdDivisions.find((d) => d.name === "Programming")
        ?.id,
      position: "Anggota",
      angkatan: "2024",
      status: "ACTIVE",
    },
    {
      email: "member2@powerspolnep.com",
      name: "Sari Indah",
      password: hashedPassword,
      role: Role.RANGERS,
      nim: "2401002",
      phone: "081234567898",
      avatar: null,
      powersDivisionId: createdDivisions.find((d) => d.name === "Programming")
        ?.id,
      position: "Anggota",
      angkatan: "2024",
      status: "ACTIVE",
    },
    // Members - Design Division
    {
      email: "member3@powerspolnep.com",
      name: "Deni Setiawan",
      password: hashedPassword,
      role: Role.RANGERS,
      nim: "2401003",
      phone: "081234567899",
      avatar: null,
      powersDivisionId: createdDivisions.find((d) => d.name === "Design")?.id,
      position: "Anggota",
      angkatan: "2024",
      status: "ACTIVE",
    },
    {
      email: "member4@powerspolnep.com",
      name: "Maya Sari",
      password: hashedPassword,
      role: Role.RANGERS,
      nim: "2401004",
      phone: "081234567900",
      avatar: null,
      powersDivisionId: createdDivisions.find((d) => d.name === "Design")?.id,
      position: "Anggota",
      angkatan: "2024",
      status: "ACTIVE",
    },
    // Members - Multimedia Division
    {
      email: "member5@powerspolnep.com",
      name: "Rizki Ramadhan",
      password: hashedPassword,
      role: Role.RANGERS,
      nim: "2401005",
      phone: "081234567901",
      avatar: null,
      powersDivisionId: createdDivisions.find((d) => d.name === "Multimedia")
        ?.id,
      position: "Anggota",
      angkatan: "2024",
      status: "ACTIVE",
    },
    {
      email: "member6@powerspolnep.com",
      name: "Linda Permata",
      password: hashedPassword,
      role: Role.RANGERS,
      nim: "2401006",
      phone: "081234567902",
      avatar: null,
      powersDivisionId: createdDivisions.find((d) => d.name === "Multimedia")
        ?.id,
      position: "Anggota",
      angkatan: "2024",
      status: "ACTIVE",
    },
  ];

  const created = [];
  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    created.push(createdUser);
    console.log(
      `✅ Created user: ${createdUser.name} (${createdUser.role}) - ${createdUser.email}`,
    );
  }

  // Update division heads
  const programmingHead = created.find(
    (u) => u.email === "kadiv.programming@powerspolnep.com",
  );
  const designHead = created.find(
    (u) => u.email === "kadiv.design@powerspolnep.com",
  );
  const multimediaHead = created.find(
    (u) => u.email === "kadiv.multimedia@powerspolnep.com",
  );

  if (programmingHead) {
    await prisma.powersDivision.update({
      where: { name: "Programming" },
      data: { headId: programmingHead.id },
    });
    console.log(`✅ Set ${programmingHead.name} as Programming division head`);
  }

  if (designHead) {
    await prisma.powersDivision.update({
      where: { name: "Design" },
      data: { headId: designHead.id },
    });
    console.log(`✅ Set ${designHead.name} as Design division head`);
  }

  if (multimediaHead) {
    await prisma.powersDivision.update({
      where: { name: "Multimedia" },
      data: { headId: multimediaHead.id },
    });
    console.log(`✅ Set ${multimediaHead.name} as Multimedia division head`);
  }

  // Create demo event
  const demoEvent = await prisma.event.upsert({
    where: { slug: "powers-tech-summit-2024" },
    update: {},
    create: {
      name: "POWERS Tech Summit 2024",
      theme: "Teknologi untuk Masa Depan",
      description:
        "Event teknologi tahunan POWERS untuk sharing knowledge dan networking",
      slug: "powers-tech-summit-2024",
      chairId:
        created.find((u) => u.email === "ketua@powerspolnep.com")?.id || "",
      startAt: new Date("2024-12-15T08:00:00Z"),
      endAt: new Date("2024-12-15T17:00:00Z"),
      status: "PLANNING",
    },
  });
  console.log(`✅ Created demo event: ${demoEvent.name}`);

  // Add some participants to the event
  const participantIds = [
    created.find((u) => u.email === "kadiv.programming@powerspolnep.com")?.id,
    created.find((u) => u.email === "kadiv.design@powerspolnep.com")?.id,
    created.find((u) => u.email === "member1@powerspolnep.com")?.id,
    created.find((u) => u.email === "member2@powerspolnep.com")?.id,
    created.find((u) => u.email === "member3@powerspolnep.com")?.id,
  ].filter(Boolean);

  for (const userId of participantIds) {
    if (userId) {
      await prisma.eventParticipant.create({
        data: {
          eventId: demoEvent.id,
          userId,
          role: "COMMITTEE",
        },
      });
    }
  }
  console.log(`✅ Added ${participantIds.length} participants to demo event`);

  // Create event divisions
  const eventDivisions = [
    {
      name: "Acara",
      headId: created.find(
        (u) => u.email === "kadiv.programming@powerspolnep.com",
      )?.id,
    },
    {
      name: "Konsumsi",
      headId: created.find((u) => u.email === "kadiv.design@powerspolnep.com")
        ?.id,
    },
    {
      name: "Dokumentasi",
      headId: created.find(
        (u) => u.email === "kadiv.multimedia@powerspolnep.com",
      )?.id,
    },
  ];

  for (const divisionData of eventDivisions) {
    if (divisionData.headId) {
      await prisma.eventDivision.create({
        data: {
          name: divisionData.name,
          eventId: demoEvent.id,
          headId: divisionData.headId,
        },
      });
    }
  }
  console.log(`✅ Created ${eventDivisions.length} divisions for demo event`);

  // Create event sessions
  const sessions = [
    {
      title: "Opening Ceremony",
      description: "Pembukaan acara dan sambutan",
      location: "Aula Utama",
      startAt: new Date("2024-12-15T08:00:00Z"),
      endAt: new Date("2024-12-15T09:00:00Z"),
    },
    {
      title: "Tech Talk: AI & Machine Learning",
      description: "Presentasi tentang perkembangan AI dan ML",
      location: "Ruang Seminar",
      startAt: new Date("2024-12-15T09:30:00Z"),
      endAt: new Date("2024-12-15T11:00:00Z"),
    },
    {
      title: "Workshop: Web Development",
      description: "Hands-on workshop pengembangan web modern",
      location: "Lab Komputer",
      startAt: new Date("2024-12-15T13:00:00Z"),
      endAt: new Date("2024-12-15T15:00:00Z"),
    },
    {
      title: "Closing & Networking",
      description: "Penutupan dan sesi networking",
      location: "Aula Utama",
      startAt: new Date("2024-12-15T15:30:00Z"),
      endAt: new Date("2024-12-15T17:00:00Z"),
    },
  ];

  for (const sessionData of sessions) {
    await prisma.eventSession.create({
      data: {
        ...sessionData,
        eventId: demoEvent.id,
      },
    });
  }
  console.log(`✅ Created ${sessions.length} sessions for demo event`);

  // Seed learning system
  await seedLearningSystem();

  console.log("🎉 Seed completed!");
  console.log("📝 Default password for all users: password123");
  console.log(
    "🚀 Demo event 'POWERS Tech Summit 2024' created with divisions and sessions",
  );
  console.log(
    "📚 Learning system seeded with modules, lessons, questions, levels, and achievements",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
