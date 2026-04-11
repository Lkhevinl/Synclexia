# System Smoke Test Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire all 7 orphaned teacher screens into navigation, fix DashboardSwitcher routing for teachers, register AdminSettings, fix hardcoded stats, remove placeholder tutorial URL, and fix teacher notification role filtering.

**Architecture:** All changes are navigation wiring and small data fixes in existing files — no new screens are built, no schema changes. Each task touches one file (or two closely related files) and is independently committable.

**Tech Stack:** React Native, Expo, React Navigation v6 (Stack + Tab navigators), Supabase JS client

---

## File Change Map

| File | What Changes |
|------|-------------|
| `src/components/DashboardSwitcher.js` | Route `teacher` role → `TeacherDashboardScreen` |
| `src/navigation/AppNavigator.js` | Register 7 teacher screens + `AdminSettings` |
| `src/screens/admin/teachers/TeacherDashboardScreen.js` | Add "Teacher Tools" nav section + fix notification role filter |
| `src/screens/admin/AdminDashboardScreen.js` | Fetch real teacher count; replace hardcoded "98% Uptime" stat |
| `src/components/Sidebar.js` | Add Admin Settings nav row (admin only) |
| `src/screens/students/WritingScreen.js` | Guard tutorial button — hide when URL is a placeholder |
| `src/screens/SplashScreen.js` | Delete file |

---

## Task 1: Fix DashboardSwitcher — route teachers to TeacherDashboardScreen

**Files:**
- Modify: `src/components/DashboardSwitcher.js`

- [ ] **Step 1.1 — Read the current file**

Open `src/components/DashboardSwitcher.js` and confirm the current logic:
```js
if (isUserAdmin(profile) || isUserTeacher(profile)) return <AdminDashboardScreen {...props} />;
```
Also note the import block at the top — `TeacherDashboardScreen` is NOT currently imported.

- [ ] **Step 1.2 — Add the import**

In `src/components/DashboardSwitcher.js`, after the existing `AdminDashboardScreen` import, add:
```js
import TeacherDashboardScreen from '../screens/admin/teachers/TeacherDashboardScreen';
```

- [ ] **Step 1.3 — Fix the dashboardMode teacher branch**

Replace this line (around line 25):
```js
if ((dashboardMode === 'teacher' || dashboardMode === 'admin') && canAccessTeacherFeatures(profile)) return <AdminDashboardScreen {...props} />;
```
With:
```js
if (dashboardMode === 'teacher' && canAccessTeacherFeatures(profile)) return <TeacherDashboardScreen {...props} />;
if (dashboardMode === 'admin' && isUserAdmin(profile)) return <AdminDashboardScreen {...props} />;
```

- [ ] **Step 1.4 — Fix the role-based routing block**

Replace (around line 29):
```js
if (isUserAdmin(profile) || isUserTeacher(profile)) return <AdminDashboardScreen {...props} />;
```
With:
```js
if (isUserAdmin(profile)) return <AdminDashboardScreen {...props} />;
if (isUserTeacher(profile)) return <TeacherDashboardScreen {...props} />;
```

- [ ] **Step 1.5 — Commit**

```bash
git add src/components/DashboardSwitcher.js
git commit -m "fix: route teacher role to TeacherDashboardScreen instead of AdminDashboardScreen"
```

---

## Task 2: AppNavigator — register 7 orphaned teacher screens + AdminSettings

**Files:**
- Modify: `src/navigation/AppNavigator.js`

- [ ] **Step 2.1 — Add imports for all 7 orphaned teacher screens**

In `src/navigation/AppNavigator.js`, find the teacher imports block (around line 47–53). After the last existing teacher import, add:
```js
import TeacherEnrollmentScreen    from '../screens/admin/teachers/TeacherEnrollmentScreen';
import TeacherMessagesScreen      from '../screens/admin/teachers/TeacherMessagesScreen';
import TeacherFeedbackScreen      from '../screens/admin/teachers/TeacherFeedbackScreen';
import TeacherNotificationsScreen from '../screens/admin/teachers/TeacherNotificationsScreen';
import TeacherProgressScreen      from '../screens/admin/teachers/TeacherProgressScreen';
import TeacherUsersScreen         from '../screens/admin/teachers/TeacherUsersScreen';
import TeacherAssignActivitiesScreen from '../screens/admin/teachers/TeacherAssignActivitiesScreen';
```

