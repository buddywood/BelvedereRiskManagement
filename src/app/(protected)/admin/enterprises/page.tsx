import Link from "next/link";
import { Building2, CreditCard, Plus, Users, UserCheck, Globe } from "lucide-react";

import { getEnterprisesForAdmin } from "@/lib/admin/queries";
import { TIER_DISPLAY_NAME } from "@/lib/billing/tier-catalog";
import type { SelfServeTier } from "@/lib/billing/tier-catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function humanizeToken(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function getStatusConfig(status: string) {
  if (status === "SUSPENDED") {
    return { badge: <Badge variant="warning">Suspended</Badge>, barClass: "bg-amber-500/80" };
  }
  if (status === "PROVISIONING") {
    return { badge: <Badge variant="secondary">Provisioning</Badge>, barClass: "bg-muted-foreground/40" };
  }
  return { badge: <Badge variant="success">Active</Badge>, barClass: "bg-green-500" };
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AdminEnterprisesPage() {
  const enterprises = await getEnterprisesForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">
            Enterprise firms{" "}
            <span className="font-normal text-muted-foreground">({enterprises.length})</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Sales-provisioned firms with multi-advisor seats and firm-level billing.
          </p>
        </div>
        <Button asChild className="shrink-0 self-start sm:self-auto">
          <Link href="/admin/enterprises/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Provision enterprise
          </Link>
        </Button>
      </div>

      {enterprises.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">
              No enterprise firms yet. Use Provision enterprise after sales closes a contract.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {enterprises.map((enterprise) => {
            const { badge: statusBadge, barClass } = getStatusConfig(enterprise.status);
            const isSuspended = enterprise.status === "SUSPENDED";
            const tierDisplay = enterprise.moduleTier
              ? TIER_DISPLAY_NAME[enterprise.moduleTier as SelfServeTier] ??
                humanizeToken(enterprise.moduleTier)
              : null;

            return (
              <Card key={enterprise.id} className={cn("overflow-hidden", isSuspended && "opacity-75")}>
                <div className={cn("h-1 w-full", barClass)} aria-hidden />
                <CardHeader className="flex flex-col gap-4 pb-3 pt-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-lg border text-sm font-bold",
                        isSuspended
                          ? "border-muted-foreground/30 bg-muted text-muted-foreground"
                          : "border-primary/20 bg-primary/10 text-primary"
                      )}
                      aria-hidden
                    >
                      {getInitials(enterprise.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-base" title={enterprise.name}>
                        {enterprise.name}
                      </CardTitle>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Globe className="size-3.5" aria-hidden />
                          <code className="font-mono text-xs">{enterprise.slug}</code>
                        </span>
                        {statusBadge}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 self-start" asChild>
                    <Link href={`/admin/enterprises/${enterprise.id}`}>Manage</Link>
                  </Button>
                </CardHeader>

                <CardContent className="grid gap-4 border-t bg-muted/30 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Owner */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Owner</p>
                    {enterprise.ownerName ? (
                      <>
                        <p className="truncate text-sm font-medium" title={enterprise.ownerName}>
                          {enterprise.ownerName}
                        </p>
                        {enterprise.ownerEmail && (
                          <p className="truncate text-xs text-muted-foreground" title={enterprise.ownerEmail}>
                            {enterprise.ownerEmail}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not assigned</p>
                    )}
                  </div>

                  {/* Seats */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Seats</p>
                    <div className="flex items-center gap-2">
                      <UserCheck className="size-4 text-muted-foreground" aria-hidden />
                      <span className="text-sm font-medium">
                        {enterprise.activeSeats} / {enterprise.seatLimit}
                      </span>
                      {enterprise.seatOverage > 0 && (
                        <Badge variant="warning" className="text-xs">+{enterprise.seatOverage} over</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {enterprise.clientLimit} client cap
                    </p>
                  </div>

                  {/* Billing */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Billing</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4 text-muted-foreground" aria-hidden />
                      <span className="text-sm font-medium">{humanizeToken(enterprise.paymentMethod)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {enterprise.subscriptionStatus
                        ? humanizeToken(enterprise.subscriptionStatus)
                        : "No subscription"}
                    </p>
                  </div>

                  {/* Module tier */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Module tier</p>
                    {tierDisplay ? (
                      <Badge variant="outline" className="text-xs font-medium">{tierDisplay}</Badge>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not set</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
