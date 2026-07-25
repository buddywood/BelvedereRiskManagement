'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Globe,
  Check,
  X,
  Clock,
  Info,
  Lock,
  Loader2,
  Copy,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TierFeatureLockIcon, TierFeatureUpgradeButton } from '@/components/advisor/billing/TierFeatureUpgrade';
import { BrandedLandingTestButton } from '@/components/advisor/settings/BrandedLandingTestButton';
import { SubscriptionFeatures } from '@/lib/validation/branding';
import type { AdvisorSubdomainSettings } from '@/lib/advisor/subdomain';
import {
  buildTenantPortalHost,
  type TenantPortalUrlConfig,
} from '@/lib/branding/tenant-portal-url';
import {
  SUBDOMAIN_SLUG_INPUT_PATTERN,
  SUBDOMAIN_SLUG_MAX_LENGTH,
  SUBDOMAIN_SLUG_VALIDATION_MESSAGE,
  sanitizeSubdomainSlugInput,
} from '@/lib/advisor/subdomain-slug-input';

interface SubdomainManagerProps {
  features: SubscriptionFeatures;
  currentSubdomain?: AdvisorSubdomainSettings | null;
  productionDomain: string;
  /** e.g. `-staging` on Preview when hostname suffix mode is enabled; empty on Production */
  tenantSubdomainSuffix?: string;
  /** When true, show preview.akilirisk.com/t/{slug} instead of a subdomain host */
  useTenantPathPortals?: boolean;
  platformAppOrigin?: string;
  stagingPlatformHost?: string;
  platformSubdomainsAutoActivate?: boolean;
  readOnly?: boolean;
  className?: string;
}

