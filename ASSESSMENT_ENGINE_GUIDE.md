# Enhanced Assessment Engine - Implementation Guide

## Overview

This guide demonstrates how to implement and use the enhanced risk assessment engine that converts your spreadsheet-based system into a scalable, rule-driven backend.

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Spreadsheet   │───▶│  Import Pipeline │───▶│  Assessment     │
│   Questions     │    │                  │    │  Bank           │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                          │
┌─────────────────┐    ┌──────────────────┐              │
│   User Answers  │───▶│  Scoring Engine  │◀─────────────┘
└─────────────────┘    └──────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Risk Scores    │◀───│   Rule Engine    │───▶│ Recommendations │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Import Your Spreadsheet

```typescript
import { SpreadsheetImporter } from '@/lib/assessment/import/spreadsheet-importer';

const importer = new SpreadsheetImporter();
const result = await importer.importFromFile('./risk-assessment.xlsx', {
  updateExisting: true,
  sheetName: 'Questions'
});

if (result.success) {
  console.log(`Imported ${result.importedCount} questions`);
} else {
  console.error('Import failed:', result.errors);
}
```

### 2. Run an Assessment

```typescript
// Create assessment
const response = await fetch('/api/assessment/enhanced/create', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user123',
    version: 1
  })
});
const { assessment } = await response.json();

// Submit answers
await fetch('/api/assessment/enhanced/submit', {
  method: 'POST',
  body: JSON.stringify({
    assessmentId: assessment.id,
    pillarId: 'governance',
    answers: {
      'governance_decision_authority': 'family_council',
      'governance_will_exists': 'yes',
      'governance_trust_established': 'no'
    }
  })
});

// Get results
const resultsResponse = await fetch(`/api/assessment/enhanced/${assessment.id}/results`);
const results = await resultsResponse.json();
```

### 3. View Results

```typescript
// Example result structure
const assessmentResults = {
  assessment: {
    id: "assessment_123",
    status: "COMPLETED",
    completedAt: "2024-01-15T10:30:00Z"
  },
  pillarScores: [
    {
      pillar: "governance",
      score: 1.8,
      riskLevel: "MEDIUM",
      breakdown: [
        {
          categoryId: "decision-making",
          categoryName: "Decision Making",
          score: 2.1,
          weight: 3,
          maxScore: 3
        }
      ],
      missingControls: [
        {
          questionId: "governance_trust_established",
          description: "Family trust not established",
          recommendation: "Consider establishing a family trust for asset protection",
          severity: "medium"
        }
      ]
    }
  ],
  overallScore: {
    score: 1.8,
    riskLevel: "MEDIUM",
    completionPercentage: 100
  },
  recommendations: [
    {
      id: "estate_planning_comprehensive",
      name: "Comprehensive Estate Planning",
      description: "Full estate planning review including wills, trusts, tax planning",
      category: "legal",
      priority: 1,
      estimatedCost: "$15,000 - $50,000",
      timeframe: "3-6 months",
      status: "PENDING"
    }
  ]
};
```

## Spreadsheet Format Requirements

Your spreadsheet should have these columns (exact names can vary):

| Column | Example Value | Required | Description |
|--------|---------------|----------|-------------|
| Pillar | Governance | Yes | Risk area identifier |
| Sub-Category | Decision Making | Yes | Category within pillar |
| Question ID | governance_decision_auth | Yes | Unique identifier |
| Question Text | Who has decision authority? | Yes | Question displayed to user |
| Help Text | Clear authority reduces conflicts | No | Additional guidance |
| Learn More | Establish governance charter | No | Detailed explanation |
| Risk Relevance | Unclear authority causes paralysis | No | Why this matters |
| Type | single-choice | Yes | Question type |
| Options | JSON array or delimited | Conditional | For choice questions |
| Required | TRUE | Yes | Whether answer is required |
| Weight | 3 | Yes | Question importance (1-10) |
| Score Map | {"yes": 3, "no": 0} | Yes | Answer → score mapping |
| Remediation | Establish clear charter | No | What to do if score is low |

### Example Spreadsheet Row

```
Pillar: Governance
Sub-Category: Decision Making
Question ID: governance_decision_authority
Question Text: Who has ultimate decision-making authority for family financial matters?
Help Text: Clear decision-making authority reduces conflicts during crises.
Type: single-choice
Options: [{"value":"patriarch","label":"Patriarch/Matriarch"},{"value":"council","label":"Family Council"},{"value":"consensus","label":"Full Consensus"},{"value":"unclear","label":"Not Defined"}]
Required: TRUE
Weight: 3
Score Map: {"patriarch":2,"council":3,"consensus":1,"unclear":0}
Remediation: Establish a family governance charter with clear decision rights
```

## Advanced Rule Configuration

### Creating Scoring Rules

