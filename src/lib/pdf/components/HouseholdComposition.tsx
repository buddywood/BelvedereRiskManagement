import { Page, Text, View } from '@react-pdf/renderer'
import { styles } from '../styles'

interface HouseholdMember {
  fullName: string
  relationship: string
  age: number | null
  governanceRoles: string[]
  isResident: boolean
}

interface HouseholdCompositionProps {
  members: HouseholdMember[]
}

export function HouseholdComposition({ members }: HouseholdCompositionProps) {
  const formatRelationship = (relationship: string) => {
    return relationship
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatGovernanceRoles = (roles: string[]) => {
    if (roles.length === 0) return 'None'
    return roles
      .map((role) =>
        role
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
      )
      .join(', ')
  }

  const formatAge = (age: number | null) => {
    return age ? age.toString() : 'N/A'
  }

  const formatStatus = (isResident: boolean) => {
    return isResident ? 'Resident' : 'Extended Family'
  }

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Household Composition</Text>

      <Text style={styles.paragraph}>
        This section provides a comprehensive overview of your household members, their relationships,
        ages, governance roles, and residence status. Understanding your family structure is essential
        for developing appropriate governance recommendations and succession planning strategies.
      </Text>

      <View style={styles.householdTable}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCol, { flex: 2 }]}>Name</Text>
          <Text style={[styles.tableCol, { flex: 1.5 }]}>Relationship</Text>
          <Text style={[styles.tableCol, { flex: 0.8 }]}>Age</Text>
          <Text style={[styles.tableCol, { flex: 2 }]}>Governance Roles</Text>
          <Text style={[styles.tableCol, { flex: 1.2 }]}>Status</Text>
        </View>

        {/* Table Rows */}
        {members.map((member, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2 }]}>{member.fullName}</Text>
            <Text style={[styles.tableCol, { flex: 1.5 }]}>
              {formatRelationship(member.relationship)}
            </Text>
            <Text style={[styles.tableCol, { flex: 0.8 }]}>{formatAge(member.age)}</Text>
            <Text style={[styles.tableCol, { flex: 2 }]}>
              {formatGovernanceRoles(member.governanceRoles)}
            </Text>
            <Text style={[styles.tableCol, { flex: 1.2 }]}>{formatStatus(member.isResident)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: 'bold' }}>Total Household Members:</Text> {members.length}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: 'bold' }}>Residents:</Text>{' '}
          {members.filter((m) => m.isResident).length}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: 'bold' }}>Extended Family:</Text>{' '}
          {members.filter((m) => !m.isResident).length}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: 'bold' }}>Members with Governance Roles:</Text>{' '}
          {members.filter((m) => m.governanceRoles.length > 0).length}
        </Text>
      </View>
    </Page>
  )
}