# Profile Page & Gamification System

## 📋 Overview

Halaman profile POWERS telah dirancang tidak hanya untuk menampilkan informasi anggota dan QR code, tetapi juga sebagai fondasi untuk sistem gamifikasi pembelajaran yang akan diimplementasikan di masa depan.

## 🎯 Fitur Saat Ini (v1.0)

### 1. **Profile Information**

Menampilkan informasi lengkap anggota:

- Nama, Email, Role
- NIM, Angkatan, Phone
- Divisi POWERS
- Position/Jabatan
- Status (ACTIVE/INACTIVE)
- Member Code untuk QR

### 2. **QR Code Display**

- Tampilan QR code statis personal
- Toggle show/hide QR code
- Komponen MemberQRCode terintegrasi
- Download QR code sebagai PNG
- Copy member code ke clipboard

### 3. **Quick Actions**

- Edit Profile (coming soon)
- Change Password (coming soon)
- View QR Code

### 4. **Member Statistics**

- Tanggal bergabung
- Member code
- Level & XP preview (placeholder untuk gamifikasi)

## 🎮 Rencana Gamifikasi (Coming Soon)

### Konsep Utama

Sistem gamifikasi pembelajaran dirancang untuk meningkatkan engagement anggota POWERS dalam pembelajaran organisasi, soft skills, dan technical skills.

### 1. **Point & Experience System (XP)**

#### Cara Mendapatkan XP:

- ✅ **Attendance** (5-10 XP): Hadir di event/meeting
- 📚 **Learning Module** (20-50 XP): Selesai materi pembelajaran
- 🎯 **Quest/Challenge** (50-100 XP): Selesaikan quest tertentu
- 🏆 **Achievement** (100+ XP): Unlock achievement khusus
- 🤝 **Contribution** (10-30 XP): Kontribusi ke organisasi
- 📝 **Assessment** (30-60 XP): Lulus quiz/test

#### Level System:

```
Level 1: Newbie (0-100 XP)
Level 2: Beginner (100-300 XP)
Level 3: Intermediate (300-600 XP)
Level 4: Advanced (600-1000 XP)
Level 5: Expert (1000-1500 XP)
Level 6: Master (1500-2500 XP)
Level 7: Legend (2500+ XP)
```

### 2. **Badge System**

#### Kategori Badge:

**Attendance Badges:**

- 🏅 First Timer - Hadir first event
- 🎖️ Regular - Hadir 5 event
- 🏆 Active Member - Hadir 10 event
- 💎 Dedicated - Hadir 20+ event

**Learning Badges:**

- 📖 Knowledge Seeker - Selesai 1 materi
- 📚 Book Worm - Selesai 5 materi
- 🎓 Scholar - Selesai 10 materi
- 🧠 Master Mind - Selesai 20+ materi

**Skill Badges:**

- 💻 Tech Rookie - Selesai tech module
- 🎤 Public Speaker - Selesai soft skill module
- 🎨 Creative Mind - Selesai creative module
- 🤝 Team Player - Collaboration achievement

**Special Badges:**

- ⭐ Early Adopter - User awal system
- 🔥 Streak Master - Learning streak 7 days
- 🎯 Perfectionist - 100% quiz score
- 👑 POWERS Champion - Complete all challenges

### 3. **Learning Modules**

#### Module Categories:

**1. Organizational Skills:**

- Leadership & Management
- Event Planning & Execution
- Team Collaboration
- Problem Solving

**2. Technical Skills:**

- Web Development Basics
- Design Thinking
- Data Analysis
- Project Management Tools

**3. Soft Skills:**

- Public Speaking
- Communication
- Time Management
- Conflict Resolution

**4. POWERS Specific:**

- POWERS History & Values
- Division Responsibilities
- Event Best Practices
- Community Building

#### Module Structure:

```
Module:
├── Introduction (Text/Video)
├── Learning Materials
│   ├── Text Content
│   ├── Video Tutorial
│   └── Interactive Examples
├── Quiz/Assessment
└── Certificate (upon completion)
```

