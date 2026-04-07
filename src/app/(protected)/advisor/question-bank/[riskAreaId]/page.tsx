import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RISK_AREAS } from "@/lib/advisor/types";
import { isRiskAreaId } from "@/lib/assessment/bank/risk-areas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdvisorQuestionBankAreaPage({
  params,
}: {
  params: Promise<{ riskAreaId: string }>;
}) {
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
          <Link href="/advisor">Advisor home</Link>
        </Button>
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Question bank</h2>
        <p className="text-sm text-muted-foreground">{area.name}</p>
        <p className="text-sm text-muted-foreground max-w-2xl">{area.summary}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {questions.length} question{questions.length === 1 ? "" : "s"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Includes hidden items (not shown to clients). Only admins can change the bank.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-0">
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions seeded for this area yet.</p>
          ) : (
            <ol className="list-decimal space-y-6 pl-5 marker:text-muted-foreground">
              {questions.map((q) => (
                <li key={q.id} className="space-y-2 pl-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-xs text-muted-foreground">{q.questionId}</code>
                    <Badge variant={q.isVisible ? "success" : "secondary"}>
                      {q.isVisible ? "Visible to clients" : "Hidden"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {q.type} · weight {q.weight}
                      {q.required ? " · required" : " · optional"}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-foreground">{q.text}</p>
                  {q.helpText ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">{q.helpText}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
