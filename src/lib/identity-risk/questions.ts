/**
 * Identity Risk Question Bank
 *
 * Complete question definitions for identity risk assessment pillar.
 * 4 sub-categories covering social exposure, public information,
 * digital footprint, and family visibility.
 */

import { Question, Pillar } from '../assessment/types';
import { IDENTITY_PILLAR_ID, IDENTITY_SUBCATEGORIES } from './types';

// ============================================================================
// SUB-CATEGORY 1: SOCIAL EXPOSURE (6 questions, weight: 4)
// ============================================================================

const socialExposureQuestions: Question[] = [
  {
    id: 'identity-se-01',
    text: 'How many social media platforms do you actively use?',
    helpText: 'Each platform increases your exposure to identity theft and data breaches.',
    type: 'single-choice',
    options: [
      { value: 'none', label: 'No social media accounts' },
      { value: 'minimal', label: '1-2 platforms' },
      { value: 'moderate', label: '3-5 platforms' },
      { value: 'extensive', label: '6+ platforms' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.SOCIAL_EXPOSURE,
    weight: 4,
    scoreMap: { 'none': 10, 'minimal': 8, 'moderate': 4, 'extensive': 0 },
  },
  {
    id: 'identity-se-02',
    text: 'How often do you review and update your social media privacy settings?',
    helpText: 'Regular privacy reviews ensure your personal information stays protected.',
    type: 'maturity-scale',
    options: [
      { value: 0, label: 'Never review', description: 'Default settings unchanged' },
      { value: 1, label: 'When prompted', description: 'Only when platform changes trigger review' },
      { value: 2, label: 'Annually', description: 'Review privacy settings once per year' },
      { value: 3, label: 'Quarterly or more', description: 'Regular proactive privacy maintenance' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.SOCIAL_EXPOSURE,
    weight: 4,
    scoreMap: { 0: 0, 1: 3, 2: 7, 3: 10 },
    branchingRule: {
      dependsOn: 'identity-se-01',
      showIf: (answer) => answer !== 'none',
    },
  },
  {
    id: 'identity-se-03',
    text: 'How much personal information do you share in your social media profiles?',
    helpText: 'Real names, locations, and employer information help identity thieves build profiles.',
    type: 'single-choice',
    options: [
      { value: 'full-detail', label: 'Full name, location, employer, and personal details' },
      { value: 'some-detail', label: 'Some personal information, limited details' },
      { value: 'minimal-detail', label: 'Nickname or first name only' },
      { value: 'anonymous', label: 'Anonymous or pseudonymous profiles' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.SOCIAL_EXPOSURE,
    weight: 5,
    scoreMap: { 'full-detail': 0, 'some-detail': 3, 'minimal-detail': 7, 'anonymous': 10 },
    branchingRule: {
      dependsOn: 'identity-se-01',
      showIf: (answer) => answer !== 'none',
    },
  },
  {
    id: 'identity-se-04',
    text: 'Are your social media accounts set to public or private?',
    helpText: 'Public accounts allow strangers to gather information for identity theft.',
    type: 'single-choice',
    options: [
      { value: 'all-public', label: 'All accounts are public' },
      { value: 'mostly-public', label: 'Most accounts are public' },
      { value: 'mostly-private', label: 'Most accounts are private' },
      { value: 'all-private', label: 'All accounts are private' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.SOCIAL_EXPOSURE,
    weight: 4,
    scoreMap: { 'all-public': 0, 'mostly-public': 2, 'mostly-private': 7, 'all-private': 10 },
    branchingRule: {
      dependsOn: 'identity-se-01',
      showIf: (answer) => answer !== 'none',
    },
  },
  {
    id: 'identity-se-05',
    text: 'Who can see your posts and personal information on social media?',
    helpText: 'Limiting visibility reduces the number of people who can gather your personal data.',
    type: 'single-choice',
    options: [
      { value: 'everyone', label: 'Anyone on the internet' },
      { value: 'friends-of-friends', label: 'Friends and their networks' },
      { value: 'friends-only', label: 'Close friends and connections only' },
      { value: 'family-only', label: 'Family members only' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.SOCIAL_EXPOSURE,
    weight: 3,
    scoreMap: { 'everyone': 0, 'friends-of-friends': 2, 'friends-only': 7, 'family-only': 10 },
    branchingRule: {
      dependsOn: 'identity-se-01',
      showIf: (answer) => answer !== 'none',
    },
  },
  {
    id: 'identity-se-06',
    text: 'How frequently do you post on social media?',
    helpText: 'Frequent posting provides more data points for identity thieves to build profiles.',
    type: 'single-choice',
    options: [
      { value: 'daily', label: 'Daily or multiple times per day' },
      { value: 'weekly', label: 'Several times per week' },
      { value: 'monthly', label: 'Monthly or less frequently' },
      { value: 'rarely', label: 'Very rarely post content' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.SOCIAL_EXPOSURE,
    weight: 2,
    scoreMap: { 'daily': 0, 'weekly': 3, 'monthly': 7, 'rarely': 10 },
    branchingRule: {
      dependsOn: 'identity-se-01',
      showIf: (answer) => answer !== 'none',
    },
  },
];

// ============================================================================
// SUB-CATEGORY 2: PUBLIC INFORMATION (5 questions, weight: 4)
// ============================================================================

const publicInformationQuestions: Question[] = [
  {
    id: 'identity-pi-01',
    text: 'Are you aware of what property records are publicly available about you?',
    helpText: 'Property records often contain personal information accessible to identity thieves.',
    type: 'maturity-scale',
    options: [
      { value: 0, label: 'Not aware', description: 'Never checked public property records' },
      { value: 1, label: 'Somewhat aware', description: 'Know records exist but not details' },
      { value: 2, label: 'Aware of most records', description: 'Checked records occasionally' },
      { value: 3, label: 'Fully informed', description: 'Regularly monitor and understand all public records' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.PUBLIC_INFORMATION,
    weight: 4,
    scoreMap: { 0: 0, 1: 3, 2: 7, 3: 10 },
  },
  {
    id: 'identity-pi-02',
    text: 'Do you have business registrations or professional licenses that make your information public?',
    helpText: 'Professional registrations can expose personal details in public databases.',
    type: 'single-choice',
    options: [
      { value: 'extensive', label: 'Multiple business registrations and licenses' },
      { value: 'some', label: 'One or two professional registrations' },
      { value: 'minimal', label: 'Single professional license only' },
      { value: 'none', label: 'No public business or professional registrations' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.PUBLIC_INFORMATION,
    weight: 3,
    scoreMap: { 'extensive': 0, 'some': 3, 'minimal': 7, 'none': 10 },
  },
  {
    id: 'identity-pi-03',
    text: 'Have you been involved in court cases or legal filings that are publicly accessible?',
    helpText: 'Court records often contain detailed personal information accessible online.',
    type: 'single-choice',
    options: [
      { value: 'multiple', label: 'Multiple court cases or legal filings' },
      { value: 'some', label: 'A few legal proceedings' },
      { value: 'single', label: 'One court case or filing' },
      { value: 'none', label: 'No public legal proceedings' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.PUBLIC_INFORMATION,
    weight: 3,
    scoreMap: { 'multiple': 0, 'some': 2, 'single': 5, 'none': 10 },
  },
  {
    id: 'identity-pi-04',
    text: 'How often do you check what information data brokers have about you?',
    helpText: 'Data brokers collect and sell personal information from public and private sources.',
    type: 'maturity-scale',
    options: [
      { value: 0, label: 'Never checked', description: 'Unaware of data broker information' },
      { value: 1, label: 'Checked once', description: 'Single search but no follow-up' },
      { value: 2, label: 'Check occasionally', description: 'Periodic searches for personal information' },
      { value: 3, label: 'Regular monitoring', description: 'Systematic monitoring and opt-out requests' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.PUBLIC_INFORMATION,
    weight: 5,
    scoreMap: { 0: 0, 1: 2, 2: 6, 3: 10 },
  },
  {
    id: 'identity-pi-05',
    text: 'Are you listed in professional directories or people-search websites?',
    helpText: 'Professional directories aggregate personal information making it easily accessible.',
    type: 'single-choice',
    options: [
      { value: 'extensive', label: 'Listed in multiple directories and search sites' },
      { value: 'moderate', label: 'Some directory listings' },
      { value: 'minimal', label: 'Very few professional listings' },
      { value: 'none', label: 'Actively avoid or remove directory listings' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.PUBLIC_INFORMATION,
    weight: 3,
    scoreMap: { 'extensive': 0, 'moderate': 3, 'minimal': 6, 'none': 10 },
  },
];

// ============================================================================
// SUB-CATEGORY 3: DIGITAL FOOTPRINT (5 questions, weight: 3)
// ============================================================================

const digitalFootprintQuestions: Question[] = [
  {
    id: 'identity-df-01',
    text: 'How many different email addresses do you use across various services?',
    helpText: 'Multiple email addresses can increase exposure if one is compromised.',
    type: 'single-choice',
    options: [
      { value: 'many', label: '6+ email addresses' },
      { value: 'several', label: '3-5 email addresses' },
      { value: 'few', label: '2 email addresses' },
      { value: 'single', label: '1 primary email address' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.DIGITAL_FOOTPRINT,
    weight: 3,
    scoreMap: { 'many': 2, 'several': 5, 'few': 8, 'single': 10 },
  },
  {
    id: 'identity-df-02',
    text: 'Do you reuse the same username across multiple platforms?',
    helpText: 'Username reuse allows attackers to connect your accounts across services.',
    type: 'maturity-scale',
    options: [
      { value: 0, label: 'Same username everywhere', description: 'Consistent username across all platforms' },
      { value: 1, label: 'Same username on most platforms', description: 'Minor variations of same username' },
      { value: 2, label: 'Different usernames by category', description: 'Work, personal, and shopping usernames' },
      { value: 3, label: 'Unique username per platform', description: 'No username reuse across platforms' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.DIGITAL_FOOTPRINT,
    weight: 4,
    scoreMap: { 0: 0, 1: 3, 2: 7, 3: 10 },
  },
  {
    id: 'identity-df-03',
    text: 'How often do you clean up old or unused online accounts?',
    helpText: 'Abandoned accounts continue to expose your information and can be compromised.',
    type: 'single-choice',
    options: [
      { value: 'never', label: 'Never delete old accounts' },
      { value: 'rarely', label: 'Only when specifically needed' },
      { value: 'annually', label: 'Annual account cleanup' },
      { value: 'regularly', label: 'Quarterly or more frequent cleanup' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.DIGITAL_FOOTPRINT,
    weight: 3,
    scoreMap: { 'never': 0, 'rarely': 2, 'annually': 6, 'regularly': 10 },
  },
  {
    id: 'identity-df-04',
    text: 'Do you maintain personal websites, blogs, or professional profiles?',
    helpText: 'Personal websites often contain detailed information useful for identity theft.',
    type: 'single-choice',
    options: [
      { value: 'extensive', label: 'Multiple websites and detailed professional profiles' },
      { value: 'moderate', label: 'Professional profile and some web presence' },
      { value: 'minimal', label: 'Basic professional profile only' },
      { value: 'none', label: 'No personal websites or detailed profiles' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.DIGITAL_FOOTPRINT,
    weight: 3,
    scoreMap: { 'extensive': 0, 'moderate': 3, 'minimal': 7, 'none': 10 },
  },
  {
    id: 'identity-df-05',
    text: 'How many online shopping accounts do you maintain across different retailers?',
    helpText: 'Each shopping account stores payment and personal information vulnerable to breaches.',
    type: 'single-choice',
    options: [
      { value: 'many', label: '20+ shopping accounts' },
      { value: 'several', label: '10-19 shopping accounts' },
      { value: 'few', label: '5-9 shopping accounts' },
      { value: 'minimal', label: 'Fewer than 5 accounts' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.DIGITAL_FOOTPRINT,
    weight: 2,
    scoreMap: { 'many': 0, 'several': 3, 'few': 6, 'minimal': 10 },
  },
];

// ============================================================================
// SUB-CATEGORY 4: FAMILY VISIBILITY (5 questions, weight: 3)
// ============================================================================

const familyVisibilityQuestions: Question[] = [
  {
    id: 'identity-fv-01',
    text: 'How often do family members tag you or share information about you on social media?',
    helpText: 'Family tagging can expose your location, activities, and relationships.',
    type: 'single-choice',
    options: [
      { value: 'frequently', label: 'Family members tag me regularly' },
      { value: 'sometimes', label: 'Occasional family tags and mentions' },
      { value: 'rarely', label: 'Family rarely tags me in posts' },
      { value: 'never', label: 'Family doesn\'t tag me or has privacy agreements' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.FAMILY_VISIBILITY,
    weight: 4,
    scoreMap: { 'frequently': 0, 'sometimes': 3, 'rarely': 7, 'never': 10 },
  },
  {
    id: 'identity-fv-02',
    text: 'How do you manage your children\'s online presence and digital footprint?',
    helpText: 'Children\'s information can be used to target the entire family for identity theft.',
    type: 'maturity-scale',
    options: [
      { value: 0, label: 'No management', description: 'Children manage their own online presence' },
      { value: 1, label: 'Basic guidelines', description: 'General rules but limited oversight' },
      { value: 2, label: 'Active monitoring', description: 'Regular review of children\'s online activities' },
      { value: 3, label: 'Strict controls', description: 'Comprehensive privacy protection and monitoring' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.FAMILY_VISIBILITY,
    weight: 4,
    scoreMap: { 0: 0, 1: 3, 2: 7, 3: 10 },
  },
  {
    id: 'identity-fv-03',
    text: 'How much information about family events and locations do you share online?',
    helpText: 'Event and location sharing can reveal family routines and security vulnerabilities.',
    type: 'single-choice',
    options: [
      { value: 'detailed', label: 'Share detailed event information and real-time locations' },
      { value: 'moderate', label: 'Share some events with general location information' },
      { value: 'limited', label: 'Share events but avoid specific locations or timing' },
      { value: 'minimal', label: 'Very limited sharing of family activities' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.FAMILY_VISIBILITY,
    weight: 3,
    scoreMap: { 'detailed': 0, 'moderate': 2, 'limited': 6, 'minimal': 10 },
  },
  {
    id: 'identity-fv-04',
    text: 'What household information is publicly visible through online sources?',
    helpText: 'Public household information can be used for social engineering attacks.',
    type: 'single-choice',
    options: [
      { value: 'extensive', label: 'Address, household members, and personal details publicly available' },
      { value: 'moderate', label: 'Some household information accessible online' },
      { value: 'limited', label: 'Minimal household information visible' },
      { value: 'protected', label: 'Actively protect and minimize household information exposure' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.FAMILY_VISIBILITY,
    weight: 3,
    scoreMap: { 'extensive': 0, 'moderate': 3, 'limited': 6, 'protected': 10 },
  },
  {
    id: 'identity-fv-05',
    text: 'How do you handle sharing family photos and personal moments online?',
    helpText: 'Family photos often contain metadata and contextual information useful for identity theft.',
    type: 'maturity-scale',
    options: [
      { value: 0, label: 'Share freely', description: 'Post family photos without privacy considerations' },
      { value: 1, label: 'Some privacy settings', description: 'Limited audience but regular photo sharing' },
      { value: 2, label: 'Careful sharing', description: 'Remove metadata and limit photo details' },
      { value: 3, label: 'Minimal sharing', description: 'Very limited family photo sharing with strict privacy' },
    ],
    required: true,
    pillar: IDENTITY_PILLAR_ID,
    subCategory: IDENTITY_SUBCATEGORIES.FAMILY_VISIBILITY,
    weight: 3,
    scoreMap: { 0: 0, 1: 3, 2: 7, 3: 10 },
  },
];

// ============================================================================
// PILLAR DEFINITION
// ============================================================================

export const identityRiskPillar: Pillar = {
  id: IDENTITY_PILLAR_ID,
  name: 'Identity Risk',
  slug: 'identity-risk',
  description: 'Assessment of personal information exposure and identity theft vulnerability',
  estimatedMinutes: 12,
  subCategories: [
    {
      id: IDENTITY_SUBCATEGORIES.SOCIAL_EXPOSURE,
      name: 'Social Exposure',
      description: 'Social media presence, privacy settings, and information sharing practices',
      weight: 4,
      questionIds: socialExposureQuestions.map(q => q.id),
    },
    {
      id: IDENTITY_SUBCATEGORIES.PUBLIC_INFORMATION,
      name: 'Public Information',
      description: 'Publicly accessible records, data broker listings, and professional visibility',
      weight: 4,
      questionIds: publicInformationQuestions.map(q => q.id),
    },
    {
      id: IDENTITY_SUBCATEGORIES.DIGITAL_FOOTPRINT,
      name: 'Digital Footprint',
      description: 'Online account management, username practices, and digital presence cleanup',
      weight: 3,
      questionIds: digitalFootprintQuestions.map(q => q.id),
    },
    {
      id: IDENTITY_SUBCATEGORIES.FAMILY_VISIBILITY,
      name: 'Family Visibility',
      description: 'Family member exposure, children\'s privacy, and household information protection',
      weight: 3,
      questionIds: familyVisibilityQuestions.map(q => q.id),
    },
  ],
};

// ============================================================================
// EXPORTS
// ============================================================================

// Combine all questions into a flat array
export const identityRiskQuestions: Question[] = [
  ...socialExposureQuestions,
  ...publicInformationQuestions,
  ...digitalFootprintQuestions,
  ...familyVisibilityQuestions,
];

// Alias for compatibility
export const allIdentityQuestions = identityRiskQuestions;