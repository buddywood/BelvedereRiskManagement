'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Question } from "@/lib/assessment/types";
import { InlineHelp } from "./InlineHelp";
import {
  SingleChoiceCards,
  YesNoCards,
  MaturityScale,
  NumericInput,
  ShortTextInput,
} from "./AnswerOptions";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * QuestionCard Component
 *
 * Main wrapper for single question display.
 * Renders question text, inline help, appropriate answer component,
 * and optional skip link for non-required questions.
 */

interface QuestionCardProps {
  question: Question;
  currentAnswer: unknown;
  onAnswer: (answer: unknown) => void;
  onSkip?: () => void;
}

export function QuestionCard({
  question,
  currentAnswer,
  onAnswer,
  onSkip,
}: QuestionCardProps) {
  // Create dynamic validation schema based on question
  const createSchema = () => {
    if (!question.required) {
      return z.object({
        answer: z.unknown().optional(),
      });
    }

    // Required question validation
    switch (question.type) {
      case 'yes-no':
      case 'single-choice':
        return z.object({
          answer: z.union([z.string(), z.number()]).refine(
            (val) => val !== null && val !== undefined,
            { message: "Please select an answer to continue" }
          ),
        });
      case 'maturity-scale':
        return z.object({
          answer: z.number({
            message: "Please select an answer to continue",
          }).refine(
            (val) => val !== null && val !== undefined,
            { message: "Please select an answer to continue" }
          ),
        });
      case 'numeric':
        return z.object({
          answer: z.number({
            message: "Please enter a number to continue",
          }),
        });
      case 'short-text':
        return z.object({
          answer: z.string().min(1, "Please enter an answer to continue"),
        });
      default:
        return z.object({
          answer: z.unknown().refine(
            (val) => val !== null && val !== undefined,
            { message: "Please select an answer to continue" }
          ),
        });
    }
  };

  const {
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSchema()),
    mode: 'onSubmit',
    defaultValues: {
      answer: currentAnswer,
    },
  });

  // Update form when currentAnswer changes (e.g., navigating back to this question)
  useEffect(() => {
    setValue('answer', currentAnswer);
  }, [currentAnswer, setValue]);

  // Handle answer change
  const handleAnswerChange = async (answer: unknown) => {
    setValue('answer', answer);
    onAnswer(answer);
    // Clear validation error when user provides an answer
    await trigger('answer');
  };

  // Render appropriate answer component based on question type
  const renderAnswerComponent = () => {
    const base = { onChange: handleAnswerChange };

    switch (question.type) {
      case 'yes-no':
        return (
          <YesNoCards
            {...base}
            value={currentAnswer != null ? String(currentAnswer) : null}
          />
        );

      case 'single-choice':
        return (
          <SingleChoiceCards
            options={question.options || []}
            {...base}
            value={currentAnswer != null ? (currentAnswer as string | number) : null}
          />
        );

      case 'maturity-scale':
        return (
          <MaturityScale
            options={question.options || []}
            {...base}
            value={currentAnswer != null ? Number(currentAnswer) : null}
          />
        );

      case 'numeric':
        return (
          <NumericInput
            {...base}
            value={currentAnswer != null ? Number(currentAnswer) : null}
          />
        );

      case 'short-text':
        return (
          <ShortTextInput
            {...base}
            value={currentAnswer != null ? String(currentAnswer) : ''}
          />
        );

      default:
        return (
          <div className="text-muted-foreground">
            Unknown question type: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="space-y-4 sm:space-y-5">
        <div className="space-y-3">
          <p className="editorial-kicker">
            {question.required ? "Required Question" : "Optional Question"}
          </p>
          <h2 className="text-2xl font-semibold leading-tight text-balance text-foreground sm:text-4xl">
            {question.text}
          </h2>
        </div>

        {question.subCategory ? (
          <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
            {question.subCategory.replace(/-/g, " ")}
          </p>
        ) : null}

        <InlineHelp
          helpText={question.helpText}
          learnMore={question.learnMore}
        />
      </div>

      <div className="mt-6 sm:mt-8">
        {renderAnswerComponent()}
      </div>

      {errors.answer && (
        <Alert variant="destructive">
          <AlertDescription>{errors.answer.message as string}</AlertDescription>
        </Alert>
      )}

      {!question.required && onSkip && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip this question
            <span className="text-xs ml-2 text-muted-foreground">
              (answering improves accuracy)
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
