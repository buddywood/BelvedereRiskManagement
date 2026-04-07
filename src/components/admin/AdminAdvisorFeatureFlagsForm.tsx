"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { updatePlatformAdvisorFeatureFlags } from "@/lib/admin/platform-settings-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AdminAdvisorFeatureFlagsFormProps {
  initialGovernanceDashboard: boolean;
  initialRiskIntelligence: boolean;
}

export function AdminAdvisorFeatureFlagsForm({
  initialGovernanceDashboard,
  initialRiskIntelligence,
}: AdminAdvisorFeatureFlagsFormProps) {
  const router = useRouter();
  const [gov, setGov] = useState(initialGovernanceDashboard);
  const [risk, setRisk] = useState(initialRiskIntelligence);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setGov(initialGovernanceDashboard);
    setRisk(initialRiskIntelligence);
  }, [initialGovernanceDashboard, initialRiskIntelligence]);

  function persist(nextGov: boolean, nextRisk: boolean) {
    startTransition(async () => {
      const result = await updatePlatformAdvisorFeatureFlags({
        advisorGovernanceDashboardEnabled: nextGov,
        advisorRiskIntelligenceEnabled: nextRisk,
      });
      if (result.success) {
        setGov(nextGov);
        setRisk(nextRisk);
        toast.success("Feature flags updated");
        router.refresh();
      } else {
        toast.error(result.error ?? "Update failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox
          id="flag-governance-dashboard"
          checked={gov}
          disabled={pending}
          onCheckedChange={(v) => {
            const checked = v === true;
            persist(checked, risk);
          }}
        />
        <div className="grid gap-1">
          <Label htmlFor="flag-governance-dashboard" className="text-sm font-medium leading-none">
            Advisor governance dashboard
          </Label>
          <p className="text-sm text-muted-foreground">
            Family Portfolio, metrics, and analytics under{" "}
            <code className="text-xs">/advisor/dashboard</code> and{" "}
            <code className="text-xs">/advisor/analytics</code>. When off, nav links are hidden and routes redirect to
            Clients.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox
          id="flag-risk-intelligence"
          checked={risk}
          disabled={pending}
          onCheckedChange={(v) => {
            const checked = v === true;
            persist(gov, checked);
          }}
        />
        <div className="grid gap-1">
          <Label htmlFor="flag-risk-intelligence" className="text-sm font-medium leading-none">
            Advisor risk intelligence
          </Label>
          <p className="text-sm text-muted-foreground">
            Portfolio risk views under <code className="text-xs">/advisor/intelligence</code>. When off, nav links are
            hidden and routes redirect to Clients.
          </p>
        </div>
      </div>
    </div>
  );
}
