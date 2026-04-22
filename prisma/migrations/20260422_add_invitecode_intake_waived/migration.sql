-- Migration: add intakeWaived to InviteCode
-- Generated manually to match live DB state (non-destructive)

ALTER TABLE "InviteCode" ADD COLUMN IF NOT EXISTS "intakeWaived" boolean DEFAULT false;
