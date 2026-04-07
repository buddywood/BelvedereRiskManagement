'use client';

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ColorPicker from '@/components/ui/color-picker';
import { FileUpload } from '@/components/ui/file-upload';
import { PreviewContainer } from '@/components/advisor/settings/BrandingPreview';
import { SubdomainManager } from '@/components/advisor/settings/SubdomainManager';
import { brandingUpdateSchema, BrandingFormData, SubscriptionFeatures } from '@/lib/validation/branding';
import { updateAdvisorBrandingAction } from '@/lib/actions/advisor-branding-actions';
import { resolveAdvisorLogoSrcForPreview } from '@/lib/branding/advisor-logo-display';
import { cn } from '@/lib/utils';
import {
  Building,
  Palette,
  Image as ImageIcon,
  Phone,
  Globe,
  Eye,
  Crown,
  Loader2,
  Check,
  Info,
} from 'lucide-react';

function subscribeXl(callback: () => void) {
  const mq = window.matchMedia('(min-width: 1280px)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getXlSnapshot() {
  return window.matchMedia('(min-width: 1280px)').matches;
}

function useXlSidebarNav() {
  return useSyncExternalStore(subscribeXl, getXlSnapshot, () => false);
}

interface EnhancedBrandingFormProps {
  profile: {
    /** Source of truth for displayed/saved brand name (same as brandName on save) */
    firmName?: string | null;
    brandName?: string | null;
    tagline?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    websiteUrl?: string | null;
    emailFooterText?: string | null;
    supportEmail?: string | null;
    supportPhone?: string | null;
    logoUrl?: string | null;
    logoS3Key?: string | null;
    logoContentType?: string | null;
    logoFileSize?: number | null;
    logoUploadedAt?: Date | null;
  };
  features: SubscriptionFeatures;
}

const FORM_SECTIONS = [
  {
    id: 'identity',
    title: 'Brand Identity',
    shortTitle: 'Identity',
    icon: Building,
    description: 'Basic brand information',
  },
  {
    id: 'colors',
    title: 'Colors & Style',
    shortTitle: 'Colors',
    icon: Palette,
    description: 'Brand colors and theming',
    premium: true,
  },
  {
    id: 'assets',
    title: 'Logo & Assets',
    shortTitle: 'Logo',
    icon: ImageIcon,
    description: 'Upload and manage your logo',
  },
  {
    id: 'contact',
    title: 'Contact Information',
    shortTitle: 'Contact',
    icon: Phone,
    description: 'Support contact details',
  },
  {
    id: 'domain',
    title: 'Custom Domain',
    shortTitle: 'Domain',
    icon: Globe,
    description: 'Custom subdomain setup',
    premium: true,
  },
  {
    id: 'preview',
    title: 'Live Preview',
    shortTitle: 'Preview',
    icon: Eye,
    description: 'See how your branding looks',
  },
] as const;

export function EnhancedBrandingForm({ profile, features }: EnhancedBrandingFormProps) {
  const xlSidebar = useXlSidebarNav();

  const brandNameFromFirm =
    profile.firmName?.trim() || profile.brandName?.trim() || '';

  const defaultFormValues: BrandingFormData = {
    brandName: brandNameFromFirm,
    tagline: profile.tagline || '',
    primaryColor: profile.primaryColor || '',
    secondaryColor: profile.secondaryColor || '',
    accentColor: profile.accentColor || '',
    websiteUrl: profile.websiteUrl || '',
    emailFooterText: profile.emailFooterText || '',
    supportEmail: profile.supportEmail || '',
    supportPhone: profile.supportPhone || '',
    logoUrl: profile.logoUrl || '',
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavedFlash, setShowSavedFlash] = useState(false);
  const savedFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeSection, setActiveSection] = useState('identity');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingUpdateSchema),
    defaultValues: defaultFormValues,
  });

  // Live preview (don't mirror watch() into state — new object every render → infinite loop)
  const watchedValues = watch();

  const brandingForPreview = useMemo(
    () => ({
      ...watchedValues,
      logoUrl: resolveAdvisorLogoSrcForPreview(watchedValues.logoUrl || profile.logoUrl || null),
    }),
    [watchedValues, profile.logoUrl]
  );

  useEffect(() => {
    setValue('brandName', brandNameFromFirm, { shouldDirty: false, shouldValidate: false });
  }, [brandNameFromFirm, setValue]);

  useEffect(() => {
    if (isDirty) {
      setShowSavedFlash(false);
    }
  }, [isDirty]);

  useEffect(() => {
    return () => {
      if (savedFlashTimerRef.current) {
        clearTimeout(savedFlashTimerRef.current);
      }
    };
  }, []);

  const flashSaved = useCallback(() => {
    if (savedFlashTimerRef.current) {
      clearTimeout(savedFlashTimerRef.current);
    }
    setShowSavedFlash(true);
    savedFlashTimerRef.current = setTimeout(() => {
      setShowSavedFlash(false);
      savedFlashTimerRef.current = null;
    }, 2800);
  }, []);

  const onSubmit = async (data: BrandingFormData) => {
    setIsSubmitting(true);
    setShowSavedFlash(false);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const result = await updateAdvisorBrandingAction(formData);

      if (result.success) {
        toast.success('Branding updated successfully');
        reset(data);
        flashSaved();
      } else {
        toast.error(result.error || 'Failed to update branding');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Branding update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = useCallback(async (file: File): Promise<string> => {
    try {
      // Same-origin upload — server writes to S3 (no browser CORS to the bucket)
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/advisor/branding/logo/direct', {
        method: 'POST',
        body: formData,
      });

      const payload = await uploadResponse.json();

      if (!uploadResponse.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to upload logo');
      }

      const confirmData = payload.data as { logoUrl: string; s3Key: string };

      setValue('logoUrl', confirmData.logoUrl, { shouldDirty: true });

      return confirmData.logoUrl;
    } catch (error) {
      console.error('Logo upload error:', error);
      throw new Error(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [setValue]);

  // Get upgrade message for restricted features
  const getUpgradeMessage = (sectionId: string): string => {
    switch (sectionId) {
      case 'colors':
        return 'Upgrade to Growth or Professional to customize brand colors';
      case 'domain':
        return 'Upgrade to Growth or Professional to claim a custom subdomain';
      default:
        return 'This feature requires a subscription upgrade';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        {/* Main Form */}
        <div className="min-w-0 space-y-6">
          <Tabs
            value={activeSection}
            onValueChange={setActiveSection}
            orientation={xlSidebar ? 'vertical' : 'horizontal'}
            className="gap-6 xl:gap-8"
          >
            <TabsList
              aria-label="Branding settings sections"
              className={cn(
                'h-auto w-full gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-2 text-muted-foreground shadow-sm',
                xlSidebar
                  ? 'sticky top-20 z-10 !flex w-56 shrink-0 flex-col items-stretch'
                  : '!grid grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2'
              )}
            >
              {FORM_SECTIONS.map((section) => {
                const showUpgradeHint =
                  (section.id === 'colors' &&
                    section.premium &&
                    !features.advancedBrandingEnabled) ||
                  (section.id === 'domain' &&
                    section.premium &&
                    !features.customSubdomainEnabled);

                return (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className={cn(
                      'min-h-11 text-xs font-medium transition-colors duration-200 sm:text-sm',
                      'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                      '[&>span>svg]:opacity-60 data-[state=active]:[&>span>svg]:opacity-100',
                      'focus-visible:ring-2 focus-visible:ring-ring/40',
                      xlSidebar
                        ? 'h-auto w-full flex-col items-stretch gap-1.5 px-3 py-3'
                        : 'flex flex-col items-center justify-center gap-1 px-2 py-2.5 sm:flex-row sm:gap-2'
                    )}
                  >
                    <span
                      className={cn(
                        'flex w-full items-center gap-2',
                        xlSidebar ? 'justify-start' : 'justify-center sm:justify-center'
                      )}
                    >
                      <section.icon className="size-4 shrink-0 transition-opacity" aria-hidden />
                      <span className="leading-tight">
                        {xlSidebar ? section.title : section.shortTitle}
                      </span>
                      {showUpgradeHint ? (
                        <Crown
                          className="ml-auto size-3.5 shrink-0 !opacity-100 text-amber-600 dark:text-amber-500"
                          aria-label="Requires plan upgrade"
                        />
                      ) : null}
                    </span>
                    {xlSidebar ? (
                      <span className="text-[11px] font-normal leading-snug text-muted-foreground">
                        {section.description}
                      </span>
                    ) : null}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)} className="min-w-0 w-full flex-1 space-y-6">
              {/* RHF only submits registered fields; ColorPickers use setValue only */}
              <input type="hidden" {...register('brandName')} />
              <input type="hidden" {...register('primaryColor')} />
              <input type="hidden" {...register('secondaryColor')} />
              <input type="hidden" {...register('accentColor')} />
              <input type="hidden" {...register('logoUrl')} />
              {/* Brand Identity */}
              <TabsContent value="identity" className="space-y-4 outline-none">
                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      Brand Identity
                    </CardTitle>
                    <CardDescription className="text-pretty leading-relaxed">
                      Tagline and website. Your public brand name is your firm name (see Contact
                      Information).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Textarea
                        id="tagline"
                        {...register('tagline')}
                        placeholder="Your brand tagline or mission statement"
                        maxLength={150}
                        rows={3}
                      />
                      {errors.tagline && (
                        <p className="text-sm text-destructive">{errors.tagline.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Website URL</Label>
                      <Input
                        id="websiteUrl"
                        type="url"
                        {...register('websiteUrl')}
                        placeholder="https://your-website.com"
                      />
                      {errors.websiteUrl && (
                        <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Colors & Style */}
              <TabsContent value="colors" className="space-y-4 outline-none">
                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                      <Palette className="h-5 w-5 text-muted-foreground" />
                      Brand Colors
                      {!features.advancedBrandingEnabled && (
                        <Crown className="h-4 w-4 text-amber-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-pretty leading-relaxed">
                      Customize your brand colors with accessibility validation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {features.advancedBrandingEnabled ? (
                      <>
                        <ColorPicker
                          label="Primary Color"
                          value={watchedValues.primaryColor || ''}
                          onChange={(color) => setValue('primaryColor', color, { shouldDirty: true })}
                          error={errors.primaryColor?.message}
                          showHarmony
                        />

                        <ColorPicker
                          label="Secondary Color"
                          value={watchedValues.secondaryColor || ''}
                          onChange={(color) => setValue('secondaryColor', color, { shouldDirty: true })}
                          error={errors.secondaryColor?.message}
                        />

                        <ColorPicker
                          label="Accent Color"
                          value={watchedValues.accentColor || ''}
                          onChange={(color) => setValue('accentColor', color, { shouldDirty: true })}
                          error={errors.accentColor?.message}
                        />
                      </>
                    ) : (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          {getUpgradeMessage('colors')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Logo & Assets */}
              <TabsContent value="assets" className="space-y-4 outline-none">
                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      Logo Upload
                    </CardTitle>
                    <CardDescription className="text-pretty leading-relaxed">
                      Upload your logo (PNG, JPEG, or SVG, max 2MB)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      accept="image/*"
                      maxSize={2 * 1024 * 1024}
                      onUpload={handleLogoUpload}
                      currentFile={profile.logoUrl}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Information */}
              <TabsContent value="contact" className="space-y-4 outline-none">
                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      Contact Information
                    </CardTitle>
                    <CardDescription className="text-pretty leading-relaxed">
                      Support contact details for your clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        {...register('supportEmail')}
                        placeholder="support@yourcompany.com"
                      />
                      {errors.supportEmail && (
                        <p className="text-sm text-destructive">{errors.supportEmail.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supportPhone">Support Phone</Label>
                      <Input
                        id="supportPhone"
                        type="tel"
                        {...register('supportPhone')}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.supportPhone && (
                        <p className="text-sm text-destructive">{errors.supportPhone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailFooterText">Email Footer Text</Label>
                      <Textarea
                        id="emailFooterText"
                        {...register('emailFooterText')}
                        placeholder="Custom footer text for email communications"
                        maxLength={300}
                        rows={3}
                      />
                      {errors.emailFooterText && (
                        <p className="text-sm text-destructive">{errors.emailFooterText.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Custom Domain */}
              <TabsContent value="domain" className="space-y-4 outline-none">
                <SubdomainManager
                  features={features}
                  currentSubdomain={undefined}
                />
              </TabsContent>

              {/* Live Preview */}
              <TabsContent value="preview" className="space-y-4 outline-none">
                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                      Live Preview
                    </CardTitle>
                    <CardDescription className="text-pretty leading-relaxed">
                      See how your branding will appear across different touchpoints
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PreviewContainer branding={brandingForPreview} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Form Actions */}
              <div className="space-y-3 border-t border-border/60 pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
                  <Button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    aria-busy={isSubmitting}
                    className={cn(
                      'min-h-11 flex-1 gap-2 transition-[color,box-shadow,background-color,border-color] sm:max-w-xs',
                      showSavedFlash &&
                        !isSubmitting &&
                        'border border-emerald-600/85 bg-emerald-50 text-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] hover:bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-950/45 dark:text-emerald-50 dark:hover:bg-emerald-950/45 dark:shadow-none disabled:opacity-100'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                        Saving…
                      </>
                    ) : showSavedFlash ? (
                      <>
                        <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                        Saved
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={!isDirty || isSubmitting}
                    className="min-h-11 shrink-0"
                  >
                    Reset
                  </Button>
                </div>
                <p
                  role="status"
                  aria-live="polite"
                  className={cn(
                    'min-h-[1.25rem] text-sm',
                    isSubmitting && 'text-muted-foreground',
                    showSavedFlash && !isSubmitting && 'font-medium text-emerald-800 dark:text-emerald-300',
                    !isSubmitting && !showSavedFlash && 'text-transparent'
                  )}
                >
                  {isSubmitting
                    ? 'Saving your branding…'
                    : showSavedFlash
                      ? 'All changes are saved.'
                      : ' '}
                </p>
              </div>
            </form>
          </Tabs>
        </div>

        {/* Preview Sidebar */}
        <div className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card className="border-border/80 shadow-md ring-1 ring-border/40">
            <CardHeader className="space-y-1 border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold tracking-tight">Preview</CardTitle>
              <CardDescription className="leading-relaxed">
                How clients see your brand at a glance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Logo Preview */}
              {(watchedValues.logoUrl || profile.logoUrl) && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Logo
                  </Label>
                  <div
                    className={cn(
                      'flex min-h-[88px] items-center justify-center rounded-lg border border-border/60 p-4',
                      'bg-[repeating-conic-gradient(rgb(228_228_231)_0%_25%,rgb(250_250_250)_0%_50%)] [background-size:12px_12px]',
                      'dark:bg-[repeating-conic-gradient(rgb(63_63_70)_0%_25%,rgb(24_24_27)_0%_50%)]'
                    )}
                  >
                    <img
                      src={resolveAdvisorLogoSrcForPreview(watchedValues.logoUrl || profile.logoUrl)}
                      alt="Logo preview"
                      className="max-h-16 max-w-full object-contain drop-shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    Checkerboard shows transparent areas; light logos stay visible.
                  </p>
                </div>
              )}

              {/* Color Preview */}
              {features.advancedBrandingEnabled && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Colors
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {watchedValues.primaryColor && (
                      <div className="space-y-1.5">
                        <div
                          className="h-10 rounded-md border border-border/60 shadow-inner"
                          style={{ backgroundColor: watchedValues.primaryColor }}
                        />
                        <p className="text-center text-[11px] font-medium text-muted-foreground">
                          Primary
                        </p>
                      </div>
                    )}
                    {watchedValues.secondaryColor && (
                      <div className="space-y-1.5">
                        <div
                          className="h-10 rounded-md border border-border/60 shadow-inner"
                          style={{ backgroundColor: watchedValues.secondaryColor }}
                        />
                        <p className="text-center text-[11px] font-medium text-muted-foreground">
                          Secondary
                        </p>
                      </div>
                    )}
                    {watchedValues.accentColor && (
                      <div className="space-y-1.5">
                        <div
                          className="h-10 rounded-md border border-border/60 shadow-inner"
                          style={{ backgroundColor: watchedValues.accentColor }}
                        />
                        <p className="text-center text-[11px] font-medium text-muted-foreground">
                          Accent
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Brand Info */}
              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Brand info
                </Label>
                <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm">
                  {watchedValues.brandName && (
                    <p className="text-base font-semibold leading-snug">{watchedValues.brandName}</p>
                  )}
                  {watchedValues.tagline && (
                    <p className="text-muted-foreground leading-relaxed italic">{watchedValues.tagline}</p>
                  )}
                  {watchedValues.websiteUrl && (
                    <a
                      href={watchedValues.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block break-all text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
                    >
                      {watchedValues.websiteUrl}
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}