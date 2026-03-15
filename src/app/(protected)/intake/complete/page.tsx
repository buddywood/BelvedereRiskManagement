import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, User, ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * Interview Completion Page
 *
 * Confirmation page shown after successful interview submission.
 * Explains next steps including advisor review process and timeline.
 */

export default function CompletePage() {
  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12">
      <div className="space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
            Interview Complete
          </h1>
          <p className="text-lg text-muted-foreground">
            Thank you for completing your intake interview.
          </p>
        </div>

        {/* What Happens Next */}
        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-medium mb-6">What Happens Next</h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Advisor Review</h3>
                <p className="text-sm text-muted-foreground">
                  Your advisor will review your audio responses and transcriptions to understand your family's unique governance context.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">2</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Focus Area Identification</h3>
                <p className="text-sm text-muted-foreground">
                  They will identify key focus areas for your governance assessment based on your family's specific needs and challenges.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">3</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Customized Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  You will receive a customized governance assessment tailored to your family's circumstances and priorities.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6 bg-muted/60 border-border">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Timeline</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your advisor will typically review your responses within 1-2 business days.
            You'll be notified when your customized assessment is ready.
          </p>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/dashboard" className="flex items-center justify-center gap-2">
              Return to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              In the meantime, you can explore other areas of your workspace.
            </p>
          </div>
        </div>

        {/* Additional Resources */}
        <Card className="p-6 border-dashed">
          <h3 className="font-medium mb-3">While You Wait</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Review your existing family profiles and relationships</p>
            <p>• Explore the assessment framework to understand the evaluation criteria</p>
            <p>• Consider additional family members who should participate in the process</p>
          </div>
        </Card>
      </div>
    </div>
  );
}