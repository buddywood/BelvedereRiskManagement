import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin/auth";
import { updateAssessmentBankQuestionContent } from "@/lib/actions/admin-question-bank-actions";
import { RISK_AREAS } from "@/lib/advisor/types";
import { AssessmentBankQuestionFields } from "@/components/admin/AssessmentBankQuestionFields";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isRiskAreaId } from "@/lib/assessment/bank/risk-areas";
import { prisma } from "@/lib/db";

function jsonField(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return JSON.stringify(value, null, 2);
}

export default async function AdminQuestionBankEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ riskAreaId: string; questionId: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  await requireAdminRole();
  const { riskAreaId, questionId: questionIdParam } = await params;
  const { err } = await searchParams;
  const questionId = decodeURIComponent(questionIdParam);

  if (!isRiskAreaId(riskAreaId)) {
    notFound();
  }

  const row = await prisma.assessmentBankQuestion.findUnique({
    where: { questionId },
  });

  if (!row || row.riskAreaId !== riskAreaId) {
    notFound();
  }

  const area = RISK_AREAS.find((a) => a.id === riskAreaId)!;

  const defaultOptionsJson = jsonField(row.options);
  const defaultScoreMapJson = jsonField(row.scoreMap);
  const defaultBranchingPredicateJson = jsonField(row.branchingPredicate);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/question-bank/${riskAreaId}`}>Back to {area.name}</Link>
        </Button>
      </div>

      {err ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save</AlertTitle>
          <AlertDescription>{err}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-base">{row.questionId}</CardTitle>
          <p className="text-sm text-muted-foreground">{area.name}</p>
        </CardHeader>
        <CardContent>
          <form action={updateAssessmentBankQuestionContent} className="space-y-4">
            <input type="hidden" name="questionId" value={row.questionId} />
            <input type="hidden" name="riskAreaId" value={riskAreaId} />
            <AssessmentBankQuestionFields
              defaultType={row.type}
              defaultText={row.text}
              defaultHelpText={row.helpText ?? ""}
              defaultLearnMore={row.learnMore ?? ""}
              defaultRiskRelevance={row.riskRelevance ?? ""}
              defaultWeight={row.weight}
              defaultRequired={row.required}
              defaultOptionsJson={defaultOptionsJson}
              defaultScoreMapJson={defaultScoreMapJson}
              defaultBranchingDependsOn={row.branchingDependsOn ?? ""}
              defaultBranchingPredicateJson={defaultBranchingPredicateJson}
              defaultProfileConditionKey={row.profileConditionKey ?? ""}
              defaultOmitMaturityScoreWhenYes={row.omitMaturityScoreWhenYes}
            />
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
