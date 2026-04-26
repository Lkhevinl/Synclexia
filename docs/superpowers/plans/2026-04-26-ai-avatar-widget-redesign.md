# AIAvatarWidget Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the AIAvatarWidget bottom sheet to show a compact arc score chip in the header, a smart personalized Lexi message, and a Strengths / Focus Areas tab switcher.

**Architecture:** All changes are confined to `src/components/AIAvatarWidget.js`. A new pure helper `buildLexiMessage` handles message generation. A new `activeTab` local state drives tab switching. The floating button and all animations are untouched.

**Tech Stack:** React Native, Expo, react-native-svg (already installed), expo-linear-gradient

---

## File Map

| File | Change |
|---|---|
| `src/components/AIAvatarWidget.js` | Main implementation — all changes here |
| `__tests__/AIAvatarWidget_LEXI_MSG.test.js` | New test for `buildLexiMessage` logic |

---

## Task 1: Test + implement `buildLexiMessage`

**Files:**
- Create: `__tests__/AIAvatarWidget_LEXI_MSG.test.js`
- Modify: `src/components/AIAvatarWidget.js` (add helper before component)

- [ ] **Step 1.1: Write the test file**

Create `__tests__/AIAvatarWidget_LEXI_MSG.test.js` with this exact content:

```js
// Test Case: AIAvatarWidget — buildLexiMessage helper
// Verifies all four message branches produce correct personalized output.

function buildLexiMessage(firstName, data) {
  const s = data.strengths;
  const w = data.weaknesses;
  if (s.length > 0 && w.length > 0) {
    const top   = s.slice(0, 2).map(x => x.label);
    const names = top.join(' & ');
    const plural = top.length > 1;
    return `👋 Hi ${firstName}! ${names} ${plural ? 'are' : 'is'} your superpower${plural ? 's' : ''} 💪 Let's give ${w[0].label} some love today!`;
  }
  if (s.length > 0) {
    const top   = s.slice(0, 2).map(x => x.label);
    const names = top.join(' & ');
    const plural = top.length > 1;
    return `👋 Hi ${firstName}! You're crushing it — ${names} ${plural ? 'are' : 'is'} looking great! Keep going! 🌟`;
  }
  if (w.length > 0) {
    return `👋 Hi ${firstName}! Let's keep building — working on ${w[0].label} will make a big difference. You've got this! 💪`;
  }
  return `👋 Hi ${firstName}! Ready to learn something new today? Complete an activity and I'll track your progress! 🚀`;
}

