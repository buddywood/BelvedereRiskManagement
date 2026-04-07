import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdvisorBrandingBySubdomain } from '@/lib/advisor/subdomain';
import { BrandingProvider } from '@/components/providers/BrandingProvider';
import { Toaster } from 'react-hot-toast';
import '@/app/globals.css';

export default async function BrandedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const advisorId = headersList.get('x-advisor-id');
  const subdomain = headersList.get('x-subdomain');
  const brandedMode = headersList.get('x-branded-mode');

  // If not in branded mode, redirect to main app
  if (!brandedMode || !advisorId || !subdomain) {
    redirect('/');
  }

  // Fetch advisor branding data
  const branding = await getAdvisorBrandingBySubdomain(subdomain);

  if (!branding) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-background font-sans antialiased">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Branding Not Available
              </h1>
              <p className="mt-2 text-gray-600">
                The advisor branding for this subdomain is not configured.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>{branding.brandName || 'Risk Assessment Portal'}</title>
        <meta
          name="description"
          content={branding.tagline || 'Comprehensive risk assessment and family governance analysis'}
        />
        {branding.logoUrl && (
          <link rel="icon" href={branding.logoUrl} />
        )}
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        style={{
          '--advisor-primary': branding.primaryColor || '#1a1a2e',
          '--advisor-secondary': branding.secondaryColor || '#f5f5f5',
          '--advisor-accent': branding.accentColor || '#10b981',
          '--advisor-logo-url': branding.logoUrl ? `url(${branding.logoUrl})` : 'none',
          '--advisor-brand-name': `"${branding.brandName || 'Risk Portal'}"`,
        } as React.CSSProperties}
        data-advisor-theme={`advisor-${advisorId}`}
        data-branded-mode="true"
      >
        <BrandingProvider
          branding={{
            ...branding,
            advisorFirmName: branding.brandName // Legacy support
          }}
          subdomain={subdomain}
        >
          {children}
          <Toaster position="top-right" />
        </BrandingProvider>
      </body>
    </html>
  );
}
