import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdvisorIntakeView } from "@/components/advisor/AdvisorIntakeView";
import { ReviewSidebar } from "@/components/advisor/ReviewSidebar";
import { getIntakeReviewData } from "@/lib/actions/advisor-actions";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params;

  // Get interview data for advisor review
  const result = await getIntakeReviewData(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { interview, approval, questions } = result.data;

  // Format submission date
  const submittedAt = interview.submittedAt
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(interview.submittedAt))
    : "Not submitted";

  // Get status badge variant
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'warning';
      case 'IN_REVIEW': return 'info';
      case 'PENDING':
      default: return 'outline';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'IN_REVIEW': return 'Under Review';
      case 'PENDING':
      default: return 'Pending Review';
    }
  };

  // No refresh function needed - server actions handle revalidation

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold">View intake</h1>
            </div>

            <Badge variant={getStatusVariant(approval?.status)}>
              {getStatusLabel(approval?.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Client info and transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client info header */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">
                        {interview.user.name || "Unnamed Client"}
                      </h2>
                      <p className="text-muted-foreground">{interview.user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>{submittedAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Responses:</span>
                      <span>{interview.responses.length} of {questions.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={interview.status === 'SUBMITTED' ? 'success' : 'outline'}>
                        {interview.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Intake form: view each question (with Play question) and client response */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">View intake</h3>
                <span className="text-sm text-muted-foreground">
                  {interview.responses.length} of {questions.length} responses
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Review each intake question as the client saw it. Use &quot;Play question&quot; to hear the question, then listen to the client&apos;s recorded response and read the transcript.
              </p>

              <AdvisorIntakeView
                responses={interview.responses}
                questions={questions}
                totalQuestions={questions.length}
              />
            </div>
          </div>

          {/* Right column - Review sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <ReviewSidebar
                  interviewId={interview.id}
                  approval={approval}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}