```typescript
// Example: Bonus scoring for family businesses
const scoringRule = {
  id: "family_business_governance_bonus",
  questionId: "governance_decision_making",
  ruleName: "Family Business Governance Bonus",
  conditions: [
    {
      type: "answer_equals",
      questionId: "governance_family_business",
      operator: "equals",
      value: "yes"
    }
  ],
  scoreModifiers: [
    {
      type: "multiply",
      value: 1.2,
      target: "question_score"
    }
  ]
};
```

### Creating Recommendation Rules

```typescript
// Example: Estate planning recommendation
const recommendationRule = {
  serviceId: "estate_planning_comprehensive",
  conditions: [
    {
      type: "score_threshold",
      pillarId: "governance",
      operator: "less_than",
      value: 2.0,
      weight: 3
    },
    {
      type: "answer_match",
      questionId: "governance_will_exists",
      operator: "equals",
      value: "no",
      weight: 2
    }
  ],
  priority: 95
};
```

## API Reference

### Authentication
All endpoints require authentication. Include your session token:

```typescript
const headers = {
  'Authorization': `Bearer ${sessionToken}`,
  'Content-Type': 'application/json'
};
```

### Core Endpoints

#### GET /api/assessment/enhanced/pillars
Get all pillars and their configuration.

**Query Parameters:**
- `pillarId` (optional) - Get specific pillar details

**Response:**
```json
{
  "pillars": [
    {
      "pillarId": "governance",
      "name": "Governance",
      "questionCount": 25,
      "subCategoryCount": 5
    }
  ]
}
```

#### POST /api/assessment/enhanced/create
Create a new assessment.

**Body:**
```json
{
  "userId": "user123",
  "version": 1,
  "focusAreas": ["governance", "cybersecurity"]
}
```

#### POST /api/assessment/enhanced/submit
Submit answers for an assessment.

**Body:**
```json
{
  "assessmentId": "assessment123",
  "pillarId": "governance",
  "answers": {
    "governance_decision_authority": "family_council",
    "governance_will_exists": "yes"
  },
  "complete": false
}
```

#### GET /api/assessment/enhanced/[id]/results
Get assessment results and recommendations.

**Response:** Complete assessment results with scores, recommendations, and action plan.

## Validation & Error Handling

### Import Validation

The import pipeline validates:
- Required fields are present
- Question types are valid
- Score maps are properly formatted
- Question IDs are unique
- Weight values are numeric (1-10)

### Runtime Validation

- Answer validation against question constraints
- Score calculation validation
- Rule condition validation
- Database constraint enforcement

### Error Responses

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "scoreMap",
      "message": "Invalid JSON format"
    }
  ]
}
```

## Performance Considerations

### Database Optimization

- Index on `questionId`, `riskAreaId`, `isVisible`
- Index on `assessmentId` for responses
- Composite index on `assessmentId + pillar` for scores

### Caching Strategy

- Cache question definitions (rarely change)
- Cache pillar configurations
- Cache rule definitions
- Don't cache user answers or scores

### Scaling Recommendations

- Use database transactions for assessment submission
- Consider read replicas for heavy report generation
- Implement pagination for large question sets
- Use background jobs for complex rule evaluations

## Testing

### Unit Tests

```typescript
describe('Enhanced Scoring Engine', () => {
  it('should calculate pillar scores correctly', async () => {
    const engine = new EnhancedScoringEngine();
    const result = await engine.calculateAdvancedPillarScore(context, questions);
    
    expect(result.score).toBe(2.1);
    expect(result.riskLevel).toBe('medium');
  });
});
```

### Integration Tests

```typescript
describe('Assessment API', () => {
  it('should create and complete assessment', async () => {
    const createResponse = await POST('/api/assessment/enhanced/create', userData);
    const { assessment } = await createResponse.json();
    
    await POST('/api/assessment/enhanced/submit', {
      assessmentId: assessment.id,
      answers: testAnswers
    });
    
    const results = await GET(`/api/assessment/enhanced/${assessment.id}/results`);
    expect(results.overallScore.score).toBeGreaterThan(0);
  });
});
```

## Migration from Existing System

### Data Migration

1. Export existing assessments to spreadsheet format
2. Use the import pipeline to create new question bank
3. Migrate historical assessment data
4. Update API calls to use new endpoints

### Gradual Migration

- Keep existing system running
- Implement new system alongside
- Migrate assessments one pillar at a time
- Switch over when all features are validated

## Support & Maintenance

### Updating Question Bank

- Use the import pipeline for bulk updates
- Use admin interface for individual question edits
- Version control your spreadsheet changes
- Test rule changes in staging environment

### Monitoring

- Track assessment completion rates
- Monitor rule execution performance
- Log recommendation generation accuracy
- Alert on import validation failures

### Backup & Recovery

- Daily database backups
- Version control for rule configurations
- Export capability for assessments
- Import/export for disaster recovery

---

This system provides a robust, scalable foundation for your risk assessment platform while maintaining the flexibility to evolve your question sets and business rules without code changes.