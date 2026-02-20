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
    const props = {
      value: currentAnswer as any,
      onChange: handleAnswerChange,
    };

    switch (question.type) {
      case 'yes-no':
        return <YesNoCards {...props} />;

      case 'single-choice':
        return (
          <SingleChoiceCards
            options={question.options || []}
            {...props}
          />
        );

      case 'maturity-scale':
        return (
          <MaturityScale
            options={question.options || []}
            {...props}
          />
        );

      case 'numeric':
        return <NumericInput {...props} />;

      case 'short-text':
        return <ShortTextInput {...props} />;

      default:
        return (
          <div className="text-zinc-500">
            Unknown question type: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Question Text */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
          {question.text}
        </h2>

        {/* Inline Help */}
        <InlineHelp
          helpText={question.helpText}
          learnMore={question.learnMore}
        />
      </div>

      {/* Answer Component */}
      <div className="mt-8">
        {renderAnswerComponent()}
      </div>

      {/* Validation Error */}
      {errors.answer && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3">
          <p className="text-sm text-red-800 dark:text-red-200">
            {errors.answer.message as string}
          </p>
        </div>
      )}

      {/* Skip Link for Optional Questions */}
      {!question.required && onSkip && (
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Skip this question
            <span className="text-xs ml-2 text-zinc-500">(answering improves accuracy)</span>
          </Button>
        </div>
      )}
    </div>
  );
}
