"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  allActions: string[];
  initialActorUserId: string;
  initialEntityType: string;
  initialEntityId: string;
  initialFrom: string;
  initialTo: string;
  initialSelectedActions: string[];
  initialShowTest: boolean;
};

export function AuditLogFilterForm({
  allActions,
  initialActorUserId,
  initialEntityType,
  initialEntityId,
  initialFrom,
  initialTo,
  initialSelectedActions,
  initialShowTest,
}: Props) {
  const selectedInit = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const a of allActions) {
      m[a] = initialSelectedActions.includes(a);
    }
    return m;
  }, [allActions, initialSelectedActions]);

  const [actionSelected, setActionSelected] = useState<Record<string, boolean>>(selectedInit);
  const [showTest, setShowTest] = useState(initialShowTest);

  return (
    <form
      method="get"
      action="/admin/audit-log"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="audit-log-filter-form"
    >
      <div className="space-y-1.5">
        <Label htmlFor="actorUserId">Actor user id</Label>
        <Input id="actorUserId" name="actorUserId" placeholder="cuid…" defaultValue={initialActorUserId} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="entityType">Entity type</Label>
        <Input
          id="entityType"
          name="entityType"
          placeholder="User, AssessmentBankQuestion, …"
          defaultValue={initialEntityType}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="entityId">Entity id</Label>
        <Input id="entityId" name="entityId" placeholder="row id" defaultValue={initialEntityId} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="from">From (UTC)</Label>
        <Input id="from" name="from" type="datetime-local" defaultValue={initialFrom} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="to">To (UTC)</Label>
        <Input id="to" name="to" type="datetime-local" defaultValue={initialTo} />
      </div>
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
        <Label>Actions</Label>
        <div className="grid max-h-64 grid-cols-1 gap-x-4 gap-y-1.5 overflow-y-auto rounded-xl border border-border/80 p-3 text-xs sm:grid-cols-2 xl:grid-cols-3">
          {allActions.map((a, i) => {
            const fieldId = `audit-action-${i}`;
            return (
            <div key={a} className="flex min-w-0 items-center gap-2">
              <input type="hidden" name="action" value={a} disabled={!actionSelected[a]} />
              <Checkbox
                id={fieldId}
                checked={actionSelected[a] ?? false}
                onCheckedChange={(v) =>
                  setActionSelected((prev) => ({
                    ...prev,
                    [a]: v === true,
                  }))
                }
                aria-labelledby={`${fieldId}-label`}
                className="shrink-0"
              />
              <Label 
                id={`${fieldId}-label`} 
                htmlFor={fieldId} 
                className="min-w-0 cursor-pointer truncate font-mono text-[11px] font-normal"
                title={a}
              >
                {a}
              </Label>
            </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2 lg:col-span-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="hidden" name="showTest" value="1" disabled={!showTest} />
          <Checkbox
            id="showTest"
            checked={showTest}
            onCheckedChange={(v) => setShowTest(v === true)}
            aria-labelledby="showTest-label"
          />
          <Label id="showTest-label" htmlFor="showTest" className="cursor-pointer font-normal text-muted-foreground">
            Show test traffic (Playwright magic-link issuances; hidden by default)
          </Label>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/audit-log">Reset</Link>
          </Button>
          <Button type="submit" size="sm">
            Apply filters
          </Button>
        </div>
      </div>
    </form>
  );
}
