/**
 * Social Media Content Templates for AkiliRisk Marketing
 *
 * Pre-built content templates organized by theme to help generate
 * draft social media posts. Templates include placeholders that
 * can be customized before publishing.
 */

import type { SocialContentTheme } from "@prisma/client";

export type ContentTemplate = {
  id: string;
  theme: SocialContentTheme;
  title: string;
  content: string;
  hashtags: string[];
  isThread?: boolean;
  threadContent?: string[];
};

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  // Cyber Security Theme
  {
    id: "cyber-mfa-tip",
    theme: "CYBER_SECURITY",
    title: "MFA Tip",
    content:
      "Enable multi-factor authentication on every account that supports it. It's one of the most effective ways to protect your family's digital identity. #CyberSecurity #MFA",
    hashtags: ["CyberSecurity", "MFA", "DigitalSecurity"],
  },
  {
    id: "cyber-password-tip",
    theme: "CYBER_SECURITY",
    title: "Password Best Practices",
    content:
      "Still using the same password everywhere? Time for a change. Use a password manager to generate and store unique, complex passwords for each account. #CyberSecurity #PasswordSecurity",
    hashtags: ["CyberSecurity", "PasswordSecurity", "OnlineSafety"],
  },
  {
    id: "cyber-wifi-security",
    theme: "CYBER_SECURITY",
    title: "Public WiFi Warning",
    content:
      "Public WiFi is convenient, but it's also a hunting ground for hackers. Use a VPN when connecting to public networks, or stick to your mobile data for sensitive tasks. #CyberSecurity",
    hashtags: ["CyberSecurity", "WiFiSecurity", "VPN"],
  },
  {
    id: "cyber-phishing-awareness",
    theme: "CYBER_SECURITY",
    title: "Phishing Awareness",
    content:
      "Before clicking that link, ask yourself: Was I expecting this email? Does the sender address look right? When in doubt, go directly to the website instead of clicking. #CyberSecurity #Phishing",
    hashtags: ["CyberSecurity", "Phishing", "EmailSecurity"],
  },
  {
    id: "cyber-software-updates",
    theme: "CYBER_SECURITY",
    title: "Software Updates Matter",
    content:
      "Those software update notifications aren't just annoying - they often contain critical security patches. Set your devices to auto-update and close those vulnerability windows. #CyberSecurity",
    hashtags: ["CyberSecurity", "SoftwareUpdates", "SecurityPatches"],
  },

  // Identity Protection Theme
  {
    id: "identity-credit-freeze",
    theme: "IDENTITY_PROTECTION",
    title: "Credit Freeze Benefits",
    content:
      "A credit freeze is free and one of the best defenses against identity theft. It prevents anyone from opening new accounts in your name - including you, until you unfreeze. #IdentityProtection",
    hashtags: ["IdentityProtection", "CreditFreeze", "IdentityTheft"],
  },
  {
    id: "identity-social-media",
    theme: "IDENTITY_PROTECTION",
    title: "Social Media Privacy",
    content:
      "What you share on social media can be used against you. Birthdays, pet names, maiden names - all common security questions that scammers can find with a quick search. #IdentityProtection",
    hashtags: ["IdentityProtection", "SocialMediaPrivacy", "OnlineSafety"],
  },
  {
    id: "identity-monitoring",
    theme: "IDENTITY_PROTECTION",
    title: "Identity Monitoring",
    content:
      "Do you know what's happening with your personal information? Regular monitoring of your credit reports and financial accounts can catch identity theft early. #IdentityProtection",
    hashtags: ["IdentityProtection", "CreditMonitoring", "FinancialSecurity"],
  },

  // Family Safety Theme
  {
    id: "family-children-online",
    theme: "FAMILY_SAFETY",
    title: "Children Online Safety",
    content:
      "Teach your children that strangers online are still strangers. Regular conversations about digital safety are just as important as teaching them to look both ways before crossing. #FamilySafety",
    hashtags: ["FamilySafety", "ChildSafety", "OnlineSafety"],
  },
  {
    id: "family-emergency-plan",
    theme: "FAMILY_SAFETY",
    title: "Family Emergency Plan",
    content:
      "Does your family have a communication plan for emergencies? Designate an out-of-area contact, establish meeting points, and make sure everyone knows the plan. #FamilySafety",
    hashtags: ["FamilySafety", "EmergencyPreparedness", "FamilyPlan"],
  },
  {
    id: "family-device-security",
    theme: "FAMILY_SAFETY",
    title: "Family Device Security",
    content:
      "Every device in your home is a potential entry point. Secure your smart home devices, review app permissions, and create separate accounts for children. #FamilySafety #SmartHome",
    hashtags: ["FamilySafety", "SmartHome", "DeviceSecurity"],
  },

  // Risk Assessment Theme
  {
    id: "risk-holistic-view",
    theme: "RISK_ASSESSMENT",
    title: "Holistic Risk View",
    content:
      "Risk doesn't exist in silos. Your digital security, physical safety, and financial protection are all interconnected. A comprehensive risk assessment looks at the whole picture. #RiskManagement",
    hashtags: ["RiskManagement", "RiskAssessment", "HolisticSecurity"],
  },
  {
    id: "risk-proactive-approach",
    theme: "RISK_ASSESSMENT",
    title: "Proactive Risk Management",
    content:
      "The best time to assess your risks is before something happens. Understanding your vulnerabilities today helps you prevent problems tomorrow. #RiskManagement",
    hashtags: ["RiskManagement", "ProactiveSecurity", "RiskPrevention"],
  },

  // Product Update Theme
  {
    id: "product-assessment-feature",
    theme: "PRODUCT_UPDATE",
    title: "Assessment Feature Highlight",
    content:
      "Our comprehensive risk assessment covers cyber security, identity protection, and family safety in one place. Know your risk profile in minutes. Try it free at akilirisk.com #AkiliRisk",
    hashtags: ["AkiliRisk", "RiskAssessment", "Security"],
  },
  {
    id: "product-advisor-portal",
    theme: "PRODUCT_UPDATE",
    title: "Advisor Portal",
    content:
      "Financial advisors: Help your clients understand their complete risk picture. Our advisor portal makes it easy to deliver personalized risk assessments. #AkiliRisk #Advisors",
    hashtags: ["AkiliRisk", "FinancialAdvisors", "RiskManagement"],
  },

  // Industry News Theme
  {
    id: "news-data-breach",
    theme: "INDUSTRY_NEWS",
    title: "Data Breach Response",
    content:
      "Another major data breach in the news. Here's what to do: Check if you're affected, change passwords for related accounts, monitor your credit, and consider a credit freeze. #DataBreach",
    hashtags: ["DataBreach", "CyberSecurity", "IdentityProtection"],
  },
  {
    id: "news-cyber-stats",
    theme: "INDUSTRY_NEWS",
    title: "Cyber Crime Statistics",
    content:
      "Cybercrime costs are projected to reach $10.5 trillion annually by 2025. The question isn't if you'll be targeted, but when. Are you prepared? #CyberSecurity #Statistics",
    hashtags: ["CyberSecurity", "CyberCrime", "Statistics"],
  },

  // Thought Leadership Theme
  {
    id: "thought-risk-culture",
    theme: "THOUGHT_LEADERSHIP",
    title: "Risk-Aware Culture",
    content:
      "Security isn't just about technology - it's about culture. Building a risk-aware mindset in your household is the foundation for lasting protection. #ThoughtLeadership #RiskCulture",
    hashtags: ["ThoughtLeadership", "RiskCulture", "SecurityMindset"],
  },
  {
    id: "thought-privacy-value",
    theme: "THOUGHT_LEADERSHIP",
    title: "The Value of Privacy",
    content:
      "In a world where data is currency, protecting your privacy is protecting your wealth. Your personal information has real value - treat it accordingly. #Privacy #DataProtection",
    hashtags: ["Privacy", "DataProtection", "ThoughtLeadership"],
  },

  // Engagement Theme
  {
    id: "engage-security-question",
    theme: "ENGAGEMENT",
    title: "Security Poll",
    content:
      "Quick poll: What's your biggest security concern for your family? Reply with:\n\n1. Cyber threats\n2. Identity theft\n3. Physical safety\n4. Financial fraud\n\n#SecurityPoll",
    hashtags: ["SecurityPoll", "FamilySafety", "CyberSecurity"],
  },
  {
    id: "engage-tip-request",
    theme: "ENGAGEMENT",
    title: "Tip Request",
    content:
      "What security topic would you like us to cover next? Drop your questions below and we'll create content to help keep you and your family safe. #AskAkili",
    hashtags: ["AskAkili", "SecurityTips", "CommunityEngagement"],
  },

  // Promotional Theme
  {
    id: "promo-free-assessment",
    theme: "PROMOTIONAL",
    title: "Free Assessment CTA",
    content:
      "Ready to understand your family's risk profile? Our free assessment takes just minutes and gives you actionable insights to protect what matters most. Start now: akilirisk.com #AkiliRisk",
    hashtags: ["AkiliRisk", "FreeAssessment", "RiskManagement"],
  },
  {
    id: "promo-advisor-signup",
    theme: "PROMOTIONAL",
    title: "Advisor Signup CTA",
    content:
      "Financial advisors: Differentiate your practice with comprehensive risk assessments. Join our advisor network and deliver more value to your clients. akilirisk.com/advisors #AkiliRisk",
    hashtags: ["AkiliRisk", "FinancialAdvisors", "AdvisorTools"],
  },
];

