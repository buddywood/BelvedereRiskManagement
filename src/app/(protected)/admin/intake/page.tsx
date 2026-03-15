import { getIntakeForAdmin } from "@/lib/admin/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NOT_STARTED: "outline",
  IN_PROGRESS: "secondary",
  COMPLETED: "default",
  SUBMITTED: "default",
};

export default async function AdminIntakePage() {
  const interviews = await getIntakeForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Intake Management</h2>
        <p className="text-muted-foreground">
          All intake interviews and their status. Use for review and triage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Intake interviews ({interviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No intake interviews found.</p>
          ) : (
            <ul className="divide-y divide-border">
              {interviews.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{i.user.name ?? i.user.email}</p>
                    <p className="text-sm text-muted-foreground">{i.user.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {i._count.responses} responses
                      {i.approval && ` · Approval: ${i.approval.status}`}
                    </p>
                  </div>
                  <Badge variant={STATUS_COLORS[i.status] ?? "outline"}>{i.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
