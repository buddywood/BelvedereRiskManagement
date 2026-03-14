#!/usr/bin/env node
/**
 * Seed test data for advisor portal verification
 * Creates: advisor user, advisor profile, client with submitted intake interview, client-advisor assignment
 */

// Load environment variables in the same order as the app
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcryptjs = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding advisor portal test data...');

  // Hash password for test users
  const hashedPassword = await bcryptjs.hash('testpassword123', 12);

  // Create advisor user
  const advisorUser = await prisma.user.upsert({
    where: { email: 'advisor@test.com' },
    update: {
      password: hashedPassword,
      name: 'Test Advisor',
      role: 'ADVISOR'
    },
    create: {
      email: 'advisor@test.com',
      password: hashedPassword,
      name: 'Test Advisor',
      role: 'ADVISOR'
    }
  });

  console.log('✅ Created advisor user:', advisorUser.email);

  // Create advisor profile
  const advisorProfile = await prisma.advisorProfile.upsert({
    where: { userId: advisorUser.id },
    update: {},
    create: {
      userId: advisorUser.id,
      specializations: ['financial-planning', 'risk-assessment', 'governance'],
      licenseNumber: 'TEST-12345',
      firmName: 'Test Advisory Firm',
      bio: 'Test advisor for portal verification'
    }
  });

  console.log('✅ Created advisor profile for:', advisorUser.name);

  // Create client user with submitted intake
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {
      password: hashedPassword,
      name: 'Test Client',
      role: 'USER'
    },
    create: {
      email: 'client@test.com',
      password: hashedPassword,
      name: 'Test Client',
      role: 'USER'
    }
  });

  console.log('✅ Created client user:', clientUser.email);

  // Create intake interview with SUBMITTED status
  const intakeInterview = await prisma.intakeInterview.upsert({
    where: { id: `test-interview-${clientUser.id}` },
    update: {
      status: 'SUBMITTED',
      currentQuestionIndex: 10,
      startedAt: new Date(Date.now() - 1000 * 60 * 30),
      completedAt: new Date(Date.now() - 1000 * 60 * 5),
      submittedAt: new Date(Date.now() - 1000 * 60 * 2)
    },
    create: {
      id: `test-interview-${clientUser.id}`,
      userId: clientUser.id,
      status: 'SUBMITTED',
      currentQuestionIndex: 10,
      startedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      completedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      submittedAt: new Date(Date.now() - 1000 * 60 * 2) // 2 minutes ago
    }
  });

  console.log('✅ Created intake interview with SUBMITTED status');

  // Create sample intake responses with transcriptions
  const sampleQuestions = [
    { id: 'family-structure', text: 'How would you describe your current family structure?' },
    { id: 'decision-making', text: 'How are important financial decisions currently made in your family?' },
    { id: 'wealth-transfer', text: 'What are your primary concerns about wealth transfer to the next generation?' },
    { id: 'family-governance', text: 'Do you have any formal family governance structures in place?' },
    { id: 'risk-awareness', text: 'What family-related risks keep you up at night?' },
    { id: 'communication', text: 'How does your family communicate about financial matters?' },
    { id: 'education', text: 'How do you prepare the next generation for wealth responsibility?' },
    { id: 'values', text: 'What family values are most important to preserve?' },
    { id: 'conflicts', text: 'How does your family handle disagreements or conflicts?' },
    { id: 'legacy', text: 'What legacy do you want to leave for future generations?' }
  ];

  for (const question of sampleQuestions) {
    await prisma.intakeResponse.upsert({
      where: {
        interviewId_questionId: {
          interviewId: intakeInterview.id,
          questionId: question.id
        }
      },
      update: {
        audioUrl: `/api/audio/test-${question.id}.webm`,
        audioDuration: 45.5,
        transcription: `This is a test transcription for the question about ${question.id}. The client provided a thoughtful response covering key aspects relevant to family wealth management.`,
        transcriptionStatus: 'COMPLETED',
        answeredAt: new Date(Date.now() - 1000 * 60 * Math.random() * 30)
      },
      create: {
        interviewId: intakeInterview.id,
        questionId: question.id,
        audioUrl: `/api/audio/test-${question.id}.webm`,
        audioDuration: 45.5,
        transcription: `This is a test transcription for the question about ${question.id}. The client provided a thoughtful response covering key aspects relevant to family wealth management.`,
        transcriptionStatus: 'COMPLETED',
        answeredAt: new Date(Date.now() - 1000 * 60 * Math.random() * 30)
      }
    });
  }

  console.log(`✅ Created ${sampleQuestions.length} intake responses with transcriptions`);

  // Create client-advisor assignment
  const assignment = await prisma.clientAdvisorAssignment.upsert({
    where: {
      clientId_advisorId: {
        clientId: clientUser.id,
        advisorId: advisorProfile.id
      }
    },
    update: { status: 'ACTIVE' },
    create: {
      clientId: clientUser.id,
      advisorId: advisorProfile.id,
      status: 'ACTIVE',
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    }
  });

  console.log('✅ Created client-advisor assignment');

  console.log('\n🎉 Test data seeded successfully!');
  console.log('\n📋 Verification credentials:');
  console.log(`   Advisor: advisor@test.com / testpassword123`);
  console.log(`   Client: client@test.com / testpassword123`);
  console.log(`   Intake ID: ${intakeInterview.id}`);
  console.log('\n🚀 Application should be running at http://localhost:3000');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });