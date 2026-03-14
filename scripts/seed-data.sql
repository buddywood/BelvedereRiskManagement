-- Seed test data for advisor portal verification
-- Creates: advisor user, advisor profile, client with submitted intake interview, client-advisor assignment

-- Clean up old test data first
DELETE FROM "AdvisorNotification" WHERE "advisorId" IN (SELECT id FROM "AdvisorProfile" WHERE "userId" IN (SELECT id FROM "User" WHERE email IN ('advisor@test.com', 'client@test.com')));
DELETE FROM "IntakeApproval" WHERE "interviewId" IN (SELECT id FROM "IntakeInterview" WHERE "userId" IN (SELECT id FROM "User" WHERE email IN ('advisor@test.com', 'client@test.com')));
DELETE FROM "IntakeResponse" WHERE "interviewId" IN (SELECT id FROM "IntakeInterview" WHERE "userId" IN (SELECT id FROM "User" WHERE email IN ('advisor@test.com', 'client@test.com')));
DELETE FROM "IntakeInterview" WHERE "userId" IN (SELECT id FROM "User" WHERE email IN ('advisor@test.com', 'client@test.com'));
DELETE FROM "ClientAdvisorAssignment" WHERE "advisorId" IN (SELECT id FROM "AdvisorProfile" WHERE "userId" IN (SELECT id FROM "User" WHERE email IN ('advisor@test.com', 'client@test.com')));
DELETE FROM "AdvisorProfile" WHERE "userId" IN (SELECT id FROM "User" WHERE email IN ('advisor@test.com', 'client@test.com'));
DELETE FROM "User" WHERE email IN ('advisor@test.com', 'client@test.com');

-- Create advisor user with proper CUID
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'cmfqtestadv0001xyz',
  'advisor@test.com',
  '$2b$12$LQv3c1yqBwlFb4aAlmOFI.GVQN3AvhxcYp2vSgxQ8/EKQbf7GH1au',
  'Test Advisor',
  'ADVISOR',
  NOW(),
  NOW()
);

-- Create advisor profile with proper CUID
INSERT INTO "AdvisorProfile" (id, "userId", specializations, "licenseNumber", "firmName", bio, "createdAt", "updatedAt")
VALUES (
  'cmfqtestadvprf001xyz',
  'cmfqtestadv0001xyz',
  ARRAY['financial-planning', 'risk-assessment', 'governance'],
  'TEST-12345',
  'Test Advisory Firm',
  'Test advisor for portal verification',
  NOW(),
  NOW()
);

-- Create client user with proper CUID
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'cmfqtestclt0001xyz',
  'client@test.com',
  '$2b$12$LQv3c1yqBwlFb4aAlmOFI.GVQN3AvhxcYp2vSgxQ8/EKQbf7GH1au',
  'Test Client',
  'USER',
  NOW(),
  NOW()
);

-- Create intake interview with SUBMITTED status and proper CUID
INSERT INTO "IntakeInterview" (id, "userId", status, "currentQuestionIndex", "startedAt", "completedAt", "submittedAt", "updatedAt")
VALUES (
  'cmfqtestint0001xyz',
  'cmfqtestclt0001xyz',
  'SUBMITTED',
  10,
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '5 minutes',
  NOW() - INTERVAL '2 minutes',
  NOW()
);

-- Create sample intake responses with proper CUIDs
INSERT INTO "IntakeResponse" (id, "interviewId", "questionId", "audioUrl", "audioDuration", transcription, "transcriptionStatus", "answeredAt", "updatedAt")
VALUES
  ('cmfqresp001famstruct', 'cmfqtestint0001xyz', 'family-structure', '/api/audio/test-family-structure.webm', 45.5, 'This is a test transcription for the question about family-structure. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '25 minutes', NOW()),
  ('cmfqresp002decision', 'cmfqtestint0001xyz', 'decision-making', '/api/audio/test-decision-making.webm', 45.5, 'This is a test transcription for the question about decision-making. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '24 minutes', NOW()),
  ('cmfqresp003wealth', 'cmfqtestint0001xyz', 'wealth-transfer', '/api/audio/test-wealth-transfer.webm', 45.5, 'This is a test transcription for the question about wealth-transfer. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '23 minutes', NOW()),
  ('cmfqresp004governance', 'cmfqtestint0001xyz', 'family-governance', '/api/audio/test-family-governance.webm', 45.5, 'This is a test transcription for the question about family-governance. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '22 minutes', NOW()),
  ('cmfqresp005risk', 'cmfqtestint0001xyz', 'risk-awareness', '/api/audio/test-risk-awareness.webm', 45.5, 'This is a test transcription for the question about risk-awareness. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '21 minutes', NOW()),
  ('cmfqresp006comm', 'cmfqtestint0001xyz', 'communication', '/api/audio/test-communication.webm', 45.5, 'This is a test transcription for the question about communication. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '20 minutes', NOW()),
  ('cmfqresp007edu', 'cmfqtestint0001xyz', 'education', '/api/audio/test-education.webm', 45.5, 'This is a test transcription for the question about education. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '19 minutes', NOW()),
  ('cmfqresp008values', 'cmfqtestint0001xyz', 'values', '/api/audio/test-values.webm', 45.5, 'This is a test transcription for the question about values. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '18 minutes', NOW()),
  ('cmfqresp009conflicts', 'cmfqtestint0001xyz', 'conflicts', '/api/audio/test-conflicts.webm', 45.5, 'This is a test transcription for the question about conflicts. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '17 minutes', NOW()),
  ('cmfqresp010legacy', 'cmfqtestint0001xyz', 'legacy', '/api/audio/test-legacy.webm', 45.5, 'This is a test transcription for the question about legacy. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '16 minutes', NOW());

-- Create client-advisor assignment with proper CUID
INSERT INTO "ClientAdvisorAssignment" (id, "clientId", "advisorId", "assignedAt", status)
VALUES (
  'cmfqtestassign001',
  'cmfqtestclt0001xyz',
  'cmfqtestadvprf001xyz',
  NOW() - INTERVAL '1 day',
  'ACTIVE'
);