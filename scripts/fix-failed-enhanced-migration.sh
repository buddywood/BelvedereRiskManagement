#!/usr/bin/env bash
# Clear P3018 after a partial apply of 20260410180000_enhanced_assessment_engine (e.g. enum exists),
# then re-run migrate deploy. Run from repo root with DATABASE_URL set.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Marking failed migration 20260410180000_enhanced_assessment_engine as rolled back..."
npx prisma migrate resolve --rolled-back "20260410180000_enhanced_assessment_engine"

echo "Applying migrations (enhanced migration is now idempotent)..."
npx prisma migrate deploy

echo "Done."
