#!/usr/bin/env bash
# Apply S3 bucket CORS so browsers can PUT to presigned URLs (documents, logos, etc.).
#
# Run from repo root:
#   S3_BUCKET_NAME=akili-advisor-assets ./scripts/apply-s3-browser-upload-cors.sh
#
# Resolves AWS profile in order (does not blindly use shell AWS_PROFILE — avoids wrong org):
#   1. AKILI_AWS_PROFILE environment variable
#   2. Repo file ./akili.awsprofile (single line, copy from akili.awsprofile.example)
#   3. Profile ebilly, if present
#   4. Profile buddy@ebilly.com, if present (common Akili dev name)
#
# If none apply: see profiles/aws-profile-akili.snippet (SSO setup).
#
# If you omit S3_BUCKET_NAME, it defaults to akili-advisor-assets.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUCKET="${S3_BUCKET_NAME:-akili-advisor-assets}"
CORS_FILE="${ROOT}/scripts/s3-browser-upload-cors.json"
AKILI_PROFILE_FILE="${ROOT}/akili.awsprofile"

list_profiles() {
  aws configure list-profiles 2>/dev/null || true
}

profile_exists() {
  local p="$1"
  list_profiles | grep -Fxq "$p"
}

resolve_akili_profile() {
  if [[ -n "${AKILI_AWS_PROFILE:-}" ]]; then
    echo "${AKILI_AWS_PROFILE}"
    return
  fi
  if [[ -f "$AKILI_PROFILE_FILE" ]]; then
    local line from_file=""
    while IFS= read -r line || [[ -n "$line" ]]; do
      [[ "$line" =~ ^[[:space:]]*# ]] && continue
      [[ -z "${line//[[:space:]]/}" ]] && continue
      from_file="${line//$'\r'/}"
      break
    done < "$AKILI_PROFILE_FILE"
    if [[ -n "$from_file" ]]; then
      echo "$from_file"
      return
    fi
  fi
  if profile_exists "ebilly"; then
    echo "ebilly"
    return
  fi
  if profile_exists "buddy@ebilly.com"; then
    echo "buddy@ebilly.com"
    return
  fi
  return 1
}

if [[ ! -f "$CORS_FILE" ]]; then
  echo "Missing $CORS_FILE" >&2
  exit 1
fi

P=""
if ! P="$(resolve_akili_profile)"; then
  echo "" >&2
  echo "No Akili AWS profile configured." >&2
  echo "  Option A — one-line file in repo root (gitignored):" >&2
  echo "    cp akili.awsprofile.example akili.awsprofile" >&2
  echo "    # edit akili.awsprofile to your ~/.aws/config profile name for buddy@ebilly.com / Akili" >&2
  echo "  Option B — environment variable:" >&2
  echo "    AKILI_AWS_PROFILE=your-profile-name $0" >&2
  echo "  Option C — finish SSO in ~/.aws/config (IAM Identity Center URL from admin):" >&2
  echo "    profiles/aws-profile-akili.snippet" >&2
  echo "    Then: aws sso login --profile buddy@ebilly.com   # or your profile name" >&2
  exit 1
fi

export AWS_PROFILE="$P"

if ! profile_exists "$AWS_PROFILE"; then
  echo "AWS profile '$AWS_PROFILE' is not defined (aws configure list-profiles)." >&2
  exit 1
fi

echo "Akili CORS: AWS_PROFILE=$AWS_PROFILE" >&2
aws sts get-caller-identity >&2

put_cors() {
  aws s3api put-bucket-cors \
    --bucket "$BUCKET" \
    --cors-configuration "file://${CORS_FILE}"
}

if ! put_cors; then
  echo "" >&2
  echo "PutBucketCors failed (often AccessDenied or wrong AWS account)." >&2
  echo "  • Arn above must be the account that OWNS s3://${BUCKET}" >&2
  echo "  • IAM needs s3:PutBucketCors on: arn:aws:s3:::${BUCKET}" >&2
  echo "  • Or S3 Console → ${BUCKET} → Permissions → CORS → paste scripts/s3-browser-upload-cors.json" >&2
  exit 1
fi

echo "CORS applied to s3://$BUCKET"
aws s3api get-bucket-cors --bucket "$BUCKET" 2>/dev/null || true
