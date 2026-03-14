import { Lightbulb } from "lucide-react";

/**
 * Question Display Component
 *
 * Displays intake interview questions with prominent text hierarchy.
 * Follows Belvedere editorial design patterns for clean, focused UX.
 */

export interface IntakeQuestion {
  id: string;
  questionText: string;
  context: string;
  recordingTips: string[];
  questionNumber: number;
}

interface QuestionDisplayProps {
  question: IntakeQuestion;
  totalQuestions: number;
}

export function QuestionDisplay({ question, totalQuestions }: QuestionDisplayProps) {
  return (
    <div className="py-8 sm:py-12 max-w-2xl mx-auto">
      {/* Question number - editorial kicker style */}
      <div className="editorial-kicker text-sm text-muted-foreground uppercase tracking-wider mb-4">
        Question {question.questionNumber} of {totalQuestions}
      </div>

      {/* Question text - prominent heading */}
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-6">
        {question.questionText}
      </h1>

      {/* Context - secondary guidance */}
      <p className="text-base text-muted-foreground mb-8 leading-relaxed">
        {question.context}
      </p>

      {/* Recording tips with subtle styling */}
      {question.recordingTips && question.recordingTips.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="size-4" />
            <span className="font-medium">Recording Tips</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground pl-6">
            {question.recordingTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/60 mt-2 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}