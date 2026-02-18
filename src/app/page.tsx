import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Belvedere Risk Management
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Family Governance Risk Assessment
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signin"
            className="px-6 py-3 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg border border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
