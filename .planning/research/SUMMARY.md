# Project Research Summary

**Project:** Cyber Risk Intelligence Platform
**Domain:** Wealth management cyber risk assessment and monitoring
**Researched:** 2026-03-18
**Confidence:** HIGH

## Executive Summary

This is a cyber risk intelligence platform that extends an existing wealth management governance system to provide unified family risk profiles. The recommended approach is to build cyber risk assessment capabilities as a parallel pillar alongside existing governance assessments, then combine scores through unified risk profiles that give advisors holistic family risk visibility.

The core implementation strategy involves leveraging proven technologies (ae-cvss-calculator for CVSS 4.0 scoring, mathjs for FAIR methodology calculations) while maintaining strict domain separation between governance and cyber risk systems. The platform should integrate cyber assessment workflows alongside existing governance patterns but avoid contaminating data models or user experiences.

The primary risk is data model contamination where cyber risk and governance domains leak into each other, creating hybrid entities that satisfy neither domain properly. This can be mitigated by maintaining strict domain boundaries with separate schemas and using materialized views for unified risk profiles. Performance is the secondary concern, as real-time cyber risk scoring can cascade into platform-wide failures if implemented synchronously.

## Key Findings

### Recommended Stack

The cyber risk domain requires specialized libraries that complement the existing Next.js/Prisma platform. Core cyber risk scoring relies on industry-standard frameworks (CVSS, FAIR) rather than custom algorithms, which reduces implementation complexity and increases credibility with financial advisors.

**Core technologies:**
- **ae-cvss-calculator**: CVSS v4.0 scoring engine — TypeScript-native with latest standards support
- **mathjs**: Risk calculation engine — handles FAIR methodology and composite scoring algorithms
- **@snyk/snyk**: Vulnerability scanning — industry standard for real-time security updates
- **d3-scale/d3-array**: Statistical analysis — risk data aggregation and score normalization
- **node-cron**: Automated assessments — scheduled vulnerability scans and periodic updates
- **helmet + express-rate-limit**: Enhanced security — critical for protecting sensitive risk data

### Expected Features

Cyber risk assessment capabilities parallel existing governance assessment patterns, with numerical scoring systems and automated threat monitoring being table stakes for advisor acceptance.

**Must have (table stakes):**
- Cyber risk assessment with numerical scoring — users expect comparable metrics to governance scores
- Identity exposure monitoring — critical for family office security posture
- Financial account security evaluation — basic security hygiene expected by advisors
- Automated threat alerts — real-time monitoring expected in current threat landscape
- Risk-based recommendations — actionable guidance required to justify assessment value

**Should have (competitive):**
- Social media exposure analysis — differentiated insight into OSINT vulnerabilities
- Family-wide risk aggregation — unified family cyber risk profiles
- Dark web credential monitoring — proactive breach detection capability
- Financial risk quantification — FAIR methodology for dollar-amount risk translation

**Defer (v2+):**
- AI-powered risk insights — complex ML implementation not essential for launch
- Third-party vendor risk scoring — high complexity API integrations
- Regulatory compliance tracking — can build on proven assessment foundation

### Architecture Approach

The system extends the existing Next.js/Prisma platform using parallel assessment architecture where cyber risk runs independently alongside governance assessment. This maintains domain separation while enabling unified risk profile generation through materialized views and event-driven updates.

**Major components:**
1. **CyberRiskEngine** — parallel assessment scoring following existing AssessmentEngine patterns
2. **UnifiedScoring** — combines governance + cyber scores using weighted algorithms
3. **ThreatFeedConnector** — external threat intelligence integration with caching and isolation
4. **CyberRiskPortal** — advisor interface extending existing portal patterns

### Critical Pitfalls

Research identified seven critical pitfalls that must be prevented during implementation, with data model contamination and security boundary violations being the highest priority.

1. **Data Model Contamination** — maintain strict domain boundaries with separate schemas, use materialized views for unified profiles
2. **Multi-Tenant Security Boundary Violations** — implement row-level security with tenant-isolated threat intelligence processing
3. **Performance Death by Real-Time Scoring** — use async processing with cached results, never block workflows on external APIs
4. **Inconsistent Scoring Algorithm Logic** — establish unified risk mathematics with comparable scales and documented weighting
5. **UX Workflow Contamination** — maintain separate workflow entry points, use unified dashboards for combined results only

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Cyber Risk Foundation
**Rationale:** Must establish domain boundaries and data architecture before any implementation to prevent contamination pitfalls
**Delivers:** Core cyber risk assessment capability with independent scoring
**Addresses:** Cyber risk assessment, financial account security evaluation, password security assessment
**Avoids:** Data model contamination, security boundary violations, scoring algorithm inconsistencies

