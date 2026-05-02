"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  setAdvisorPortalAccessByAdmin,
  updateAdvisorByAdmin,
  type UpdateAdvisorInput,
} from "@/lib/admin/actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email("Invalid email").max(255),
  firmName: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  jobTitle: z.string().max(200).optional(),
  licenseNumber: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  specializationsStr: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

type AdvisorSubscription = {
  status: string;
  tier: string;
  billingCycle: string;
  currentPeriodEnd: Date | string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
};

type Advisor = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  advisorPortalAccessEnabled: boolean;
  subscription: AdvisorSubscription | null;
  advisorProfile: {
    id: string;
    firmName: string | null;
    licenseNumber: string | null;
    specializations: string[];
    phone: string | null;
    jobTitle: string | null;
    bio: string | null;
  } | null;
};

function humanizeEnum(value: string) {
  return value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatPeriodEnd(value: Date | string) {
  try {
    const d = typeof value === "string" ? new Date(value) : value;
    return format(d, "PP");
  } catch {
    return "—";
  }
}

interface AdminEditAdvisorFormProps {
  advisor: Advisor;
  /** When true, portal enablement requires a Stripe subscription id on the subscription row. */
  billingFeaturesEnabled: boolean;
  /** Whether the admin is allowed to turn portal access on (subscription rules satisfied). */
  canEnablePortalAccess: boolean;
}

export function AdminEditAdvisorForm({
  advisor,
  billingFeaturesEnabled,
  canEnablePortalAccess,
}: AdminEditAdvisorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portalEnabled, setPortalEnabled] = useState(
    advisor.advisorPortalAccessEnabled !== false
  );
  const [portalSaving, setPortalSaving] = useState(false);
  const profile = advisor.advisorProfile;
  const sub = advisor.subscription;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: advisor.name ?? "",
      firstName: advisor.firstName ?? "",
      lastName: advisor.lastName ?? "",
      email: advisor.email,
      firmName: profile?.firmName ?? "",
      phone: profile?.phone ?? "",
      jobTitle: profile?.jobTitle ?? "",
      licenseNumber: profile?.licenseNumber ?? "",
      bio: profile?.bio ?? "",
      specializationsStr: profile?.specializations?.join(", ") ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const specializations = data.specializationsStr
        ? data.specializationsStr.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const payload: UpdateAdvisorInput = {
        userId: advisor.id,
        name: data.name || undefined,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        email: data.email,
        firmName: data.firmName || undefined,
        phone: data.phone || undefined,
        jobTitle: data.jobTitle || undefined,
        licenseNumber: data.licenseNumber || undefined,
        bio: data.bio || undefined,
        specializations: specializations.length ? specializations : undefined,
      };
      const result = await updateAdvisorByAdmin(payload);
      if (result.success) {
        toast.success("Advisor updated");
        router.push("/admin/advisors");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update advisor");
      }
    } catch {
      toast.error("Failed to update advisor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPortalAccessChange = async (checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") return;
    setPortalSaving(true);
    try {
      const result = await setAdvisorPortalAccessByAdmin({
        userId: advisor.id,
        enabled: checked,
      });
      if (result.success) {
        setPortalEnabled(checked);
        toast.success(checked ? "Portal access enabled" : "Portal access disabled");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update portal access");
      }
    } catch {
      toast.error("Failed to update portal access");
    } finally {
      setPortalSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription and portal access</CardTitle>
          <CardDescription>
            Subscription data is read-only from the database (Stripe checkout and webhooks update
            it). Portal access can only be turned on when the subscription qualifies: active or past
            due, or grace period while the current period end is still in the future (once that date
            passes, grace no longer qualifies).
            {billingFeaturesEnabled
              ? " With billing enabled, a Stripe subscription id is required for active and similar statuses; grace period before current period end can qualify without one."
              : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Subscription status</dt>
              <dd className="mt-1 font-medium">
                {sub ? humanizeEnum(sub.status) : "No subscription"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Plan tier</dt>
              <dd className="mt-1 font-medium">{sub ? humanizeEnum(sub.tier) : "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Billing cycle</dt>
              <dd className="mt-1 font-medium">
                {sub ? humanizeEnum(sub.billingCycle) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Current period ends</dt>
              <dd className="mt-1 font-medium">
                {sub ? formatPeriodEnd(sub.currentPeriodEnd) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cancel at period end</dt>
              <dd className="mt-1 font-medium">{sub ? (sub.cancelAtPeriodEnd ? "Yes" : "No") : "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Stripe subscription</dt>
              <dd className="mt-1 font-mono text-xs break-all">
                {sub?.stripeSubscriptionId ?? "—"}
              </dd>
            </div>
          </dl>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <Checkbox
              id="portal-access"
              checked={portalEnabled}
              disabled={portalSaving || (!portalEnabled && !canEnablePortalAccess)}
              onCheckedChange={onPortalAccessChange}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label htmlFor="portal-access" className="cursor-pointer font-medium leading-snug">
                Advisor portal access enabled
              </Label>
              <p className="text-xs text-muted-foreground">
                When unchecked, this advisor cannot use the advisor hub or advisor APIs. Turning
                access on requires a qualifying subscription. With billing enabled, new paid access
                normally comes from Stripe checkout; grace period before current period end still
                qualifies even if no Stripe id is stored on the row yet. After period end, grace
                does not qualify.
              </p>
              {!portalEnabled && !canEnablePortalAccess ? (
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {billingFeaturesEnabled
                    ? "Complete an active Stripe subscription for this advisor before enabling portal access."
                    : "Fix the subscription so it is qualifying (including grace period before period end) before enabling portal access."}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...register("firstName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...register("lastName")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advisor profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firmName">Firm name</Label>
              <Input id="firmName" {...register("firmName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" {...register("jobTitle")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License number</Label>
              <Input id="licenseNumber" {...register("licenseNumber")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specializationsStr">Specializations (comma-separated)</Label>
            <Input
              id="specializationsStr"
              placeholder="e.g. financial-planning, risk-assessment"
              {...register("specializationsStr")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} {...register("bio")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/advisors">Cancel</Link>
        </Button>
      </div>
    </form>
    </div>
  );
}