- [ ] **Step 2.2 — Add import for AdminSettingsScreen**

After the last existing admin import (around line 67), add:
```js
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
```

- [ ] **Step 2.3 — Register the 7 teacher screens in the navigator**

Find the teacher routes block (around line 255–264):
```js
{(isTeacher || isAdmin) && (
  <>
    <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
    <Stack.Screen name="TeacherAddStory" component={TeacherAddStoryScreen} />
    <Stack.Screen name="TeacherPhonics" component={TeacherPhonicsScreen} />
    <Stack.Screen name="TeacherSpelling" component={TeacherSpellingScreen} />
    <Stack.Screen name="TeacherPhonicsActivity" component={TeacherPhonicsActivityScreen} />
    <Stack.Screen name="TeacherPhonological" component={TeacherPhonologicalScreen} />
  </>
)}
```

Replace it with:
```js
{(isTeacher || isAdmin) && (
  <>
    <Stack.Screen name="TeacherDashboard"          component={TeacherDashboardScreen} />
    <Stack.Screen name="TeacherAddStory"           component={TeacherAddStoryScreen} />
    <Stack.Screen name="TeacherPhonics"            component={TeacherPhonicsScreen} />
    <Stack.Screen name="TeacherSpelling"           component={TeacherSpellingScreen} />
    <Stack.Screen name="TeacherPhonicsActivity"    component={TeacherPhonicsActivityScreen} />
    <Stack.Screen name="TeacherPhonological"       component={TeacherPhonologicalScreen} />
    <Stack.Screen name="TeacherEnrollment"         component={TeacherEnrollmentScreen} />
    <Stack.Screen name="TeacherMessages"           component={TeacherMessagesScreen} />
    <Stack.Screen name="TeacherFeedback"           component={TeacherFeedbackScreen} />
    <Stack.Screen name="TeacherNotifications"      component={TeacherNotificationsScreen} />
    <Stack.Screen name="TeacherProgress"           component={TeacherProgressScreen} />
    <Stack.Screen name="TeacherUsers"              component={TeacherUsersScreen} />
    <Stack.Screen name="TeacherAssignActivities"   component={TeacherAssignActivitiesScreen} />
  </>
)}
```

- [ ] **Step 2.4 — Register AdminSettings under the isAdmin block**

Find the admin routes block (around line 275–290):
```js
{isAdmin && (
  <>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    ...
    <Stack.Screen name="AdminPhonological" component={AdminPhonologicalScreen} />
  </>
)}
```

Add `AdminSettings` as the last entry inside that block:
```js
    <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
```

- [ ] **Step 2.5 — Commit**

```bash
git add src/navigation/AppNavigator.js
git commit -m "fix: register 7 orphaned teacher screens and AdminSettings in AppNavigator"
```

---

## Task 3: TeacherDashboardScreen — add Teacher Tools section + fix notification filter

**Files:**
- Modify: `src/screens/admin/teachers/TeacherDashboardScreen.js`

- [ ] **Step 3.1 — Fix the notification role filter**

In `src/screens/admin/teachers/TeacherDashboardScreen.js`, find the main notifications query (around line 76–82):
```js
// Build query for active notifications (teachers see all role-targeted notifications)
let query = supabase
  .from(TABLES.NOTIFICATIONS)
  .select('*')
  .eq('is_draft', false)
  .order('created_at', { ascending: false })
  .limit(10);
```

Replace with:
```js
// Teachers see notifications targeted to 'all' or 'teacher'
let query = supabase
  .from(TABLES.NOTIFICATIONS)
  .select('*')
  .eq('is_draft', false)
  .in('target_role', ['all', 'teacher'])
  .order('created_at', { ascending: false })
  .limit(10);
```

Also fix the fallback query (in the `dismissedError` branch, around line 64–70):
```js
const { data } = await supabase
  .from(TABLES.NOTIFICATIONS)
  .select('*')
  .eq('is_draft', false)
  .order('created_at', { ascending: false })
  .limit(10);
```
Replace with:
```js
const { data } = await supabase
  .from(TABLES.NOTIFICATIONS)
  .select('*')
  .eq('is_draft', false)
  .in('target_role', ['all', 'teacher'])
  .order('created_at', { ascending: false })
  .limit(10);
```

- [ ] **Step 3.2 — Locate the correct insert point for the Teacher Tools section**

