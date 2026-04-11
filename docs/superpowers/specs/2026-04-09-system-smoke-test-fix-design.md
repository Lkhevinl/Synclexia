# Synclexia System Smoke Test — Fix Design
**Date:** 2026-04-09
**Scope:** All screens, navigation, and data issues identified during smoke test audit
**Goal:** Make every built screen reachable, remove hardcoded/placeholder data, and ensure notification filtering is correct per role.

---

## Audit Findings Summary (Grouped by Area)

### Navigation / Routing
| Issue | Severity | File |
|-------|----------|------|
| `TeacherDashboardScreen` registered in AppNavigator but nothing navigates to it | Critical | `AppNavigator.js` |
| `AdminSettingsScreen` exists but NOT registered in AppNavigator | High | `AppNavigator.js` |
| `SplashScreen` exists but unused anywhere | Low | `SplashScreen.js` |

### Teacher Screens — 7 fully built but completely unreachable
| Screen File | Feature |
|-------------|---------|
| `TeacherEnrollmentScreen.js` | QR code / teacher enrollment codes |
| `TeacherMessagesScreen.js` | Teacher ↔ parent messaging |
| `TeacherFeedbackScreen.js` | Feedback viewer |
| `TeacherNotificationsScreen.js` | Post/manage notifications |
| `TeacherProgressScreen.js` | Student progress tracking |
| `TeacherUsersScreen.js` | User management |
| `TeacherAssignActivitiesScreen.js` | Assign activities to students |

### Admin Screens
| Issue | Severity | File |
|-------|----------|------|
| Uptime stat hardcoded at "98%" | Medium | `AdminDashboardScreen.js:335` |
| `AdminSettingsScreen` inaccessible | High | `AdminSettingsScreen.js` |

### Student Screens
| Issue | Severity | File |
|-------|----------|------|
| `VIDEO_TUTORIAL_URL` is a YouTube search query, not a real URL | Medium | `WritingScreen.js:30` |

### Data / Backend
| Issue | Severity | File |
|-------|----------|------|
| Notification role filtering unverified for teacher/parent dashboards | High | `TeacherDashboardScreen.js`, `ParentDashboardScreen.js` |

---

## Implementation Plan

### Fix 1 — DashboardSwitcher: Route teachers to TeacherDashboardScreen
**File:** `src/components/DashboardSwitcher.js`

Change the teacher routing so teachers land on `TeacherDashboardScreen` instead of `AdminDashboardScreen`.

```
Before: isUserTeacher(profile) → AdminDashboardScreen
After:  isUserTeacher(profile) → TeacherDashboardScreen
```

Import `TeacherDashboardScreen` and update the role-based routing logic. Admins still go to `AdminDashboardScreen`.

---

### Fix 2 — AppNavigator: Register all 7 orphaned teacher screens + AdminSettings
**File:** `src/navigation/AppNavigator.js`

Add imports and Stack.Screen entries under the `(isTeacher || isAdmin)` conditional block:

```
TeacherEnrollment     → TeacherEnrollmentScreen
TeacherMessages       → TeacherMessagesScreen
TeacherFeedback       → TeacherFeedbackScreen
TeacherNotifications  → TeacherNotificationsScreen
TeacherProgress       → TeacherProgressScreen
TeacherUsers          → TeacherUsersScreen
TeacherAssignActivities → TeacherAssignActivitiesScreen
```

Add under `isAdmin` block:
```
AdminSettings → AdminSettingsScreen
```

---

### Fix 3 — TeacherDashboardScreen: Add navigation section for teacher tools
**File:** `src/screens/admin/teachers/TeacherDashboardScreen.js`

Add a second section below "Content Management" called "Teacher Tools" with cards navigating to:
- Enrollment (QR codes)
- Messages
- Feedback
- Notifications
- Progress
- Users
- Assign Activities

Use the same `GridCard` component pattern already in the screen.

---

### Fix 4 — AdminDashboard: Replace hardcoded uptime with teacher count
**File:** `src/screens/admin/AdminDashboardScreen.js` line 335

The "98% Uptime" stat card is hardcoded. Replace with a real `teacherCount` fetched from `profiles` table where `role = 'teacher'`. Change the stat card label from "Uptime" to "Teachers".

---

### Fix 5 — AdminSettings: Add navigation entry from Admin Sidebar
**File:** `src/components/Sidebar.js`

Add an "Admin Settings" row under the "SYSTEM MAINTENANCE" section (visible to admins only), navigating to `AdminSettings`.

---

### Fix 6 — WritingScreen: Replace placeholder tutorial URL
**File:** `src/screens/students/WritingScreen.js` line 30

Remove the tutorial button or replace `VIDEO_TUTORIAL_URL` with a `null` value and add a guard that hides the button when `VIDEO_TUTORIAL_URL` is null/empty. This prevents silently opening a YouTube search.

---

### Fix 7 — Notification Role Filtering: Teacher and Parent dashboards
**Files:** `src/screens/admin/teachers/TeacherDashboardScreen.js`, `src/screens/parents/ParentDashboardScreen.js`

Audit `fetchNotifications()` in both files. Ensure each adds role-specific filtering:
- Teacher: `.in('target_role', ['all', 'teacher'])`
- Parent: `.in('target_role', ['all', 'parent'])`

---

### Fix 8 — SplashScreen: Delete dead file
**File:** `src/screens/SplashScreen.js`

File is built but referenced nowhere. Delete it to prevent confusion.

---

## File Change Map

| File | Change Type |
|------|-------------|
| `src/components/DashboardSwitcher.js` | Route teachers to TeacherDashboardScreen |
| `src/navigation/AppNavigator.js` | Register 7 teacher screens + AdminSettings |
| `src/screens/admin/teachers/TeacherDashboardScreen.js` | Add Teacher Tools navigation section |
| `src/screens/admin/AdminDashboardScreen.js` | Replace hardcoded uptime with teacher count |
| `src/components/Sidebar.js` | Add Admin Settings nav entry |
| `src/screens/students/WritingScreen.js` | Guard/remove placeholder tutorial URL |
| `src/screens/admin/teachers/TeacherDashboardScreen.js` | Fix notification role filter |
| `src/screens/parents/ParentDashboardScreen.js` | Fix notification role filter |
| `src/screens/SplashScreen.js` | Delete |

---

## Out of Scope
- Implementing new features inside the 7 teacher screens (they are already fully built)
- Database schema changes
- Any UI redesign beyond what's needed to wire navigation
