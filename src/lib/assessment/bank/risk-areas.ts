import { RISK_AREAS } from "@/lib/advisor/types";

export const RISK_AREA_IDS = RISK_AREAS.map((a) => a.id) as readonly string[];

export function isRiskAreaId(id: string): id is (typeof RISK_AREA_IDS)[number] {
  return (RISK_AREA_IDS as readonly string[]).includes(id);
}
