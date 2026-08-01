import type { CSSProperties } from "react";
import Link from "next/link";
import {
  CreditCard,
  Globe,
  Package,
  Plus,
  Users,
} from "lucide-react";

import {
  advisorBrandInitials,
  pickAdvisorBrandPrimary,
  pickAdvisorBrandSecondary,
} from "@/components/admin/admin-advisor-list-styles";
import { getEnterprisesForAdmin } from "@/lib/admin/queries";
import { TIER_DISPLAY_NAME } from "@/lib/billing/tier-catalog";
import type { SelfServeTier } from "@/lib/billing/tier-catalog";
import { looksLikeAdvisorBrandingS3Url } from "@/lib/branding/advisor-logo-display";
import { buildAdvisorPortalOrigin } from "@/lib/client/client-portal-origin";
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

function subscriptionStatusVariant(
  status: string | null,
): "success" | "warning" | "secondary" | "destructive" | "outline" {
  if (!status) return "secondary";
  if (status === "ACTIVE" || status === "TRIALING") return "success";
  if (status === "PAST_DUE" || status === "UNPAID") return "warning";
  if (status === "CANCELED" || status === "INCOMPLETE_EXPIRED") return "destructive";
  return "outline";
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
            const isSuspended = enterprise.status === "SUSPENDED";
            const isProvisioning = enterprise.status === "PROVISIONING";
            const brandingActive = enterprise.brandingEnabled;
            const primary = brandingActive
              ? pickAdvisorBrandPrimary(enterprise.primaryColor, enterprise.accentColor)
              : undefined;
            const secondary = brandingActive
              ? pickAdvisorBrandSecondary(
                  enterprise.secondaryColor,
                  enterprise.primaryColor,
                  enterprise.accentColor,
                )
              : undefined;
            const rawLogo = brandingActive ? enterprise.logoUrl?.trim() || "" : "";
            const showPublicLogo =
              Boolean(rawLogo) &&
              !looksLikeAdvisorBrandingS3Url(rawLogo) &&
              /^https?:\/\//i.test(rawLogo);
            const hasS3Logo = brandingActive && Boolean(enterprise.logoS3Key?.trim());
            const adminLogoSrc = `/api/admin/enterprises/${enterprise.id}/logo`;
            const brandDisplayName =
              (brandingActive && enterprise.brandName?.trim()) ||
              enterprise.name.trim() ||
              null;
            const initials = advisorBrandInitials(
              brandingActive ? enterprise.brandName : null,
              enterprise.name,
              enterprise.ownerName,
            );
            const hasBrandColors = Boolean(primary);
            const hasBrandingConfigured =
              brandingActive && (hasBrandColors || showPublicLogo || hasS3Logo);
            const isWhiteLabel = enterprise.whiteLabel;
            const tierDisplay = enterprise.moduleTier
              ? TIER_DISPLAY_NAME[enterprise.moduleTier as SelfServeTier] ??
                humanizeToken(enterprise.moduleTier)
              : null;
            const portalUrl = buildAdvisorPortalOrigin(enterprise.slug);

            const cardSurfaceStyle: CSSProperties | undefined =
              !isSuspended && hasBrandColors && primary
                ? {
                    borderColor: `color-mix(in srgb, ${primary} ${isWhiteLabel ? 42 : 28}%, hsl(var(--border)))`,
                    backgroundImage: secondary
                      ? `linear-gradient(155deg, color-mix(in srgb, ${primary} ${isWhiteLabel ? 18 : 10}%, transparent) 0%, color-mix(in srgb, ${secondary} ${isWhiteLabel ? 14 : 8}%, transparent) 52%, transparent 88%)`
                      : `linear-gradient(155deg, color-mix(in srgb, ${primary} ${isWhiteLabel ? 18 : 10}%, transparent) 0%, transparent 78%)`,
                  }
                : undefined;

            const topBarBackground =
              !isSuspended && hasBrandColors && primary
                ? secondary && secondary !== primary
                  ? `linear-gradient(90deg, ${primary}, ${secondary})`
                  : `linear-gradient(90deg, ${primary}, color-mix(in srgb, ${primary} 45%, white))`
                : undefined;

            return (
              <Card
                key={enterprise.id}
                className={cn(
                  "overflow-hidden transition-shadow",
                  isSuspended
                    ? "border border-dashed border-muted-foreground/35 bg-muted/30 opacity-75 shadow-none"
                    : isProvisioning
                      ? "border-2 border-amber-500/45 bg-amber-500/[0.03] shadow-sm"
                      : hasBrandColors
                        ? "border-2 shadow-sm"
                        : "border shadow-sm",
                  !isSuspended && isWhiteLabel && "shadow-md",
                )}
                style={cardSurfaceStyle}
                aria-disabled={isSuspended ? true : undefined}
              >
                {isSuspended ? (
                  <div
                    className="h-1.5 w-full shrink-0 bg-muted-foreground/25"
                    aria-hidden
                  />
                ) : isProvisioning ? (
                  <div
                    className="h-1.5 w-full shrink-0 bg-amber-500/80"
                    aria-hidden
                  />
                ) : topBarBackground ? (
                  <div
                    className="h-1.5 w-full shrink-0"
                    style={{ background: topBarBackground }}
                    aria-hidden
                  />
                ) : null}

                <CardHeader className="flex flex-col gap-4 space-y-0 pb-4 pt-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-4 lg:min-w-[280px] lg:max-w-[50%]">
                    {showPublicLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- public CDN URLs only
                      <img
                        src={rawLogo}
                        alt=""
                        className={cn(
                          "size-14 shrink-0 rounded-xl border object-contain p-1 shadow-sm",
                          isSuspended
                            ? "border-muted-foreground/25 bg-muted/50 opacity-60 grayscale"
                            : "border-border/60 bg-background",
                        )}
                      />
                    ) : hasS3Logo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin-authenticated same-origin logo route
                      <img
                        src={adminLogoSrc}
                        alt=""
                        className={cn(
                          "size-14 shrink-0 rounded-xl border object-contain p-1 shadow-sm",
                          isSuspended
                            ? "border-muted-foreground/25 bg-muted/50 opacity-60 grayscale"
                            : "border-border/60 bg-background",
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex size-14 shrink-0 items-center justify-center rounded-xl border text-sm font-bold leading-none shadow-inner",
                          isSuspended
                            ? "border-muted-foreground/30 bg-muted text-muted-foreground"
                            : "border-border/50 text-white",
                        )}
                        style={
                          isSuspended
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

                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle
                        className={cn(
                          "truncate text-base leading-snug",
                          isSuspended && "text-muted-foreground",
                        )}
                        title={enterprise.name}
                      >
                        {enterprise.name}
                      </CardTitle>

                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                        {enterprise.ownerEmail ? (
                          <span
                            className="max-w-full truncate"
                            title={
                              enterprise.ownerName
                                ? `${enterprise.ownerName} · ${enterprise.ownerEmail}`
                                : enterprise.ownerEmail
                            }
                          >
                            {enterprise.ownerName
                              ? `${enterprise.ownerName} · ${enterprise.ownerEmail}`
                              : enterprise.ownerEmail}
                          </span>
                        ) : (
                          <span>Owner not assigned</span>
                        )}
                        <a
                          href={portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center gap-1 underline-offset-2 hover:text-foreground hover:underline"
                          title={`Open white-label portal for ${enterprise.slug}`}
                        >
                          <Globe className="size-3.5" aria-hidden />
                          <code className="font-mono text-xs">{enterprise.slug}</code>
                          <span className="sr-only"> (opens in new tab)</span>
                        </a>
                      </p>

                      <p
                        className={cn(
                          "flex flex-wrap items-baseline gap-x-1 gap-y-0.5 pt-1 text-sm",
                          isSuspended && "text-muted-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "min-w-0 truncate font-medium",
                            isSuspended ? "text-muted-foreground" : "text-foreground",
                          )}
                          title={brandDisplayName ?? "Firm"}
                        >
                          {brandDisplayName ?? "Firm"}
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-muted-foreground">
                          {" · "}
                          {enterprise.activeSeats}/{enterprise.seatLimit} seat
                          {enterprise.seatLimit === 1 ? "" : "s"}
                          {" · "}
                          {enterprise.clientLimit} client cap
                        </span>
                        {!hasBrandingConfigured ? (
                          <span className="w-full text-xs text-muted-foreground">
                            {brandingActive
                              ? "Branding colors/logo not configured yet."
                              : "Firm branding is disabled."}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <div
                      className={cn(
                        "flex flex-wrap items-center gap-2",
                        isSuspended && "opacity-70",
                      )}
                    >
                      <Badge
                        variant={
                          isSuspended
                            ? "warning"
                            : isProvisioning
                              ? "secondary"
                              : "success"
                        }
                        className="inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 text-xs font-medium normal-case tracking-normal"
                        title="Enterprise status"
                      >
                        <span className="truncate">
                          {isSuspended
                            ? "Suspended"
                            : isProvisioning
                              ? "Provisioning"
                              : "Active"}
                        </span>
                      </Badge>

                      {tierDisplay ? (
                        <Badge
                          variant="outline"
                          className="inline-flex max-w-[min(100%,16rem)] items-center gap-1.5 text-xs font-medium normal-case tracking-normal"
                          title="Module tier"
                        >
                          <Package className="size-3 shrink-0 opacity-80" aria-hidden />
                          <span className="truncate">
                            {tierDisplay}
                            {enterprise.billingCycle
                              ? ` · ${humanizeToken(enterprise.billingCycle)}`
                              : ""}
                          </span>
                        </Badge>
                      ) : null}

                      <Badge
                        variant={subscriptionStatusVariant(enterprise.subscriptionStatus)}
                        className="inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 text-xs font-medium normal-case tracking-normal"
                        title="Billing status"
                      >
                        <CreditCard className="size-3 shrink-0 opacity-80" aria-hidden />
                        <span className="truncate">
                          {enterprise.subscriptionStatus
                            ? humanizeToken(enterprise.subscriptionStatus)
                            : "No subscription"}
                          {` · ${humanizeToken(enterprise.paymentMethod)}`}
                        </span>
                      </Badge>

                      {enterprise.seatOverage > 0 ? (
                        <Badge
                          variant="warning"
                          className="inline-flex items-center gap-1.5 text-xs font-medium normal-case tracking-normal"
                        >
                          <Users className="size-3 shrink-0 opacity-80" aria-hidden />
                          +{enterprise.seatOverage} over seat limit
                        </Badge>
                      ) : null}
                    </div>

                    <Button variant="outline" size="sm" className="shrink-0" asChild>
                      <Link href={`/admin/enterprises/${enterprise.id}`}>Manage</Link>
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
