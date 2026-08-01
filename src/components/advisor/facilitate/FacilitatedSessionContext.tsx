"use client";

import { createContext, useContext } from "react";

export type FacilitatedSessionBranding = {
  brandName: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  tagline: string | null;
};

export type FacilitatedSessionContextValue = {
  sessionId: string;
  clientName: string | null;
  assessmentId: string | null;
  branding: FacilitatedSessionBranding;
};

const FacilitatedSessionContext = createContext<FacilitatedSessionContextValue | null>(
  null,
);

export function FacilitatedSessionProvider({
  value,
  children,
}: {
  value: FacilitatedSessionContextValue;
  children: React.ReactNode;
}) {
  const isBranded = value.branding.primaryColor || value.branding.brandName;
  
  return (
    <FacilitatedSessionContext.Provider value={value}>
      <div
        className={isBranded ? "facilitated-session-branded" : undefined}
        style={
          isBranded
            ? ({
                "--facilitated-brand-primary": value.branding.primaryColor || "#1a1a2e",
                "--facilitated-brand-secondary": value.branding.secondaryColor || "#f5f5f5",
                "--facilitated-brand-accent": value.branding.accentColor || value.branding.primaryColor || "#1a1a2e",
              } as React.CSSProperties)
            : undefined
        }
      >
        {children}
      </div>
    </FacilitatedSessionContext.Provider>
  );
}

export function useFacilitatedSessionContext(): FacilitatedSessionContextValue {
  const ctx = useContext(FacilitatedSessionContext);
  if (!ctx) {
    throw new Error("useFacilitatedSessionContext requires FacilitatedSessionProvider");
  }
  return ctx;
}

export function useFacilitatedBranding(): FacilitatedSessionBranding {
  const ctx = useFacilitatedSessionContext();
  return ctx.branding;
}