### 4. **Quest System**

#### Quest Types:

**Daily Quests** (5-10 XP):

- Login to dashboard
- View learning material
- Check upcoming events

**Weekly Quests** (20-50 XP):

- Attend 1 event
- Complete 1 module
- Help team member

**Monthly Quests** (100-200 XP):

- Complete 3 modules
- Attend 3 events
- Earn 3 badges

**Special Quests** (Varies):

- Seasonal events
- Competition challenges
- Collaboration missions

### 5. **Leaderboard System**

#### Leaderboard Categories:

**Overall Leaderboard:**

- Top XP earners (all time)
- Monthly champions
- Weekly stars

**Category Leaderboards:**

- Most Attended (by events)
- Learning Champion (by modules)
- Quest Master (by quests)
- Badge Collector (by badges)

**Division Leaderboard:**

- Top members per division
- Division ranking
- Division achievements

## 📊 Database Schema (Future)

### Gamification Tables:

```prisma
model UserProgress {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  totalXP   Int      @default(0)
  level     Int      @default(1)
  currentLevelXP Int  @default(0)
  nextLevelXP   Int  @default(100)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId])
}

model Badge {
  id          String   @id @default(cuid())
  name        String
  description String
  icon        String   // Icon/image URL
  category    String   // ATTENDANCE, LEARNING, SKILL, SPECIAL
  requirement String   // Criteria to earn
  xpReward    Int      @default(0)
  rarity      String   // COMMON, RARE, EPIC, LEGENDARY

  userBadges  UserBadge[]

  createdAt   DateTime @default(now())
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  badgeId   String
  badge     Badge    @relation(fields: [badgeId], references: [id])
  earnedAt  DateTime @default(now())

  @@unique([userId, badgeId])
}

model LearningModule {
  id          String   @id @default(cuid())
  title       String
  description String
  category    String
  difficulty  String   // BEGINNER, INTERMEDIATE, ADVANCED
  duration    Int      // in minutes
  xpReward    Int
  content     String   @db.Text // JSON content

  progress    ModuleProgress[]
  quizzes     Quiz[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ModuleProgress {
  id           String         @id @default(cuid())
  userId       String
  user         User           @relation(fields: [userId], references: [id])
  moduleId     String
  module       LearningModule @relation(fields: [moduleId], references: [id])
  progress     Int            @default(0) // 0-100
  completed    Boolean        @default(false)
  completedAt  DateTime?

  @@unique([userId, moduleId])
}

model Quest {
  id          String   @id @default(cuid())
  title       String
  description String
  type        String   // DAILY, WEEKLY, MONTHLY, SPECIAL
  xpReward    Int
  requirement String   // JSON criteria
  active      Boolean  @default(true)
  startDate   DateTime?
  endDate     DateTime?

  userQuests  UserQuest[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model UserQuest {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  questId     String
  quest       Quest    @relation(fields: [questId], references: [id])
  progress    Int      @default(0)
  completed   Boolean  @default(false)
  completedAt DateTime?

  @@unique([userId, questId])
}

model XPTransaction {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  amount      Int
  source      String   // ATTENDANCE, MODULE, QUEST, ACHIEVEMENT
  sourceId    String?  // Reference to source
  description String
  createdAt   DateTime @default(now())
}
```

## 🎨 UI Components (Future)

### 1. **Profile Page Enhancements**

```tsx
// XP Progress Bar
<XPProgressBar
  currentXP={user.currentLevelXP}
  nextLevelXP={user.nextLevelXP}
  level={user.level}
/>

// Badge Showcase
<BadgeShowcase
  badges={user.badges}
  totalBadges={totalBadges}
/>

// Learning Stats
<LearningStats
  completedModules={user.completedModules}
  inProgressModules={user.inProgressModules}
  totalTime={user.totalLearningTime}
/>

// Quest Progress
<QuestList
  dailyQuests={dailyQuests}
  weeklyQuests={weeklyQuests}
  monthlyQuests={monthlyQuests}
/>
```

### 2. **Learning Module Page**