describe('buildLexiMessage', () => {
  test('strengths and weaknesses — names top two strengths and first weakness', () => {
    const data = {
      strengths: [{ label: 'Phonics' }, { label: 'Writing' }],
      weaknesses: [{ label: 'Spelling' }],
    };
    const msg = buildLexiMessage('Alex', data);
    expect(msg).toContain('Phonics & Writing');
    expect(msg).toContain('Spelling');
    expect(msg).toContain('superpowers');
    expect(msg).toContain('Alex');
  });

  test('single strength + weakness — uses singular form', () => {
    const data = {
      strengths: [{ label: 'Reading' }],
      weaknesses: [{ label: 'Spelling' }],
    };
    const msg = buildLexiMessage('Sam', data);
    expect(msg).toContain('Reading');
    expect(msg).toContain('is your superpower');
    expect(msg).not.toContain('superpowers');
    expect(msg).toContain('Spelling');
  });

  test('strengths only — no weakness nudge', () => {
    const data = {
      strengths: [{ label: 'Phonics' }, { label: 'Writing' }],
      weaknesses: [],
    };
    const msg = buildLexiMessage('Lexi', data);
    expect(msg).toContain('crushing it');
    expect(msg).toContain('Phonics & Writing');
    expect(msg).not.toContain('love today');
  });

  test('weaknesses only — encourages focus area', () => {
    const data = {
      strengths: [],
      weaknesses: [{ label: 'Spelling' }],
    };
    const msg = buildLexiMessage('Jordan', data);
    expect(msg).toContain('Spelling');
    expect(msg).toContain('keep building');
  });

  test('no activity — prompts to start', () => {
    const data = { strengths: [], weaknesses: [] };
    const msg = buildLexiMessage('Chris', data);
    expect(msg).toContain('Ready to learn');
    expect(msg).toContain('Chris');
  });

  test('limits to top 2 strengths in message', () => {
    const data = {
      strengths: [{ label: 'Phonics' }, { label: 'Writing' }, { label: 'Reading' }],
      weaknesses: [{ label: 'Spelling' }],
    };
    const msg = buildLexiMessage('Alex', data);
    expect(msg).toContain('Phonics & Writing');
    expect(msg).not.toContain('Reading');
  });
});
```

- [ ] **Step 1.2: Run the test to verify it passes**

```bash
npx jest __tests__/AIAvatarWidget_LEXI_MSG.test.js --no-coverage
```

Expected: All 6 tests **PASS**.

- [ ] **Step 1.3: Add `buildLexiMessage` to the component file**

In `src/components/AIAvatarWidget.js`, after the existing `scoreLabel` line (line 16), add:

```js
const buildLexiMessage = (firstName, data) => {
  const s = data.strengths;
  const w = data.weaknesses;
  if (s.length > 0 && w.length > 0) {
    const top   = s.slice(0, 2).map(x => x.label);
    const names = top.join(' & ');
    const plural = top.length > 1;
    return `👋 Hi ${firstName}! ${names} ${plural ? 'are' : 'is'} your superpower${plural ? 's' : ''} 💪 Let's give ${w[0].label} some love today!`;
  }
  if (s.length > 0) {
    const top   = s.slice(0, 2).map(x => x.label);
    const names = top.join(' & ');
    const plural = top.length > 1;
    return `👋 Hi ${firstName}! You're crushing it — ${names} ${plural ? 'are' : 'is'} looking great! Keep going! 🌟`;
  }
  if (w.length > 0) {
    return `👋 Hi ${firstName}! Let's keep building — working on ${w[0].label} will make a big difference. You've got this! 💪`;
  }
  return `👋 Hi ${firstName}! Ready to learn something new today? Complete an activity and I'll track your progress! 🚀`;
};
```

- [ ] **Step 1.4: Commit**

```bash
git add __tests__/AIAvatarWidget_LEXI_MSG.test.js src/components/AIAvatarWidget.js
git commit -m "feat: add buildLexiMessage helper for smart AI buddy message"
```

---

## Task 2: Add SVG import + arc chip to header

**Files:**
- Modify: `src/components/AIAvatarWidget.js`

- [ ] **Step 2.1: Add SVG import at the top of the file**

In `src/components/AIAvatarWidget.js`, replace:
```js
import { LinearGradient } from 'expo-linear-gradient';
```
with:
```js
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
```

- [ ] **Step 2.2: Add the arc chip JSX inside the panel header**

In `src/components/AIAvatarWidget.js`, find the panel header block. It ends with:
```jsx
              <TouchableOpacity onPress={close} style={styles.closeBtn}>
                <Icon name="x" size="md" color="#90A4AE" />
              </TouchableOpacity>