### Phase 2: Threat Intelligence Integration
**Rationale:** External integrations require proven foundation and proper isolation patterns to prevent vendor security cascade
**Delivers:** Automated threat monitoring and identity exposure detection
**Uses:** ae-cvss-calculator, Snyk, node-cron for scheduled assessments
**Implements:** ThreatFeedConnector with caching and tenant isolation
**Avoids:** Vendor integration security cascade, performance death by real-time scoring

### Phase 3: Unified Risk Intelligence
**Rationale:** Risk aggregation requires mature individual assessment systems to ensure mathematical validity
**Delivers:** Family-wide cyber risk profiles and combined governance/cyber dashboards
**Uses:** d3-scale/d3-array for statistical normalization, mathjs for composite scoring
**Implements:** UnifiedScoring algorithms and enhanced intelligence dashboards
**Avoids:** UX workflow contamination through separate assessment flows

### Phase 4: Advanced Analytics
**Rationale:** Financial quantification and social media analysis build on proven risk assessment foundation
**Delivers:** FAIR-based financial risk quantification and social media exposure analysis
**Uses:** Full stack including AI-powered content analysis capabilities

### Phase Ordering Rationale

- **Phase 1 prioritized** because data architecture contamination is irreversible and must be prevented from the start
- **External integrations deferred** until security boundaries are proven to prevent vendor-related security cascades
- **Unified scoring delayed** until individual domain scoring is mathematically sound to avoid algorithm inconsistencies
- **Advanced features last** because they depend on proven assessment foundation and advisor adoption

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Complex vendor integrations require API security research and threat intelligence provider evaluation
- **Phase 4:** Social media analysis and FAIR methodology implementation need domain-specific research

Phases with standard patterns (skip research-phase):
- **Phase 1:** Follows established Next.js/Prisma patterns from existing governance system
- **Phase 3:** Uses proven statistical libraries and existing dashboard component patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies verified through official npm packages and OWASP standards |
| Features | HIGH | Based on wealth management industry analysis and family office security reports |
| Architecture | HIGH | Extends proven existing platform patterns with well-documented integration approaches |
| Pitfalls | HIGH | Sourced from fintech security architecture failures and multi-tenant platform lessons |

**Overall confidence:** HIGH

### Gaps to Address

- **Vendor selection for threat intelligence:** Research focused on general patterns but specific vendor evaluation needed during Phase 2 planning
- **FAIR methodology implementation details:** High-level approach confirmed but detailed calculation algorithms need validation during Phase 4
- **Social media API compliance:** Privacy regulations for social media data analysis may require legal consultation

## Sources

### Primary (HIGH confidence)
- [OWASP Risk Rating Methodology](https://owasp.org/www-community/OWASP_Risk_Rating_Methodology) — risk scoring standards
- [Financial Services API Security Compliance Guide](https://www.apisec.ai/blog/financial-services-api-security-compliance) — API security requirements
- [ae-cvss-calculator npm package](https://www.npmjs.com/package/ae-cvss-calculator) — CVSS 4.0 implementation verification

### Secondary (MEDIUM confidence)
- [Wealth Management Cybersecurity: Protecting Assets From Cyber Threats](https://www.kiteworks.com/cybersecurity-risk-management/wealth-management-cybersecurity-risk-data-protection-2026/) — industry requirements
- [Family Office Security & Risk Report 2025](https://andsimple.co/reports/risk-and-security/) — feature expectations
- [Multi-Tenant Database Architecture Patterns](https://www.bytebase.com/blog/multi-tenant-database-architecture-patterns-explained/) — isolation patterns

### Tertiary (LOW confidence)
- [Top Risk Assessment Tools for 2026](https://cynomi.com/learn/risk-assessment-tools/) — competitive landscape analysis
- [AI-Powered Cyber Risk Forecasting 2026](https://informatix.systems/blog/cyber-threat-intelligence-services/ai-powered-cyber-risk-forecasting-2026/) — future capabilities

---
*Research completed: 2026-03-18*
*Ready for roadmap: yes*