# AIAvatarWidget Redesign — Design Spec
**Date:** 2026-04-26  
**Scope:** `src/components/AIAvatarWidget.js`  
**Goals:** Improve layout & information hierarchy; improve content & messaging

---

## 1. Problem Statement

The current widget has two issues:

1. **Layout** — The large score row (circle + progress bar + label) dominates the sheet and pushes skill rows down, reducing how much the student sees at a glance. Strengths and Focus Areas are shown together, creating visual overload.
2. **Messaging** — Lexi's greeting bubble says `"Here's your progress today 👇"` — generic filler that wastes the one moment of direct communication with the student.

---

## 2. Design Decisions

### 2.1 Score — Arc Chip in Header

**What changes:** The standalone score row (large circle + flat progress bar + label) is removed. In its place, a compact arc-gauge chip is added to the right side of the panel header, between the Lexi name block and the close button.

**Chip anatomy:**
- Small SVG arc (28×28 px) showing score progress as a colored stroke (green/orange/red based on existing `scoreColor` helper)
- Score number (`81%`) in bold next to the arc
- `scoreLabel` text (`Strong Learner!`) in small muted text below the number
- Chip background: `#F9F9F9`, border `1px solid #F0F0F0`, border-radius `20px`, padding `5px 10px 5px 6px`

**Why:** Frees a full content block of vertical space without hiding the score — it stays visible at all times in the header.

### 2.2 Smart Lexi Message

**What changes:** The `ChatBubble` text is no longer a static string. It is generated dynamically from `data` using a new helper `buildLexiMessage(firstName, data)`.

**Message logic:**
- If `data.strengths.length > 0` and `data.weaknesses.length > 0`:  
  `"👋 Hi {firstName}! {strength1} & {strength2} are your superpowers 💪 Let's give {weakness1} some love today!"`  
  (Uses `item.label` from strengths/weaknesses arrays.)
- If only strengths (no weaknesses):  
  `"👋 Hi {firstName}! You're crushing it — {strength1} and {strength2} are looking great! Keep going! 🌟"`
- If only weaknesses (no strengths):  
  `"👋 Hi {firstName}! Let's keep building — working on {weakness1} will make a big difference. You've got this! 💪"`
- If no activity data (`!hasActivity`):  
  `"👋 Hi {firstName}! Ready to learn something new today? Complete an activity and I'll track your progress! 🚀"`

**Why:** Makes Lexi feel like a real learning buddy — every message is specific to the student's actual data.

### 2.3 Session Meta — Moved Below Bubble

**What changes:** The session meta line (`148 sessions · 5 activities practised`) moves from inside the score row to below the chat bubble tail, in its own small muted text line.

**Why:** It was crowded next to the score. Below the bubble it reads as supporting context without competing with the greeting.

### 2.4 Tabs — Strengths / Focus Areas

**What changes:** The two sections (Strengths, Weaknesses) are no longer both visible simultaneously. A two-tab row replaces the section headers:

- Tab 1: `✅ Strengths` — active state: filled green background (`#4CAF50`), white text, shadow. Inactive: `#F5F5F5` bg, muted text.
- Tab 2: `⚠️ Focus Areas` — active state: filled orange background (`#FF9800`), white text, shadow. Inactive: `#F5F5F5` bg, muted text.

**Default tab:** `strengths`. If `data.strengths.length === 0` but `data.weaknesses.length > 0`, default to `focus`.

**State:** One new local state variable `activeTab` (`'strengths' | 'focus'`), initialized in the existing component. No external state changes.

**Rendering:** The skill rows beneath the tabs render only the active tab's data. Existing `ProgressBar` component and `itemRow` styles are reused unchanged.

**Why:** Reduces cognitive load — student sees one category at a time. Particularly important for dyslexic learners who benefit from reduced visual noise.

---

## 3. What Does NOT Change

- Floating avatar button (owl emoji, bounce animation, AI badge, glow ring) — unchanged
- `open()` / `close()` animations — unchanged
- `ProgressBar` sub-component — unchanged
- `ChatBubble` sub-component markup — unchanged (only the text content changes)
- "View Full Report" button — unchanged
- Loading state — unchanged
- Error/retry state — unchanged
- `analyzeStudentProfile` call and data shape — unchanged
- `scoreColor` / `scoreLabel` helpers — unchanged, reused in chip

---

## 4. New Helper

```js
function buildLexiMessage(firstName, data) {
  const s = data.strengths;
  const w = data.weaknesses;
  if (s.length > 0 && w.length > 0) {
    const names = s.slice(0, 2).map(x => x.label).join(' & ');
    return `👋 Hi ${firstName}! ${names} ${s.length > 1 ? 'are' : 'is'} your superpower${s.length > 1 ? 's' : ''} 💪 Let's give ${w[0].label} some love today!`;
  }
  if (s.length > 0) {
    const names = s.slice(0, 2).map(x => x.label).join(' & ');
    return `👋 Hi ${firstName}! You're crushing it — ${names} ${s.length > 1 ? 'are' : 'is'} looking great! Keep going! 🌟`;
  }
  if (w.length > 0) {
    return `👋 Hi ${firstName}! Let's keep building — working on ${w[0].label} will make a big difference. You've got this! 💪`;
  }
  return `👋 Hi ${firstName}! Ready to learn something new today? Complete an activity and I'll track your progress! 🚀`;
}
```

---

## 5. New State

```js
const [activeTab, setActiveTab] = useState('strengths'); // 'strengths' | 'focus'
```

Reset `activeTab` via a `useEffect` that watches `data`:
```js
useEffect(() => {
  if (!data) return;
  setActiveTab(data.strengths.length > 0 ? 'strengths' : 'focus');
}, [data]);
```

**Tabs only render when `hasActivity` is true** — same guard as the existing strengths/weaknesses block. When `!hasActivity`, the empty state view renders instead (no tabs shown).

---

## 6. Styles — New & Changed

| Style key | Change |
|---|---|
| `scoreRow` | **Removed** — replaced by chip in header |
| `scoreCircle`, `scoreNum`, `scorePct`, `scoreLabel` | **Removed** |
| `scorePct` (header chip) | **Added** — arc chip container in header |
| `sessionMeta` | Moved out of score row; now standalone below bubble |
| `tabRow` | **Added** — `flexDirection: 'row'`, `gap: 8`, `marginBottom: 14` |
| `tab` | **Added** — base tab style (flex:1, borderRadius:10, padding:8) |
| `tabActive` | **Added** — filled bg, white text, elevation shadow |
| `tabInactive` | **Added** — `#F5F5F5` bg, muted text |
| `sectionTitleRow`, `sectionTitle` | **Removed** — replaced by tabs |

All other existing styles are unchanged.

---

## 7. Acceptance Criteria

- [ ] Score chip visible in header at all times while sheet is open
- [ ] Arc stroke color matches `scoreColor(score)` (green/orange/red)
- [ ] Lexi message is never the old static string
- [ ] Message correctly picks the right template based on strengths/weaknesses presence
- [ ] Strengths tab shows green active state; Focus Areas tab shows orange active state
- [ ] Default tab is `strengths` unless student has no strengths
- [ ] Tapping a tab switches content without closing the sheet
- [ ] Session meta appears below the chat bubble
- [ ] No regressions in loading state, error state, or empty state
- [ ] Floating button and all animations unchanged
