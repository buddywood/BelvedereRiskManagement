"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";

import { MarketingMeterBar } from "@/components/marketing/MarketingMeterBar";
import { MarketingSurfaceCard } from "@/components/marketing/MarketingSurfaceCard";
import { PlatformPillarRadarPreview } from "@/components/marketing/PlatformPillarRadarPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { maturityHeatLevel } from "@/lib/assessment/governance-rubric";
import { MATURITY_SCALE_MAX } from "@/lib/assessment/maturity-scale";
import {
  demoQuestionOptions,
  scoreDemoAnswers,
  type DemoAnswers,
  type DemoExperience,
  type DemoMaturityLevel,
  type DemoResult,
} from "@/lib/marketing/demo-experience";
import { cn } from "@/lib/utils";

type HeatLevel = ReturnType<typeof maturityHeatLevel>;

const HEAT_BAR_FILL: Record<HeatLevel, string> = {
  strong: "fill-emerald-500",
  fair: "fill-amber-500",
  weak: "fill-orange-500",
  severe: "fill-red-500",
};

const HEAT_TEXT: Record<HeatLevel, string> = {
  strong: "text-emerald-700 dark:text-emerald-400",
  fair: "text-amber-700 dark:text-amber-400",
  weak: "text-orange-700 dark:text-orange-400",
  severe: "text-red-700 dark:text-red-400",
};

const GAP_BADGE_CLASS: Record<string, string> = {
  critical: "border-red-300 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  high: "border-orange-300 bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
  medium: "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  low: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
};

const GAP_BADGE_LABEL: Record<string, string> = {
  critical: "Critical",
  high: "Elevated",
  medium: "Moderate",
  low: "Low",
};

function ScorePanel({
  result,
  subjectLabel,
  heading,
  note,
}: {
  result: DemoResult;
  subjectLabel: string;
  heading: string;
  note: string;
}) {
  const heat = maturityHeatLevel(result.maturity);
  const started = result.answeredCount > 0;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="editorial-kicker">{heading}</p>
        <p className="text-sm text-muted-foreground">{subjectLabel}</p>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p
            className={cn(
              "font-display text-5xl font-semibold tabular-nums leading-none",
              started ? HEAT_TEXT[heat] : "text-muted-foreground/50",
            )}
            data-testid="demo-score-percent"
          >
            {started ? result.percent : "—"}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Resilience score (0–100)
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm tabular-nums text-foreground">
            {started ? result.maturity.toFixed(1) : "0.0"} / {MATURITY_SCALE_MAX}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">Mean maturity</p>
        </div>
      </div>

      <MarketingMeterBar
        percent={started ? result.percent : 0}
        fillClassName={cn("transition-all", HEAT_BAR_FILL[heat])}
        heightClassName="h-2.5"
      />

      {started ? (
        <p className="text-sm leading-6 text-muted-foreground">
          <span className="font-medium text-foreground">{result.tier.title}.</span>{" "}
          {result.tier.description}
        </p>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">{note}</p>
      )}

      <PlatformPillarRadarPreview
        pillars={result.domains}
        variant="prominent"
        className="mx-auto"
      />

      <p className="text-xs leading-5 text-muted-foreground">
        {result.answeredCount} of {result.questionCount} sample domains scored
        {result.domainsBeyondDemo > 0
          ? ` · ${result.domainsBeyondDemo} further domains covered in a full assessment`
          : null}
      </p>
    </div>
  );
}

