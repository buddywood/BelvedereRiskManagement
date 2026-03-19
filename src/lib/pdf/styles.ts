import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 72,
    paddingBottom: 72,
    paddingHorizontal: 72,
    lineHeight: 1.5,
    color: '#374151',
  },

  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },

  subheader: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },

  section: {
    marginBottom: 24,
  },

  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
    lineHeight: 1.6,
  },

  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },

  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },

  tableHeader: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
  },

  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
    flex: 1,
  },

  footerContainer: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    width: '100%',
    paddingHorizontal: 72,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 9,
    color: '#6b7280',
  },

  coverTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1a1a2e',
    textAlign: 'center',
    lineHeight: 1.2,
    maxWidth: 460,
    alignSelf: 'center',
    marginBottom: 40,
  },

  coverSubtitle: {
    fontSize: 20,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 60,
  },

  scoreDisplay: {
    textAlign: 'center',
    marginVertical: 40,
  },

  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },

  riskBadge: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },

  riskBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
    flexDirection: 'row',
  },

  progressFill: {
    backgroundColor: '#10b981',
    height: '100%',
  },

  confidential: {
    position: 'absolute',
    bottom: 72,
    left: 72,
    right: 72,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 12,
  },

  metricGrid: {
    flexDirection: 'row',
    marginVertical: 20,
  },

  metricItem: {
    flex: 1,
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    margin: 4,
  },

  metricLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },

  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },

  householdTable: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginVertical: 16,
  },

  roleSection: {
    marginBottom: 24,
    paddingLeft: 12,
    borderLeft: '3 solid #1a1a2e',
  },

  roleMemberList: {
    marginBottom: 8,
  },
})