Find the closing of the Content Management grid section — it ends after the `</View>` that closes the `styles.grid` view (around line 344). The Teacher Tools section goes immediately after this, before `{/* CONTENT OVERVIEW */}`.

- [ ] **Step 3.3 — Add the Teacher Tools section**

After the Content Management grid `</View>` and before `{/* CONTENT OVERVIEW */}`, insert:

```jsx
{/* ── TEACHER TOOLS ── */}
<View style={styles.sectionHeader}>
  <View>
    <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Teacher Tools</Text>
    <Text style={styles.sectionSubtitle}>Manage students, messages, and more</Text>
  </View>
</View>

<View style={[styles.grid, isDesktop && styles.gridDesktop]}>
  <GridCard
    title="Enrollment"
    subtitle="QR codes & student links"
    icon="qr-code"
    color="#4CAF50"
    count={null}
    onPress={() => navigation.navigate('TeacherEnrollment')}
  />
  <GridCard
    title="Messages"
    subtitle="Parent communications"
    icon="message-circle"
    color="#2196F3"
    count={null}
    onPress={() => navigation.navigate('TeacherMessages')}
  />
  <GridCard
    title="Student Progress"
    subtitle="Track learning outcomes"
    icon="bar-chart"
    color="#FF9800"
    count={null}
    onPress={() => navigation.navigate('TeacherProgress')}
  />
  <GridCard
    title="Notifications"
    subtitle="Post announcements"
    icon="megaphone"
    color="#9C27B0"
    count={null}
    onPress={() => navigation.navigate('TeacherNotifications')}
  />
  <GridCard
    title="Students"
    subtitle="View enrolled users"
    icon="users"
    color="#F44336"
    count={null}
    onPress={() => navigation.navigate('TeacherUsers')}
  />
  <GridCard
    title="Assign Activities"
    subtitle="Set tasks for students"
    icon="clipboard-list"
    color="#009688"
    count={null}
    onPress={() => navigation.navigate('TeacherAssignActivities')}
  />
  <GridCard
    title="Feedback"
    subtitle="View parent feedback"
    icon="message-square"
    color="#795548"
    count={null}
    onPress={() => navigation.navigate('TeacherFeedback')}
  />
</View>
```

- [ ] **Step 3.4 — Fix GridCard to handle null count**

Find the `GridCard` component definition (around line 174). The `count` prop is currently always rendered. Guard it so `null` counts don't show "null":

Find this inside `GridCard`:
```jsx
<View style={styles.countBadge}>
  <Text style={styles.countText}>{count}</Text>
</View>
```

Replace with:
```jsx
{count !== null && count !== undefined && (
  <View style={styles.countBadge}>
    <Text style={styles.countText}>{count}</Text>
  </View>
)}
```

- [ ] **Step 3.5 — Commit**

```bash
git add src/screens/admin/teachers/TeacherDashboardScreen.js
git commit -m "fix: add Teacher Tools nav section and fix notification role filter in TeacherDashboardScreen"
```

---

## Task 4: AdminDashboardScreen — replace hardcoded uptime with real teacher count

**Files:**
- Modify: `src/screens/admin/AdminDashboardScreen.js`

- [ ] **Step 4.1 — Add teacherCount state**

Find the existing state declarations at the top of the component (around line 19–20):
```js
const [studentCount, setStudentCount] = useState(0);
const [parentCount, setParentCount] = useState(0);
```

Add below:
```js
const [teacherCount, setTeacherCount] = useState(0);
```

- [ ] **Step 4.2 — Fetch teacher count in fetchUserCounts**

Find `fetchUserCounts` (around line 170–189). Replace:
```js
const fetchUserCounts = async () => {
  try {
    const [s, p] = await Promise.all([
      supabase.from(TABLES.PROFILES).select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from(TABLES.PROFILES).select('*', { count: 'exact', head: true }).eq('role', 'parent'),
    ]);

    if (s.error || p.error) {
      setStudentCount(0);
      setParentCount(0);
      return;
    }

    setStudentCount(s.count || 0);
    setParentCount(p.count || 0);
  } catch (error) {
    setStudentCount(0);
    setParentCount(0);
  }
};
```