/**
 * Get templates by theme
 */
export function getTemplatesByTheme(theme: SocialContentTheme): ContentTemplate[] {
  return CONTENT_TEMPLATES.filter((t) => t.theme === theme);
}

/**
 * Get a random template from a specific theme
 */
export function getRandomTemplate(theme?: SocialContentTheme): ContentTemplate {
  const templates = theme
    ? getTemplatesByTheme(theme)
    : CONTENT_TEMPLATES;

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Get all available themes with template counts
 */
export function getThemeSummary(): { theme: SocialContentTheme; count: number }[] {
  const themes = new Map<SocialContentTheme, number>();

  for (const template of CONTENT_TEMPLATES) {
    themes.set(template.theme, (themes.get(template.theme) ?? 0) + 1);
  }

  return Array.from(themes.entries()).map(([theme, count]) => ({
    theme,
    count,
  }));
}

/**
 * Format a template with optional customizations
 */
export function formatTemplate(
  template: ContentTemplate,
  options?: {
    includeHashtags?: boolean;
    customHashtags?: string[];
    appendUrl?: string;
  }
): string {
  let content = template.content;

  // Remove existing hashtags if we're replacing them
  if (options?.customHashtags) {
    content = content.replace(/#\w+/g, "").trim();
  }

  // Add hashtags
  if (options?.includeHashtags !== false) {
    const hashtags = options?.customHashtags ?? template.hashtags;
    const hashtagStr = hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
    content = `${content}\n\n${hashtagStr}`;
  }

  // Append URL
  if (options?.appendUrl) {
    content = `${content}\n\n${options.appendUrl}`;
  }

  return content;
}

/**
 * Theme display names for UI
 */
export const THEME_DISPLAY_NAMES: Record<SocialContentTheme, string> = {
  CYBER_SECURITY: "Cyber Security",
  IDENTITY_PROTECTION: "Identity Protection",
  FAMILY_SAFETY: "Family Safety",
  RISK_ASSESSMENT: "Risk Assessment",
  PRODUCT_UPDATE: "Product Updates",
  INDUSTRY_NEWS: "Industry News",
  THOUGHT_LEADERSHIP: "Thought Leadership",
  ENGAGEMENT: "Engagement",
  PROMOTIONAL: "Promotional",
  OTHER: "Other",
};

/**
 * Suggested posting frequency by theme (posts per week)
 */
export const THEME_POSTING_FREQUENCY: Record<SocialContentTheme, number> = {
  CYBER_SECURITY: 3,
  IDENTITY_PROTECTION: 2,
  FAMILY_SAFETY: 2,
  RISK_ASSESSMENT: 1,
  PRODUCT_UPDATE: 1,
  INDUSTRY_NEWS: 2,
  THOUGHT_LEADERSHIP: 1,
  ENGAGEMENT: 2,
  PROMOTIONAL: 1,
  OTHER: 0,
};
