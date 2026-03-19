# Feature Landscape: Cyber Risk Intelligence

**Domain:** Wealth management cyber risk intelligence
**Researched:** 2026-03-18

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Cyber risk assessment with numerical scoring | Standard in all financial cyber platforms, needed for comparison with governance scores | Medium | Similar structure to existing governance assessment |
| Identity exposure monitoring | 68% of security incidents preceded by OSINT reconnaissance, family offices need visibility | High | Requires data broker API integrations, dark web monitoring |
| Financial account security evaluation | Core banking/investment security practices expected by wealth advisors | Medium | Can leverage existing client data collection patterns |
| Automated threat alerts | Real-time monitoring expected in 2026 threat landscape (93% of firms had incidents) | Medium | Can build on existing notification system |
| Risk-based recommendations | Actionable guidance required to justify assessment value | Medium | Similar to governance recommendations pattern |
| Multi-factor authentication status tracking | Basic security hygiene expected by all advisors | Low | Simple status collection and display |
| Password security assessment | Table stakes for any cyber security evaluation | Low | Integration with password manager APIs |
| Device security posture | Mobile/laptop security critical for high-net-worth families | Medium | Device management API integrations needed |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Social media exposure analysis | 47% of professionals cite social media as biggest OSINT blind spot | High | AI-powered content analysis, privacy scoring |
| Third-party vendor risk scoring | Supply chain attacks growing 9% YoY, family offices outsource heavily | High | Vendor security assessment automation |
| Family-wide risk aggregation | Unified family cyber risk profile (like governance composite) | Medium | Extends existing family aggregation patterns |
| Dark web credential monitoring | Proactive breach detection before exploitation | High | Dark web scanning services integration |
| AI-powered risk insights | Predictive analytics for emerging threats | High | ML models for pattern recognition |
| Regulatory compliance tracking | SEC examination readiness for RIAs | Medium | Compliance framework mapping |
| Incident response planning | Automated playbooks based on risk assessment results | Medium | Template system with customization |
| Cyber insurance readiness | Assessment criteria aligned with insurance requirements | Low | Static criteria evaluation |
| Financial risk quantification | FAIR methodology translates risks to dollar amounts for board communication | High | Requires FAIR model implementation |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time threat hunting | Outside advisor scope, creates liability | Partner with specialized cybersecurity firms |
| Direct device management | Invasive, complex, liability issues | Assess security posture, recommend actions |
| Penetration testing tools | Requires specialized expertise and licensing | Recommend professional services |
| Incident remediation services | Beyond platform scope, operational overhead | Generate response plans, connect to specialists |
| Email/network monitoring | Privacy concerns, technical complexity | Assess security practices, not monitor activity |
| Custom malware analysis | Highly specialized, liability risks | Focus on prevention and preparedness |
| Forensic investigation tools | Legal/regulatory complexity | Assessment and planning only |

## Feature Dependencies

```
Identity Exposure → Social Media Analysis (enhanced insights)
Financial Security → Multi-Factor Auth Status (component)
Risk Assessment → Automated Alerts (triggers)
Risk Assessment → Recommendations (generated from)
Family Aggregation → Individual Assessments (requires all members)
Vendor Risk → Third-Party Integrations (data source)
Financial Risk Quantification → Risk Assessment (builds upon)
```

## MVP Recommendation

Prioritize:
1. **Cyber risk assessment with scoring** - Core parallel to governance assessment
2. **Financial account security evaluation** - Leverages existing data collection
3. **Automated threat alerts** - Builds on existing notification system
4. **Risk-based recommendations** - Essential for advisor value

Defer:
- **Identity exposure monitoring** - High complexity, requires significant API integrations
- **Social media exposure analysis** - AI-heavy, can add in Phase 2
- **Dark web monitoring** - Requires specialized vendor partnerships
- **Financial risk quantification** - Advanced feature for Phase 3+

## Integration with Existing Platform

### Leverage Current Capabilities
- **Assessment framework**: Extend existing 0-10 scoring system
- **Notification system**: Use existing SSE and email preferences
- **Multi-tenant architecture**: Apply same data isolation patterns
- **PDF reporting**: Add cyber sections to existing reports
- **Document collection**: Reuse for cyber security documentation

### New Infrastructure Needed
- **External API integrations**: Dark web monitoring, identity exposure services
- **Threat intelligence feeds**: Real-time cyber threat data
- **Device assessment tools**: Mobile/laptop security evaluation
- **Vendor assessment database**: Third-party risk scoring
- **FAIR framework implementation**: For financial risk quantification

## Assessment Framework Considerations

### Risk Scoring Standards
- **CVSS 4.0**: Technical vulnerability severity scoring (industry standard for 2026)
- **FAIR methodology**: Financial risk quantification for executive communication
- **Asset-first approach**: Name critical assets, threats, and vulnerabilities
- **Hybrid qualitative/quantitative**: Quick triage with deeper quantification for high-impact risks

### Integration with Governance Scoring
- Parallel 0-10 scale for consistency with existing governance assessment
- Combined family risk profile incorporating both governance and cyber scores
- Unified dashboard showing individual + composite scores across risk domains

## Sources

- [Wealth Management Cybersecurity: Protecting Assets From Cyber Threats](https://www.kiteworks.com/cybersecurity-risk-management/wealth-management-cybersecurity-risk-data-protection-2026/)
- [Cybersecurity and AI in 2026: How Family Offices Can Mitigate Risk](https://www.sdbj.com/branded-content/cybersecurity-and-ai-in-2026-how-family-offices-can-mitigate-risk/)
- [Cybersecurity for Family Offices & High-Net-Worth Families](https://decyphertech.com/family-offices/)
- [Family Office Security & Risk Report 2025](https://andsimple.co/reports/risk-and-security/)
- [Risk Management for Cybersecurity in 2026: How to Identify, Score, and Reduce Risk](https://www.nucamp.co/blog/risk-management-for-cybersecurity-in-2026-how-to-identify-score-and-reduce-risk)
- [Cybersecurity Dashboards: Visualize and Monitor Security Metrics](https://sprinto.com/blog/cybersecurity-dashboards/)
- [BlackCloak Digital Protection for Individuals and Families](https://blackcloak.io/private-client-services/)
- [The Importance and Effectiveness of Quantifying Cyber Risk](https://www.fairinstitute.org/fair-risk-management/)
- [Measuring Cybersecurity ROI: A Framework For 2026 Decision-Makers](https://safe.security/resources/blog/measuring-cybersecurity-roi-a-framework-for-2026-decision-makers/)