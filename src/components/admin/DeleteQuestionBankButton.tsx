"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  formAction: (formData: FormData) => void | Promise<void>;
  questionId: string;
  /** Extra hidden fields (e.g. `riskAreaId` for pillar delete redirect). */
  extraHidden?: { name: string; value: string }[];
};

export function DeleteQuestionBankButton({
  formAction,
  questionId,
  extraHidden,
}: Props) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (fd) => {
        if (!window.confirm("Delete this question? This cannot be undone.")) {
          return;
        }
        setPending(true);
        try {
          await formAction(fd);
        } finally {
          setPending(false);
        }
      }}
    >
      <input type="hidden" name="questionId" value={questionId} />
      {extraHidden?.map((h) => (
        <input key={h.name} type="hidden" name={h.name} value={h.value} />
      ))}
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </Button>
    </form>
  );
}
