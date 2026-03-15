# Feature Research

**Domain:** Client invitation systems, status tracking dashboards, and automated workflow notifications
**Researched:** 2026-03-15
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Secure email invitations with branded templates | Standard for all wealth management platforms 2026 | MEDIUM | Email templates with personalization, secure links, advisor branding |
| Real-time pipeline status dashboard | Advisors need visibility into client onboarding progress | MEDIUM | Visual pipeline stages, completion percentages, at-a-glance health |
| Automated status change notifications | Expected for professional service delivery efficiency | MEDIUM | Stage transitions, document uploads, deadline alerts |
| Document collection progress tracking | Required for compliance and momentum maintenance | LOW | File upload status, completion indicators, automated reminders |
| Mobile-responsive portal access | Clients expect modern digital experience across devices | LOW | Responsive design, secure authentication, mobile optimization |
| Client communication preferences | Professional expectation to respect communication choices | LOW | Email frequency, notification types, contact method preferences |
| Secure messaging within platform | Clients expect integrated, compliant communication | MEDIUM | Portal-based messaging, audit trail, file sharing |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI-powered personalized onboarding paths | Adapts workflow based on client complexity/family structure | HIGH | Dynamic path adjustment based on assessment responses |
| Predictive analytics for engagement optimization | Identifies at-risk clients before they disengage | HIGH | Behavior analysis, proactive intervention recommendations |
| White-label invitation system with advisor branding | Complete advisor brand experience throughout journey | MEDIUM | Custom domains, branded templates, logos, color schemes |
| Family member role-based invitation workflows | Handles complex governance structures with multiple stakeholders | HIGH | Multi-approver flows, role permissions, dependency tracking |
| Smart calendar integration with availability matching | Streamlines complex family scheduling across time zones | MEDIUM | Calendar sync, family availability coordination |
| Compliance audit trail with governance focus | Demonstrates regulatory adherence specific to family governance | MEDIUM | Detailed logs, governance decision tracking, export capabilities |
| Video introduction integration for personal touch | Humanizes digital onboarding for high-touch relationships | MEDIUM | Embedded advisor videos, recording tools, personalization |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Built-in CRM functionality | "One platform for everything" | Not our expertise, existing solutions better | Deep CRM integration via APIs |
| Complex project management features | Onboarding seems like project management | Over-engineering for specific governance use case | Focus on governance-specific workflow states |
| Marketing automation beyond onboarding | "Nurture prospects too" | Scope creep, dilutes governance intelligence focus | Partner with marketing platforms, focus on assessment |
| Social media integration | "Modern engagement" | Outside wealth management compliance scope | Professional communication channels only |
| Video conferencing built-in | "Complete platform" | Commodity feature, maintenance overhead | Support existing meeting platforms via links |

## Feature Dependencies

```
Secure Authentication (existing)
    └──enables──> Client Invitation System
                       └──requires──> Status Dashboard (tracks invitations)
                                          └──enables──> Automated Notifications

Document Collection (existing file handling)
    └──enhances──> Progress Tracking
                      └──triggers──> Status Notifications

Family/Household Management (existing)
    └──enables──> Multi-stakeholder Invitations
                     └──requires──> Role-based Workflows

Notification System Foundation (existing)
    └──extends──> Workflow Notifications
```

### Dependency Notes

- **Status Dashboard requires Client Invitation System:** Dashboard shows invitation status and progress
- **Automated Notifications require Status Dashboard:** Notifications triggered by status changes tracked in dashboard
- **Multi-stakeholder Invitations require Family Management:** Complex family structures need existing household relationship data
- **All features require existing Authentication/MFA:** Security is table stakes for wealth management

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Secure email invitation system — Essential for advisor workflow, table stakes expectation
- [ ] Basic status dashboard — Advisors must see client progress, prevents manual tracking
- [ ] Automated reminder notifications — Prevents client drop-off, maintains professional momentum
- [ ] Document collection tracking — Builds on existing file handling, shows completion status

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] White-label branding — When advisors request branded experience
- [ ] Advanced notification customization — When usage patterns show needed flexibility
- [ ] Mobile app optimization — When mobile usage data shows demand

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] AI-powered personalization — Requires usage data to be meaningful
- [ ] Predictive analytics — Need baseline engagement data first
- [ ] Video integration — Nice-to-have, not essential for governance workflow validation

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Secure email invitations | HIGH | MEDIUM | P1 |
| Status dashboard | HIGH | MEDIUM | P1 |
| Automated notifications | HIGH | MEDIUM | P1 |
| Document tracking | MEDIUM | LOW | P1 |
| White-label branding | MEDIUM | MEDIUM | P2 |
| AI personalization | LOW | HIGH | P3 |
| Video integration | LOW | MEDIUM | P3 |
| Predictive analytics | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Industry Standard | Wealth Management Leaders | Our Approach |
|---------|------------------|---------------------------|--------------|
| Email invitations | Basic templates | Branded, personalized | Governance-focused templates |
| Status tracking | Simple progress bars | Real-time dashboards | Governance milestone tracking |
| Notifications | Generic CRM alerts | Customizable workflows | Assessment-specific triggers |
| Document collection | File uploads | Secure portals with compliance | Integrate with existing assessment docs |

## Integration with Existing Features

### Assessment System Integration
- Use existing 68-question assessment as the core workflow being tracked
- Leverage existing scoring engine to trigger notifications based on completion
- Build on existing customization features for advisor-specific workflows

### Household Profile Integration
- Use existing household member profiles for multi-stakeholder invitations
- Leverage role-based access for family member permissions in workflow
- Build on existing member-aware authentication for secure access

### Security and Privacy Integration
- Extend existing TOTP/MFA to invitation system access
- Maintain SOC 2 compliance with workflow tracking and notifications
- Use existing audit logging for invitation and status tracking history

### Notification System Foundation Integration
- Extend existing notification infrastructure for workflow alerts
- Build on existing email template system for invitation customization
- Leverage existing preference management for notification settings

## Sources

- [Wealth Management Software in 2026 | Top Platforms & Technology Solutions](https://revenx.com/wealth-management-software-in-2026-platforms-and-technology-for-scalable-pre-set-appointments/)
- [Client Onboarding in Wealth Management: Best Practices](https://whatfix.com/blog/client-onboarding-in-wealth-management/)
- [Wealth management client onboarding process + checklist - Blog | ShareFile](https://www.sharefile.com/resource/blogs/wealth-management-client-onboarding)
- [Guide to Wealth Management Onboarding & Service](https://www.smartcommunications.com/resources/guides/the-ultimate-guide-to-wealth-management-client-onboarding-and-servicing/)
- [10 new client onboarding email templates for a smoother onboarding experience | Moxo](https://www.moxo.com/blog/new-client-onboarding-email-template)
- [Pipeline CRM for Financial Services](https://pipelinecrm.com/industries/financial-services-crm/)
- [CRM Features Transforming Financial Services: Analytics, Workflow, and Compliance | Bedrock](https://bedrockfs.com/crm-features-transforming-financial-services-analytics-workflow-and-compliance/)

---
*Feature research for: Client invitation systems, status tracking dashboards, and automated workflow notifications*
*Researched: 2026-03-15*