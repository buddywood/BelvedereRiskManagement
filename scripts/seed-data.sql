-- Seed test data for advisor portal verification
-- Creates: advisor user, advisor profile, client with submitted intake interview, client-advisor assignment

-- Create advisor user
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'test-advisor-001',
  'advisor@test.com',
  '$2b$12$LQv3c1yqBwlFb4aAlmOFI.GVQN3AvhxcYp2vSgxQ8/EKQbf7GH1au',
  'Test Advisor',
  'ADVISOR',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  "updatedAt" = NOW();

-- Create advisor profile
INSERT INTO "AdvisorProfile" (id, "userId", specializations, "licenseNumber", "firmName", bio, "createdAt", "updatedAt")
VALUES (
  'test-advisor-profile-001',
  'test-advisor-001',
  ARRAY['financial-planning', 'risk-assessment', 'governance'],
  'TEST-12345',
  'Test Advisory Firm',
  'Test advisor for portal verification',
  NOW(),
  NOW()
) ON CONFLICT ("userId") DO UPDATE SET
  specializations = EXCLUDED.specializations,
  "licenseNumber" = EXCLUDED."licenseNumber",
  "firmName" = EXCLUDED."firmName",
  bio = EXCLUDED.bio,
  "updatedAt" = NOW();

-- Create client user
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'test-client-001',
  'client@test.com',
  '$2b$12$LQv3c1yqBwlFb4aAlmOFI.GVQN3AvhxcYp2vSgxQ8/EKQbf7GH1au',
  'Test Client',
  'USER',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  "updatedAt" = NOW();

-- Create intake interview with SUBMITTED status
INSERT INTO "IntakeInterview" (id, "userId", status, "currentQuestionIndex", "startedAt", "completedAt", "submittedAt", "updatedAt")
VALUES (
  'test-interview-001',
  'test-client-001',
  'SUBMITTED',
  10,
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '5 minutes',
  NOW() - INTERVAL '2 minutes',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  "currentQuestionIndex" = EXCLUDED."currentQuestionIndex",
  "completedAt" = EXCLUDED."completedAt",
  "submittedAt" = EXCLUDED."submittedAt",
  "updatedAt" = NOW();

-- Create sample intake responses (simpler version)
INSERT INTO "IntakeResponse" (id, "interviewId", "questionId", "audioUrl", "audioDuration", transcription, "transcriptionStatus", "answeredAt", "updatedAt")
VALUES
  ('test-response-family-structure', 'test-interview-001', 'family-structure', '/api/audio/test-family-structure.webm', 45.5, 'This is a test transcription for the question about family-structure. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '25 minutes', NOW()),
  ('test-response-decision-making', 'test-interview-001', 'decision-making', '/api/audio/test-decision-making.webm', 45.5, 'This is a test transcription for the question about decision-making. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '24 minutes', NOW()),
  ('test-response-wealth-transfer', 'test-interview-001', 'wealth-transfer', '/api/audio/test-wealth-transfer.webm', 45.5, 'This is a test transcription for the question about wealth-transfer. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '23 minutes', NOW()),
  ('test-response-family-governance', 'test-interview-001', 'family-governance', '/api/audio/test-family-governance.webm', 45.5, 'This is a test transcription for the question about family-governance. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '22 minutes', NOW()),
  ('test-response-risk-awareness', 'test-interview-001', 'risk-awareness', '/api/audio/test-risk-awareness.webm', 45.5, 'This is a test transcription for the question about risk-awareness. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '21 minutes', NOW()),
  ('test-response-communication', 'test-interview-001', 'communication', '/api/audio/test-communication.webm', 45.5, 'This is a test transcription for the question about communication. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '20 minutes', NOW()),
  ('test-response-education', 'test-interview-001', 'education', '/api/audio/test-education.webm', 45.5, 'This is a test transcription for the question about education. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '19 minutes', NOW()),
  ('test-response-values', 'test-interview-001', 'values', '/api/audio/test-values.webm', 45.5, 'This is a test transcription for the question about values. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '18 minutes', NOW()),
  ('test-response-conflicts', 'test-interview-001', 'conflicts', '/api/audio/test-conflicts.webm', 45.5, 'This is a test transcription for the question about conflicts. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '17 minutes', NOW()),
  ('test-response-legacy', 'test-interview-001', 'legacy', '/api/audio/test-legacy.webm', 45.5, 'This is a test transcription for the question about legacy. The client provided a thoughtful response covering key aspects relevant to family wealth management.', 'COMPLETED', NOW() - INTERVAL '16 minutes', NOW())
ON CONFLICT ("interviewId", "questionId") DO UPDATE SET
  transcription = EXCLUDED.transcription,
  "transcriptionStatus" = EXCLUDED."transcriptionStatus",
  "updatedAt" = NOW();

-- Create client-advisor assignment
INSERT INTO "ClientAdvisorAssignment" (id, "clientId", "advisorId", "assignedAt", status)
VALUES (
  'test-assignment-001',
  'test-client-001',
  'test-advisor-profile-001',
  NOW() - INTERVAL '1 day',
  'ACTIVE'
) ON CONFLICT ("clientId", "advisorId") DO UPDATE SET
  status = EXCLUDED.status;