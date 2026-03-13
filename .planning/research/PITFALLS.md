# Pitfalls Research

**Domain:** Adding intake interviews, audio recording, and advisor portal to Family Governance assessment platform
**Researched:** 2026-03-13
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Audio Recording Infrastructure Failure

**What goes wrong:**
Audio recording features fail in production due to browser compatibility issues, insufficient bandwidth handling, data storage explosion, and cross-device inconsistencies. Users experience failed recordings, corrupted audio files, and inability to replay critical interview content during advisor reviews.

**Why it happens:**
Developers underestimate audio infrastructure complexity, assuming Web Audio API works uniformly across browsers and devices. Teams skip load testing with realistic audio file sizes and don't account for upload timeouts with large audio files.

**How to avoid:**
- Implement progressive audio encoding with real-time compression
- Use chunked upload with resumable file transfer protocols
- Establish browser compatibility matrix testing (Chrome, Safari, Firefox, Edge)
- Set maximum recording duration limits (15-20 minutes per session)
- Implement audio quality fallback modes for poor network conditions

**Warning signs:**
- Audio uploads failing on mobile devices
- Recording timeouts after 10+ minutes
- Cross-browser audio playback inconsistencies
- Exponential storage cost increases
- User complaints about lost recording data

**Phase to address:**
Phase 1 (Audio Infrastructure Foundation) - Must establish robust recording architecture before building interview workflows

---

### Pitfall 2: Advisor Portal Permission Leakage

**What goes wrong:**
Advisor access permissions become inconsistent, leading to advisors seeing client data they shouldn't access, clients losing control over their information, and compliance violations. Role boundaries blur between advisor review, client ownership, and administrative access.

**Why it happens:**
Development teams fail to map existing ownership-enforced data access patterns to new advisor roles. The current system's user-centric security model doesn't naturally extend to multi-role scenarios without careful permission architecture.

**How to avoid:**
- Extend existing `userId`-based ownership pattern with explicit `advisorId` relationships
- Implement granular permission scopes: `read-assessment`, `write-recommendations`, `view-profiles`, `manage-interviews`
- Create advisor invitation workflow with client explicit consent
- Add advisor session tracking separate from client sessions
- Implement audit logs for all advisor data access

**Warning signs:**
- Advisors accessing assessments they weren't assigned to
- Client data visible across advisor portal boundaries
- Missing advisor activity audit trails
- Unclear advisor invitation/removal workflows
- Permission escalation during advisor actions

**Phase to address:**
Phase 2 (Advisor Permission Architecture) - Must establish secure multi-tenant access before building advisor workflows

---

### Pitfall 3: Interview State Management Disrupting Assessment Flow

**What goes wrong:**
Adding intake interviews breaks the existing 12-15 minute assessment completion time, confuses users about progress tracking, and disrupts the validated TurboTax-style user experience. Assessment auto-save conflicts with interview state, creating data corruption.

**Why it happens:**
Teams treat interviews as separate feature rather than integrated workflow step. The current Zustand store architecture and auto-save patterns weren't designed for multi-stage user journeys with different data persistence patterns.

**How to avoid:**
- Create interview completion gates before assessment access
- Extend existing assessment store with interview state isolation
- Implement interview progress tracking separate from assessment progress
- Preserve existing assessment auto-save behavior
- Use feature flags to gradually introduce interview requirements

**Warning signs:**
- Users starting assessments without completing interviews
- Assessment completion time exceeding 20 minutes
- Auto-save conflicts between interview and assessment data
- User progress confusion ("How much is left?")
- Existing users unable to access previously started assessments

**Phase to address:**
Phase 3 (Interview-Assessment Integration) - Must integrate workflows without disrupting existing user experience

---

### Pitfall 4: Assessment Customization Complexity Explosion

**What goes wrong:**
Adding advisor-driven assessment customization creates exponential branching complexity, making the system unmaintainable. Question dependency chains become fragile, and customization conflicts with existing household profile integration.

**Why it happens:**
The current `shouldShowQuestion()` function and profile-aware branching wasn't architected for external customization. Teams underestimate the interaction complexity between advisor preferences, household profiles, and existing branching logic.

