import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { allQuestions } from "@/lib/assessment/questions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Advisors and admins land on the advisor hub instead of the client dashboard
  const role = session.user.role?.toString().toUpperCase();
  if (role === "ADVISOR" || role === "ADMIN") {
    redirect("/advisor");
  }

  // Client: check if intake is approved (assessment access gated on advisor approval)
  let intakeApproved = false;
  const submittedInterview = await prisma.intakeInterview.findFirst({
    where: { userId: session.user.id, status: "SUBMITTED" },
    select: { id: true },
  });
  if (submittedInterview) {
    const approval = await prisma.intakeApproval.findUnique({
      where: { interviewId: submittedInterview.id },
      select: { status: true },
    });
    intakeApproved = approval?.status === "APPROVED";
  }

  // Fetch assessments with responses and scores
  const assessments = await prisma.assessment.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { responses: true } },
      scores: {
        orderBy: { calculatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalQuestions = allQuestions.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-2 sm:space-y-3">
            <p className="text-sm text-muted-foreground">
              Welcome back,{" "}
              {session.user.firstName ?? session.user.name ?? "Guest"}
            </p>

          </div>

          <Card className="bg-background/60">
            <CardContent className="grid gap-3 pt-5 sm:grid-cols-3 sm:pt-6">
              <div>
                <p className="editorial-kicker">Assessments</p>
                <p className="mt-2 text-3xl font-semibold">
                  {assessments.length}
                </p>
              </div>
              <div>
                <p className="editorial-kicker">MFA</p>
                <p className="mt-2 text-3xl font-semibold">
                  {session?.user?.mfaEnabled ? "On" : "Off"}
                </p>
              </div>
              <div>
                <p className="editorial-kicker">Latest Status</p>
                <p className="mt-2 text-xl font-semibold">
                  {assessments[0]?.status === "COMPLETED"
                    ? "Results Ready"
                    : assessments.length
                      ? "In Progress"
                      : "Ready to Start"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className={!intakeApproved ? "opacity-75" : undefined}>
          <CardHeader>
            <CardTitle className="text-3xl">Your Assessments</CardTitle>
            <CardDescription>
              {intakeApproved
                ? "Monitor progress and continue or review the latest family governance assessment."
                : "Assessment unlocks after your advisor reviews and approves your intake."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!intakeApproved ? (
              <div className="rounded-[1.5rem] border section-divider bg-muted/40 px-6 py-10 text-center">
                <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
                  Complete your intake and wait for your advisor to approve it.
                  The assessment will then become available here.
                </p>
              </div>
            ) : assessments.length === 0 ? (
              <div className="rounded-[1.5rem] border section-divider bg-background/55 px-6 py-10 text-center">
                <p className="mx-auto mb-5 max-w-2xl text-sm leading-7 text-muted-foreground">
                  No assessments yet. Start your first risk assessment to
                  receive personalized governance recommendations.
                </p>
                <Button asChild size="lg">
                  <Link href="/assessment">Start Assessment</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => {
                  const isCompleted = assessment.status === "COMPLETED";
                  const responseCount = assessment._count.responses;
                  const progressPercentage =
                    (responseCount / totalQuestions) * 100;
                  const latestScore = assessment.scores[0];

                  return (
                    <Card key={assessment.id} className="bg-background/55">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-2xl">
                              Family Governance Assessment
                            </CardTitle>
                            <CardDescription>
                              Updated{" "}
                              {formatDistanceToNow(
                                new Date(assessment.updatedAt),
                                { addSuffix: true },
                              )}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={isCompleted ? "success" : "info"}
                            className="w-fit"
                          >
                            {isCompleted ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {!isCompleted ? (
                          <>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Progress
                                </span>
                                <span className="font-medium text-foreground">
                                  {responseCount} of {totalQuestions} questions
                                  answered
                                </span>
                              </div>
                              <Progress
                                value={progressPercentage}
                                className="h-2.5"
                              />
                              <p className="text-xs text-muted-foreground">
                                {Math.round(progressPercentage)}% complete
                              </p>
                            </div>

                            <div className="rounded-[1.25rem] border section-divider bg-card/50 px-4 py-4">
                              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                Section Status
                              </p>
                              <div className="mt-3 flex items-center gap-3">
                                <div className="flex-1">
                                  <Progress
                                    value={progressPercentage}
                                    className="h-2"
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  Family Governance
                                </span>
                              </div>
                            </div>

                            {intakeApproved ? (
                              <Button asChild className="w-full" size="lg">
                                <Link href="/assessment">
                                  Continue Assessment
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                className="w-full"
                                size="lg"
                                disabled
                                title="Assessment unlocks after your advisor approves your intake."
                              >
                                Continue Assessment
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            {latestScore && (
                              <div className="space-y-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Overall Score
                                    </p>
                                    <p className="text-4xl font-semibold">
                                      {latestScore.score.toFixed(1)} / 10
                                    </p>
                                  </div>
                                  <Badge
                                    variant={
                                      latestScore.riskLevel === "LOW"
                                        ? "success"
                                        : latestScore.riskLevel === "MEDIUM"
                                          ? "warning"
                                          : latestScore.riskLevel === "HIGH"
                                            ? "warning"
                                            : "outline"
                                    }
                                    className="w-fit"
                                  >
                                    {latestScore.riskLevel} Risk
                                  </Badge>
                                </div>

                                <div className="rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4 text-sm text-muted-foreground">
                                  Completed on{" "}
                                  {format(
                                    new Date(
                                      assessment.completedAt ||
                                        assessment.updatedAt,
                                    ),
                                    "MMM d, yyyy",
                                  )}
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                  {intakeApproved ? (
                                    <>
                                      <Button asChild size="lg">
                                        <Link href="/assessment/results">
                                          View Results
                                        </Link>
                                      </Button>
                                      <Button asChild size="lg" variant="outline">
                                        <a
                                          href={`/api/reports/${assessment.id}/pdf`}
                                          download
                                        >
                                          Download Report
                                        </a>
                                      </Button>
                                      <Button asChild size="lg" variant="outline">
                                        <Link href="/assessment/results">
                                          Get Templates
                                        </Link>
                                      </Button>
                                      <Button asChild size="lg" variant="outline">
                                        <Link href="/assessment">Start New</Link>
                                      </Button>
                                    </>
                                  ) : (
                                    <p className="col-span-full text-sm text-muted-foreground">
                                      Assessment actions unlock after your advisor approves your intake.
                                    </p>
                                  )}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Account Settings</CardTitle>
            <CardDescription>
              Review identity and account protection details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4">
              <p className="editorial-kicker">Email</p>
              <p className="mt-2 text-base font-semibold">
                {session?.user?.email}
              </p>
            </div>

            <div className="rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="editorial-kicker">Two-Factor Auth</p>
                  <p className="mt-2 text-base font-semibold">
                    {session?.user?.mfaEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <Badge
                  variant={session?.user?.mfaEnabled ? "success" : "secondary"}
                >
                  {session?.user?.mfaEnabled ? "Protected" : "Recommended"}
                </Badge>
              </div>
            </div>

            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/settings">Manage Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