export function SubdomainManager({
  features,
  currentSubdomain,
  productionDomain,
  tenantSubdomainSuffix = '',
  useTenantPathPortals = false,
  platformAppOrigin = '',
  stagingPlatformHost = 'preview.akilirisk.com',
  platformSubdomainsAutoActivate = true,
  readOnly = false,
  className = '',
}: SubdomainManagerProps) {
  const portalConfig: TenantPortalUrlConfig = {
    productionDomain,
    tenantSubdomainSuffix,
    useTenantPathPortals,
    platformAppOrigin,
    stagingPlatformHost,
  };
  const domainSuffix = `.${productionDomain}`;
  const portalHost = (canonicalSlug: string) =>
    buildTenantPortalHost(canonicalSlug, portalConfig);
  const [subdomain, setSubdomain] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    available: boolean;
    error?: string;
    suggestions?: string[];
  } | null>(null);

  // Auto-check availability when typing
  useEffect(() => {
    const checkAvailability = async () => {
      if (subdomain.length < 3) {
        setCheckResult(null);
        return;
      }

      setIsChecking(true);
      try {
        const response = await fetch('/api/advisor/subdomain/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subdomain }),
        });

        const result = await response.json() as {
          success: boolean;
          error?: string;
          data?: { available: boolean; reason?: string; suggestions?: string[] };
        };

        if (result.success && result.data) {
          setCheckResult({
            available: result.data.available,
            error: result.data.reason,
            suggestions: result.data.suggestions,
          });
        } else {
          setCheckResult({
            available: false,
            error: result.error,
          });
        }
      } catch (error) {
        setCheckResult({
          available: false,
          error: 'Failed to check availability',
        });
      } finally {
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [subdomain]);

  const handleClaim = async () => {
    if (readOnly || !subdomain || !checkResult?.available) return;

    setIsClaiming(true);
    try {
      const response = await fetch('/api/advisor/subdomain/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Subdomain '${subdomain}' claimed successfully!`);
        // Refresh the page to show the new subdomain
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to claim subdomain');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Subdomain claim error:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleRelease = async () => {
    if (readOnly || !currentSubdomain) return;

    setIsReleasing(true);
    try {
      const response = await fetch('/api/advisor/subdomain/claim', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Subdomain released successfully');
        // Refresh the page to remove the subdomain
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to release subdomain');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Subdomain release error:', error);
    } finally {
      setIsReleasing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSubdomainInput = (value: string) => {
    setSubdomain(sanitizeSubdomainSlugInput(value));
  };

  const subdomainInputProps = {
    value: subdomain,
    onChange: (e: ChangeEvent<HTMLInputElement>) => handleSubdomainInput(e.target.value),
    placeholder: 'yourname',
    className: useTenantPathPortals ? 'font-mono' : 'rounded-r-none font-mono',
    maxLength: SUBDOMAIN_SLUG_MAX_LENGTH,
    pattern: SUBDOMAIN_SLUG_INPUT_PATTERN,
    spellCheck: false,
    autoComplete: 'off',
    autoCapitalize: 'off',
    inputMode: 'url' as const,
  };

  const previewSlug = subdomain.length >= 3 ? subdomain : 'yourname';
  const livePortalPreview = portalHost(previewSlug);

  const getStatusBadge = (data: AdvisorSubdomainSettings) => {
    if (data.status === 'active' || (data.dnsVerified && data.sslProvisioned)) {
      return (
        <Badge variant="default" className="bg-green-600 shrink-0">
          <Check className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (data.dnsVerified && !data.sslProvisioned) {
      return (
        <Badge variant="secondary" className="shrink-0">
          <Clock className="h-3 w-3 mr-1" />
          SSL Pending
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="shrink-0">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const renderSlugField = (inputId: string) => (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {currentSubdomain ? 'New subdomain' : 'Choose your subdomain'}
      </Label>
      {useTenantPathPortals ? (
        <Input id={inputId} {...subdomainInputProps} />
      ) : (
        <div className="flex min-w-0">
          <Input id={inputId} {...subdomainInputProps} />
          <div className="flex shrink-0 items-center rounded-r-md border border-l-0 bg-muted px-3 py-2 font-mono text-sm text-muted-foreground">
            {domainSuffix}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">{SUBDOMAIN_SLUG_VALIDATION_MESSAGE}</p>
      <p className="text-sm text-muted-foreground">
        Portal URL:{' '}
        <span className="break-all font-mono text-foreground">{livePortalPreview}</span>
      </p>
    </div>
  );

  const renderAvailability = () =>
    subdomain ? (
      <div className="flex items-center gap-2">
        {isChecking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : checkResult?.available ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-red-600" />
        )}
        <span className="text-sm">
          {isChecking
            ? 'Checking availability…'
            : checkResult?.available
              ? 'Available'
              : checkResult?.error || 'Not available'}
        </span>
      </div>
    ) : null;

  const renderSuggestions = (heading: string) =>
    checkResult?.suggestions?.length ? (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{heading}</p>
        <div className="flex flex-wrap gap-2">
          {checkResult.suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => handleSubdomainInput(suggestion)}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 shrink-0" />
          Custom Subdomain
          {!features.customSubdomainEnabled && (
            <TierFeatureLockIcon className="h-4 w-4" />
          )}
        </CardTitle>
        <CardDescription>
          Claim your custom subdomain for a fully branded client experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 overflow-hidden">
        {readOnly ? (
          <Alert>
            <Lock className="h-4 w-4" aria-hidden />
            <AlertDescription>
              Custom subdomain settings are managed by your firm owner or administrators.
            </AlertDescription>
          </Alert>
        ) : null}
        {!features.customSubdomainEnabled ? (
          <Alert>
            <Lock className="h-4 w-4" aria-hidden />
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>Custom subdomains are available on Professional and higher plans.</span>
              <TierFeatureUpgradeButton feature="CUSTOM_SUBDOMAIN" size="sm" />
            </AlertDescription>
          </Alert>
        ) : currentSubdomain ? (
          <div className="space-y-4">
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="min-w-0 break-all font-medium font-mono text-sm sm:text-base">
                  {portalHost(currentSubdomain.subdomain)}
                </span>
                {getStatusBadge(currentSubdomain)}
              </div>

              <div className="flex flex-wrap gap-2">
                {currentSubdomain.dnsVerified ? (
                  <BrandedLandingTestButton
                    currentSubdomain={currentSubdomain}
                    portalConfig={portalConfig}
                    customSubdomainEnabled={features.customSubdomainEnabled}
                  />
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(portalHost(currentSubdomain.subdomain))}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </Button>
              </div>

              {platformSubdomainsAutoActivate && currentSubdomain.dnsVerified ? (
                <p className="text-sm text-muted-foreground">
                  Your portal is active on our platform domain. Share this URL with clients.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Your branded client portal URL</p>
              )}
            </div>

            {!platformSubdomainsAutoActivate &&
              !currentSubdomain.dnsVerified &&
              currentSubdomain.verificationInstructions && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="font-medium">Activation pending</p>
                      <p>{currentSubdomain.verificationInstructions.instructions}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

            <Separator />

            {!readOnly ? (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium">Change subdomain</h4>
                  <div className="space-y-3">
                    {renderSlugField('new-subdomain')}
                    {renderAvailability()}
                    {renderSuggestions('Suggestions:')}
                    <Button
                      onClick={handleClaim}
                      disabled={!subdomain || !checkResult?.available || isClaiming}
                    >
                      {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Change subdomain
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Release subdomain</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently release your custom subdomain. This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleRelease}
                    disabled={isReleasing}
                  >
                    {isReleasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Release subdomain
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        ) : !readOnly ? (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Claim your custom subdomain to provide clients with a fully branded portal
                experience.
                {platformSubdomainsAutoActivate && (
                  <> It will be active immediately after you claim it.</>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {renderSlugField('subdomain')}
              {renderAvailability()}
              {renderSuggestions('Try these instead:')}
              <Button
                onClick={handleClaim}
                disabled={!subdomain || !checkResult?.available || isClaiming}
              >
                {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Claim subdomain
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
