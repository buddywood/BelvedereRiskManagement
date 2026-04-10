import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { RISK_AREAS } from "@/lib/advisor/types";
import { isRiskAreaId } from "@/lib/assessment/bank/risk-areas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteAssessmentBankQuestion,
  moveAssessmentBankQuestionOrder,
  updateAssessmentBankQuestionVisibility,
} from "@/lib/actions/admin-question-bank-actions";
import { DeleteQuestionBankButton } from "@/components/admin/DeleteQuestionBankButton";
import { ArrowDown, ArrowUp } from "lucide-react";

export default async function AdminQuestionBankAreaPage({
  params,
}: {
  params: Promise<{ riskAreaId: string }>;
}) {
  await requireAdminRole();
  const { riskAreaId } = await params;

  if (!isRiskAreaId(riskAreaId)) {
    notFound();
  }

  const area = RISK_AREAS.find((a) => a.id === riskAreaId)!;

  const questions = await prisma.assessmentBankQuestion.findMany({
    where: { riskAreaId },
    orderBy: { sortOrderGlobal: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/question-bank">All risk areas</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/advisor/question-bank/${riskAreaId}`}>Advisor view</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/admin/question-bank/${riskAreaId}/new`}>New question</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{area.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{area.summary}</p>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border p-0">
          {questions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No questions in the bank for this area. Seed the database first.
            </p>
          ) : (
            questions.map((q, index) => (
              <div
                key={q.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-xs text-muted-foreground">{q.questionId}</code>
                    <Badge variant={q.isVisible ? "success" : "secondary"}>
                      {q.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {q.type} · weight {q.weight}
                      {q.required ? " · required" : " · optional"}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{q.text}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <div className="flex gap-1">
                    <form action={moveAssessmentBankQuestionOrder}>
                      <input type="hidden" name="questionId" value={q.questionId} />
                      <input type="hidden" name="direction" value="up" />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={index === 0}
                        aria-label="Move up"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                    </form>
                    <form action={moveAssessmentBankQuestionOrder}>
                      <input type="hidden" name="questionId" value={q.questionId} />
                      <input type="hidden" name="direction" value="down" />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={index === questions.length - 1}
                        aria-label="Move down"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                    </form>
                  </div>
                  <form action={updateAssessmentBankQuestionVisibility}>
                    <input type="hidden" name="questionId" value={q.questionId} />
                    <input type="hidden" name="isVisible" value={q.isVisible ? "false" : "true"} />
                    <Button type="submit" variant="outline" size="sm">
                      {q.isVisible ? "Hide" : "Show"}
                    </Button>
                  </form>
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/admin/question-bank/${riskAreaId}/${encodeURIComponent(q.questionId)}`}>
                      Edit
                    </Link>
                  </Button>
                  <DeleteQuestionBankButton
                    formAction={deleteAssessmentBankQuestion}
                    questionId={q.questionId}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