**How to avoid:**
- Implement customization as overlay on existing branching, not replacement
- Create advisor recommendation engine separate from core assessment logic
- Limit customization scope to question emphasis/priority, not visibility
- Version customization rules to prevent breaking existing assessments
- Implement customization preview mode for advisors

**Warning signs:**
- Assessment logic becoming impossible to test comprehensively
- Customization conflicts causing assessment errors
- Performance degradation due to complex branching calculations
- Advisors unable to predict assessment outcomes for clients
- Development team avoiding branching logic changes

**Phase to address:**
Phase 4 (Assessment Customization Architecture) - Must design maintainable customization before feature expansion

---

### Pitfall 5: Audio Data Privacy and Compliance Failures

**What goes wrong:**
Audio recordings containing sensitive family governance information lack proper encryption, retention policies, and compliance frameworks. Client audio data becomes unmanageable liability, violating privacy expectations and regulatory requirements.

**Why it happens:**
Teams focus on technical audio implementation while overlooking data classification and lifecycle management. Family governance discussions contain highly sensitive information requiring specialized privacy protections beyond standard web application security.

**How to avoid:**
- Implement at-rest encryption for all audio data storage
- Create automated audio data retention/deletion policies
- Add client consent workflows specifically for audio recording
- Implement audio data export functionality for client data portability
- Establish clear audio transcription and processing guidelines

**Warning signs:**
- Audio files stored in plain text format
- No clear audio data deletion procedures
- Missing client consent tracking for recordings
- Audio data accessible to unauthorized team members
- Unclear audio data processing vendor agreements

**Phase to address:**
Phase 1 (Audio Infrastructure Foundation) - Must establish compliance framework before recording any client audio

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Browser-only audio recording | Faster development | Limited mobile support, quality issues | Development/testing only |
| Single audio file per interview | Simple storage model | Large files, poor upload reliability | Never - use chunked recording |
| Advisory permissions via user table flags | Quick role implementation | Permission leakage, scaling issues | Early prototype only |
| Interview state in existing assessment store | Faster integration | State conflicts, data corruption | Never - separate concerns |
| Hardcoded advisor customization rules | Immediate customization | Unmaintainable, no flexibility | Never - use configuration |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Audio transcription services | Sending raw audio without processing | Pre-process audio: compress, format, chunk |
| Advisor notification systems | Using existing user email templates | Create advisor-specific notification patterns |
| Audio storage providers | Assuming unlimited upload sizes | Implement progressive upload with size limits |
| Assessment customization APIs | Direct database manipulation | Use versioned configuration APIs |
| Interview scheduling systems | Tight coupling with assessment flow | Loose coupling via event-driven architecture |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Synchronous audio processing | Upload timeouts, UI blocking | Async processing with progress indicators | >5MB audio files |
| Loading all advisor permissions per request | Slow API responses | Cache permissions with TTL refresh | >50 advisor relationships |
| Client-side interview state management | Memory issues, state loss | Server-side state with client hydration | >30 interview questions |
| Full assessment re-evaluation per customization | Slow customization preview | Incremental evaluation with cached results | >100 assessment questions |
| Linear audio storage growth | Storage cost explosion | Automated retention/compression policies | >1000 recorded interviews |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Audio data transmitted without encryption | Sensitive family information exposure | HTTPS + at-rest encryption |
| Advisor access without client audit trail | Unauthorized data access, compliance violations | Comprehensive audit logging |
| Interview data accessible across user boundaries | Privacy violations, data breaches | Extend ownership-based access patterns |
| Audio transcription sent to third parties without consent | Privacy violations, vendor lock-in | Client-controlled transcription consent |
| Advisor portal session sharing | Permission escalation, data leakage | Separate advisor authentication flows |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Adding interview step without user preparation | Confused users, abandoned sessions | Clear upfront time expectations and preparation guides |
| Audio recording without clear visual feedback | Users unsure if recording is working | Real-time recording indicators and level meters |
| Advisor portal separate from main application | Disjointed experience, context switching | Embedded advisor views within main application |
| Assessment customization hidden from clients | Lack of transparency, trust issues | Client-visible customization explanations |
| Interview progress separate from assessment progress | Unclear completion status | Unified progress tracking across both phases |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Audio Recording:** Often missing browser compatibility testing — verify all target browsers with real users
- [ ] **Advisor Portal:** Often missing permission boundary testing — verify no cross-client data leakage
- [ ] **Interview Integration:** Often missing existing user migration — verify current users can still access assessments
- [ ] **Assessment Customization:** Often missing performance testing — verify complex customizations don't break assessment flow
- [ ] **Audio Storage:** Often missing retention policy implementation — verify audio data lifecycle management
- [ ] **Advisor Notifications:** Often missing unsubscribe/preference management — verify advisor communication controls
- [ ] **Interview Progress:** Often missing error recovery — verify users can resume interrupted interviews
- [ ] **Audio Quality:** Often missing network degradation handling — verify recording works on poor connections

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Audio recording infrastructure failure | HIGH | Implement audio recording queue with retry mechanism, migrate to proven audio service |
| Advisor permission leakage | HIGH | Emergency permission audit, client notification, system access review |
| Assessment flow disruption | MEDIUM | Feature flag rollback, user session recovery, assessment state repair |
| Interview state corruption | MEDIUM | Backup state recovery, interview restart workflow, user support |
| Audio storage compliance violation | HIGH | Legal review, affected client notification, storage migration |
| Customization complexity explosion | HIGH | Simplification sprint, legacy customization deprecation, rebuild |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Audio infrastructure failure | Phase 1: Audio Foundation | Load test with 100+ concurrent recordings |
| Advisor permission leakage | Phase 2: Advisor Architecture | Permission boundary testing with multiple advisor/client combinations |
| Interview-assessment integration issues | Phase 3: Interview Integration | End-to-end user journey testing preserving 12-15 minute assessment time |
| Assessment customization complexity | Phase 4: Customization Framework | Performance testing with complex branching scenarios |
| Audio privacy compliance | Phase 1: Audio Foundation | Security audit of audio data lifecycle |
| Interview state management | Phase 3: Interview Integration | State persistence testing across browser sessions |

