import Link from "next/link";
import { getAdvisorsForAdmin } from "@/lib/admin/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, UserPlus } from "lucide-react";

export default async function AdminAdvisorsPage() {
  const advisors = await getAdvisorsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/advisors/new" className="inline-flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add advisor
          </Link>
        </Button>
      </div>
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
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{a.name ?? a.email}</p>
                    <p className="text-sm text-muted-foreground">{a.email}</p>
                    {a.advisorProfile && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.advisorProfile.firmName ?? "No firm"} · {a.advisorProfile._count.clientAssignments} client(s)
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {a.subscription ? (
                      <Badge variant="outline" className="text-xs font-normal">
                        {a.subscription.status.replace(/_/g, " ")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs font-normal">
                        No subscription
                      </Badge>
                    )}
                    {a.advisorPortalAccessEnabled === false ? (
                      <Badge variant="warning" className="text-xs normal-case tracking-normal">
                        Access off
                      </Badge>
                    ) : null}
                    {a.advisorProfile ? (
                      <Badge variant="secondary">Profile</Badge>
                    ) : (
                      <Badge variant="outline">No profile</Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link
                        href={`/admin/advisors/${a.id}/edit`}
                        aria-label={`Edit ${a.name ?? a.email}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
