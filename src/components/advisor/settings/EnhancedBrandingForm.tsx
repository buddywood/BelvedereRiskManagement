'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ColorPicker from '@/components/ui/color-picker';
import { FileUpload } from '@/components/ui/file-upload';
import { PreviewContainer } from '@/components/advisor/settings/BrandingPreview';
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
  { id: 'identity', title: 'Brand Identity', icon: Building, description: 'Basic brand information' },
  { id: 'colors', title: 'Colors & Style', icon: Palette, description: 'Brand colors and theming', premium: true },
  { id: 'assets', title: 'Logo & Assets', icon: ImageIcon, description: 'Upload and manage your logo' },
  { id: 'contact', title: 'Contact Information', icon: Phone, description: 'Support contact details' },
  { id: 'domain', title: 'Custom Domain', icon: Globe, description: 'Custom subdomain setup', premium: true },
  { id: 'preview', title: 'Live Preview', icon: Eye, description: 'See how your branding looks' },
];

export function EnhancedBrandingForm({ profile, features }: EnhancedBrandingFormProps) {
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
    trigger,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Branding</h2>
          <p className="text-muted-foreground">
            Customize your brand identity and client experience
          </p>
        </div>
        <Badge variant={features.tier === 'PROFESSIONAL' ? 'default' : 'secondary'}>
          {features.tier}
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-6">
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {FORM_SECTIONS.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex items-center gap-1 text-xs"
                >
                  <section.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* RHF only submits registered fields; ColorPickers use setValue only */}
              <input type="hidden" {...register('brandName')} />
              <input type="hidden" {...register('primaryColor')} />
              <input type="hidden" {...register('secondaryColor')} />
              <input type="hidden" {...register('accentColor')} />
              <input type="hidden" {...register('logoUrl')} />
              {/* Brand Identity */}
              <TabsContent value="identity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Brand Identity
                    </CardTitle>
                    <CardDescription>
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
              <TabsContent value="colors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Brand Colors
                      {!features.advancedBrandingEnabled && (
                        <Crown className="h-4 w-4 text-amber-500" />
                      )}
                    </CardTitle>
                    <CardDescription>
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
              <TabsContent value="assets" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Logo Upload
                    </CardTitle>
                    <CardDescription>
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
              <TabsContent value="contact" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>
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
              <TabsContent value="domain" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Custom Subdomain
                      {!features.customSubdomainEnabled && (
                        <Crown className="h-4 w-4 text-amber-500" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Claim your custom subdomain for branded client access
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {features.customSubdomainEnabled ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Custom subdomain management coming soon. You'll be able to claim a custom subdomain like yourname.akiliplatform.com for a fully branded client experience.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          {getUpgradeMessage('domain')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Live Preview */}
              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Live Preview
                    </CardTitle>
                    <CardDescription>
                      See how your branding will appear across different touchpoints
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PreviewContainer branding={brandingForPreview} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Form Actions */}
              <div className="space-y-3 pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    aria-busy={isSubmitting}
                    className={cn(
                      'flex-1 gap-2 transition-[color,box-shadow,background-color,border-color]',
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
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>
                Your current branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Preview */}
              {(watchedValues.logoUrl || profile.logoUrl) && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Logo</Label>
                  <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-center min-h-[80px]">
                    <img
                      src={resolveAdvisorLogoSrcForPreview(watchedValues.logoUrl || profile.logoUrl)}
                      alt="Logo preview"
                      className="max-h-16 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Color Preview */}
              {features.advancedBrandingEnabled && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Colors</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {watchedValues.primaryColor && (
                      <div className="space-y-1">
                        <div
                          className="h-8 rounded border"
                          style={{ backgroundColor: watchedValues.primaryColor }}
                        />
                        <p className="text-xs text-center">Primary</p>
                      </div>
                    )}
                    {watchedValues.secondaryColor && (
                      <div className="space-y-1">
                        <div
                          className="h-8 rounded border"
                          style={{ backgroundColor: watchedValues.secondaryColor }}
                        />
                        <p className="text-xs text-center">Secondary</p>
                      </div>
                    )}
                    {watchedValues.accentColor && (
                      <div className="space-y-1">
                        <div
                          className="h-8 rounded border"
                          style={{ backgroundColor: watchedValues.accentColor }}
                        />
                        <p className="text-xs text-center">Accent</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Brand Info */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Brand Info</Label>
                <div className="space-y-1 text-sm">
                  {watchedValues.brandName && (
                    <p><strong>{watchedValues.brandName}</strong></p>
                  )}
                  {watchedValues.tagline && (
                    <p className="text-muted-foreground italic">{watchedValues.tagline}</p>
                  )}
                  {watchedValues.websiteUrl && (
                    <p className="text-blue-600 underline">{watchedValues.websiteUrl}</p>
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