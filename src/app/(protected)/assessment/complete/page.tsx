'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/assessment/store';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

/**
 * Assessment Completion Page
 *
 * Shown after user completes all visible questions.
 * Handles score calculation and transition to results.
 *
 * TODO: Integrate with scoring engine (Plan 05)
 */

export default function AssessmentCompletePage() {
  const router = useRouter();
  const { assessmentId } = useAssessmentStore();

  useEffect(() => {
    if (!assessmentId) {
      router.push('/assessment');
    }
  }, [assessmentId, router]);

  // TODO: Trigger score calculation here (Plan 05)
  // For now, just show completion message

  const handleViewResults = () => {
    // TODO: Navigate to results page once scoring is implemented
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              Assessment Complete
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Thank you for completing the Family Governance assessment.
            </p>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Calculating your governance score...</span>
            </div>

            <Button
              onClick={handleViewResults}
              size="lg"
              className="min-w-[200px]"
            >
              View Results
            </Button>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            You can review and change your answers at any time from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
