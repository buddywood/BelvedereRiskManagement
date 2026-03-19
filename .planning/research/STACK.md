# Stack Research

**Domain:** Cyber Risk Intelligence
**Researched:** 2026-03-18
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| ae-cvss-calculator | ^1.0.11 | CVSS v3.0, v3.1, v4.0 scoring | TypeScript-native, supports latest CVSS 4.0 standard, active maintenance |
| mathjs | ^13.1.1 | Risk calculation engine | Handles FAIR methodology, composite scoring algorithms, precision math |
| @snyk/snyk | ^1.1293.0 | Vulnerability scanning | Industry standard, real-time updates, CI/CD integration for supply chain security |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| d3-scale | ^4.0.2 | Risk scoring scales | Quantitative risk mapping, score normalization |
| d3-array | ^3.2.4 | Statistical analysis | Risk data aggregation, percentile calculations |
| node-cron | ^3.0.3 | Automated assessments | Scheduled vulnerability scans, periodic risk updates |
| helmet | ^8.0.0 | Security headers | Enhanced API protection for sensitive risk data endpoints |
| express-rate-limit | ^7.4.1 | Request throttling | Protect assessment APIs from abuse, resource management |
| lodash | ^4.17.21 | Data utilities | Risk score aggregation, data normalization helpers |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| @types/lodash | TypeScript definitions | Required for risk calculation utilities |
| @types/d3-scale | TypeScript definitions | Type safety for scoring algorithms |
| @types/d3-array | TypeScript definitions | Statistical calculation types |

## Installation

```bash
# Core cyber risk libraries
npm install ae-cvss-calculator mathjs @snyk/snyk

# Data analysis and visualization components
npm install d3-scale d3-array lodash

# Security and scheduling
npm install helmet express-rate-limit node-cron

# Dev dependencies
npm install -D @types/lodash @types/d3-scale @types/d3-array
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| ae-cvss-calculator | cvssjs/cvssjs | Legacy projects requiring older CVSS versions only |
| mathjs | Custom calculation engine | Simple linear scoring (but loses FAIR methodology support) |
| d3-scale/d3-array | Chart.js data utilities | Projects not using existing Recharts infrastructure |
| Snyk | Socket.dev | Startups prioritizing cost over enterprise features |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| TensorFlow.js/ML libraries | Complexity overkill for rule-based scoring | Proven algorithms (CVSS, FAIR) |
| Real-time threat intelligence APIs | High cost, complexity for wealth advisor use case | Assessment-time risk factors |
| Custom cryptography libraries | Security risk, reinventing the wheel | Node.js built-in crypto module |
| Blockchain risk APIs | Unproven ROI for family governance context | Standard financial security practices |

## Stack Patterns by Variant

**If implementing basic cyber risk assessment:**
- Use ae-cvss-calculator + mathjs core
- Because CVSS provides standardized vulnerability scoring

**If adding digital footprint monitoring:**
- Use ae-cvss-calculator + Snyk + node-cron
- Because automated scanning requires scheduled vulnerability checks

**If building unified risk profiles:**
- Use full stack including d3-scale/d3-array
- Because composite scoring needs statistical normalization

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| ae-cvss-calculator@1.0.11 | TypeScript ^5.0 | Native TypeScript implementation |
| mathjs@13.1.1 | Node.js 18+ | Requires modern JavaScript features |
| d3-scale@4.0.2 | d3-array@3.2.4 | Designed to work together for data analysis |

## Integration with Existing Stack

### Database Schema Extensions
```prisma
model CyberRiskAssessment {
  id            String           @id @default(cuid())
  userId        String
  cvssScore     Float?
  fairScore     Float?
  digitalFootprint Json?
  riskFactors   Json

  user          User             @relation(fields: [userId], references: [id])
  responses     CyberRiskResponse[]
}

model UnifiedRiskProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  governanceScore Float?   // Existing governance pillar
  cyberScore      Float?   // New cyber risk pillar
  compositeScore  Float    // Weighted combination
  riskLevel       RiskLevel

  user            User     @relation(fields: [userId], references: [id])
}
```

### API Architecture
- Leverage existing Next.js 15 server actions pattern
- Use existing Prisma 7 transaction handling
- Integrate with existing Auth.js v5 authentication
- Extend existing assessment workflow with cyber risk pillar

### Visualization Integration
- Continue using existing Recharts library (already in package.json)
- Add d3 utilities for score normalization only
- Maintain existing dashboard component patterns

## Sources

- [ae-cvss-calculator - npm](https://www.npmjs.com/package/ae-cvss-calculator) — MEDIUM confidence (npm registry verified)
- [OWASP Risk Rating Methodology](https://owasp.org/www-community/OWASP_Risk_Rating_Methodology) — HIGH confidence (official OWASP documentation)
- [Top Risk Assessment Tools for 2026](https://cynomi.com/learn/risk-assessment-tools/) — MEDIUM confidence (industry analysis)
- [7 Methods For Calculating Cybersecurity Risk Scores](https://www.centraleyes.com/7-methods-for-calculating-cybersecurity-risk-scores/) — MEDIUM confidence (methodology overview)
- [Top Cybersecurity Trends for 2026 Every Financial Leader Must Know](https://www.jackhenry.com/fintalk/top-cybersecurity-trends-for-2026-every-financial-leader-must-know) — MEDIUM confidence (financial sector specific)
- [Financial Services API Security Compliance Guide](https://www.apisec.ai/blog/financial-services-api-security-compliance) — HIGH confidence (API security standards)
- [6 Best JavaScript Charting Libraries for Dashboards in 2026](https://embeddable.com/blog/javascript-charting-libraries) — MEDIUM confidence (library comparison)
- [Recharts GitHub](https://github.com/recharts/recharts) — HIGH confidence (official repository)

---
*Stack research for: Cyber Risk Intelligence*
*Researched: 2026-03-18*