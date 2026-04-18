# Cybersecurity Assessment Implementation Guide

## Based on Your Actual Spreadsheet

This guide shows you exactly how to implement the enhanced assessment engine using your **real cybersecurity data** from the Belvedere spreadsheet.

## 📊 Your Assessment Structure (Analyzed)

**Categories:**
- **A.** Household Governance (6 questions)
- **B.** Devices & Network (5 questions) 
- **C.** Accounts & Access (3 questions)
- **D.** Data & Privacy (4 questions)
- **E.** Financial & Identity Risk (3 questions)
- **F.** Incident Response & Recovery (6 questions)

**Scoring Scale:** 0-3 (matches your existing maturity scale!)
- 0: Critical Exposure (Absent/Unknown/Unsafe)
- 1: Partial/Inconsistent (Ad hoc, user-dependent)
- 2: Implemented (In place and generally followed)
- 3: Mature/Resilient (Standardized, enforced, monitored)

**Risk Tiers:** (Direct from your spreadsheet)
- 80-100%: Low Risk → Annual testing
- 60-79%: Moderate Risk → Targeted remediation  
- 40-59%: Elevated Risk → Full uplift
- <40%: High/Critical → Immediate intervention

## 🚀 Step-by-Step Implementation

### Step 1: Database Setup

```bash
# Add the new schema extensions
npx prisma db push

# Or create migration
npx prisma migrate dev --name "add-enhanced-assessment-engine"
```

### Step 2: Import Your Cybersecurity Questions

```bash
# Place your CSV file in the project root
# Run the custom import script
npx tsx scripts/import-belvedere-cybersecurity.ts
```

This will:
- ✅ Parse your exact CSV format
- ✅ Create 27+ questions in `AssessmentBankQuestion`
- ✅ Map your 6 categories to subcategories
- ✅ Convert your scoring descriptions to options
- ✅ Extract risk relevance and remediation actions

### Step 3: Setup Recommendation Rules

```bash
# Setup rules based on your risk tiers
npx tsx scripts/setup-cybersecurity-rules.ts
```

This creates:
- ✅ 4 recommendation rules (one per risk tier)
- ✅ 3 advanced scoring rules  
- ✅ 4 service recommendations
- ✅ Pillar configuration with your thresholds

### Step 4: Test the System

```bash
# Run complete example assessment
npx tsx examples/cybersecurity-assessment-example.ts
```

Expected output:
```
🔐 Running Cybersecurity Assessment Example
==================================================
1. Creating assessment...
   ✅ Created assessment: clm123...

2. Submitting answers...
   ✅ Submitted 27 answers

3. Calculating enhanced score...
   📊 Cybersecurity Score: 1.2/3.0
   🚨 Risk Level: HIGH
   ❌ Missing Controls: 8

📋 ASSESSMENT RESULTS SUMMARY
==================================================
📊 CYBERSECURITY SCORE: 1.2/3.0
🎯 RISK LEVEL: HIGH
📈 RISK TIER: Elevated Risk (40-59%)
📝 REQUIRED ACTION: Full cybersecurity uplift

📂 CATEGORY BREAKDOWN:
   Household Governance: 1.0/3.0 (33%)
   Devices & Network: 0.8/3.0 (27%)
   Accounts & Access: 1.0/3.0 (33%)
   Data & Privacy: 1.0/3.0 (33%)
   Financial & Identity Risk: 0.7/3.0 (23%)
   Incident Response & Recovery: 0.8/3.0 (27%)

❌ MISSING CONTROLS (8):
   1. [HIGH] Network segmentation not implemented
      → Configure separate networks for work, family, and guests
   2. [HIGH] Password manager not deployed
      → Deploy enterprise-grade password manager for all family members
   3. [MEDIUM] MFA not enabled on critical accounts
      → Enable multi-factor authentication for banking, investments, email

💡 RECOMMENDATIONS (3):
   1. Complete Cybersecurity Uplift (technology)
      Cost: $15,000 - $50,000
      Time: 3-6 months
      Priority: 3
```

## 🎯 API Usage Examples

### Create Assessment

```typescript
const response = await fetch('/api/assessment/enhanced/create', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    userId: 'user123',
    version: 1
  })
});
const { assessment } = await response.json();
```

### Submit Cybersecurity Answers

```typescript
await fetch('/api/assessment/enhanced/submit', {
  method: 'POST',
  body: JSON.stringify({
    assessmentId: assessment.id,
    pillarId: 'cybersecurity',
    answers: {
      'cyber_a_password_device_management': 'informal',
      'cyber_a_family_online_rules': 'verbal',
      'cyber_b_device_inventory': 'partial',
      'cyber_c_password_manager': 'some_complexity',
      'cyber_c_mfa_enabled': 'limited',
      // ... all 27 questions
    },
    complete: true
  })
});
```

### Get Results

```typescript
const resultsResponse = await fetch(`/api/assessment/enhanced/${assessment.id}/results`);
const results = await resultsResponse.json();

// Results include:
// - Overall cybersecurity score
// - Risk level (LOW/MEDIUM/HIGH/CRITICAL)
// - Category breakdown
// - Missing controls with remediation actions
// - Service recommendations based on risk tier
// - Action plan prioritized by severity
```

