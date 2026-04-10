import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin/auth";
import { createAssessmentBankQuestion } from "@/lib/actions/admin-question-bank-actions";
import { RISK_AREAS } from "@/lib/advisor/types";
import { AssessmentBankQuestionFields } from "@/components/admin/AssessmentBankQuestionFields";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isRiskAreaId } from "@/lib/assessment/bank/risk-areas";

export default async function AdminQuestionBankNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ riskAreaId: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  await requireAdminRole();
  const { riskAreaId } = await params;
  const { err } = await searchParams;

  if (!isRiskAreaId(riskAreaId)) {
    notFound();
  }

  const area = RISK_AREAS.find((a) => a.id === riskAreaId)!;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/question-bank/${riskAreaId}`}>Back to {area.name}</Link>
        </Button>
      </div>

      {err ? (
        <Alert variant="destructive">
          <AlertTitle>Could not create question</AlertTitle>
          <AlertDescription>{err}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New question</CardTitle>
          <p className="text-sm text-muted-foreground">{area.name}</p>
        </CardHeader>
        <CardContent>
          <form action={createAssessmentBankQuestion} className="space-y-4">
            <input type="hidden" name="riskAreaId" value={riskAreaId} />
            <AssessmentBankQuestionFields showVisibleToggle defaultVisible />
            <Button type="submit">Create question</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
