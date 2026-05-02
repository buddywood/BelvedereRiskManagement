import type { CSSProperties } from "react";
import type { SubscriptionStatus } from "@prisma/client";
import Link from "next/link";
import { CreditCard, Pencil, UserPlus } from "lucide-react";
import {
  advisorBrandInitials,
  pickAdvisorBrandPrimary,
  pickAdvisorBrandSecondary,
} from "@/components/admin/admin-advisor-list-styles";
import { subscriptionEntitlesAdvisorPortal } from "@/lib/billing/advisor-portal-subscription";
import { getAdvisorsForAdmin } from "@/lib/admin/queries";
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
            <ul className="flex flex-col">
              {advisors.map((a) => {
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
                  ? advisorBrandInitials(
                      profile.brandName,
                      profile.firmName,
                      a.name ?? a.email
                    )
                  : (a.name ?? a.email).slice(0, 2).toUpperCase();

                const wlSurfaceStyle: CSSProperties | undefined =
                  isWhiteLabel && primary
                    ? {
                        borderColor: `color-mix(in srgb, ${primary} 38%, hsl(var(--border)))`,
                        backgroundImage: secondary
                          ? `linear-gradient(155deg, color-mix(in srgb, ${primary} 18%, transparent) 0%, color-mix(in srgb, ${secondary} 14%, transparent) 50%, transparent 88%)`
                          : `linear-gradient(155deg, color-mix(in srgb, ${primary} 18%, transparent) 0%, transparent 75%)`,
                      }
                    : undefined;

                const topBarBackground =
                  isWhiteLabel && primary
                    ? secondary && secondary !== primary
                      ? `linear-gradient(90deg, ${primary}, ${secondary})`
                      : `linear-gradient(90deg, ${primary}, color-mix(in srgb, ${primary} 45%, white))`
                    : undefined;

                return (
                  <li
                    key={a.id}
                    className={cn(
                      "flex flex-col",
                      isWhiteLabel
                        ? "my-1 overflow-hidden rounded-2xl border bg-card shadow-md first:mt-0 last:mb-0"
                        : "border-b border-border/60 py-3 last:border-b-0"
                    )}
                    style={wlSurfaceStyle}
                  >
                    {isWhiteLabel && topBarBackground ? (
                      <div
                        className="h-1 w-full shrink-0"
                        style={{ background: topBarBackground }}
                        aria-hidden
                      />
                    ) : null}
                    <div
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-3",
                        isWhiteLabel && "px-4 pb-4 pt-3"
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        {isWhiteLabel ? (
                          showPublicLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element -- public CDN URLs only
                            <img
                              src={rawLogo}
                              alt=""
                              className="mt-0.5 size-11 shrink-0 rounded-lg border border-border/50 bg-background object-contain p-0.5"
                            />
                          ) : hasS3Logo ? (
                            // eslint-disable-next-line @next/next/no-img-element -- admin-authenticated same-origin logo route
                            <img
                              src={adminLogoSrc}
                              alt=""
                              className="mt-0.5 size-11 shrink-0 rounded-lg border border-border/50 bg-background object-contain p-0.5"
                            />
                          ) : (
                            <div
                              className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-lg border border-border/50 text-[11px] font-bold leading-none text-white shadow-inner"
                              style={{
                                background: secondary
                                  ? `linear-gradient(145deg, ${primary ?? "hsl(var(--primary))"}, ${secondary})`
                                  : (primary ?? "hsl(var(--primary))"),
                              }}
                              aria-hidden
                            >
                              {initials}
                            </div>
                          )
                        ) : null}
                        <div className="min-w-0">
                          <p className="font-medium">{a.name ?? a.email}</p>
                          <p className="text-sm text-muted-foreground">{a.email}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {profile ? (
                              <>
                                {profile.firmName ?? "No firm name"} · {profile._count.clientAssignments}{" "}
                                client(s)
                              </>
                            ) : (
                              <>Practice details not added — open edit to complete setup.</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
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
                        {a.advisorPortalAccessEnabled === false ? (
                          <Badge variant="warning" className="text-xs normal-case tracking-normal">
                            Access off
                          </Badge>
                        ) : null}
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link
                            href={`/admin/advisors/${a.id}/edit`}
                            aria-label={`Edit ${a.name ?? a.email}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
