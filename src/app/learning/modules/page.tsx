import Link from "next/link";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  topics: string[];
}

const modules: Module[] = [
  {
    id: "1",
    title: "Introduction to Programming",
    description: "Learn the fundamentals of programming including variables, data types, and basic control structures.",
    duration: "4 weeks",
    level: "Beginner",
    topics: ["Variables", "Data Types", "Control Flow", "Functions"]
  },
  {
    id: "2",
    title: "Web Development Basics",
    description: "Master HTML, CSS, and JavaScript to build modern web applications from scratch.",
    duration: "6 weeks",
    level: "Beginner",
    topics: ["HTML5", "CSS3", "JavaScript", "Responsive Design"]
  },
  {
    id: "3",
    title: "React Fundamentals",
    description: "Build dynamic user interfaces with React, including components, state, and hooks.",
    duration: "5 weeks",
    level: "Intermediate",
    topics: ["Components", "State", "Props", "Hooks", "Context"]
  },
  {
    id: "4",
    title: "Next.js Development",
    description: "Create full-stack applications with Next.js, server components, and API routes.",
    duration: "6 weeks",
    level: "Intermediate",
    topics: ["App Router", "Server Components", "API Routes", "Deployment"]
  },
  {
    id: "5",
    title: "Database Design",
    description: "Learn database concepts, SQL queries, and data modeling best practices.",
    duration: "5 weeks",
    level: "Intermediate",
    topics: ["SQL", "NoSQL", "Data Modeling", "Optimization"]
  },
  {
    id: "6",
    title: "Advanced TypeScript",
    description: "Deep dive into TypeScript features including generics, utility types, and advanced patterns.",
    duration: "4 weeks",
    level: "Advanced",
    topics: ["Generics", "Utility Types", "Decorators", "Type Guards"]
  }
];

function getLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "intermediate":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "advanced":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
}

export default function LearningModules() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Learning Modules
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Choose from our comprehensive collection of learning modules to enhance your skills.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Level Badge */}
              <div className="mb-4 flex items-start justify-between">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getLevelColor(module.level)}`}>
                  {module.level}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {module.duration}
                </span>
              </div>

              {/* Module Title */}
              <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {module.title}
              </h2>

              {/* Description */}
              <p className="mb-4 flex-grow text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {module.description}
              </p>

              {/* Topics */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Topics covered:
                </p>
                <div className="flex flex-wrap gap-2">
                  {module.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Start Learning Button */}
              <button className="mt-auto flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Start Learning
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Need Help Getting Started?
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Contact our support team or join our community forum for guidance and assistance with any module.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
