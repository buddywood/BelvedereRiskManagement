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

// Template content for each policy type
const templateContents = {
  'decision-making-authority': `
{familyName} Family Decision-Making Authority Policy

Assessment Date: {assessmentDate}
Overall Governance Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

GOVERNANCE STRUCTURE & DECISION-MAKING

This policy establishes clear decision-making authority and voting procedures for the {familyName} family governance structure.

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

DECISION-MAKING FRAMEWORK:
1. Family council voting rights and quorum requirements
   Authorized voting members: {decisionMakers}
2. Conflict resolution procedures and escalation paths
3. Authority levels for different decision types
4. Meeting protocols and documentation standards
`,

  'access-controls': `
{familyName} Family Access Controls Policy

Assessment Date: {assessmentDate}
Overall Governance Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

INFORMATION SECURITY & ACCESS MANAGEMENT

This policy defines asset access tiers and approval workflows for the {familyName} family.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}
Access Approval Authority: {decisionMakers}

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

ACCESS CONTROL FRAMEWORK:
1. Asset access tier definitions and restrictions
2. Approval workflow requirements by asset type
   Approving authorities: {decisionMakers}
3. Information sharing protocols and confidentiality
4. Digital access management and security measures
`,

  'trust-estate-governance': `
{familyName} Trust & Estate Governance Policy

Assessment Date: {assessmentDate}
Overall Governance Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

TRUST & ESTATE STRUCTURE GOVERNANCE

This policy outlines trustee responsibilities and beneficiary rights for the {familyName} family trust structures.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}
Designated Trustees: {trustees}
Beneficiaries: {beneficiaries}

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

TRUST GOVERNANCE FRAMEWORK:
1. Trustee duties, powers, and accountability measures
   Trustees: {trustees}
2. Beneficiary rights and communication requirements
   Beneficiaries: {beneficiaries}
3. Distribution decision criteria and procedures
4. Trust review schedule and performance evaluation
`,

  'succession-planning': `
{familyName} Succession Planning Policy

Assessment Date: {assessmentDate}
Overall Governance Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

LEADERSHIP SUCCESSION PLANNING

This policy establishes leadership transition planning and capability development for the {familyName} family.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}
Designated Successors: {successors}

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

SUCCESSION FRAMEWORK:
1. Leadership transition planning and timeline
   Designated successors: {successors}
2. Mentorship and development requirements
3. Capability assessment and readiness criteria
4. Emergency succession procedures
`,

  'behavior-standards': `
{familyName} Family Behavior Standards Policy

Assessment Date: {assessmentDate}
Overall Governance Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

FAMILY CODE OF CONDUCT

This policy defines behavior expectations and public representation standards for the {familyName} family.

RESPONSIBLE PARTIES:
Family Governance Lead: {householdHead}

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

BEHAVIOR STANDARDS FRAMEWORK:
1. Family code of conduct and core values
2. Social media guidelines and digital presence
3. Public representation and media interaction rules
4. Consequence framework for policy violations
`,

  'family-business-governance': `
{familyName} Family Business Governance Policy

Assessment Date: {assessmentDate}
Overall Governance Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

FAMILY BUSINESS GOVERNANCE STRUCTURE

This policy establishes governance framework for family business operations and oversight.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}
Board Members: {decisionMakers}
Advisory Board: {advisors}

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

BUSINESS GOVERNANCE FRAMEWORK:
1. Board structure and family/independent director balance
   Family board members: {decisionMakers}
   Advisory board members: {advisors}
2. Family employment policies and merit requirements
3. Compensation transparency and fairness principles
4. Conflict of interest policies and disclosure requirements
`,

  'documentation-records': `
{familyName} Documentation & Records Policy

Assessment Date: {assessmentDate}
Overall Governance Score: {overallScore}/10 ({riskLevel} risk)
Category Score: {categoryScore}/10 ({categoryRiskLevel} risk)

RECORD KEEPING & DOCUMENTATION MANAGEMENT

This policy defines record retention and documentation standards for the {familyName} family governance.

RESPONSIBLE PARTIES:
Primary Authority: {householdHead}
Records Custodians: {executors}

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

DOCUMENTATION FRAMEWORK:
1. Record retention schedule by document type
2. Access protocols and security requirements
3. Update frequency and version control
4. Responsible parties and accountability measures
   Records custodians: {executors}
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