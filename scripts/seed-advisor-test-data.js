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
      firstName: 'Test',
      lastName: 'Advisor',
      role: 'ADVISOR'
    },
    create: {
      email: 'advisor@test.com',
      password: hashedPassword,
      name: 'Test Advisor',
      firstName: 'Test',
      lastName: 'Advisor',
      role: 'ADVISOR'
    }
  });

  console.log('✅ Created advisor user:', advisorUser.email);

  // Create advisor profile (with personal details)
  const advisorProfile = await prisma.advisorProfile.upsert({
    where: { userId: advisorUser.id },
    update: {
      phone: '+1 (555) 100-2000',
      jobTitle: 'Senior Wealth Advisor'
    },
    create: {
      userId: advisorUser.id,
      specializations: ['financial-planning', 'risk-assessment', 'governance'],
      licenseNumber: 'TEST-12345',
      firmName: 'Test Advisory Firm',
      bio: 'Test advisor for portal verification',
      phone: '+1 (555) 100-2000',
      jobTitle: 'Senior Wealth Advisor'
    }
  });

  console.log('✅ Created advisor profile for:', advisorUser.name);

  // Create client user with submitted intake
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {
      password: hashedPassword,
      name: 'Test Client',
      firstName: 'Test',
      lastName: 'Client',
      role: 'USER'
    },
    create: {
      email: 'client@test.com',
      password: hashedPassword,
      name: 'Test Client',
      firstName: 'Test',
      lastName: 'Client',
      role: 'USER'
    }
  });

  console.log('✅ Created client user:', clientUser.email);

  // Client profile (personal details) for first test client
  await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    update: {
      phone: '+1 (555) 200-3000',
      addressLine1: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'USA'
    },
    create: {
      userId: clientUser.id,
      phone: '+1 (555) 200-3000',
      addressLine1: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'USA'
    }
  });
  console.log('✅ Created client profile for:', clientUser.email);

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

  // Use the same question ids as the app (intake-q1..intake-q10) so "View intake" shows responses
  const INTAKE_QUESTION_IDS = ['intake-q1', 'intake-q2', 'intake-q3', 'intake-q4', 'intake-q5', 'intake-q6', 'intake-q7', 'intake-q8', 'intake-q9', 'intake-q10'];

  await prisma.intakeResponse.deleteMany({ where: { interviewId: intakeInterview.id } });

  for (let i = 0; i < INTAKE_QUESTION_IDS.length; i++) {
    const questionId = INTAKE_QUESTION_IDS[i];
    const num = i + 1;
    await prisma.intakeResponse.upsert({
      where: {
        interviewId_questionId: {
          interviewId: intakeInterview.id,
          questionId
        }
      },
      update: {
        audioUrl: `/uploads/intake/${intakeInterview.id}/q${num}.webm`,
        audioDuration: 45.5,
        transcription: `[Seed] Sample transcription for intake question ${num}. The client provided a thoughtful response covering key aspects relevant to family wealth management.`,
        transcriptionStatus: 'COMPLETED',
        answeredAt: new Date(Date.now() - 1000 * 60 * Math.random() * 30)
      },
      create: {
        interviewId: intakeInterview.id,
        questionId,
        audioUrl: `/uploads/intake/${intakeInterview.id}/q${num}.webm`,
        audioDuration: 45.5,
        transcription: `[Seed] Sample transcription for intake question ${num}. The client provided a thoughtful response covering key aspects relevant to family wealth management.`,
        transcriptionStatus: 'COMPLETED',
        answeredAt: new Date(Date.now() - 1000 * 60 * Math.random() * 30)
      }
    });
  }

  console.log(`✅ Created ${INTAKE_QUESTION_IDS.length} intake responses with transcriptions (intake-q1..intake-q10)`);

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

  // Second client user for MFA testing (enable MFA in Settings to test verify flow)
  const client2User = await prisma.user.upsert({
    where: { email: 'client-mfa@test.com' },
    update: {
      password: hashedPassword,
      name: 'Test Client (MFA)',
      firstName: 'MFA',
      lastName: 'Client',
      role: 'USER'
    },
    create: {
      email: 'client-mfa@test.com',
      password: hashedPassword,
      name: 'Test Client (MFA)',
      firstName: 'MFA',
      lastName: 'Client',
      role: 'USER'
    }
  });

  console.log('✅ Created second client user (for MFA testing):', client2User.email);

  await prisma.clientProfile.upsert({
    where: { userId: client2User.id },
    update: {
      phone: '+1 (555) 201-3001',
      city: 'New York',
      state: 'NY',
      country: 'USA'
    },
    create: {
      userId: client2User.id,
      phone: '+1 (555) 201-3001',
      city: 'New York',
      state: 'NY',
      country: 'USA'
    }
  });

  const intakeInterview2 = await prisma.intakeInterview.upsert({
    where: { id: `test-interview-${client2User.id}` },
    update: {
      status: 'SUBMITTED',
      currentQuestionIndex: 10,
      startedAt: new Date(Date.now() - 1000 * 60 * 30),
      completedAt: new Date(Date.now() - 1000 * 60 * 5),
      submittedAt: new Date(Date.now() - 1000 * 60 * 2)
    },
    create: {
      id: `test-interview-${client2User.id}`,
      userId: client2User.id,
      status: 'SUBMITTED',
      currentQuestionIndex: 10,
      startedAt: new Date(Date.now() - 1000 * 60 * 30),
      completedAt: new Date(Date.now() - 1000 * 60 * 5),
      submittedAt: new Date(Date.now() - 1000 * 60 * 2)
    }
  });

  await prisma.intakeResponse.deleteMany({ where: { interviewId: intakeInterview2.id } });

  for (let i = 0; i < INTAKE_QUESTION_IDS.length; i++) {
    const questionId = INTAKE_QUESTION_IDS[i];
    const num = i + 1;
    await prisma.intakeResponse.upsert({
      where: {
        interviewId_questionId: {
          interviewId: intakeInterview2.id,
          questionId
        }
      },
      update: {
        audioUrl: `/uploads/intake/${intakeInterview2.id}/q${num}.webm`,
        audioDuration: 45.5,
        transcription: `[Seed MFA client] Sample transcription for intake question ${num}.`,
        transcriptionStatus: 'COMPLETED',
        answeredAt: new Date(Date.now() - 1000 * 60 * Math.random() * 30)
      },
      create: {
        interviewId: intakeInterview2.id,
        questionId,
        audioUrl: `/uploads/intake/${intakeInterview2.id}/q${num}.webm`,
        audioDuration: 45.5,
        transcription: `[Seed MFA client] Sample transcription for intake question ${num}.`,
        transcriptionStatus: 'COMPLETED',
        answeredAt: new Date(Date.now() - 1000 * 60 * Math.random() * 30)
      }
    });
  }

  await prisma.clientAdvisorAssignment.upsert({
    where: {
      clientId_advisorId: {
        clientId: client2User.id,
        advisorId: advisorProfile.id
      }
    },
    update: { status: 'ACTIVE' },
    create: {
      clientId: client2User.id,
      advisorId: advisorProfile.id,
      status: 'ACTIVE',
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
    }
  });

  console.log('✅ Created second client-advisor assignment');

  console.log('\n🎉 Test data seeded successfully!');
  console.log('\n📋 Verification credentials:');
  console.log(`   Advisor: advisor@test.com / testpassword123`);
  console.log(`   Client: client@test.com / testpassword123`);
  console.log(`   Client (MFA testing): client-mfa@test.com / testpassword123`);
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