export function InteractiveDemo({ experience }: { experience: DemoExperience }) {
  const [answers, setAnswers] = useState<DemoAnswers>({});
  const [index, setIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const result = useMemo(
    () => scoreDemoAnswers(experience, answers),
    [experience, answers],
  );

  const questions = experience.questions;
  const question = questions[index];
  const selected = question ? answers[question.id] : undefined;
  const isLast = index === questions.length - 1;

  const select = useCallback(
    (value: string) => {
      if (!question) return;
      const level = Number(value) as DemoMaturityLevel;
      setAnswers((previous) => ({ ...previous, [question.id]: level }));
    },
    [question],
  );

  const goNext = useCallback(() => {
    if (isLast) {
      setShowResult(true);
      // Focus lands on the result heading so keyboard and screen-reader users
      // are moved to the outcome rather than left on a removed button.
      requestAnimationFrame(() => resultHeadingRef.current?.focus());
      return;
    }
    setIndex((previous) => previous + 1);
    requestAnimationFrame(() => questionHeadingRef.current?.focus());
  }, [isLast]);

  const goBack = useCallback(() => {
    if (showResult) {
      setShowResult(false);
      requestAnimationFrame(() => questionHeadingRef.current?.focus());
      return;
    }
    setIndex((previous) => Math.max(0, previous - 1));
    requestAnimationFrame(() => questionHeadingRef.current?.focus());
  }, [showResult]);

  const restart = useCallback(() => {
    setAnswers({});
    setIndex(0);
    setShowResult(false);
    requestAnimationFrame(() => questionHeadingRef.current?.focus());
  }, []);

  const answeredPercent = Math.round(
    (result.answeredCount / result.questionCount) * 100,
  );

  return (
    <div
      className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8"
      data-testid="interactive-demo"
    >
      <MarketingSurfaceCard className="flex flex-col gap-6 sm:px-7 sm:py-7">
        {showResult ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2
                ref={resultHeadingRef}
                tabIndex={-1}
                className="scroll-mt-28 font-display text-2xl font-semibold tracking-tight text-foreground outline-none sm:text-3xl"
                data-testid="demo-result-heading"
              >
                {experience.resultHeadline}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {experience.nextStep}
              </p>
            </div>

            {result.gaps.length > 0 ? (
              <section className="space-y-3" aria-labelledby="demo-gaps-heading">
                <h3
                  id="demo-gaps-heading"
                  className="text-sm font-semibold text-foreground"
                >
                  Prioritized gaps
                </h3>
                <ul className="space-y-3" data-testid="demo-gap-list">
                  {result.gaps.map((gap) => (
                    <li
                      key={gap.title}
                      className="rounded-xl border border-border/70 bg-background/60 px-4 py-3.5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-[11px]", GAP_BADGE_CLASS[gap.level])}
                        >
                          {GAP_BADGE_LABEL[gap.level] ?? gap.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {gap.domain}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {gap.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {gap.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <p className="text-sm font-medium text-foreground">
                  No critical gaps in this sample.
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  A full assessment goes deeper on each domain — most engagements
                  surface gaps a six-question sample cannot reach.
                </p>
              </div>
            )}

            {result.strengths.length > 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                <span className="font-medium text-foreground">Holding up well:</span>{" "}
                {result.strengths.join(", ")}.
              </p>
            ) : null}

            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-h-12 sm:min-w-[13rem]">
                  <Link
                    href={experience.selfServeCta.href}
                    data-testid="demo-self-serve-cta"
                  >
                    {experience.selfServeCta.label}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="min-h-12 sm:min-w-[11rem]"
                >
                  <Link
                    href={experience.salesCta.href}
                    data-testid="demo-sales-cta"
                  >
                    {experience.salesCta.label}
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Not sure which fits?{" "}
                <Link
                  href={experience.pricingLink.href}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  data-testid="demo-pricing-link"
                >
                  {experience.pricingLink.label}
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="size-4" aria-hidden />
                Back to questions
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={restart}
                data-testid="demo-restart"
              >
                <RotateCcw className="size-4" aria-hidden />
                Start over
              </Button>
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              {experience.footerNote}
            </p>
          </div>
        ) : question ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Question {index + 1} of {questions.length}
                </p>
                <p className="font-mono text-xs tabular-nums text-muted-foreground">
                  {answeredPercent}% complete
                </p>
              </div>
              <Progress
                value={(index / questions.length) * 100}
                aria-label={`Question ${index + 1} of ${questions.length}`}
              />
            </div>

            <div className="space-y-2">
              <h2
                ref={questionHeadingRef}
                tabIndex={-1}
                className="scroll-mt-28 font-display text-xl font-semibold leading-snug tracking-tight text-foreground outline-none sm:text-2xl"
                data-testid="demo-question-prompt"
              >
                {question.prompt}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {question.helper}
              </p>
            </div>

            {/* Keyed per question: without a remount Radix carries the previous
                question's selection forward, so picking the same level twice in
                a row fires no change event. Empty string = nothing selected. */}
            <RadioGroup
              key={question.id}
              value={selected === undefined ? "" : String(selected)}
              onValueChange={select}
              className="gap-2.5"
              aria-label={question.prompt}
            >
              {demoQuestionOptions(question).map((option) => {
                const inputId = `${question.id}-${option.value}`;
                const isSelected = selected === option.value;

                return (
                  <label
                    key={option.value}
                    htmlFor={inputId}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors",
                      "hover:border-brand/50 hover:bg-brand/[0.03]",
                      "focus-within:ring-2 focus-within:ring-ring/50",
                      isSelected
                        ? "border-brand/70 bg-brand/[0.06]"
                        : "border-border/70 bg-background/60",
                    )}
                    data-testid={`demo-option-${option.value}`}
                  >
                    <RadioGroupItem
                      id={inputId}
                      value={String(option.value)}
                      className="mt-0.5"
                    />
                    <span className="space-y-1">
                      <span className="block text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="block text-sm leading-6 text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </RadioGroup>

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={goBack}
                disabled={index === 0}
              >
                <ArrowLeft className="size-4" aria-hidden />
                Back
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={goNext}
                disabled={selected === undefined}
                className="min-h-11 min-w-[9rem]"
                data-testid="demo-next"
              >
                {isLast ? "See my snapshot" : "Continue"}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>

            <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Answers stay in your browser. Nothing is saved, sent, or used to
              contact you.
            </p>
          </div>
        ) : null}
      </MarketingSurfaceCard>

      <MarketingSurfaceCard className="h-fit lg:sticky lg:top-24">
        <div aria-live="polite" data-testid="demo-live-preview">
          <ScorePanel
            result={result}
            subjectLabel={experience.subjectLabel}
            heading={showResult ? "Snapshot" : "Live preview"}
            note={experience.inProgressNote}
          />
        </div>
      </MarketingSurfaceCard>
    </div>
  );
}
