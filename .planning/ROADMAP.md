# Roadmap: v1.1 Household Profile Integration

## Overview

Enhance assessment personalization through comprehensive household member profiles that drive intelligent question branching and customized deliverables.

## Phases

### Phase 5: Profile Foundation
**Goal:** Users can create and manage household member profiles with governance roles

**Dependencies:** None (builds on existing v1.0 authentication)

**Requirements:**
- PROFILE-01: User can create household member profiles with full name, age, occupation/career, and primary contact information (phone and email)
- PROFILE-02: User can specify family relationship for each household member (spouse, child, parent, etc.)
- PROFILE-03: User can assign governance roles to household members (decision maker, advisor, successor, etc.)
- PROFILE-04: User can edit and update existing household member profiles after initial creation
- PROFILE-05: User can remove household members from their profile when family composition changes
- PROFILE-06: User can track extended family members not living in the home (adult children, grandchildren) with basic contact information

**Success Criteria:**
1. User can add new household members with complete profile information in under 2 minutes per member
2. User can edit existing member profiles and see changes reflected immediately
3. User can assign and update governance roles for each household member
4. User can delete household members and confirm removal from all associated data

### Phase 6: Assessment Integration
**Goal:** Assessment questions personalize based on household composition and member roles

**Dependencies:** Phase 5 (Profile Foundation)

**Requirements:**
- ASSESS-01: Assessment questions branch based on household composition (number of members, ages, roles)
- ASSESS-02: Assessment displays personalized questions using household member names and roles
- ASSESS-03: Assessment auto-saves household profile data during profile creation and updates
- ASSESS-04: Assessment maintains backward compatibility with existing assessments that have no household profiles
- ASSESS-05: Assessment preserves existing scoring algorithm when household profiles are incomplete

**Success Criteria:**
1. User sees personalized questions that reference their household member names and roles
2. Assessment automatically shows/hides questions based on household composition (e.g., succession questions only for families with multiple generations)
3. User can complete assessment with or without household profiles maintaining 12-15 minute target completion time
4. Assessment auto-saves profile changes during session without interrupting flow

### Phase 7: Household Reporting
**Goal:** Reports and policy templates personalize using household member information

**Dependencies:** Phase 6 (Assessment Integration)

**Requirements:**
- REPORT-01: PDF reports include household composition section with member names, roles, and relationships
- REPORT-02: PDF reports display family-specific governance recommendations based on household member roles
- REPORT-03: PDF reports maintain professional formatting when household information is included
- REPORT-04: Policy templates pre-populate with household member names and governance role assignments

**Success Criteria:**
1. PDF reports display household composition section with all member information clearly formatted
2. Reports include governance recommendations tailored to specific family roles and relationships
3. Policy templates automatically populate with household member names in appropriate governance roles
4. All deliverables maintain professional appearance with household data integrated seamlessly

## Progress

| Phase | Status | Requirements | Success Criteria |
|-------|--------|--------------|------------------|
| 5 - Profile Foundation | Not Started | 6/6 | 0/4 |
| 6 - Assessment Integration | Not Started | 5/5 | 0/4 |
| 7 - Household Reporting | Not Started | 4/4 | 0/4 |

**Total:** 15/15 requirements across 3 phases

## Previous Milestones

### v1.0 MVP (Shipped: 2026-03-13)
- ✅ Phase 1: Authentication & Security (3/3 plans)
- ✅ Phase 2: Assessment Engine & Core Scoring (6/6 plans)
- ✅ Phase 3: Branching Logic (2/2 plans)
- ✅ Phase 4: Reports & Templates (3/3 plans)

**What shipped:** Complete 12-minute TurboTax-style Family Governance assessment with secure authentication, intelligent branching logic, and professional PDF reports with governance policy templates.