```tsx
// Module List
<ModuleGrid
  modules={modules}
  filter={filter}
  sort={sort}
/>

// Module Detail
<ModuleDetail
  module={module}
  progress={userProgress}
  onStart={startModule}
  onContinue={continueModule}
/>

// Quiz Component
<QuizComponent
  quiz={quiz}
  onSubmit={submitQuiz}
/>
```

### 3. **Leaderboard Page**

```tsx
// Leaderboard Tabs
<LeaderboardTabs
  categories={['overall', 'learning', 'attendance', 'quests']}
  divisions={divisions}
/>

// Ranking List
<RankingList
  rankings={rankings}
  currentUser={currentUser}
/>
```

### 4. **Achievement Page**

```tsx
// Achievement Grid
<AchievementGrid
  achievements={achievements}
  userAchievements={userAchievements}
/>

// Achievement Detail
<AchievementDetail
  achievement={achievement}
  progress={progress}
/>
```

## 🔄 Integration Points

### 1. **Event Attendance → XP**

```typescript
// When user attends event
await createXPTransaction({
  userId: user.id,
  amount: 10,
  source: "ATTENDANCE",
  sourceId: eventId,
  description: `Attended: ${event.name}`,
});

await checkAndAwardBadges(userId, "ATTENDANCE");
await updateQuestProgress(userId, "ATTEND_EVENT");
```

### 2. **Module Completion → XP & Badge**

```typescript
// When user completes module
await createXPTransaction({
  userId: user.id,
  amount: module.xpReward,
  source: "MODULE",
  sourceId: moduleId,
  description: `Completed: ${module.title}`,
});

await markModuleComplete(userId, moduleId);
await checkAndAwardBadges(userId, "LEARNING");
```

### 3. **Quest Progress Update**

```typescript
// Real-time quest tracking
await updateQuestProgress(userId, questType, {
  increment: 1,
  checkCompletion: true,
});
```

## 📈 Analytics & Insights

### User Analytics:

- Learning time per week/month
- XP gain rate
- Module completion rate
- Badge collection progress
- Quest completion rate

### Organizational Analytics:

- Overall engagement rate
- Popular modules
- Active learners ranking
- Division performance
- Skill distribution

## 🚀 Implementation Phases

### Phase 1: Foundation (Current)

- ✅ Profile page with placeholder
- ✅ QR code integration
- ✅ Basic user data structure

### Phase 2: XP & Levels (Next)

- Add UserProgress model
- Implement XP system
- Level progression
- XP transactions

### Phase 3: Badges

- Badge catalog
- Award logic
- Badge showcase UI
- Notification system

### Phase 4: Learning Modules

- Module management
- Content delivery
- Quiz system
- Progress tracking

### Phase 5: Quests

- Quest creation system
- Daily/Weekly/Monthly quests
- Progress tracking
- Rewards distribution

### Phase 6: Leaderboard & Social

- Leaderboard system
- Social features
- Challenges & competitions
- Team collaboration

## 🎯 Success Metrics

### Engagement Metrics:

- Daily active users
- Weekly learning time
- Module completion rate
- Quest participation rate
- Badge collection rate

### Learning Metrics:

- Skills acquired
- Knowledge retention (via quizzes)
- Practical application
- Peer collaboration

### Organizational Metrics:

- Member skill level
- Division competency
- Event attendance correlation
- Overall member growth

## 📝 Notes

### Current Implementation:

- Profile page sudah siap dengan placeholder gamifikasi
- API `/api/auth/me` untuk fetch user data
- Struktur UI sudah support gamifikasi elements
- QR code terintegrasi untuk attendance tracking

### Next Steps:

1. Design database schema lengkap
2. Implement XP & level system
3. Create badge catalog
4. Develop learning module CMS
5. Build quest management system
6. Deploy leaderboard
7. Add notifications & rewards

---

**Status:** Profile v1.0 ✅ | Gamification Planning 🎯  
**Last Updated:** 2025-01-07  
**Next Milestone:** Phase 2 - XP & Levels System
