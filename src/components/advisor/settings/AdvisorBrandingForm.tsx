'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Pencil } from 'lucide-react';

const brandingSchema = z.object({
  logoUrl: z.string().optional(),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

interface AdvisorBrandingFormProps {
  profile: {
    logoUrl: string | null;
    user: {
      name: string | null;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
    phone: string | null;
    firmName: string | null;
    jobTitle: string | null;
    licenseNumber: string | null;
  };
  updateBrandingAction: (formData: FormData) => Promise<{ success: boolean; error?: string; data?: any }>;
}

export function AdvisorBrandingForm({ profile, updateBrandingAction }: AdvisorBrandingFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(profile.logoUrl);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      logoUrl: profile.logoUrl || '',
    },
  });

  const logoUrl = watch('logoUrl');
  const showPreview = logoUrl && logoUrl.trim() !== '' && isValidUrl(logoUrl);
  const hasLogo = currentLogoUrl && currentLogoUrl.trim() !== '' && isValidUrl(currentLogoUrl);

  const onSubmit = async (data: BrandingFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('logoUrl', data.logoUrl?.trim() ?? '');
      const result = await updateBrandingAction(formData);
      if (result.success) {
        setCurrentLogoUrl(data.logoUrl?.trim() || null);
        setIsEditing(false);
        reset({ logoUrl: data.logoUrl ?? '' });
        toast.success('Branding updated');
      } else {
        toast.error(result.error || 'Failed to update branding');
      }
    } catch (error) {
      toast.error('Failed to update branding. Please try again.');
      console.error('Error updating branding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset({ logoUrl: currentLogoUrl || '' });
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Branding</h2>
          <p className="text-sm text-muted-foreground">
            Logo shown in client invitation emails.
          </p>
        </div>
        {!isEditing && (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)} className="shrink-0">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="mt-6">
          {hasLogo ? (
            <div className="rounded-lg border bg-muted/30 p-6 flex items-center justify-center min-h-[100px]">
              <img
                src={currentLogoUrl!}
                alt="Your logo"
                className="max-h-16 max-w-[220px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No logo set. Click Edit to add one.</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="logoUrl" className="text-sm font-medium">
              Logo URL
            </label>
            <Input
              id="logoUrl"
              type="url"
              {...register('logoUrl')}
              placeholder="https://example.com/logo.png"
              aria-invalid={!!errors.logoUrl}
              disabled={isSubmitting}
              className="max-w-md"
            />
            {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
            <p className="text-xs text-muted-foreground">HTTPS URL only. Leave empty for no logo.</p>
          </div>
          {showPreview && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview</p>
              <div className="rounded-lg border bg-transparent p-4 inline-block">
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="max-h-14 max-w-[180px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={isSubmitting} size="sm" className="min-w-[80px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}