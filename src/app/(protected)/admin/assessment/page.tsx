import { getAssessmentsForAdmin } from "@/lib/admin/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, "default" | "secondary" | "success" | "warning" | "info" | "outline"> = {
  IN_PROGRESS: "secondary",
  COMPLETED: "success",
  ARCHIVED: "outline",
};

export default async function AdminAssessmentPage() {
  const assessments = await getAssessmentsForAdmin();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessments ({assessments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assessments found.</p>
          ) : (
            <ul className="divide-y divide-border">
              {assessments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{a.user.name ?? a.user.email}</p>
                    <p className="text-sm text-muted-foreground">{a.user.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      v{a.version} · {a._count.responses} responses · {a._count.scores} scores
                    </p>
                  </div>
                  <Badge variant={STATUS_COLORS[a.status] ?? "outline"}>{a.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
