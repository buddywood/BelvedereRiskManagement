import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

// Basic docx structure with minimal content
const createBaseDocx = (): PizZip => {
  const zip = new PizZip();

  // Add basic document structure
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  return zip;
};

// Template content for each policy type (six comprehensive risk pillars)
const templateContents = {
  'environmental-geographic-risk': `
{familyName} Environmental & Geographic Risk Policy

Assessment Date: {assessmentDate}
Overall Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

NATURAL HAZARD EXPOSURE & PROPERTY RESILIENCE

This policy documents how the {familyName} household identifies regional hazards, maintains insurance, and plans for evacuation or prolonged disruption.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}

IDENTIFIED GAPS TO ADDRESS:
{#gaps}• {description} - {severity} Priority
  Recommendation: {recommendation}

{/gaps}

STRENGTHS TO MAINTAIN:
{#strengths}• {.}
{/strengths}

RECOMMENDATIONS FOR IMPLEMENTATION:
{#recommendations}• {.}
{/recommendations}

ENVIRONMENTAL & GEOGRAPHIC FRAMEWORK:
1. Hazard mapping and broker review cycle for primary residences
2. Catastrophe coverage aligned to replacement value and ordinance costs
3. Evacuation routes, rally points, and household communications
4. Continuity: records, secondary locations, and advisor contact tree
`,

  'physical-security': `
{familyName} Physical Security Policy

Assessment Date: {assessmentDate}
Overall Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

RESIDENCE, TRAVEL, AND PERSONAL SAFETY

This policy defines physical security expectations for residences, travel, and dependents for the {familyName} family.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}

IDENTIFIED GAPS TO ADDRESS:
{#gaps}• {description} - {severity} Priority
  Recommendation: {recommendation}

{/gaps}

STRENGTHS TO MAINTAIN:
{#strengths}• {.}
{/strengths}

RECOMMENDATIONS FOR IMPLEMENTATION:
{#recommendations}• {.}
{/recommendations}

PHYSICAL SECURITY FRAMEWORK:
1. Layered controls at primary homes (entries, lighting, monitoring)
2. Neighborhood risk awareness and routine adjustments
3. Travel security briefings for elevated-risk destinations
4. Duress communication and escalation for household members
`,

  'cybersecurity': `
{familyName} Cybersecurity & Digital Access Policy

Assessment Date: {assessmentDate}
Overall Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

DIGITAL ACCESS, DEVICES, AND SENSITIVE INFORMATION

This policy defines authentication, access tiers, and safe handling of financial and estate information for the {familyName} family.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}
Access Approvers: {decisionMakers}

IDENTIFIED GAPS TO ADDRESS:
{#gaps}• {description} - {severity} Priority
  Recommendation: {recommendation}

{/gaps}

STRENGTHS TO MAINTAIN:
{#strengths}• {.}
{/strengths}

RECOMMENDATIONS FOR IMPLEMENTATION:
{#recommendations}• {.}
{/recommendations}

CYBERSECURITY FRAMEWORK:
1. MFA and hardened recovery paths for email and financial accounts
2. Home network segmentation and IoT inventory
3. Need-to-know access to trust, tax, and investment documents
4. Periodic access reviews as household roles change
`,

  'financial-asset-protection': `
{familyName} Financial & Asset Protection Policy

Assessment Date: {assessmentDate}
Overall Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

INSURANCE, STRUCTURES, AND CONCENTRATION

This policy addresses how the {familyName} family protects balance-sheet assets through insurance, legal structures, and concentration awareness.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}
Trustees: {trustees}

IDENTIFIED GAPS TO ADDRESS:
{#gaps}• {description} - {severity} Priority
  Recommendation: {recommendation}

{/gaps}

STRENGTHS TO MAINTAIN:
{#strengths}• {.}
{/strengths}

RECOMMENDATIONS FOR IMPLEMENTATION:
{#recommendations}• {.}
{/recommendations}

FINANCIAL & ASSET PROTECTION FRAMEWORK:
1. Property, liability, umbrella, and specialty coverage reviews
2. Trust, titling, marital, and business continuity documents
3. Liquidity stress tests for large private positions
4. Fraud controls on banking and investment workflows
`,

  'health-medical-preparedness': `
{familyName} Health & Medical Preparedness Policy

Assessment Date: {assessmentDate}
Overall Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

EMERGENCY MEDICAL AND TRAVEL HEALTH

This policy documents medical decision-making, continuity of care, and travel health readiness for the {familyName} family.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}

IDENTIFIED GAPS TO ADDRESS:
{#gaps}• {description} - {severity} Priority
  Recommendation: {recommendation}

{/gaps}

STRENGTHS TO MAINTAIN:
{#strengths}• {.}
{/strengths}

RECOMMENDATIONS FOR IMPLEMENTATION:
{#recommendations}• {.}
{/recommendations}

HEALTH & MEDICAL FRAMEWORK:
1. Emergency plans, preferred facilities, and physician rosters
2. Central medication and allergy lists for caregivers
3. International coverage, telehealth, and medical evacuation
4. Contingencies for regional health disruptions affecting dependents
`,

  'lifestyle-behavioral-risk': `
{familyName} Lifestyle & Behavioral Risk Policy

Assessment Date: {assessmentDate}
Overall Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

GOVERNANCE, VISIBILITY, AND ROUTINES

This policy aligns decision rights, public footprint, and advisor coordination for the {familyName} family.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}
Decision Makers: {decisionMakers}

IDENTIFIED GAPS TO ADDRESS:
{#gaps}• {description} - {severity} Priority
  Recommendation: {recommendation}

{/gaps}

STRENGTHS TO MAINTAIN:
{#strengths}• {.}
{/strengths}

RECOMMENDATIONS FOR IMPLEMENTATION:
{#recommendations}• {.}
{/recommendations}

LIFESTYLE & BEHAVIORAL FRAMEWORK:
1. Documented governance roles, voting, and conflict escalation
2. Expectations for social visibility and sharing wealth-related information
3. Predictable routines reviewed for undue exposure
4. Coordinated advisor team with single source of truth on key facts
`
};

async function createTemplateFiles() {
  // Ensure templates directory exists
  const templatesDir = path.join(process.cwd(), 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  for (const [templateId, content] of Object.entries(templateContents)) {
    console.log(`Creating template: ${templateId}.docx`);

    // Create base document
    const zip = createBaseDocx();

    // Create document.xml with template content
    const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">${content.trim()}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

    zip.file('word/document.xml', docXml);

    // Generate and save the file
    const buffer = zip.generate({ type: 'nodebuffer' });
    const filePath = path.join(templatesDir, `${templateId}.docx`);
    fs.writeFileSync(filePath, buffer);

    console.log(`Created: ${filePath}`);
  }

  console.log('All template files created successfully!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTemplateFiles().catch(console.error);
}

export { createTemplateFiles };