## 🔧 Customization Examples

### Add Custom Scoring Rule

```json
{
  "id": "cyber_high_net_worth_bonus",
  "questionId": "cyber_a_cyber_insurance",
  "ruleName": "High Net Worth Insurance Requirement",
  "conditions": [
    {
      "type": "profile_condition",
      "field": "netWorth",
      "operator": "greater_than",
      "value": 10000000
    }
  ],
  "scoreModifiers": [
    {
      "type": "apply_weight",
      "value": 2.0,
      "target": "question_score"
    }
  ]
}
```

### Add Custom Recommendation

```json
{
  "id": "cyber_executive_protection",
  "name": "Executive Cybersecurity Protection",
  "description": "Advanced cybersecurity for high-profile families",
  "category": "executive",
  "priority": 1,
  "estimatedCost": "$50,000 - $150,000",
  "triggerConditions": [
    {
      "type": "profile_condition",
      "field": "publicProfile",
      "operator": "equals",
      "value": "high"
    },
    {
      "type": "score_threshold",
      "pillarId": "cybersecurity", 
      "operator": "less_than",
      "value": 2.5
    }
  ]
}
```

## 📈 Integration with Existing System

### Using Your Current Components

The enhanced engine integrates seamlessly:

```typescript
// In your existing assessment flow
import { EnhancedScoringEngine } from '@/lib/assessment/engines/enhanced-scoring-engine';
import { loadGovernanceQuestionsMerged } from '@/lib/assessment/bank/load-bank';

// Your existing pillar scoring
const questions = await loadGovernanceQuestionsMerged({
  onlyVisible: true,
  riskAreaId: 'cybersecurity'
});

// Enhanced scoring with rules
const enhancedEngine = new EnhancedScoringEngine();
const result = await enhancedEngine.calculateAdvancedPillarScore({
  answers: userAnswers,
  householdProfile: userProfile,
  assessmentId,
  pillarId: 'cybersecurity'
}, questions);

// Use existing PillarScore storage
await db.pillarScore.create({
  data: {
    assessmentId,
    pillar: 'cybersecurity',
    score: result.score,
    riskLevel: result.riskLevel.toUpperCase(),
    breakdown: result.breakdown,
    missingControls: result.missingControls
  }
});
```

### Updating Your Assessment Flow

```typescript
// In src/components/assessment/QuestionCard.tsx
// Add enhanced feedback based on risk relevance

// In src/components/assessment/ScoreDisplay.tsx  
// Show risk tier classification and required actions

// In src/components/assessment/ActionPlan.tsx
// Display prioritized recommendations from engine
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('Cybersecurity Assessment', () => {
  it('should calculate correct risk tier for moderate risk family', async () => {
    const answers = {
      'cyber_c_password_manager': 'password_manager',
      'cyber_c_mfa_enabled': 'critical_enabled',
      // ... other moderate answers
    };
    
    const result = await calculatePillarScore(answers, pillar, questions);
    expect(result.score).toBeGreaterThan(1.8);
    expect(result.score).toBeLessThan(2.4);
    expect(result.riskLevel).toBe('medium');
  });
});
```

### Integration Tests

```typescript
describe('Recommendation Engine', () => {
  it('should recommend targeted remediation for moderate risk', async () => {
    const context = { /* moderate risk context */ };
    const recommendations = await engine.generateRecommendations(context);
    
    expect(recommendations).toContainEqual(
      expect.objectContaining({
        name: 'Targeted Cybersecurity Remediation'
      })
    );
  });
});
```

## 📋 Migration Checklist

- [ ] **Database setup** - Run migrations for enhanced schema
- [ ] **Import questions** - Run cybersecurity import script  
- [ ] **Setup rules** - Configure recommendation and scoring rules
- [ ] **Test system** - Run example assessment
- [ ] **API integration** - Update frontend to use new endpoints
- [ ] **Validate scoring** - Compare results with spreadsheet calculations
- [ ] **User testing** - Test with real family scenarios
- [ ] **Documentation** - Update admin guides for question management

## 🔮 Next Steps

1. **Import remaining pillars** - Adapt the scripts for your other 5 risk areas
2. **Advanced rules** - Add conditional logic based on household profiles
3. **Recommendation tuning** - Refine based on advisor feedback
4. **Reporting enhancements** - Build advisor dashboards showing risk tiers
5. **Question versioning** - Implement version control for question updates

## 🆘 Support

**Common Issues:**
- **Import fails:** Check CSV formatting and column mapping
- **Scoring incorrect:** Validate scoreMap JSON in questions
- **Rules not firing:** Check condition logic and weights
- **Performance slow:** Add database indexes for large datasets

**Debugging:**
```typescript
// Enable rule execution logging
process.env.RULE_EXECUTION_DEBUG = 'true';

// Check question loading
const questions = await loadGovernanceQuestionsMerged({
  onlyVisible: true,
  riskAreaId: 'cybersecurity'
});
console.log(`Loaded ${questions.length} cybersecurity questions`);
```

---

🎉 **You now have a production-ready cybersecurity assessment engine based on your actual spreadsheet!**

The system maintains your existing 0-3 maturity scale, risk tier classifications, and recommended actions while adding powerful rule-based customization and automated recommendation generation.