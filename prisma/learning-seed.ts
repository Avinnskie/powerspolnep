import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedLearningSystem() {
  console.log("🌱 Seeding learning system...");

  // Create levels
  const levels = [
    {
      number: 1,
      name: "Beginner",
      description: "Just getting started!",
      minXp: 0,
      maxXp: 99,
      color: "#10B981",
    },
    {
      number: 2,
      name: "Novice",
      description: "Learning the basics",
      minXp: 100,
      maxXp: 299,
      color: "#3B82F6",
    },
    {
      number: 3,
      name: "Apprentice",
      description: "Making good progress",
      minXp: 300,
      maxXp: 599,
      color: "#8B5CF6",
    },
    {
      number: 4,
      name: "Student",
      description: "Building confidence",
      minXp: 600,
      maxXp: 999,
      color: "#F59E0B",
    },
    {
      number: 5,
      name: "Scholar",
      description: "Solid understanding",
      minXp: 1000,
      maxXp: 1499,
      color: "#EF4444",
    },
    {
      number: 6,
      name: "Expert",
      description: "Advanced knowledge",
      minXp: 1500,
      maxXp: 2499,
      color: "#EC4899",
    },
    {
      number: 7,
      name: "Master",
      description: "Exceptional skills",
      minXp: 2500,
      maxXp: 4999,
      color: "#6366F1",
    },
    {
      number: 8,
      name: "Grandmaster",
      description: "Elite level",
      minXp: 5000,
      maxXp: null,
      color: "#A855F7",
    },
  ];

  console.log("Creating levels...");
  for (const levelData of levels) {
    await prisma.level.upsert({
      where: { number: levelData.number },
      update: levelData,
      create: levelData,
    });
  }

  // Create achievements
  const achievements = [
    {
      name: "First Steps",
      description: "Complete your first lesson",
      icon: "star",
      color: "#10B981",
      criteria: { type: "LESSONS_COMPLETED", value: 1 },
      xpReward: 25,
      isSecret: false,
    },
    {
      name: "Quick Learner",
      description: "Complete 5 lessons",
      icon: "trophy",
      color: "#3B82F6",
      criteria: { type: "LESSONS_COMPLETED", value: 5 },
      xpReward: 50,
      isSecret: false,
    },
    {
      name: "Module Master",
      description: "Complete your first module",
      icon: "medal",
      color: "#F59E0B",
      criteria: { type: "MODULES_COMPLETED", value: 1 },
      xpReward: 100,
      isSecret: false,
    },
    {
      name: "Streak Champion",
      description: "Maintain a 7-day learning streak",
      icon: "target",
      color: "#EF4444",
      criteria: { type: "STREAK_DAYS", value: 7 },
      xpReward: 75,
      isSecret: false,
    },
    {
      name: "Knowledge Seeker",
      description: "Reach 1000 total XP",
      icon: "star",
      color: "#8B5CF6",
      criteria: { type: "TOTAL_XP", value: 1000 },
      xpReward: 100,
      isSecret: false,
    },
    {
      name: "Perfect Score",
      description: "Get 10 questions correct",
      icon: "trophy",
      color: "#10B981",
      criteria: { type: "QUESTIONS_CORRECT", value: 10 },
      xpReward: 50,
      isSecret: true,
    },
  ];

  console.log("Creating achievements...");
  for (const achievementData of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievementData.name },
      update: achievementData,
      create: achievementData,
    });
  }

  // Create learning modules
  const modules = [
    {
      title: "English Basics",
      description:
        "Learn fundamental English grammar, vocabulary, and sentence structure.",
      slug: "english-basics",
      difficulty: "BEGINNER",
      order: 1,
      isPublished: true,
      xpReward: 150,
    },
    {
      title: "Everyday Conversations",
      description:
        "Practice common phrases and expressions for daily situations.",
      slug: "everyday-conversations",
      difficulty: "BEGINNER",
      order: 2,
      isPublished: true,
      xpReward: 200,
    },
    {
      title: "Business English",
      description: "Professional communication skills for workplace success.",
      slug: "business-english",
      difficulty: "INTERMEDIATE",
      order: 3,
      isPublished: true,
      xpReward: 250,
    },
    {
      title: "Advanced Grammar",
      description:
        "Master complex grammar structures and advanced language patterns.",
      slug: "advanced-grammar",
      difficulty: "ADVANCED",
      order: 4,
      isPublished: false,
      xpReward: 300,
    },
  ];

  console.log("Creating learning modules...");
  const createdModules = [];
  for (const moduleData of modules) {
    const module = await prisma.learningModule.upsert({
      where: { slug: moduleData.slug },
      update: moduleData,
      create: moduleData,
    });
    createdModules.push(module);
  }

  // Create lessons for English Basics module
  const englishBasicsModule = createdModules.find(
    (m) => m.slug === "english-basics",
  );
  if (englishBasicsModule) {
    const lessons = [
      {
        title: "Introduction to English",
        content: `
          <h2>Welcome to English Basics!</h2>
          <p>English is a global language spoken by over 1.5 billion people worldwide. Learning English opens doors to:</p>
          <ul>
            <li>Better career opportunities</li>
            <li>Access to more information and resources</li>
            <li>Enhanced travel experiences</li>
            <li>Cultural understanding</li>
          </ul>
          
          <h3>Basic Sentence Structure</h3>
          <p>English sentences typically follow the Subject-Verb-Object (SVO) pattern:</p>
          <ul>
            <li><strong>Subject</strong> - Who or what performs the action</li>
            <li><strong>Verb</strong> - The action word</li>
            <li><strong>Object</strong> - Who or what receives the action</li>
          </ul>
          
          <p><strong>Example:</strong> "I eat apples"</p>
          <ul>
            <li>Subject: I</li>
            <li>Verb: eat</li>
            <li>Object: apples</li>
          </ul>
        `,
        order: 1,
        moduleId: englishBasicsModule.id,
        xpReward: 25,
      },
      {
        title: "Basic Vocabulary",
        content: `
          <h2>Essential English Words</h2>
          <p>Let's start with some basic vocabulary that you'll use every day!</p>
          
          <h3>Common Nouns</h3>
          <ul>
            <li><strong>Person</strong> - a human being</li>
            <li><strong>House</strong> - a building where people live</li>
            <li><strong>Car</strong> - a vehicle for transportation</li>
            <li><strong>Book</strong> - something you read</li>
            <li><strong>Water</strong> - a liquid we drink</li>
          </ul>
          
          <h3>Basic Verbs</h3>
          <ul>
            <li><strong>Be</strong> - to exist (I am, you are, he/she is)</li>
            <li><strong>Have</strong> - to possess (I have, you have, he/she has)</li>
            <li><strong>Go</strong> - to move from one place to another</li>
            <li><strong>Come</strong> - to move toward the speaker</li>
            <li><strong>See</strong> - to look at with your eyes</li>
          </ul>
          
          <h3>Useful Adjectives</h3>
          <ul>
            <li><strong>Good</strong> - positive, well</li>
            <li><strong>Bad</strong> - negative, not good</li>
            <li><strong>Big</strong> - large in size</li>
            <li><strong>Small</strong> - little in size</li>
            <li><strong>Happy</strong> - feeling joy</li>
          </ul>
        `,
        order: 2,
        moduleId: englishBasicsModule.id,
        xpReward: 30,
      },
      {
        title: "Present Tense",
        content: `
          <h2>Present Tense in English</h2>
          <p>The present tense describes actions happening now or regularly.</p>
          
          <h3>Simple Present</h3>
          <p>Used for:</p>
          <ul>
            <li>Regular activities</li>
            <li>Facts</li>
            <li>Habits</li>
          </ul>
          
          <h4>Formation:</h4>
          <p><strong>I/You/We/They + base verb</strong></p>
          <p><strong>He/She/It + base verb + s/es</strong></p>
          
          <h4>Examples:</h4>
          <ul>
            <li>I <strong>work</strong> every day.</li>
            <li>She <strong>works</strong> in an office.</li>
            <li>We <strong>study</strong> English.</li>
            <li>He <strong>watches</strong> TV in the evening.</li>
          </ul>
          
          <h3>Present Continuous</h3>
          <p>Used for actions happening right now.</p>
          
          <h4>Formation:</h4>
          <p><strong>Subject + am/is/are + verb + ing</strong></p>
          
          <h4>Examples:</h4>
          <ul>
            <li>I <strong>am studying</strong> English now.</li>
            <li>She <strong>is working</strong> on her computer.</li>
            <li>They <strong>are watching</strong> a movie.</li>
          </ul>
        `,
        order: 3,
        moduleId: englishBasicsModule.id,
        xpReward: 35,
      },
    ];

    console.log("Creating lessons for English Basics...");
    const createdLessons = [];
    for (const lessonData of lessons) {
      const lesson = await prisma.lesson.create({
        data: lessonData,
      });
      createdLessons.push(lesson);
    }

    // Create questions for the lessons
    const questions = [
      // Questions for Introduction to English lesson
      {
        lessonId: createdLessons[0].id,
        type: "MULTIPLE_CHOICE",
        question: "What is the typical sentence structure in English?",
        options: [
          { value: "SVO", label: "Subject-Verb-Object" },
          { value: "VSO", label: "Verb-Subject-Object" },
          { value: "OVS", label: "Object-Verb-Subject" },
          { value: "SOV", label: "Subject-Object-Verb" },
        ],
        correctAnswer: "SVO",
        explanation:
          'English typically follows the Subject-Verb-Object (SVO) pattern, like "I eat apples".',
        order: 1,
        points: 10,
      },
      {
        lessonId: createdLessons[0].id,
        type: "TRUE_FALSE",
        question: "English is spoken by over 1.5 billion people worldwide.",
        correctAnswer: "true",
        explanation:
          "Yes, English is indeed spoken by over 1.5 billion people globally.",
        order: 2,
        points: 10,
      },

      // Questions for Basic Vocabulary lesson
      {
        lessonId: createdLessons[1].id,
        type: "FILL_BLANK",
        question:
          'Complete the sentence: "I _____ a book every night." (Use the verb "read")',
        correctAnswer: "read",
        explanation:
          'The correct answer is "read" - I read a book every night.',
        order: 1,
        points: 15,
      },
      {
        lessonId: createdLessons[1].id,
        type: "MULTIPLE_CHOICE",
        question: 'Which word means "to possess"?',
        options: [
          { value: "have", label: "Have" },
          { value: "go", label: "Go" },
          { value: "see", label: "See" },
          { value: "come", label: "Come" },
        ],
        correctAnswer: "have",
        explanation: '"Have" means to possess or own something.',
        order: 2,
        points: 10,
      },

      // Questions for Present Tense lesson
      {
        lessonId: createdLessons[2].id,
        type: "MULTIPLE_CHOICE",
        question: "Which sentence is in present continuous tense?",
        options: [
          { value: "I work every day", label: "I work every day" },
          { value: "I am working now", label: "I am working now" },
          { value: "I worked yesterday", label: "I worked yesterday" },
          { value: "I will work tomorrow", label: "I will work tomorrow" },
        ],
        correctAnswer: "I am working now",
        explanation:
          'Present continuous uses "am/is/are + verb + ing" for actions happening right now.',
        order: 1,
        points: 15,
      },
      {
        lessonId: createdLessons[2].id,
        type: "FILL_BLANK",
        question: 'Complete: "She _____ to school every day." (Use "go")',
        correctAnswer: "goes",
        explanation:
          'For he/she/it, we add "s" or "es" to the base verb: goes.',
        order: 2,
        points: 15,
      },
    ];

    console.log("Creating questions...");
    for (const questionData of questions) {
      await prisma.question.create({
        data: questionData,
      });
    }
  }

  // Create lessons for Everyday Conversations module
  const conversationsModule = createdModules.find(
    (m) => m.slug === "everyday-conversations",
  );
  if (conversationsModule) {
    const lessons = [
      {
        title: "Greetings and Introductions",
        content: `
          <h2>How to Greet People in English</h2>
          <p>Proper greetings are essential for making good first impressions!</p>
          
          <h3>Common Greetings</h3>
          <ul>
            <li><strong>Hello</strong> - Universal greeting, works in any situation</li>
            <li><strong>Hi</strong> - Informal, friendly greeting</li>
            <li><strong>Good morning</strong> - Before 12 PM</li>
            <li><strong>Good afternoon</strong> - 12 PM to 6 PM</li>
            <li><strong>Good evening</strong> - After 6 PM</li>
          </ul>
          
          <h3>Introducing Yourself</h3>
          <ul>
            <li>"Hi, I'm [your name]"</li>
            <li>"Hello, my name is [your name]"</li>
            <li>"Nice to meet you, I'm [your name]"</li>
          </ul>
          
          <h3>Asking Someone's Name</h3>
          <ul>
            <li>"What's your name?"</li>
            <li>"May I have your name?"</li>
            <li>"I didn't catch your name."</li>
          </ul>
          
          <h3>Responses to Introductions</h3>
          <ul>
            <li>"Nice to meet you too!"</li>
            <li>"Pleasure to meet you."</li>
            <li>"Great to meet you!"</li>
          </ul>
        `,
        order: 1,
        moduleId: conversationsModule.id,
        xpReward: 25,
      },
    ];

    for (const lessonData of lessons) {
      const lesson = await prisma.lesson.create({
        data: lessonData,
      });

      // Add a question for this lesson
      await prisma.question.create({
        data: {
          lessonId: lesson.id,
          type: "MULTIPLE_CHOICE",
          question: "What is an appropriate greeting for the afternoon?",
          options: [
            { value: "Good morning", label: "Good morning" },
            { value: "Good afternoon", label: "Good afternoon" },
            { value: "Good evening", label: "Good evening" },
            { value: "Good night", label: "Good night" },
          ],
          correctAnswer: "Good afternoon",
          explanation: "Good afternoon is used from 12 PM to 6 PM.",
          order: 1,
          points: 10,
        },
      });
    }
  }

  console.log("✅ Learning system seeded successfully!");
}

// Only run if this file is executed directly
if (require.main === module) {
  seedLearningSystem()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
