import { Document } from "@react-pdf/renderer";
import { ReportCover } from "./ReportCover";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { RecommendationsSection } from "./RecommendationsSection";
import { HouseholdComposition } from "./HouseholdComposition";
import { GovernanceRecommendations } from "./GovernanceRecommendations";

interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  subcategoryCount: number;
}

interface MissingControl {
  category: string;
  subcategory: string;
  description: string;
  recommendation: string;
  severity: "high" | "medium" | "low";
}

interface AssessmentReportData {
  score: number;
  riskLevel: string;
  breakdown: CategoryScore[];
  missingControls: MissingControl[];
  assessmentDate: string;
  completionPercentage: number;
  categoryCount: number;
  missingControlsCount: number;
}

interface HouseholdProfile {
  members: Array<{
    fullName: string;
    relationship: string;
    age: number | null;
    governanceRoles: string[];
    isResident: boolean;
  }>;
}

interface AdvisorBranding {
  firmName?: string;
  logoUrl?: string;
}

interface PdfDocumentMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  subject?: string;
  keywords?: string;
  creationDate?: Date;
}

interface AssessmentReportProps {
  data: AssessmentReportData;
  householdProfile?: HouseholdProfile;
  advisorBranding?: AdvisorBranding;
  /** Merged onto <Document /> (e.g. from createBrandedPDFMetadata) */
  documentMetadata?: PdfDocumentMetadata;
}

export function AssessmentReport({
  data,
  householdProfile,
  advisorBranding,
  documentMetadata,
}: AssessmentReportProps) {
  const companyName = advisorBranding?.firmName || "Belvedere Risk Management";

  return (
    <Document
      title={documentMetadata?.title ?? "Family Governance Assessment Report"}
      author={
        documentMetadata?.author ??
        advisorBranding?.firmName ??
        "AKILI Risk Intelligence"
      }
      subject={
        documentMetadata?.subject ?? "Confidential Governance Assessment"
      }
      creator={documentMetadata?.creator ?? "AKILI Assessment Platform"}
      producer={documentMetadata?.producer}
      keywords={documentMetadata?.keywords}
      creationDate={documentMetadata?.creationDate}
    >
      {/* Page 1: Cover */}
      <ReportCover
        assessmentDate={data.assessmentDate}
        completionPercentage={data.completionPercentage}
        overallScore={data.score}
        riskLevel={data.riskLevel}
        advisorBranding={advisorBranding}
      />

      {/* Page 2: Executive Summary */}
      <ExecutiveSummary
        score={data.score}
        riskLevel={data.riskLevel}
        categoryCount={data.categoryCount}
        missingControlsCount={data.missingControlsCount}
        companyName={companyName}
      />

      {/* Page 3: Household Composition (if household profile exists) */}
      {householdProfile && householdProfile.members.length > 0 && (
        <HouseholdComposition
          members={householdProfile.members}
          companyName={companyName}
        />
      )}

      {/* Page 4: Category Breakdown */}
      <CategoryBreakdown breakdown={data.breakdown} companyName={companyName} />

      {/* Page 5+: Recommendations */}
      <RecommendationsSection
        missingControls={data.missingControls}
        companyName={companyName}
      />

      {/* Page 6+: Governance Recommendations (if household profile has governance roles) */}
      {householdProfile &&
        householdProfile.members.some((m) => m.governanceRoles.length > 0) && (
          <GovernanceRecommendations
            members={householdProfile.members}
            missingControls={data.missingControls}
            companyName={companyName}
          />
        )}
    </Document>
  );
}
