#!/usr/bin/env bash
# After pulling the fixed 20260410000001_cybersecurity_assessment_bank migration, clear the failed
# state and apply pending migrations (from repo root, DATABASE_URL set in .env.local).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Marking failed migration as rolled back (does not run SQL)..."
npx prisma migrate resolve --rolled-back "20260410000001_cybersecurity_assessment_bank"

echo "Applying migrations..."
npx prisma migrate deploy

echo "Done. Optionally run: npx prisma generate"
