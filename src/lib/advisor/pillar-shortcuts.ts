import type { LucideIcon } from "lucide-react";
import {
  Globe,
  Shield,
  Lock,
  Landmark,
  HeartPulse,
  Users,
} from "lucide-react";
import { RISK_AREAS } from "@/lib/advisor/types";

const PILLAR_ICONS: Record<(typeof RISK_AREAS)[number]["id"], LucideIcon> = {
  "environmental-geographic-risk": Globe,
  "physical-security": Shield,
  cybersecurity: Lock,
  "financial-asset-protection": Landmark,
  "health-medical-preparedness": HeartPulse,
  "lifestyle-behavioral-risk": Users,
};

/** Six assessment pillars — same IDs as intake focus areas (`RISK_AREAS`). */
export const ADVISOR_PILLAR_SHORTCUTS = RISK_AREAS.map((area) => ({
  id: area.id,
  name: area.name,
  summary: area.summary,
  icon: PILLAR_ICONS[area.id],
}));
