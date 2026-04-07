import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { RISK_AREAS } from "@/lib/advisor/types";
import { isRiskAreaId } from "@/lib/assessment/bank/risk-areas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateAssessmentBankQuestionContent } from "@/lib/actions/admin-question-bank-actions";

export default async function AdminQuestionBankEditPage({
  params,
}: {
  params: Promise<{ riskAreaId: string; questionId: string }>;
}) {
  await requireAdminRole();
  const { riskAreaId, questionId: questionIdParam } = await params;
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/question-bank/${riskAreaId}`}>Back to {area.name}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-mono">{row.questionId}</CardTitle>
          <p className="text-sm text-muted-foreground">{area.name}</p>
        </CardHeader>
        <CardContent>
          <form action={updateAssessmentBankQuestionContent} className="space-y-4">
            <input type="hidden" name="questionId" value={row.questionId} />

            <div className="space-y-2">
              <Label htmlFor="text">Question text</Label>
              <Textarea
                id="text"
                name="text"
                required
                rows={4}
                defaultValue={row.text}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpText">Help text</Label>
              <Textarea
                id="helpText"
                name="helpText"
                rows={3}
                defaultValue={row.helpText ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learnMore">Learn more</Label>
              <Textarea
                id="learnMore"
                name="learnMore"
                rows={3}
                defaultValue={row.learnMore ?? ""}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={row.weight}
                  required
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <div className="flex items-center gap-2">
                  <input
                    id="required"
                    name="required"
                    type="checkbox"
                    defaultChecked={row.required}
                    className="size-4 rounded border-input accent-primary"
                  />
                  <Label htmlFor="required" className="font-normal cursor-pointer">
                    Required
                  </Label>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Options, score map, and branching are managed via seed and code for now. Toggle
              visibility from the risk area list.
            </p>

            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
