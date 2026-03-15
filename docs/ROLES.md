# How Roles Are Managed

## Overview

User roles control which menu options and routes are available. **ADVISOR** and **ADMIN** users see the Advisor and Governance nav links; **USER** (default) does not.

For a full breakdown of what each role can access (routes, APIs, nav), see **[ACCESS-LEVELS-BY-ROLE.md](./ACCESS-LEVELS-BY-ROLE.md)**.

## Where the role is stored

- **Database:** `User.role` in Prisma (`UserRole` enum: `USER` | `ADVISOR` | `ADMIN`). Default is `USER`.
- **Session:** The role is copied into the JWT and then into `session.user.role` so the UI and route guards can use it without hitting the DB on every request.

## Flow

1. **Sign-in**  
   NextAuth credentials provider validates the user. The user record (including `role`) lives in the database.

2. **JWT callback** (`src/lib/auth.ts`)  
   On each request that uses the session, the JWT callback runs and loads the user from the DB:
   - `token.role = dbUser?.role ?? 'USER'`
   So the JWT (and thus the session) always reflects the current `User.role` when the server runs `auth()`.

3. **Session callback** (`src/lib/auth.ts`)  
   Exposes the role to the app:
   - `session.user.role = token.role`

4. **Where the role is used**
   - **Protected layout** (`src/app/(protected)/layout.tsx`): Passes `showAdvisor={session?.user?.role === "ADVISOR" || session?.user?.role === "ADMIN"}` to `ProtectedNav`.
   - **ProtectedNav** (`src/components/layout/ProtectedNav.tsx`): If `showAdvisor` is true, the nav includes "Advisor" and "Governance" (and hides them otherwise).
   - **Advisor routes** (`src/app/(protected)/advisor/layout.tsx`): Redirects to `/dashboard` if `session.user.role` is not `ADVISOR` or `ADMIN`.

## If you’re logged in as advisor@test.com but don’t see Advisor menu

1. **Confirm the user’s role in the DB**  
   For example, in Prisma Studio or SQL:
   - `User` where `email = 'advisor@test.com'` should have `role = 'ADVISOR'`.

2. **Re-seed advisor test data** (if needed)  
   The script sets `role: 'ADVISOR'` for `advisor@test.com`:
   ```bash
   node scripts/seed-advisor-test-data.js
   ```

3. **Sign out and sign in again**  
   So a new JWT is issued with the current `role`. The JWT callback does read from the DB on each `auth()` call, but if the session was created before the role was set, or there’s caching, a fresh login ensures the session has the correct role.

4. **Hard refresh**  
   After signing in again, do a full refresh (e.g. Cmd+Shift+R) so the protected layout re-renders with the new session.

## Test data

- **advisor@test.com** – seeded with `role: 'ADVISOR'` (see `scripts/seed-advisor-test-data.js`).
- **client@test.com** – seeded with `role: 'USER'`.
- **buddy@ebilly.com** – designated admin; run `node scripts/set-admin-role.js` to create/update with `role: 'ADMIN'`. Admin access is restricted to this account in code.

New users created via the sign-up flow get the default role **USER** unless you change the registration logic to set a different role.