## Sources

### Audio Recording Integration
- [Common Audio Recording Errors: Tips to Improve Sound Quality & Techniques](https://sparkmoor.com/common-sound-recording-mistakes-and-how-to-avoid-them/)
- [Web Audio API best practices - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- [Do's and Don'ts of Sound in UX](https://medium.com/design-bootcamp/dos-and-don-ts-of-sound-in-ux-766178f1ae95)
- [AudioRecorder Walkthrough: Web Audio, WebRTC, and Web Workers](http://flats.github.io/blog/2016/01/25/audiorecorder-walkthrough-web-audio-and-webrtc/)

### Advisor Portal and Workflow Integration
- [Top 10 Digital Tools for Financial Advisors in 2026](https://nextvestment.com/resources/blog/digital-tools-financial-advisors-2026)
- [Integrate your Financial Advisor tech stack to fuel growth](https://www.envestnet.com/wealth-management/software/tech-stack-integration-for-growth)
- [The Ultimate Guide to Workflow Integration in 2026](https://thedigitalprojectmanager.com/productivity/workflow-integration/)
- [Hubly Integrations Equal Automation Magnified](https://www.wealthmanagement.com/advisor-support-platforms/automation-magnified-hubly-announced-some-interesting-integrations-this-week)

### Intake Interview and Assessment Integration
- [Top 10 Technical Interview Pitfalls Companies Must Avoid in 2026](https://vprople.com/top-10-technical-interview-pitfalls-vprople-iaas/)
- [Conducting Intake Effectively: 22 Forms, Questions, & Apps](https://quenza.com/blog/intake-form-counseling/)
- [Why Your Technical Interview Process Is Broken in 2026](https://www.boundev.com/blog/why-technical-interview-process-broken-2026)

### Family Governance Platform Specific
- [A Family Office Guide on Governance Pitfalls](https://andsimple.co/guides/family-office-governance-pitfalls/)
- [10 governance challenges for family enterprises](https://www.ocorian.com/knowledge-hub/insights/10-governance-challenges-family-enterprises)
- [Family Office Software & Technology Report 2025](https://andsimple.co/reports/family-office-software/)
- [The Best Family Office Software for 2026](https://asora.com/best-family-office-software)

---
*Pitfalls research for: Adding intake interviews, audio recording, and advisor portal to Family Governance assessment platform*
*Researched: 2026-03-13*