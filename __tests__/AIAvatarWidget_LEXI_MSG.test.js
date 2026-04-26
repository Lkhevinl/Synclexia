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
