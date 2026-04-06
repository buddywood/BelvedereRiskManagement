'use client';

import { useEffect, useRef } from 'react';
import { AdvisorBrandingData } from '@/lib/validation/branding';
import { createScopedThemeStyles, applyAdvisorTheme } from '@/lib/theming/theme-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  LayoutDashboard,
  FileText,
  User,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  Building,
  Phone,
  Globe
} from 'lucide-react';

interface BrandingPreviewProps {
  type: 'email' | 'dashboard' | 'pdf';
  branding: Partial<AdvisorBrandingData>;
  className?: string;
}

export function BrandingPreview({ type, branding, className = '' }: BrandingPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const scopeClass = `.preview-${type}`;
      const styles = createScopedThemeStyles(branding as AdvisorBrandingData, scopeClass);

      // Create or update style element
      let styleElement = document.getElementById(`preview-styles-${type}`);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = `preview-styles-${type}`;
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = styles;
    }
  }, [branding, type]);

  const renderEmailPreview = () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {/* Email Header */}
      <div
        className="p-4 rounded-t-lg text-center"
        style={{
          backgroundColor: branding.secondaryColor || '#f5f5f5',
          color: branding.primaryColor || '#1a1a2e'
        }}
      >
        {branding.logoUrl && (
          <div className="mb-3">
            <img
              src={branding.logoUrl}
              alt="Logo"
              className="h-8 mx-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        {branding.brandName && (
          <h3 className="text-lg font-semibold">{branding.brandName}</h3>
        )}
        {branding.tagline && (
          <p className="text-sm opacity-80">{branding.tagline}</p>
        )}
      </div>

      {/* Email Content */}
      <div className="bg-white p-4 rounded-b-lg border">
        <h4 className="font-semibold mb-2">Risk Assessment Invitation</h4>
        <p className="text-sm text-gray-600 mb-4">
          Dear Client, you've been invited to complete a comprehensive family risk assessment...
        </p>

        {/* CTA Button */}
        <div className="text-center my-4">
          <Button
            style={{
              backgroundColor: branding.primaryColor || '#1a1a2e',
              borderColor: branding.primaryColor || '#1a1a2e'
            }}
            className="text-white"
          >
            Start Assessment
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
          {branding.emailFooterText && (
            <p className="mb-2">{branding.emailFooterText}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            {branding.supportEmail && (
              <span style={{ color: branding.primaryColor || '#1a1a2e' }}>
                {branding.supportEmail}
              </span>
            )}
            {branding.supportPhone && (
              <span style={{ color: branding.primaryColor || '#1a1a2e' }}>
                {branding.supportPhone}
              </span>
            )}
          </div>
          {branding.websiteUrl && (
            <p className="mt-1">
              <a
                href="#"
                style={{ color: branding.primaryColor || '#1a1a2e' }}
                className="hover:underline"
              >
                {branding.websiteUrl}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderDashboardPreview = () => (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 rounded-lg"
        style={{ backgroundColor: branding.secondaryColor || '#f5f5f5' }}
      >
        <div className="flex items-center gap-2">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="Logo"
              className="h-6 w-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Building
              className="h-5 w-5"
              style={{ color: branding.primaryColor || '#1a1a2e' }}
            />
          )}
          <span
            className="font-medium text-sm"
            style={{ color: branding.primaryColor || '#1a1a2e' }}
          >
            {branding.brandName || 'Advisor Portal'}
          </span>
        </div>
        <Badge
          style={{ backgroundColor: branding.accentColor || branding.primaryColor || '#10b981' }}
          className="text-white text-xs"
        >
          Active
        </Badge>
      </div>

      {/* Navigation */}
      <div className="flex gap-1 text-xs">
        {['Clients', 'Assessments', 'Reports', 'Settings'].map((item) => (
          <button
            key={item}
            className="px-2 py-1 rounded hover:bg-white/50 transition-colors"
            style={{ color: branding.primaryColor || '#1a1a2e' }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs font-medium">24</p>
              <p className="text-xs text-gray-500">Clients</p>
            </div>
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs font-medium">89%</p>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Button */}
      <Button
        size="sm"
        className="w-full text-xs text-white"
        style={{
          backgroundColor: branding.primaryColor || '#1a1a2e',
          borderColor: branding.primaryColor || '#1a1a2e'
        }}
      >
        <Mail className="h-3 w-3 mr-1" />
        Invite Client
      </Button>
    </div>
  );

  const renderPDFPreview = () => (
    <div className="space-y-3 p-4 bg-white border rounded-lg shadow-sm">
      {/* PDF Header */}
      <div
        className="text-center p-4 rounded"
        style={{ backgroundColor: branding.primaryColor || '#1a1a2e' }}
      >
        {branding.logoUrl && (
          <img
            src={branding.logoUrl}
            alt="Logo"
            className="h-8 mx-auto mb-2 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <h3 className="text-white font-bold text-sm">
          Family Risk Assessment Report
        </h3>
        {branding.tagline && (
          <p className="text-white/80 text-xs mt-1">{branding.tagline}</p>
        )}
      </div>

      {/* PDF Content */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-sm">Client: John Doe</h4>
          <span className="text-xs text-gray-500">Generated: Apr 6, 2026</span>
        </div>

        {/* Risk Overview */}
        <div className="space-y-2">
          <h5 className="font-medium text-xs text-gray-700">Risk Overview</h5>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-red-50 rounded">
              <AlertTriangle className="h-4 w-4 text-red-500 mx-auto mb-1" />
              <p className="text-xs text-red-700">High</p>
              <p className="text-xs text-gray-500">Cyber</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <Shield className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
              <p className="text-xs text-yellow-700">Medium</p>
              <p className="text-xs text-gray-500">Physical</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <CheckCircle className="h-4 w-4 text-green-500 mx-auto mb-1" />
              <p className="text-xs text-green-700">Low</p>
              <p className="text-xs text-gray-500">Financial</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center p-2 rounded text-white text-xs"
          style={{ backgroundColor: branding.secondaryColor || '#16213e' }}
        >
          {branding.brandName || 'Risk Management Services'}
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`preview-${type} ${className}`}
      data-preview-type={type}
    >
      {type === 'email' && renderEmailPreview()}
      {type === 'dashboard' && renderDashboardPreview()}
      {type === 'pdf' && renderPDFPreview()}
    </div>
  );
}

/**
 * Preview container with tabs for different preview types
 */
interface PreviewContainerProps {
  branding: Partial<AdvisorBrandingData>;
  className?: string;
}

export function PreviewContainer({ branding, className = '' }: PreviewContainerProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Preview
          </h4>
          <BrandingPreview type="email" branding={branding} />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard Preview
          </h4>
          <BrandingPreview type="dashboard" branding={branding} />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDF Preview
          </h4>
          <BrandingPreview type="pdf" branding={branding} />
        </div>
      </div>
    </div>
  );
}