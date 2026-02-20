'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/assessment/store';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Assessment Completion Page
 *
 * Transition page after completing all questions.
 * Triggers score calculation and redirects to results page.
 */

export default function AssessmentCompletePage() {
  const router = useRouter();
  const { assessmentId } = useAssessmentStore();
  const [isCalculating, setIsCalculating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      router.push('/assessment');
      return;
    }

    // Trigger score calculation
    const calculateScore = async () => {
      try {
        setIsCalculating(true);
        setError(null);

        const response = await fetch(`/api/assessment/${assessmentId}/score`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to calculate score');
        }

        // Score calculated successfully, wait 2 seconds for effect then redirect
        setTimeout(() => {
          router.push('/assessment/results');
        }, 2000);
      } catch (err) {
        setIsCalculating(false);
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    calculateScore();
  }, [assessmentId, router]);

  const handleRetry = () => {
    setError(null);
    setIsCalculating(true);
    window.location.reload();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                Calculation Error
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {error}
              </p>
            </div>

            <Alert variant="destructive" className="text-left">
              <AlertTitle>What went wrong?</AlertTitle>
              <AlertDescription>
                {error.includes('50%') ? (
                  <p>
                    You need to complete at least 50% of the assessment questions to receive a score.
                    Please return to the assessment and answer more questions.
                  </p>
                ) : (
                  <p>
                    There was an issue calculating your score. This could be due to incomplete data
                    or a temporary server issue.
                  </p>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 justify-center pt-4">
              <Button
                onClick={handleRetry}
                variant="default"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push('/assessment')}
                variant="outline"
              >
                Return to Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-6">
          <div className="flex justify-center">
            {isCalculating ? (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              {isCalculating ? 'Calculating Your Results' : 'Assessment Complete'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isCalculating
                ? 'Analyzing your governance structure and generating recommendations...'
                : 'Your results are ready.'}
            </p>
          </div>

          {isCalculating && (
            <div className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Calculating overall governance score</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                <span>Identifying risk drivers</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                <span>Generating action plan</span>
              </div>
            </div>
          )}

          <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-4">
            This will only take a moment...
          </p>
        </div>
      </div>
    </div>
  );
}
