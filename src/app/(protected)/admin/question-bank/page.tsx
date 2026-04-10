import Link from "next/link";
import { requireAdminRole } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { RISK_AREAS } from "@/lib/advisor/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default async function AdminQuestionBankIndexPage() {
  await requireAdminRole();

  const counts = await prisma.assessmentBankQuestion.groupBy({
    by: ["riskAreaId"],
    _count: { id: true },
  });
  const visibleCounts = await prisma.assessmentBankQuestion.groupBy({
    by: ["riskAreaId"],
    where: { isVisible: true },
    _count: { id: true },
  });

  const countByArea = Object.fromEntries(counts.map((c) => [c.riskAreaId, c._count.id]));
  const visibleByArea = Object.fromEntries(
    visibleCounts.map((c) => [c.riskAreaId, c._count.id]),
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground max-w-2xl">
        Create, reorder, edit, and hide questions for each assessment pillar (risk area). Clients
        only see questions marked visible. Run{" "}
        <code className="text-xs">npm run seed:assessment-bank</code> to sync from code defaults
        without removing custom rows.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RISK_AREAS.map((area) => {
          const total = countByArea[area.id] ?? 0;
          const visible = visibleByArea[area.id] ?? 0;
          return (
            <Link key={area.id} href={`/admin/question-bank/${area.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    {area.name}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{area.summary}</p>
                  <p className="mt-3 text-xs text-muted-foreground tabular-nums">
                    {visible} visible · {total} total in bank
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
