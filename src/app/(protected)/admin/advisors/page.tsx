import { getAdvisorsForAdmin } from "@/lib/admin/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminAdvisorsPage() {
  const advisors = await getAdvisorsForAdmin();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Advisor accounts ({advisors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {advisors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No advisors found.</p>
          ) : (
            <ul className="divide-y divide-border">
              {advisors.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{a.name ?? a.email}</p>
                    <p className="text-sm text-muted-foreground">{a.email}</p>
                    {a.advisorProfile && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.advisorProfile.firmName ?? "No firm"} · {a.advisorProfile._count.clientAssignments} client(s)
                      </p>
                    )}
                  </div>
                  {a.advisorProfile ? (
                    <Badge variant="secondary">Profile</Badge>
                  ) : (
                    <Badge variant="outline">No profile</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