With:
```js
const fetchUserCounts = async () => {
  try {
    const [s, p, t] = await Promise.all([
      supabase.from(TABLES.PROFILES).select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from(TABLES.PROFILES).select('*', { count: 'exact', head: true }).eq('role', 'parent'),
      supabase.from(TABLES.PROFILES).select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    ]);

    if (s.error || p.error || t.error) {
      setStudentCount(0);
      setParentCount(0);
      setTeacherCount(0);
      return;
    }

    setStudentCount(s.count || 0);
    setParentCount(p.count || 0);
    setTeacherCount(t.count || 0);
  } catch (error) {
    setStudentCount(0);
    setParentCount(0);
    setTeacherCount(0);
  }
};
```

- [ ] **Step 4.3 — Replace the hardcoded uptime stat card**

Find the 4th stat card (around line 332–339):
```jsx
<View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
  <View style={styles.statIconContainer}>
    <Icon name="trending-up" size="md" color="#FF9800" />
  </View>
  <Text style={[styles.statNumber, { color: '#FF9800' }]}>98%</Text>
  <Text style={styles.statLabel}>Uptime</Text>
  <Text style={styles.statSubtext}>System health</Text>
</View>
```

Replace with:
```jsx
<View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
  <View style={styles.statIconContainer}>
    <Icon name="user-check" size="md" color="#FF9800" />
  </View>
  <Text style={[styles.statNumber, { color: '#FF9800' }]}>{teacherCount}</Text>
  <Text style={styles.statLabel}>Teachers</Text>
  <Text style={styles.statSubtext}>Active staff</Text>
</View>
```

- [ ] **Step 4.4 — Commit**

```bash
git add src/screens/admin/AdminDashboardScreen.js
git commit -m "fix: replace hardcoded 98% uptime stat with real teacher count in AdminDashboard"
```

---

## Task 5: Sidebar — add Admin Settings nav entry

**Files:**
- Modify: `src/components/Sidebar.js`

- [ ] **Step 5.1 — Locate the SYSTEM MAINTENANCE section**

In `src/components/Sidebar.js`, find the admin-only maintenance section (around line 200–212):
```jsx
{isAdmin && (
  <>
    <Text style={s.groupLabel}>SYSTEM MAINTENANCE</Text>
    <View style={s.card}>
      <TouchableOpacity style={s.row} onPress={() => navigate('MaintenanceLogs')}>
        <View style={[s.iconWrap, { backgroundColor: '#607D8B18' }]}><Icon name="list" size="sm" color="#607D8B" /></View>
        <Text style={s.rowLabel}>View Maintenance Logs</Text>
        <Icon name="chevron-forward" size="sm" color="#D0D9E0" />
      </TouchableOpacity>
    </View>
  </>
)}
```

- [ ] **Step 5.2 — Add Admin Settings row inside the card**

Replace the section with:
```jsx
{isAdmin && (
  <>
    <Text style={s.groupLabel}>SYSTEM MAINTENANCE</Text>
    <View style={s.card}>
      <TouchableOpacity style={s.row} onPress={() => navigate('MaintenanceLogs')}>
        <View style={[s.iconWrap, { backgroundColor: '#607D8B18' }]}><Icon name="list" size="sm" color="#607D8B" /></View>
        <Text style={s.rowLabel}>View Maintenance Logs</Text>
        <Icon name="chevron-forward" size="sm" color="#D0D9E0" />
      </TouchableOpacity>
      <View style={s.divider} />
      <TouchableOpacity style={s.row} onPress={() => navigate('AdminSettings')}>
        <View style={[s.iconWrap, { backgroundColor: '#FF980018' }]}><Icon name="settings" size="sm" color="#FF9800" /></View>
        <Text style={s.rowLabel}>Admin Settings</Text>
        <Icon name="chevron-forward" size="sm" color="#D0D9E0" />
      </TouchableOpacity>
    </View>
  </>
)}
```

- [ ] **Step 5.3 — Commit**

```bash
git add src/components/Sidebar.js
git commit -m "fix: add Admin Settings navigation entry to Sidebar for admin users"
```

---

## Task 6: WritingScreen — guard the placeholder tutorial URL

**Files:**
- Modify: `src/screens/students/WritingScreen.js`

- [ ] **Step 6.1 — Replace the placeholder URL with null**

In `src/screens/students/WritingScreen.js`, find line 30:
```js
const VIDEO_TUTORIAL_URL = 'https://www.youtube.com/results?search_query=letter+tracing+tutorial+for+kids+dyslexia';
```

Replace with:
```js
const VIDEO_TUTORIAL_URL = null; // Set to a real URL when a tutorial video is available
```

