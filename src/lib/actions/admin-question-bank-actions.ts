"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminRole } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

function revalidateQuestionBankPaths() {
  revalidatePath("/admin/question-bank");
  revalidatePath("/admin/question-bank", "layout");
  revalidatePath("/advisor/question-bank");
  revalidatePath("/advisor/question-bank", "layout");
}

export async function updateAssessmentBankQuestionVisibility(formData: FormData) {
  await requireAdminRole();
  const questionId = z.string().min(1).parse(formData.get("questionId"));
  const isVisible = formData.get("isVisible") === "true";

  await prisma.assessmentBankQuestion.update({
    where: { questionId },
    data: { isVisible },
  });

  revalidateQuestionBankPaths();
}

export async function updateAssessmentBankQuestionContent(formData: FormData) {
  await requireAdminRole();
  const questionId = z.string().min(1).parse(formData.get("questionId"));
  const text = z.string().min(1).parse(formData.get("text"));
  const helpTextRaw = formData.get("helpText");
  const learnMoreRaw = formData.get("learnMore");
  const helpText =
    helpTextRaw === null || helpTextRaw === "" ? null : String(helpTextRaw);
  const learnMore =
    learnMoreRaw === null || learnMoreRaw === "" ? null : String(learnMoreRaw);
  const weight = z.coerce.number().int().min(0).max(100).parse(formData.get("weight"));
  const required = formData.has("required");

  await prisma.assessmentBankQuestion.update({
    where: { questionId },
    data: { text, helpText, learnMore, weight, required },
  });

  revalidateQuestionBankPaths();
}
