import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "./AudioPlayer";
import type { IntakeReviewData } from "@/lib/advisor/types";

interface TranscriptViewerProps {
  responses: IntakeReviewData['interview']['responses'];
  questions: IntakeReviewData['questions'];
}

export function TranscriptViewer({ responses, questions }: TranscriptViewerProps) {
  // Create a map for quick question lookup
  const questionMap = questions.reduce((map, question) => {
    map[question.id] = question;
    return map;
  }, {} as Record<string, IntakeReviewData['questions'][0]>);

  return (
    <div className="space-y-8">
      {responses.map((response) => {
        const question = questionMap[response.questionId];
        if (!question) return null;

        return (
          <section key={response.id} className="space-y-4">
            {/* Question header */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="editorial-kicker">Question {question.id.replace('intake-q', '')}</span>
              </div>
              <h3 className="text-lg font-medium leading-7 text-foreground">
                {question.text}
              </h3>
              {question.helpText && (
                <p className="text-sm text-muted-foreground leading-6">
                  {question.helpText}
                </p>
              )}
            </div>

            {/* Audio player */}
            {response.audioUrl && (
              <AudioPlayer
                audioUrl={response.audioUrl}
                duration={response.audioDuration || undefined}
                questionLabel={`Question ${question.id.replace('intake-q', '')}`}
              />
            )}

            {/* Transcription */}
            <div className="rounded-lg bg-muted/50 p-4">
              {response.transcriptionStatus === 'FAILED' && (
                <div className="mb-3">
                  <Badge variant="warning" className="text-xs">
                    Transcription Failed
                  </Badge>
                </div>
              )}

              {response.transcription ? (
                <p className="text-sm leading-6 text-foreground/90">
                  {response.transcription}
                </p>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground italic">
                  No transcription available
                </p>
              )}

              {/* Future expansion: confidence indicator can be added here when available */}
            </div>
          </section>
        );
      })}

      {responses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No responses available for this interview.</p>
        </div>
      )}
    </div>
  );
}