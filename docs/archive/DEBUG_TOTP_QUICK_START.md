# Debug TOTP - Quick Start Guide

## Problem
TOTP tokens from authenticator apps (Google Authenticator, Authy, etc.) were being rejected as invalid.

## Solution
Fixed otplib v13 API usage in `src/lib/mfa.ts`. Now includes a debug endpoint and comprehensive logging.

## Quick Test (30 seconds)

### 1. Start the dev server
```bash
npm run dev
```

### 2. Generate a test secret
```bash
curl http://localhost:3000/api/debug/totp | jq .secret
```

### 3. Add to authenticator app
- Use Google Authenticator, Authy, or Microsoft Authenticator
- Manually enter the secret OR scan the QR code

### 4. Get current token
```bash
SECRET="JBSWY3DPEHPK3PXP"  # From step 2
curl http://localhost:3000/api/debug/totp \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"$SECRET\"}"  | jq .token
```

### 5. Verify it works
```bash
SECRET="JBSWY3DPEHPK3PXP"
TOKEN="123456"  # From step 4
curl -X POST http://localhost:3000/api/debug/totp \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"$SECRET\",\"token\":\"$TOKEN\"}"
```

Expected response:
```json
{
  "valid": true,
  "delta": 0,
  "epoch": 1708588200,
  "message": "Token is valid"
}
```

## What Was Fixed

| Issue | Fix | File |
|-------|-----|------|
| Wrong API signature | `totp.verify(token, options)` | `src/lib/mfa.ts:131` |
| Wrong method name | `totp.toURI()` instead of `generateURI()` | `src/lib/mfa.ts:59` |
| Wrong tolerance units | `epochTolerance: 60` (seconds) | `src/lib/mfa.ts:133` |
| No input validation | Added 6-digit format check | `src/lib/mfa.ts:113` |
| No debug logging | Added `[TOTP]` and `[MFA]` prefixed logs | `src/lib/mfa.ts` |

## Debug Endpoint: `/api/debug/totp`

### GET - View endpoint help
```bash
curl http://localhost:3000/api/debug/totp
```

### POST - Three modes

**Mode 1: Generate new secret + token**
```bash
curl -X POST http://localhost:3000/api/debug/totp
```

**Mode 2: Verify a token**
```bash
curl -X POST http://localhost:3000/api/debug/totp \
  -H "Content-Type: application/json" \
  -d '{"secret":"ABC123XYZ","token":"123456"}'
```

**Mode 3: Generate token from existing secret**
```bash
curl -X POST http://localhost:3000/api/debug/totp \
  -H "Content-Type: application/json" \
  -d '{"secret":"ABC123XYZ"}'
```

## Monitor Logs

Look for these debug messages:

**Enrollment:**
```
[MFA] Generated TOTP secret { secretLength: 32 }
[MFA] Successfully encrypted secret
[MFA] Stored encrypted secret for user
[MFA] Generated otpauth URI
[MFA] Generated QR code
```

**Verification (Success):**
```
[TOTP] Successfully decrypted secret { secretLength: 32 }
[TOTP] Starting verification { token: '123456' }
[TOTP] Verification result { valid: true, delta: 0 }
```

**Verification (Failure):**
```
[TOTP] Invalid token format. Expected 6 digits, got: { token: '12345' }
[TOTP] Verification error: { error: '...' }
```

## Run Tests

```bash
# Run all tests
npm test

# Just TOTP tests
npm test -- src/lib/mfa.test.ts
```

Expected: 7/7 tests pass

## Configuration

Current TOTP settings:
- **Algorithm**: SHA1 (RFC 6238 standard)
- **Digits**: 6
- **Period**: 30 seconds
- **Tolerance**: 60 seconds (±1 period)

## Before Production

Remove or gate the debug endpoint:
```bash
# Remove this file or add authentication
rm src/app/api/debug/totp/route.ts
```

Or add admin-only gate:
```typescript
const session = await auth();
if (!session?.user?.isAdmin) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## Troubleshooting

### Token always invalid
1. Check token format: must be exactly 6 digits
2. Verify secret is Base32-encoded
3. Check system clock is synchronized
4. Try using a larger tolerance (debug endpoint uses 60s)

### QR code doesn't work
1. Ensure ENCRYPTION_KEY environment variable is set
2. Check logs for encryption errors
3. Try scanning again - QR is time-sensitive

### Still getting errors?
1. Check application logs for `[TOTP]` messages
2. Review `TOTP_DEBUG_REPORT.md` for detailed info
3. Check `MFA_DEBUGGING_SUMMARY.md` for technical deep-dive

## Files

| File | Purpose |
|------|---------|
| `src/lib/mfa.ts` | Core MFA functions with logging |
| `src/app/api/debug/totp/route.ts` | Debug endpoint |
| `src/lib/mfa.test.ts` | Test suite (7 tests) |
| `MFA_DEBUGGING_SUMMARY.md` | Complete technical summary |
| `TOTP_DEBUG_REPORT.md` | Debugging findings |
| `TOTP_FIX_VERIFICATION.md` | Verification checklist |
| `DEBUG_TOTP_QUICK_START.md` | This file |

## Success Criteria

✅ TOTP tokens from authenticator apps verify successfully
✅ Recovery codes generate after MFA enabled
✅ No TypeScript errors
✅ All 24 tests pass
✅ Build completes successfully
✅ Debug logs show verification flow

---

Commit: `d6ec0e3` - "fix: debug and fix TOTP validation in MFA system"