- [ ] **Step 6.2 — Guard the first tutorial button (around line 929–936)**

Find:
```jsx
<TouchableOpacity style={styles.watchVideoBtn} onPress={() => Linking.openURL(VIDEO_TUTORIAL_URL)} activeOpacity={0.85}>
```

Wrap it in a guard:
```jsx
{VIDEO_TUTORIAL_URL ? (
  <TouchableOpacity style={styles.watchVideoBtn} onPress={() => Linking.openURL(VIDEO_TUTORIAL_URL)} activeOpacity={0.85}>
```

Find the closing `</TouchableOpacity>` for this button and close the ternary:
```jsx
  </TouchableOpacity>
) : null}
```

- [ ] **Step 6.3 — Guard the second tutorial button (around line 1142)**

Find:
```jsx
onPress={() => Linking.openURL(VIDEO_TUTORIAL_URL)}
```

Wrap its parent `TouchableOpacity` similarly:
```jsx
{VIDEO_TUTORIAL_URL ? (
  <TouchableOpacity ... onPress={() => Linking.openURL(VIDEO_TUTORIAL_URL)}>
    ...
  </TouchableOpacity>
) : null}
```

- [ ] **Step 6.4 — Commit**

```bash
git add src/screens/students/WritingScreen.js
git commit -m "fix: guard tutorial button in WritingScreen -- hide when VIDEO_TUTORIAL_URL is null"
```

---

## Task 7: Delete SplashScreen.js (dead file)

**Files:**
- Delete: `src/screens/SplashScreen.js`

- [ ] **Step 7.1 — Confirm no references exist**

Run:
```bash
grep -r "SplashScreen" src/ --include="*.js" -l
```
Expected output: no files listed. If any file imports it, remove that import first before deleting.

- [ ] **Step 7.2 — Delete the file**

```bash
git rm src/screens/SplashScreen.js
```

- [ ] **Step 7.3 — Commit**

```bash
git commit -m "chore: delete unused SplashScreen.js"
```

---

## Task 8: Verification pass

- [ ] **Step 8.1 — Verify all routes are navigable**

Manually (or in Expo Go) confirm:
- Log in as **teacher** → lands on `TeacherDashboardScreen` (not admin screen)
- Log in as **admin** → still lands on `AdminDashboardScreen`
- Teacher dashboard shows two sections: "Content Management" and "Teacher Tools"
- Each Teacher Tools card navigates to its screen without crashing
- Admin Sidebar → "View Maintenance Logs" and "Admin Settings" both appear and navigate correctly

- [ ] **Step 8.2 — Verify notification filtering**

Log in as teacher, open the notifications bell — should only show notifications with `target_role` of `'all'` or `'teacher'`, not student/parent-only notifications.

- [ ] **Step 8.3 — Verify WritingScreen**

Open Writing screen as a student — the "Watch Video" button(s) should be hidden (not a broken link to a YouTube search).

- [ ] **Step 8.4 — Verify AdminDashboard teacher count stat**

Log in as admin — the 4th stat card should show "Teachers" with a real number, not "98%".

- [ ] **Step 8.5 — Final commit**

```bash
git add .
git commit -m "chore: post smoke-test verification pass complete"
```

---

## Self-Review Checklist

- [x] **Spec coverage:**
  - Fix 1 (DashboardSwitcher) → Task 1 ✅
  - Fix 2 (Register 7 screens + AdminSettings) → Task 2 ✅
  - Fix 3 (Teacher Tools section) → Task 3 ✅
  - Fix 4 (Replace hardcoded uptime) → Task 4 ✅
  - Fix 5 (Admin Settings in Sidebar) → Task 5 ✅
  - Fix 6 (WritingScreen URL guard) → Task 6 ✅
  - Fix 7 (Teacher notification filter) → Task 3 Step 3.1 ✅
  - Fix 8 (Delete SplashScreen) → Task 7 ✅
  - ParentDashboardScreen notification filter → already correct, no task needed ✅

- [x] **No placeholders** — all steps contain exact code, file paths, and commands
- [x] **Type consistency** — `GridCard` component used consistently throughout Task 3; `count={null}` guard added in same task where null is introduced
- [x] **Route names consistent** — `TeacherEnrollment`, `TeacherMessages`, etc. match exactly between Task 2 (registration) and Task 3 (navigation calls)
