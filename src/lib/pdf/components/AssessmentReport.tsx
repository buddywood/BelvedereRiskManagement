import { Document, Page, Text, View } from '@react-pdf/renderer'
import { styles } from '../styles'
import { ReportCover } from './ReportCover'
import { ExecutiveSummary } from './ExecutiveSummary'
import { CategoryBreakdown } from './CategoryBreakdown'
import { RecommendationsSection } from './RecommendationsSection'
import { HouseholdComposition } from './HouseholdComposition'
import { GovernanceRecommendations } from './GovernanceRecommendations'

interface CategoryScore {
  name: string
  score: number
  maxScore: number
  subcategoryCount: number
}

interface MissingControl {
  category: string
  subcategory: string
  description: string
  recommendation: string
  severity: 'high' | 'medium' | 'low'
}

interface AssessmentReportData {
  score: number
  riskLevel: string
  breakdown: CategoryScore[]
  missingControls: MissingControl[]
  assessmentDate: string
  completionPercentage: number
  categoryCount: number
  missingControlsCount: number
}

interface HouseholdProfile {
  members: Array<{
    fullName: string
    relationship: string
    age: number | null
    governanceRoles: string[]
    isResident: boolean
  }>
}

interface AssessmentReportProps {
  data: AssessmentReportData
  householdProfile?: HouseholdProfile
}

export function AssessmentReport({ data, householdProfile }: AssessmentReportProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document
      title="Family Governance Assessment Report"
      author="Belvedere Risk Management"
      subject="Confidential Governance Assessment"
      creator="Belvedere Assessment Platform"
    >
      {/* Page 1: Cover */}
      <ReportCover
        assessmentDate={data.assessmentDate}
        completionPercentage={data.completionPercentage}
        overallScore={data.score}
        riskLevel={data.riskLevel}
      />

      {/* Page 2: Executive Summary */}
      <ExecutiveSummary
        score={data.score}
        riskLevel={data.riskLevel}
        categoryCount={data.categoryCount}
        missingControlsCount={data.missingControlsCount}
      />

      {/* Page 3: Household Composition (if household profile exists) */}
      {householdProfile && householdProfile.members.length > 0 && (
        <HouseholdComposition members={householdProfile.members} />
      )}

      {/* Page 4: Category Breakdown */}
      <CategoryBreakdown breakdown={data.breakdown} />

      {/* Page 5+: Recommendations */}
      <RecommendationsSection missingControls={data.missingControls} />

      {/* Page 6+: Governance Recommendations (if household profile has governance roles) */}
      {householdProfile && householdProfile.members.some(m => m.governanceRoles.length > 0) && (
        <GovernanceRecommendations members={householdProfile.members} missingControls={data.missingControls} />
      )}

      {/* Footer on all pages */}
      {[...Array(4)].map((_, pageIndex) => (
        <Page key={`footer-${pageIndex}`} size="A4" style={{ position: 'absolute' }}>
          <View style={styles.footer}>
            <Text>
              Confidential - Page {pageIndex + 1} | Generated {currentDate} | Belvedere Risk Management
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  )
}