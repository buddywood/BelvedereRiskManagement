import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Welcome back, {session?.user?.email?.split("@")[0]}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Manage your family governance risk assessments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Your Assessments Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Your Assessments
          </h3>
          <div className="text-center py-8">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No assessments yet. Start your first risk assessment to get personalized governance recommendations.
            </p>
            <Link
              href="/assessment"
              className="inline-block px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Start Assessment
            </Link>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Account Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-zinc-700 dark:text-zinc-300">Email</span>
              <span className="text-zinc-900 dark:text-zinc-50 font-medium">
                {session?.user?.email}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-zinc-700 dark:text-zinc-300">Two-Factor Auth</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                session?.user?.mfaEnabled
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
              }`}>
                {session?.user?.mfaEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <Link
              href="/settings"
              className="inline-block mt-4 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Manage Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
