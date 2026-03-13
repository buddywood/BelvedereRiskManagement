import { Page, Text, View } from '@react-pdf/renderer'
import { styles } from '../styles'

interface ReportCoverProps {
  assessmentDate: string
  completionPercentage: number
  overallScore: number
  riskLevel: string
}

export function ReportCover({
  assessmentDate,
  completionPercentage,
  overallScore,
  riskLevel,
}: ReportCoverProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return '#10b981'
      case 'MEDIUM':
        return '#f59e0b'
      case 'HIGH':
        return '#ef4444'
      case 'CRITICAL':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  return (
    <Page size="A4" style={styles.page}>
      <View style={{ textAlign: 'center', marginTop: 100 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 40 }}>
          Belvedere Risk Management
        </Text>

        <Text style={styles.coverTitle}>
          Family Governance Assessment Report
        </Text>

        <Text style={styles.coverSubtitle}>
          Confidential Risk Analysis & Recommendations
        </Text>

        <View style={styles.scoreDisplay}>
          <Text style={styles.scoreNumber}>{overallScore.toFixed(1)}/10</Text>
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: getRiskColor(riskLevel) },
            ]}
          >
            <Text>{riskLevel} RISK</Text>
          </View>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Assessment Date</Text>
            <Text style={styles.metricValue}>{assessmentDate}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Completion</Text>
            <Text style={styles.metricValue}>{completionPercentage}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.confidential}>
        <Text>
          CONFIDENTIAL: This report contains sensitive family governance information and is intended solely for the assessed family.
          Distribution outside the family without written consent is prohibited.
        </Text>
      </View>
    </Page>
  )
}