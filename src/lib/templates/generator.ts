import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { TemplateId, TemplateData, TEMPLATE_REGISTRY, TemplateMetadata } from './types';

/**
 * Generate Word document from template and data
 * @param templateId - Template identifier
 * @param data - Template data for placeholder replacement
 * @returns Generated document buffer
 */
export function generateTemplate(templateId: TemplateId, data: TemplateData): Buffer {
  // Load template file
  const templatePath = path.join(process.cwd(), 'templates', `${templateId}.docx`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  // Read template file
  const content = fs.readFileSync(templatePath, 'binary');

  // Create zip instance and document templater
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true
  });

  // Render template with data
  doc.render(data);

  // Generate buffer
  const buffer = doc.getZip().generate({ type: 'nodebuffer' });

  return buffer;
}

/**
 * Get all available template metadata
 * @returns Array of template metadata
 */
export function getAvailableTemplates(): TemplateMetadata[] {
  return TEMPLATE_REGISTRY;
}