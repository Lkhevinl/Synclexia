# Login Efficiency — Design Spec
**Date:** 2026-04-23
**Scope:** `src/screens/LoginScreen.js` · `src/context/AuthContext.js`

---

## Goal
Reduce login latency by one network round-trip and eliminate redundant state calls, while adding keyboard flow and email persistence for a smoother UX.

---

## Section 1 — Performance

### 1a. Remove duplicate profile query
`LoginScreen.handleLogin` currently fetches `is_banned, role` from `profiles` after a successful `signInWithPassword` to check for banned accounts. `AuthContext.fetchProfile` already performs this exact check — it calls `supabase.auth.signOut()` and shows an `Alert` if `data.is_banned` is true.

**Change:** Delete the `supabase.from(TABLES.PROFILES).select('is_banned, role')` query block (and its ban-handling branch) from `LoginScreen.handleLogin`. Rely entirely on `AuthContext.fetchProfile` for the ban check.

**Result:** One fewer sequential DB query on every login.

### 1b. Remove redundant `setSession()` call
When `signInWithPassword` succeeds, Supabase fires a `SIGNED_IN` event. The `onAuthStateChange` handler in `AuthContext` already calls `setSession(s)` and `fetchProfile(userId)`. `LoginScreen` then calls `setSession(data.session)` a second time.

**Change:** Remove the explicit `setSession(data.session)` call from `LoginScreen`. The `SIGNED_IN` handler owns session state.

### 1c. Move `resetSigningOut()` before `signInWithPassword()`
`resetSigningOut()` sets `signingOutRef.current = false`, allowing the `SIGNED_IN` handler to process the event. Currently it is called *after* `await signInWithPassword()`, meaning if the `SIGNED_IN` event fires before our await resolves (possible in some Supabase SDK versions), it gets blocked by `signingOutRef.current === true` and `fetchProfile` is never called — leaving the app on the loading screen.

**Change:** Call `resetSigningOut()` at the top of `handleLogin`, before `signInWithPassword()`.

---

## Section 2 — Keyboard UX + Remember Email

### 2a. Keyboard flow
- Email field: `returnKeyType="next"`, `onSubmitEditing` focuses the password field via a `useRef`.
- Password field: `returnKeyType="done"`, `onSubmitEditing` calls `handleLogin`.
- Users can complete the entire login without tapping outside the keyboard.

### 2b. Remember last-used email
- **On mount:** Read `@synclexia_last_email` from `AsyncStorage`. If present, pre-fill the email field.
- **On successful login:** Write the trimmed lowercase email to `@synclexia_last_email`.
- **On failure:** Email field retains its current value (no clear on error).
- No opt-in checkbox — always on, consistent with standard mobile app behaviour.
- The key `@synclexia_last_email` is added to `STORAGE_KEYS` in `src/lib/constants.js`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/screens/LoginScreen.js` | Remove ban-check query, remove `setSession` call, move `resetSigningOut`, add keyboard refs, add email persistence |
| `src/lib/constants.js` | Add `LAST_EMAIL` to `STORAGE_KEYS` |
| `src/context/AuthContext.js` | No change required — existing logic is already correct |

---

## Out of Scope
- Biometric / Face ID login
- "Remember password" (security risk on mobile)
- UI reskin or animation changes
