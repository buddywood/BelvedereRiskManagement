"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  QUESTION_BANK_FILTER_TYPES,
  QUESTION_BANK_TYPE_LABELS,
} from "@/lib/assessment/bank/question-bank-types";

const selectClass = cn(
  "border-input h-9 min-w-[12rem] rounded-lg border bg-background px-3 py-1.5 text-sm shadow-xs",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
);

export function QuestionBankTypeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("type") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label htmlFor="question-bank-type" className="text-sm text-muted-foreground whitespace-nowrap">
        Question type
      </Label>
      <select
        id="question-bank-type"
        aria-label="Filter by question type"
        className={selectClass}
        value={current}
        onChange={(e) => {
          const v = e.target.value;
          const next = new URLSearchParams(searchParams.toString());
          if (v) next.set("type", v);
          else next.delete("type");
          const qs = next.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname);
        }}
      >
        <option value="">All types</option>
        {QUESTION_BANK_FILTER_TYPES.map((t) => (
          <option key={t} value={t}>
            {QUESTION_BANK_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
    </div>
  );
}
