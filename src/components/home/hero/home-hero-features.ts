import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  ListChecks,
  MessagesSquare,
  ScanSearch,
  Users,
} from "lucide-react";

export type HomeHeroFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

/**
 * Client-facing feature cards — used on white-label tenant portals where
 * households land after an advisor invite (not a public marketing audience).
 */
export const HOME_HERO_FEATURES: ReadonlyArray<HomeHeroFeature> = [
  {
    title: "Advisor Led",
    description:
      "A structured interview designed for families and their advisors.",
    icon: MessagesSquare,
  },
  {
    title: "Risk Identification",
    description: "Surface concerns before they become events.",
    icon: ScanSearch,
  },
  {
    title: "Personal Recommendations",
    description:
      "Receive tailored recommendations for your family's needs.",
    icon: ListChecks,
  },
];

/** Marketing feature cards — family offices, RIAs, and broker-dealers. */
export const ADVISOR_HERO_FEATURES: ReadonlyArray<HomeHeroFeature> = [
  {
    title: "Multi-household pipeline",
    description:
      "Invite principals and clients, track intake, and manage engagements across the book or family enterprise.",
    icon: Users,
  },
  {
    title: "Practice-ready scoring",
    description:
      "Turn structured profiles into maturity scores and prioritized remediations for client and board reviews.",
    icon: BarChart3,
  },
  {
    title: "Built for offices & RIAs",
    description:
      "One methodology for single-/multi-family offices and broker-dealer / RIA teams delivering private-client risk reviews.",
    icon: Building2,
  },
];