```

Insert the arc chip **before** that `TouchableOpacity`:
```jsx
              {data && (
                <View style={styles.arcChip}>
                  <Svg width={28} height={28} viewBox="0 0 28 28">
                    <Circle cx={14} cy={14} r={11} fill="none" stroke="#F0F0F0" strokeWidth={3} />
                    <Circle
                      cx={14} cy={14} r={11} fill="none"
                      stroke={color} strokeWidth={3}
                      strokeDasharray={`${Math.round(score / 100 * 69)} 69`}
                      strokeLinecap="round"
                      transform="rotate(-90, 14, 14)"
                    />
                  </Svg>
                  <View>
                    <Text style={[styles.arcChipScore, { color }]}>{score}%</Text>
                    <Text style={styles.arcChipLabel}>{label}</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity onPress={close} style={styles.closeBtn}>
                <Icon name="x" size="md" color="#90A4AE" />
              </TouchableOpacity>
```

- [ ] **Step 2.3: Add arc chip styles**

In `src/components/AIAvatarWidget.js`, inside `StyleSheet.create({...})`, after the `closeBtn` style block, add:

```js
  /* Arc score chip */
  arcChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  arcChipScore: { fontSize: 11, fontWeight: '900' },
  arcChipLabel:  { fontSize: 8, color: '#90A4AE', whiteSpace: 'nowrap' },
```

- [ ] **Step 2.4: Commit**

```bash
git add src/components/AIAvatarWidget.js
git commit -m "feat: add arc score chip to AIAvatarWidget header"
```

---

## Task 3: Add `activeTab` state + reset useEffect

**Files:**
- Modify: `src/components/AIAvatarWidget.js`

- [ ] **Step 3.1: Add `activeTab` state**

In `src/components/AIAvatarWidget.js`, find the existing state declarations block (lines 70–72):
```js
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data,    setData]    = useState(null);
```

Add `activeTab` on the next line:
```js
  const [visible,    setVisible]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [data,       setData]       = useState(null);
  const [activeTab,  setActiveTab]  = useState('strengths');
```

- [ ] **Step 3.2: Add useEffect to reset tab when data loads**

In `src/components/AIAvatarWidget.js`, find the existing `useEffect` that resets data (lines 74–77):
```js
  // Reset cached data whenever the target student changes (parent switching children)
  useEffect(() => {
    setData(null);
  }, [targetId]);
```

Add a new `useEffect` directly after it:
```js
  useEffect(() => {
    if (!data) return;
    setActiveTab(data.strengths.length > 0 ? 'strengths' : 'focus');
  }, [data]);
```

- [ ] **Step 3.3: Commit**

```bash
git add src/components/AIAvatarWidget.js
git commit -m "feat: add activeTab state for AIAvatarWidget tab switcher"
```

---

## Task 4: Smart Lexi message + move session meta

**Files:**
- Modify: `src/components/AIAvatarWidget.js`

- [ ] **Step 4.1: Replace static ChatBubble text**

In `src/components/AIAvatarWidget.js`, find:
```jsx
                {/* Chat bubble greeting */}
                <ChatBubble
                  text={`Hi ${firstName}! Here's your progress today 👇`}
                />
```

Replace with:
```jsx
                {/* Chat bubble greeting */}
                <ChatBubble
                  text={buildLexiMessage(firstName, data)}
                />
```

- [ ] **Step 4.2: Move session meta below the bubble**

In `src/components/AIAvatarWidget.js`, find the score row block and its session meta line:
```jsx
                {/* ── Score row ── */}
                <View style={styles.scoreRow}>
                  <View style={[styles.scoreCircle, { borderColor: color }]}>
                    <Text style={[styles.scoreNum, { color }]}>{score}</Text>
                    <Text style={[styles.scorePct, { color }]}>%</Text>
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
                    <ProgressBar value={score} color={color} />
                    <Text style={styles.sessionMeta}>
                      {data.totalSessions} session{data.totalSessions !== 1 ? 's' : ''} •{' '}
                      {data.activitiesPracticed} activit{data.activitiesPracticed !== 1 ? 'ies' : 'y'} practised
                    </Text>
                  </View>
                </View>
```

Replace the **entire score row block** with just the session meta line (standalone):
```jsx
                <Text style={styles.sessionMeta}>
                  {data.totalSessions} session{data.totalSessions !== 1 ? 's' : ''} •{' '}
                  {data.activitiesPracticed} activit{data.activitiesPracticed !== 1 ? 'ies' : 'y'} practised
                </Text>
```

- [ ] **Step 4.3: Commit**

```bash
git add src/components/AIAvatarWidget.js
git commit -m "feat: use smart Lexi message and move session meta below bubble"
```

---

## Task 5: Replace sections with tabs

**Files:**
- Modify: `src/components/AIAvatarWidget.js`

- [ ] **Step 5.1: Replace the strengths + weaknesses sections with tab UI**

In `src/components/AIAvatarWidget.js`, find the `hasActivity` conditional block:
```jsx
                {hasActivity ? (
                  <>
                    {/* ── Strengths ── */}
                    {data.strengths.length > 0 && (
                      <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                          <Icon name="check-circle" size="sm" color="#4CAF50" />
                          <Text style={styles.sectionTitle}>  Your Strengths</Text>
                        </View>
                        {data.strengths.slice(0, 3).map(item => (
                          <View key={item.activity} style={styles.itemRow}>
                            <View style={[styles.itemIconWrap, { backgroundColor: '#E8F5E9' }]}>
                              <Icon name={item.icon} size="sm" color="#4CAF50" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.itemLabel}>{item.label}</Text>
                              <ProgressBar value={item.avgAccuracy} color="#4CAF50" />
                            </View>
                            <Text style={[styles.itemPct, { color: '#4CAF50' }]}>{item.avgAccuracy}%</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* ── Weaknesses ── */}
                    {data.weaknesses.length > 0 && (
                      <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                          <Icon name="x-circle" size="sm" color="#EF5350" />
                          <Text style={styles.sectionTitle}>  Areas to Focus</Text>
                        </View>
                        {data.weaknesses.slice(0, 3).map(item => (
                          <View key={item.activity} style={styles.itemRow}>
                            <View style={[styles.itemIconWrap, { backgroundColor: '#FFF3E0' }]}>
                              <Icon name={item.icon} size="sm" color="#FF9800" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.itemLabel}>{item.label}</Text>
                              <ProgressBar value={item.avgAccuracy} color="#FF9800" />
                            </View>
                            <Text style={[styles.itemPct, { color: '#FF9800' }]}>{item.avgAccuracy}%</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.emptyWrap}>
                    <Icon name="target" size="xl" color="#E8927C" />
                    <Text style={styles.emptyText}>
                      Complete some activities and I'll track your strengths and focus areas!
                    </Text>
                  </View>
                )}
```

Replace it entirely with:
```jsx
                {hasActivity ? (
                  <>
                    {/* ── Tabs ── */}
                    <View style={styles.tabRow}>
                      <TouchableOpacity
                        style={[styles.tab, activeTab === 'strengths' ? styles.tabActiveGreen : styles.tabInactive]}
                        onPress={() => setActiveTab('strengths')}
                      >
                        <Text style={activeTab === 'strengths' ? styles.tabTextActive : styles.tabTextInactive}>
                          ✅ Strengths
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.tab, activeTab === 'focus' ? styles.tabActiveOrange : styles.tabInactive]}
                        onPress={() => setActiveTab('focus')}
                      >
                        <Text style={activeTab === 'focus' ? styles.tabTextActive : styles.tabTextInactive}>
                          ⚠️ Focus Areas
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* ── Strengths tab content ── */}
                    {activeTab === 'strengths' && data.strengths.length > 0 && (
                      <View style={styles.section}>
                        {data.strengths.slice(0, 3).map(item => (
                          <View key={item.activity} style={styles.itemRow}>
                            <View style={[styles.itemIconWrap, { backgroundColor: '#E8F5E9' }]}>
                              <Icon name={item.icon} size="sm" color="#4CAF50" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.itemLabel}>{item.label}</Text>
                              <ProgressBar value={item.avgAccuracy} color="#4CAF50" />
                            </View>
                            <Text style={[styles.itemPct, { color: '#4CAF50' }]}>{item.avgAccuracy}%</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* ── Focus tab content ── */}
                    {activeTab === 'focus' && data.weaknesses.length > 0 && (
                      <View style={styles.section}>
                        {data.weaknesses.slice(0, 3).map(item => (
                          <View key={item.activity} style={styles.itemRow}>
                            <View style={[styles.itemIconWrap, { backgroundColor: '#FFF3E0' }]}>
                              <Icon name={item.icon} size="sm" color="#FF9800" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.itemLabel}>{item.label}</Text>
                              <ProgressBar value={item.avgAccuracy} color="#FF9800" />
                            </View>
                            <Text style={[styles.itemPct, { color: '#FF9800' }]}>{item.avgAccuracy}%</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.emptyWrap}>
                    <Icon name="target" size="xl" color="#E8927C" />
                    <Text style={styles.emptyText}>
                      Complete some activities and I'll track your strengths and focus areas!
                    </Text>
                  </View>
                )}
```

- [ ] **Step 5.2: Add tab styles inside `StyleSheet.create`**

After the `arcChipLabel` style you added in Task 2, add:

```js
  /* Tabs */
  tabRow:          { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab:             { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10 },
  tabActiveGreen:  { backgroundColor: '#4CAF50', elevation: 3, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  tabActiveOrange: { backgroundColor: '#FF9800', elevation: 3, shadowColor: '#FF9800', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  tabInactive:     { backgroundColor: '#F5F5F5' },
  tabTextActive:   { fontSize: 12, fontWeight: '800', color: '#fff' },
  tabTextInactive: { fontSize: 12, fontWeight: '700', color: '#90A4AE' },
```

- [ ] **Step 5.3: Commit**

```bash
git add src/components/AIAvatarWidget.js
git commit -m "feat: add Strengths/Focus Areas tab switcher to AIAvatarWidget"
```

---

## Task 6: Remove obsolete styles

**Files:**
- Modify: `src/components/AIAvatarWidget.js`

- [ ] **Step 6.1: Remove the score row styles**

In `src/components/AIAvatarWidget.js`, inside `StyleSheet.create`, find and **delete** these style entries completely:

```js
  /* Score row */
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FAF5F1',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNum: { fontSize: 24, fontWeight: 'bold' },
  scorePct: { fontSize: 13, fontWeight: '700', color: '#999' },
  scoreLabel: { fontSize: 13, fontWeight: '700' },
```

- [ ] **Step 6.2: Remove the section title styles**

In `src/components/AIAvatarWidget.js`, inside `StyleSheet.create`, find and **delete** these two entries:

```js
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#455A64', letterSpacing: 0.2 },
```

- [ ] **Step 6.3: Verify no dangling style references**

Run a search to confirm none of the removed keys are still used in JSX:

```bash
grep -n "scoreRow\|scoreCircle\|scoreNum\|scorePct\|scoreLabel\|sectionTitleRow\|sectionTitle" src/components/AIAvatarWidget.js
```

Expected: **No output** (zero matches).

- [ ] **Step 6.4: Commit**

```bash
git add src/components/AIAvatarWidget.js
git commit -m "refactor: remove obsolete score row and section title styles from AIAvatarWidget"
```

---

## Task 7: Verify + final commit

**Files:**
- `__tests__/AIAvatarWidget_LEXI_MSG.test.js`
- `src/components/AIAvatarWidget.js`

- [ ] **Step 7.1: Run the Lexi message tests**

```bash
npx jest __tests__/AIAvatarWidget_LEXI_MSG.test.js --no-coverage
```

Expected: All 6 tests **PASS**.

- [ ] **Step 7.2: Run the full test suite**

```bash
npx jest --no-coverage 2>&1 | tail -20
```

Expected: No new failures introduced (existing passing tests still pass).

- [ ] **Step 7.3: Acceptance criteria check**

Verify each item manually in the running app (Expo Go or simulator):

- [ ] Arc chip visible in header once data loads — color matches score (green ≥75, orange ≥50, red <50)
- [ ] Arc chip hidden before data loads (loading spinner state)
- [ ] Lexi bubble never shows "Here's your progress today 👇"
- [ ] Lexi message names actual strength/weakness labels from data
- [ ] Strengths tab is green when active; Focus Areas tab is orange when active
- [ ] Tapping a tab switches content without closing the sheet
- [ ] Default tab is Strengths (or Focus Areas if student has no strengths)
- [ ] Session meta appears below the chat bubble (not inside a score row)
- [ ] Loading state, error/retry state, and empty state are unchanged
- [ ] Floating owl button animations are unchanged
