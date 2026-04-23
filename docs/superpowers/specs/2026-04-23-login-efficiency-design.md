# Login Efficiency — Design Spec
**Date:** 2026-04-23
**Scope:** `src/screens/LoginScreen.js` · `src/context/AuthContext.js` · `src/lib/constants.js`

---

## Goal
Reduce login latency by one network round-trip, eliminate the post-login loading screen for returning users, and add keyboard flow + email persistence for a smoother UX.

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

## Section 3 — Eliminate Post-Login Loading Screen

After `signInWithPassword` succeeds, `AppScreens` blocks on `profileLoaded` while `fetchProfile` makes a full Supabase round-trip (up to 10s on slow connections). The user sees the loading screen logo for the entire duration.

### 3a. Profile cache
- **Write:** After every successful `fetchProfile`, serialize the profile object and write it to `AsyncStorage` under `@synclexia_cached_profile_{userId}`.
- **Read:** In `AuthContext`, after `getSession()` resolves and a session exists, read the cache for that user ID before the `fetchProfile` call. If a cached profile is found, immediately call `setProfile(cached)` and `setProfileLoaded(true)`. The user lands on the dashboard instantly.
- **Refresh:** The background `fetchProfile` call still runs. When it completes it overwrites state with fresh data. If `is_banned` is detected in the fresh fetch, the existing ban-handling logic (sign out + alert) fires normally.
- **Invalidation:** Cache is deleted on `signOut()`. Cache is always overwritten after every successful `fetchProfile`. Cache is keyed by user ID — switching accounts never shows stale data from a previous user.
- **Key:** `@synclexia_cached_profile_{userId}` — added as a helper function `profileCacheKey(userId)` in `AuthContext` (not a static string in `STORAGE_KEYS` since it includes the user ID).

### 3b. Reduce query timeout
`PROFILE_QUERY_MS` drops from `10000` → `5000`. With 3 retries and 2s delays, worst-case fetch time goes from ~36s to ~21s. For any user with a cached profile this path is never blocking the UI.

---

## Files Changed

| File | Change |
|------|--------|
| `src/screens/LoginScreen.js` | Remove ban-check query, remove `setSession` call, move `resetSigningOut`, add keyboard refs, add email persistence |
| `src/context/AuthContext.js` | Add profile cache read on startup, write cache after successful fetch, clear cache on sign-out |
| `src/lib/constants.js` | Add `LAST_EMAIL` to `STORAGE_KEYS`; reduce `PROFILE_QUERY_MS` to 5000 |

---

## Out of Scope
- Biometric / Face ID login
- "Remember password" (security risk on mobile)
- UI reskin or animation changes
