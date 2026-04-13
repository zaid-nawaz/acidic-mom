import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center text-gray-800 px-6">
      {/* Hero Section */}
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600">
          Welcome to Quinn
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Learn smarter with AI-powered insights, curated video lessons, and interactive quizzes.
          Your journey to mastering backend development starts here.
        </p>
        <Link
          href="/courses"
          className="inline-block px-8 mr-2 py-3 bg-blue-600 text-white font-medium text-lg rounded-full shadow-md hover:bg-blue-700 transition"
        >
          Explore Courses →
        </Link>

        <Link
          href="/addcourses"
          className="inline-block px-8 py-3 bg-blue-600 text-white font-medium text-lg rounded-full shadow-md hover:bg-blue-700 transition"
        >
          Add Courses →
        </Link>
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-160 h-160 bg-blue-300 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-40 right-1/2 translate-x-1/2 w-140 h-140 bg-purple-300 opacity-20 blur-3xl rounded-full"></div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-gray-500">
        © {new Date().getFullYear()} Lumino.
      </footer>
    </main>
  );
}
