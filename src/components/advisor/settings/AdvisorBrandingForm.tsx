'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const brandingSchema = z.object({
  logoUrl: z.string().optional(),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      logoUrl: profile.logoUrl || '',
    },
  });

  const logoUrl = watch('logoUrl');

  const onSubmit = async (data: BrandingFormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (data.logoUrl) {
        formData.append('logoUrl', data.logoUrl);
      } else {
        formData.append('logoUrl', '');
      }

      const result = await updateBrandingAction(formData);

      if (result.success) {
        toast.success('Branding updated successfully');
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

  const fieldLabelClassName = 'text-sm font-semibold text-foreground';
  const fieldHintClassName = 'text-xs leading-5 text-muted-foreground';
  const errorClassName = 'text-sm text-destructive';

  // Check if URL is valid for preview
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const showPreview = logoUrl && logoUrl.trim() !== '' && isValidUrl(logoUrl);

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">Branding</h2>
        <p className="text-sm text-muted-foreground">
          Configure your logo and branding that appears in client invitation emails.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="logoUrl" className={fieldLabelClassName}>
            Logo URL
          </label>
          <p className={fieldHintClassName}>
            Enter the HTTPS URL of your company logo. Leave empty to use no logo.
          </p>
          <Input
            id="logoUrl"
            type="url"
            {...register('logoUrl')}
            placeholder="https://example.com/logo.png"
            aria-invalid={!!errors.logoUrl}
            disabled={isSubmitting}
          />
          {errors.logoUrl && <p className={errorClassName}>{errors.logoUrl.message}</p>}
        </div>

        {showPreview && (
          <div className="space-y-2">
            <p className={fieldLabelClassName}>Preview</p>
            <div className="rounded-md border bg-muted/50 p-4">
              <img
                src={logoUrl}
                alt="Logo preview"
                className="max-h-[60px] max-w-[200px] object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const parent = img.parentNode as HTMLElement;
                  if (parent && !parent.querySelector('.error-text')) {
                    const errorText = document.createElement('p');
                    errorText.className = 'text-xs text-destructive error-text';
                    errorText.textContent = 'Failed to load image from URL';
                    parent.appendChild(errorText);
                  }
                }}
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'block';
                  const parent = img.parentNode as HTMLElement;
                  const errorText = parent?.querySelector('.error-text');
                  if (errorText) {
                    errorText.remove();
                  }
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save Branding'}
          </Button>
        </div>
      </form>
    </div>
  );
}