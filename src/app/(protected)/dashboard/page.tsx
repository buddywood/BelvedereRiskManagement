import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { allQuestions } from "@/lib/assessment/questions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Fetch assessments with responses and scores
  const assessments = await prisma.assessment.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { responses: true } },
      scores: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const totalQuestions = allQuestions.length;

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

          {assessments.length === 0 ? (
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
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => {
                const isCompleted = assessment.status === 'COMPLETED';
                const responseCount = assessment._count.responses;
                const progressPercentage = (responseCount / totalQuestions) * 100;
                const latestScore = assessment.scores[0];

                return (
                  <Card key={assessment.id} className="border-zinc-200 dark:border-zinc-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold">
                          Family Governance Assessment
                        </CardTitle>
                        <Badge
                          variant={isCompleted ? 'success' : 'info'}
                          className="ml-2"
                        >
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!isCompleted ? (
                        <>
                          {/* In-progress state */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-600 dark:text-zinc-400">
                                Progress
                              </span>
                              <span className="text-zinc-900 dark:text-zinc-50 font-medium">
                                {responseCount} of {totalQuestions} questions answered
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {Math.round(progressPercentage)}% complete
                            </p>
                          </div>

                          {/* Pillar-by-pillar completion */}
                          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                              Section Status
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700">
                                <div
                                  className="h-full rounded-full bg-blue-500 transition-all"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                Family Governance
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Last updated {formatDistanceToNow(new Date(assessment.updatedAt), { addSuffix: true })}
                          </div>

                          <Link
                            href="/assessment"
                            className="inline-block w-full px-4 py-2 text-center bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
                          >
                            Continue Assessment
                          </Link>
                        </>
                      ) : (
                        <>
                          {/* Completed state */}
                          {latestScore && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Overall Score
                                  </p>
                                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                                    {latestScore.overallScore.toFixed(1)} / 10
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    latestScore.riskLevel === 'LOW' ? 'success' :
                                    latestScore.riskLevel === 'MEDIUM' ? 'warning' :
                                    latestScore.riskLevel === 'HIGH' ? 'warning' :
                                    'default'
                                  }
                                  className="text-xs"
                                >
                                  {latestScore.riskLevel} Risk
                                </Badge>
                              </div>

                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                Completed on {format(new Date(assessment.completedAt || assessment.updatedAt), 'MMM d, yyyy')}
                              </div>

                              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400">
                                <p className="mb-1 font-medium">Comprehensive Assessment Status</p>
                                <div className="flex items-center justify-between">
                                  <span>Questions Answered:</span>
                                  <span className="font-medium">{responseCount} / {totalQuestions}</span>
                                </div>
                                <div className="mt-1 text-green-600 dark:text-green-400 font-medium">
                                  Assessment Complete - Results Available
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <Link
                                  href="/assessment/results"
                                  className="inline-block px-4 py-2 text-center bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium text-sm"
                                >
                                  View Results
                                </Link>
                                <Link
                                  href="/assessment"
                                  className="inline-block px-4 py-2 text-center text-zinc-900 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium text-sm"
                                >
                                  Start New
                                </Link>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
