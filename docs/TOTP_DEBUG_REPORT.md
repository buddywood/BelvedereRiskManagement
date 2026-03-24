# TOTP Validation Issue - Debug Report

## Issue Found

The TOTP validation was failing because of incorrect API usage in the `verifyMFAToken` function.

### Root Cause

The `otplib` v13 TOTP class has a different API than expected:

```typescript
// WRONG (what was being called)
await totp.verify({
  secret,
  token,
  epochTolerance: 30,
})

// CORRECT (what it expects)
await totp.verify(token, {
  secret,
  epochTolerance: 60,  // in SECONDS, not milliseconds
})
```

**Key differences:**
1. The first parameter is the token string directly, not a full options object
2. `epochTolerance` is in **seconds**, and should be converted from time windows
3. The TOTP class instance already has crypto and base32 plugins configured, so partial options suffice
4. Also, the method name is `toURI()` not `generateURI()`

## Changes Made

### 1. Updated `src/lib/mfa.ts`

**Verification function improvements:**
- Fixed method signature: `totp.verify(token, options)` instead of `totp.verify({token, ...})`
- Corrected `epochTolerance` units from undefined to 60 seconds (±1 period)
- Added comprehensive debug logging for:
  - Encrypted/decrypted secret lengths
  - Token format validation (must be 6 digits)
  - Verification configuration details
  - Result details (valid, delta, epoch)
  - Error details with stack traces

**Enrollment function improvements:**
- Added logging for secret generation
- Added error handling for encryption failures
- Added logging for secret storage and URI generation
- Fixed method name: `totp.toURI()` instead of `totp.generateURI()`

### 2. Created Debug Endpoint `src/app/api/debug/totp/route.ts`

Three operational modes to test TOTP independently:

**Mode 1: Generate new secret and token**
```bash
curl -X POST http://localhost:3000/api/debug/totp
```
Response includes: secret, token, QR URI

**Mode 2: Verify a token**
```bash
curl -X POST http://localhost:3000/api/debug/totp \
  -H "Content-Type: application/json" \
  -d '{"secret":"ABC123XYZ","token":"123456"}'
```
Response includes: valid (boolean), delta, epoch, debug info

**Mode 3: Generate token from existing secret**
```bash
curl -X POST http://localhost:3000/api/debug/totp \
  -H "Content-Type: application/json" \
  -d '{"secret":"ABC123XYZ"}'
```

### 3. Added Comprehensive Tests `src/lib/mfa.test.ts`

Test suite verifies:
- Secret generation (Base32 format, correct length)
- Token generation from secrets
- Token verification with tolerance window
- Invalid token rejection
- otpauth URI generation
- Configuration consistency with production setup

All 7 tests pass.

## TOTP Configuration Reference

Current production configuration:
- **Algorithm**: SHA1
- **Digits**: 6
- **Period**: 30 seconds
- **Tolerance**: 60 seconds (±1 period, allows 1 period drift past and future)
- **Crypto**: NobleCryptoPlugin (from @otplib/plugin-crypto-noble)
- **Base32**: ScureBase32Plugin (from @otplib/plugin-base32-scure)

## Debugging Workflow

To test TOTP validation without the full MFA setup:

1. **Generate a test secret:**
   ```bash
   curl http://localhost:3000/api/debug/totp | jq .secret
   ```

2. **Add to authenticator app** manually or scan QR

3. **Verify tokens** while monitoring logs:
   ```bash
   curl -X POST http://localhost:3000/api/debug/totp \
     -H "Content-Type: application/json" \
     -d '{"secret":"XXXXX","token":"123456"}'
   ```

4. **Check application logs** for detailed debug output:
   - `[TOTP]` logs show verification details
   - `[MFA]` logs show enrollment/crypto details

## Expected Behavior After Fix

✅ TOTP tokens from authenticator apps are verified correctly
✅ Allows 60-second clock skew (±1 period)
✅ Returns detailed debug information in logs
✅ Encryption/decryption of secrets working properly
✅ All configuration parameters match RFC 6238 standards

## File Changes Summary

| File | Change | Reason |
|------|--------|--------|
| `src/lib/mfa.ts` | Fixed verify API call + added logging | Correct otplib v13 API usage |
| `src/lib/mfa.ts` | Fixed `toURI()` method name | Correct method name in TOTP class |
| `src/app/api/debug/totp/route.ts` | New debug endpoint | Test TOTP independently |
| `src/lib/mfa.test.ts` | New test suite | Validate TOTP configuration |

## Notes for Future Development

1. The debug endpoint should be removed or gated before production deployment
2. Debug logging uses `console.debug()` - configure log level appropriately
3. The 60-second tolerance window is generous; consider reducing to 30 seconds (±0 periods) for higher security
4. Consider adding rate limiting to TOTP verification endpoint if not already present
5. The encryption uses AES-256-GCM with PBKDF2 key derivation - ensure ENCRYPTION_KEY env var is set securely
