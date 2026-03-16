import Link from "next/link";
import { requireAdminRole } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminSettingsPage() {
  await requireAdminRole();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Your admin account uses the same profile and security settings as other users.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/settings">Open app Settings</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Placeholder for system-wide admin settings (e.g. feature flags, defaults, maintenance).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
