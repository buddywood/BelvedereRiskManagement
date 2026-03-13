'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { QuestionOption } from "@/lib/assessment/types";
import { Check } from "lucide-react";

/**
 * Answer Option Components
 *
 * Card-based answer renderers for all question types.
 * All use shadcn Card components for premium selection feel.
 */

// Single Choice Cards
interface SingleChoiceCardsProps {
  options: QuestionOption[];
  value: string | number | null;
  onChange: (value: string | number) => void;
}

export function SingleChoiceCards({ options, value, onChange }: SingleChoiceCardsProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <Card
            key={String(option.value)}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40",
              isSelected && "border-brand/50 bg-brand/10"
            )}
            onClick={() => onChange(option.value)}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <div className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border-2 mt-0.5 shrink-0",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-border"
              )}>
                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-sm text-muted-foreground mt-1 leading-6">
                    {option.description}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Yes/No Cards
interface YesNoCardsProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function YesNoCards({ value, onChange }: YesNoCardsProps) {
  const options = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <Card
            key={option.value}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40",
              isSelected && "border-brand/50 bg-brand/10"
            )}
            onClick={() => onChange(option.value)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 mb-3",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-border"
              )}>
                {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
              </div>
              <div className="text-lg font-semibold text-foreground">
                {option.label}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Maturity Scale
interface MaturityScaleProps {
  options: QuestionOption[];
  value: number | null;
  onChange: (value: number) => void;
}

export function MaturityScale({ options, value, onChange }: MaturityScaleProps) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = value === option.value;
        // Calculate color intensity based on progression
        const progressLevel = index + 1;
        const totalLevels = options.length;

        return (
          <Card
            key={String(option.value)}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 relative overflow-hidden",
              isSelected && "border-brand/50 bg-brand/10"
            )}
            onClick={() => onChange(option.value as number)}
          >
            {/* Left border indicator showing progression */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity"
              style={{
                backgroundColor: `hsl(${44 + 28 * (progressLevel / totalLevels)} 68% 58%)`,
                opacity: isSelected ? 1 : 0.3,
              }}
            />
            <CardContent className="flex items-start gap-3 p-4 pl-5">
              <div className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border-2 mt-0.5 shrink-0",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-border"
              )}>
                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-sm text-muted-foreground mt-1 leading-6">
                    {option.description}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Numeric Input
interface NumericInputProps {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}

export function NumericInput({
  value,
  onChange,
  min,
  max,
  placeholder = "Enter a number"
}: NumericInputProps) {
  return (
    <div className="space-y-2">
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const num = parseFloat(e.target.value);
          if (!isNaN(num)) {
            onChange(num);
          }
        }}
        min={min}
        max={max}
        placeholder={placeholder}
        className="text-lg"
      />
      {(min !== undefined || max !== undefined) && (
        <div className="text-sm text-muted-foreground">
          {min !== undefined && max !== undefined
            ? `Enter a value between ${min} and ${max}`
            : min !== undefined
            ? `Minimum value: ${min}`
            : `Maximum value: ${max}`}
        </div>
      )}
    </div>
  );
}

// Short Text Input
interface ShortTextInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  multiline?: boolean;
}

export function ShortTextInput({
  value,
  onChange,
  maxLength = 500,
  placeholder = "Type your answer",
  multiline = false
}: ShortTextInputProps) {
  const Component = multiline ? Textarea : Input;
  const currentLength = value?.length || 0;

  return (
    <div className="space-y-2">
      <Component
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="text-lg"
        {...(multiline ? { rows: 4 } : {})}
      />
      {maxLength && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {currentLength} / {maxLength} characters
          </span>
          {currentLength > maxLength * 0.9 && (
            <span className="text-amber-700 dark:text-amber-300">
              Approaching character limit
            </span>
          )}
        </div>
      )}
    </div>
  );
}
