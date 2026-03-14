import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActiveIntakeInterviewAction, startIntakeInterview } from "@/lib/actions/intake-actions";
import { redirect } from "next/navigation";

/**
 * Intake Landing Page
 *
 * Entry point for family governance intake interviews. Checks for existing active
 * interviews and provides a clear starting point with expectations.
 */

export default async function IntakePage() {
  // Check for existing active interview
  const activeResult = await getActiveIntakeInterviewAction();

  if (activeResult.success && activeResult.interview) {
    // User has an active interview - redirect to continue it
    redirect(`/intake/interview`);
  }

  // Server action to start a new interview
  async function handleStartInterview() {
    "use server";

    const result = await startIntakeInterview();

    if (result.success) {
      redirect("/intake/interview");
    }

    // If there's an error, the page will re-render
    // In production, we'd want better error handling here
  }

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
            Family Governance Intake Interview
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Before your assessment, we'd like to learn about your family through a brief audio interview.
            An advisor will review your responses.
          </p>
        </div>

        {/* Interview Overview Card */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-medium">What to Expect</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                <span>10 focused questions about your family's governance approach</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                <span>Audio responses that give your advisor rich context</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                <span>One question at a time with clear progress tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                <span>Automatic saving - you can pause and resume anytime</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-muted-foreground">ESTIMATED TIME</span>
              <span className="text-2xl font-semibold">10-15 min</span>
            </div>

            <form action={handleStartInterview} className="space-y-4">
              <Button type="submit" size="lg" className="w-full">
                Begin Interview
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your browser will request microphone access to record your responses.
              </p>
            </form>
          </div>
        </Card>

        {/* Additional Context */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Your responses will be reviewed by a qualified advisor to customize your governance assessment.
          </p>
        </div>
      </div>
    </div>
  );
}