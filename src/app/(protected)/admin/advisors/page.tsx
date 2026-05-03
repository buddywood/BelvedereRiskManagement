import type { CSSProperties } from "react";
import type { SubscriptionStatus } from "@prisma/client";
import Link from "next/link";
import { CreditCard, Package, Pencil, UserPlus } from "lucide-react";
import {
  advisorBrandInitials,
  pickAdvisorBrandPrimary,
  pickAdvisorBrandSecondary,
} from "@/components/admin/admin-advisor-list-styles";
import { subscriptionEntitlesAdvisorPortal } from "@/lib/billing/advisor-portal-subscription";
import { getAdvisorsForAdmin, type AdvisorsAdminScope } from "@/lib/admin/queries";
import { looksLikeAdvisorBrandingS3Url } from "@/lib/branding/advisor-logo-display";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

function humanizeSubscriptionStatus(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function humanizeEnumToken(value: string) {
  return value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function subscriptionStatusBadgeVariant(
  status: string | undefined,
  subscription: {
    status: string;
    currentPeriodEnd: Date | string;
    cancelAtPeriodEnd: boolean;
  } | null | undefined
): VariantProps<typeof badgeVariants>["variant"] {
  if (!status || !subscription) return "outline";
  const row = {
    status: subscription.status as SubscriptionStatus,
    currentPeriodEnd:
      typeof subscription.currentPeriodEnd === "string"
        ? new Date(subscription.currentPeriodEnd)
        : subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
  if (!subscriptionEntitlesAdvisorPortal(row)) {
    return "secondary";
  }
  switch (status) {
    case "ACTIVE":
      return "success";
    case "GRACE_PERIOD":
    case "PAST_DUE":
      return "warning";
    case "UNPAID":
      return "warning";
    case "CANCELLED":
      return "secondary";
    default:
      return "outline";
  }
}

export default async function AdminAdvisorsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const scope: AdvisorsAdminScope = sp.filter === "all" ? "all" : "active";
  const advisors = await getAdvisorsForAdmin({ scope });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight">
            Advisor accounts{" "}
            <span className="font-normal text-muted-foreground">({advisors.length})</span>
          </h1>
          <div className="flex flex-wrap gap-2 text-sm">
            <Button
              variant={scope === "active" ? "default" : "outline"}
              size="sm"
              className="h-8"
              asChild
            >
              <Link href="/admin/advisors">Active</Link>
            </Button>
            <Button
              variant={scope === "all" ? "default" : "outline"}
              size="sm"
              className="h-8"
              asChild
            >
              <Link href="/admin/advisors?filter=all">All</Link>
            </Button>
          </div>
        </div>
        <Button asChild className="shrink-0 self-start sm:self-auto">
          <Link href="/admin/advisors/new" className="inline-flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add advisor
          </Link>
        </Button>
      </div>

      {advisors.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">No advisors found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {advisors.map((a) => {
            const isDeactivated = Boolean(a.deletedAt);
            const isWhiteLabel = Boolean(a.subscription?.whiteLabel);
            const profile = a.advisorProfile;
            const primary = pickAdvisorBrandPrimary(profile?.primaryColor, profile?.accentColor);
            const secondary = pickAdvisorBrandSecondary(
              profile?.secondaryColor,
              profile?.primaryColor,
              profile?.accentColor
            );
            const rawLogo = profile?.logoUrl?.trim() || "";
            const showPublicLogo =
              Boolean(rawLogo) && !looksLikeAdvisorBrandingS3Url(rawLogo) && /^https?:\/\//i.test(rawLogo);
            const hasS3Logo = Boolean(profile?.logoS3Key);
            const adminLogoSrc = `/api/admin/advisors/${a.id}/logo`;
            const initials = profile
              ? advisorBrandInitials(profile.brandName, profile.firmName, a.name ?? a.email)
              : (a.name ?? a.email).slice(0, 2).toUpperCase();

            const hasBrandColors = Boolean(primary);
            const brandDisplayName =
              profile?.brandName?.trim() || profile?.firmName?.trim() || null;

            const cardSurfaceStyle: CSSProperties | undefined =
              !isDeactivated && hasBrandColors && primary
                ? {
                    borderColor: `color-mix(in srgb, ${primary} ${isWhiteLabel ? 42 : 28}%, hsl(var(--border)))`,
                    backgroundImage: secondary
                      ? `linear-gradient(155deg, color-mix(in srgb, ${primary} ${isWhiteLabel ? 18 : 10}%, transparent) 0%, color-mix(in srgb, ${secondary} ${isWhiteLabel ? 14 : 8}%, transparent) 52%, transparent 88%)`
                      : `linear-gradient(155deg, color-mix(in srgb, ${primary} ${isWhiteLabel ? 18 : 10}%, transparent) 0%, transparent 78%)`,
                  }
                : undefined;

            const topBarBackground =
              !isDeactivated && hasBrandColors && primary
                ? secondary && secondary !== primary
                  ? `linear-gradient(90deg, ${primary}, ${secondary})`
                  : `linear-gradient(90deg, ${primary}, color-mix(in srgb, ${primary} 45%, white))`
                : undefined;

            return (
              <Card
                key={a.id}
                className={cn(
                  "overflow-hidden transition-shadow",
                  isDeactivated
                    ? "border border-dashed border-muted-foreground/35 bg-muted/30 shadow-none"
                    : hasBrandColors
                      ? "border-2 shadow-sm"
                      : "border shadow-sm",
                  !isDeactivated && isWhiteLabel && "shadow-md"
                )}
                style={cardSurfaceStyle}
                aria-disabled={isDeactivated ? true : undefined}
              >
                {isDeactivated ? (
                  <div
                    className="h-1.5 w-full shrink-0 bg-muted-foreground/25"
                    aria-hidden
                  />
                ) : topBarBackground ? (
                  <div
                    className="h-1.5 w-full shrink-0"
                    style={{ background: topBarBackground }}
                    aria-hidden
                  />
                ) : null}
                <CardHeader className="flex flex-col gap-4 space-y-0 pb-4 pt-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    {showPublicLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- public CDN URLs only
                      <img
                        src={rawLogo}
                        alt=""
                        className={cn(
                          "size-14 shrink-0 rounded-xl border object-contain p-1 shadow-sm",
                          isDeactivated
                            ? "border-muted-foreground/25 bg-muted/50 opacity-60 grayscale"
                            : "border-border/60 bg-background"
                        )}
                      />
                    ) : hasS3Logo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin-authenticated same-origin logo route
                      <img
                        src={adminLogoSrc}
                        alt=""
                        className={cn(
                          "size-14 shrink-0 rounded-xl border object-contain p-1 shadow-sm",
                          isDeactivated
                            ? "border-muted-foreground/25 bg-muted/50 opacity-60 grayscale"
                            : "border-border/60 bg-background"
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex size-14 shrink-0 items-center justify-center rounded-xl border text-sm font-bold leading-none shadow-inner",
                          isDeactivated
                            ? "border-muted-foreground/30 bg-muted text-muted-foreground"
                            : "border-border/50 text-white"
                        )}
                        style={
                          isDeactivated
                            ? undefined
                            : {
                                background: secondary
                                  ? `linear-gradient(145deg, ${primary ?? "hsl(var(--primary))"}, ${secondary})`
                                  : (primary ?? "hsl(var(--primary))"),
                              }
                        }
                        aria-hidden
                      >
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 space-y-1">
                      <CardTitle
                        className={cn(
                          "text-base leading-snug",
                          isDeactivated && "text-muted-foreground"
                        )}
                      >
                        {a.name ?? a.email}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{a.email}</p>
                      {profile ? (
                        <p
                          className={cn(
                            "pt-1 text-sm",
                            isDeactivated && "text-muted-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "font-medium",
                              isDeactivated ? "text-muted-foreground" : "text-foreground"
                            )}
                          >
                            {brandDisplayName ?? "Practice"}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {profile._count.clientAssignments} client
                            {profile._count.clientAssignments === 1 ? "" : "s"}
                          </span>
                        </p>
                      ) : (
                        <p className="pt-1 text-sm text-muted-foreground">
                          Practice details not added — open edit to complete setup.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <div
                      className={cn(
                        "flex flex-wrap items-center gap-2",
                        isDeactivated && "opacity-70"
                      )}
                    >
                      {a.subscription ? (
                        <Badge
                          variant="outline"
                          className="inline-flex max-w-[min(100%,16rem)] items-center gap-1.5 text-xs font-medium normal-case tracking-normal"
                          title="Subscription plan"
                        >
                          <Package className="size-3 shrink-0 opacity-80" aria-hidden />
                          <span className="truncate">
                            {humanizeEnumToken(a.subscription.tier)}
                            {a.subscription.billingCycle
                              ? ` · ${humanizeEnumToken(a.subscription.billingCycle)}`
                              : ""}
                          </span>
                        </Badge>
                      ) : null}
                      <Badge
                        variant={subscriptionStatusBadgeVariant(
                          a.subscription?.status,
                          a.subscription ?? undefined
                        )}
                        className="inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 text-xs font-medium normal-case tracking-normal"
                        title="Subscription status"
                      >
                        <CreditCard className="size-3 shrink-0 opacity-80" aria-hidden />
                        <span className="truncate">
                          {a.subscription
                            ? humanizeSubscriptionStatus(a.subscription.status)
                            : "No subscription"}
                        </span>
                      </Badge>
                    </div>
                    {a.deletedAt ? (
                      <Badge variant="secondary" className="text-xs normal-case tracking-normal">
                        Deactivated
                      </Badge>
                    ) : null}
                    {a.advisorPortalAccessEnabled === false ? (
                      <Badge variant="warning" className="text-xs normal-case tracking-normal">
                        Access off
                      </Badge>
                    ) : null}
                    <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                      <Link href={`/admin/advisors/${a.id}/edit`} aria-label={`Edit ${a.name ?? a.email}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
