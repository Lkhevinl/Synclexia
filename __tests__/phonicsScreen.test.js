// ─── Tests for src/screens/students/PhonicsScreen.js ─────────────────────────
// Tests the JP_GROUPS data structure and pure logic functions.
// UI rendering is NOT tested here (requires device/emulator).

// ══════════════════════════════════════════════════════════════════════════════
// JP_GROUPS data  — copied here for isolation (no native module imports needed)
// ══════════════════════════════════════════════════════════════════════════════

const JP_GROUPS = [
  {
    name: 'Group 1', mascot: '🦉',
    heroBg: ['#FF6B6B', '#FF8E53'], shadowColor: '#E05440',
    letters: [
      { letter: 's', emoji: '🐍', word: 'snake', sound: 'ssss' },
      { letter: 'a', emoji: '🐜', word: 'ant',   sound: 'a-a-a' },
      { letter: 't', emoji: '⏰', word: 'tick',   sound: 't-t-t' },
      { letter: 'i', emoji: '🦟', word: 'itch',   sound: 'i-i-i' },
      { letter: 'p', emoji: '💨', word: 'puff',   sound: 'p-p-p' },
      { letter: 'n', emoji: '🎵', word: 'hum',    sound: 'nnn' },
    ],
  },
  {
    name: 'Group 2', mascot: '🐱',
    heroBg: ['#FF8C69', '#E8572A'], shadowColor: '#C94A20',
    letters: [
      { letter: 'ck', emoji: '🕰️', word: 'clock', sound: 'ck-ck' },
      { letter: 'e',  emoji: '🥚', word: 'egg',   sound: 'e-e-e' },
      { letter: 'h',  emoji: '🐕', word: 'pant',  sound: 'hhh' },
      { letter: 'r',  emoji: '🤖', word: 'robot', sound: 'rrr' },
      { letter: 'm',  emoji: '🍰', word: 'mmm',   sound: 'mmm' },
      { letter: 'd',  emoji: '🥁', word: 'drum',  sound: 'd-d-d' },
    ],
  },
  {
    name: 'Group 3', mascot: '🐘',
    heroBg: ['#51CF66', '#2F9E44'], shadowColor: '#237032',
    letters: [
      { letter: 'g', emoji: '🚿', word: 'gurgle',   sound: 'g-g-g' },
      { letter: 'o', emoji: '🍊', word: 'orange',   sound: 'o-o-o' },
      { letter: 'u', emoji: '☂️', word: 'umbrella', sound: 'u-u-u' },
      { letter: 'l', emoji: '🍭', word: 'lolly',    sound: 'lll' },
      { letter: 'f', emoji: '🌬️', word: 'fan',      sound: 'fff' },
      { letter: 'b', emoji: '⚽', word: 'ball',     sound: 'b-b-b' },
    ],
  },
  {
    name: 'Group 4', mascot: '🌟',
    heroBg: ['#FCC419', '#E67700'], shadowColor: '#C96000',
    letters: [
      { letter: 'ai', emoji: '🌧️', word: 'rain',  sound: 'ai-ai' },
      { letter: 'j',  emoji: '🍮', word: 'jelly', sound: 'j-j-j' },
      { letter: 'oa', emoji: '⛵', word: 'boat',  sound: 'oa-oa' },
      { letter: 'ie', emoji: '🔭', word: 'spy',   sound: 'ie-ie' },
      { letter: 'ee', emoji: '🐭', word: 'squeak',sound: 'eee' },
      { letter: 'or', emoji: '⛈️', word: 'storm', sound: 'or-or' },
    ],
  },
  {
    name: 'Group 5', mascot: '🦓',
    heroBg: ['#748FFC', '#4263EB'], shadowColor: '#3451B2',
    letters: [
      { letter: 'z',  emoji: '🐝', word: 'buzz',   sound: 'zzz' },
      { letter: 'w',  emoji: '💨', word: 'wind',   sound: 'www' },
      { letter: 'ng', emoji: '🔔', word: 'ring',   sound: 'ng-ng' },
      { letter: 'v',  emoji: '🧹', word: 'vacuum', sound: 'vvv' },
      { letter: 'oo', emoji: '🦉', word: 'hoot',   sound: 'oo-oo' },
    ],
  },
  {
    name: 'Group 6', mascot: '🦊',
    heroBg: ['#CC5DE8', '#9C36B5'], shadowColor: '#7A2898',
    letters: [
      { letter: 'y',  emoji: '🦬', word: 'yawn',  sound: 'yyy' },
      { letter: 'x',  emoji: '🩻', word: 'x-ray', sound: 'x-x-x' },
      { letter: 'ch', emoji: '🚂', word: 'chug',  sound: 'ch-ch' },
      { letter: 'sh', emoji: '🤫', word: 'shh',   sound: 'shh' },
      { letter: 'th', emoji: '😛', word: 'this',  sound: 'th-th' },
    ],
  },
  {
    name: 'Group 7', mascot: '🦜',
    heroBg: ['#20C997', '#0CA678'], shadowColor: '#087F5B',
    letters: [
      { letter: 'qu', emoji: '🦆', word: 'quack', sound: 'qu-qu' },
      { letter: 'ou', emoji: '🤕', word: 'ouch',  sound: 'ou-ou' },
      { letter: 'oi', emoji: '🫕', word: 'boil',  sound: 'oi-oi' },
      { letter: 'ue', emoji: '🌤️', word: 'blue',  sound: 'ue-ue' },
      { letter: 'er', emoji: '🤔', word: 'err',   sound: 'er-er' },
      { letter: 'ar', emoji: '🏴‍☠️', word: 'arr',  sound: 'ar-ar' },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// 1. JP_GROUPS structure
// ══════════════════════════════════════════════════════════════════════════════

describe('JP_GROUPS structure', () => {
  test('has exactly 7 groups', () => {
    expect(JP_GROUPS).toHaveLength(7);
  });

  test('each group has a name, mascot, heroBg, shadowColor and letters', () => {
    JP_GROUPS.forEach(group => {
      expect(group).toHaveProperty('name');
      expect(group).toHaveProperty('mascot');
      expect(group).toHaveProperty('heroBg');
      expect(group).toHaveProperty('shadowColor');
      expect(group).toHaveProperty('letters');
    });
  });

  test('group names are "Group 1" through "Group 7"', () => {
    JP_GROUPS.forEach((group, i) => {
      expect(group.name).toBe(`Group ${i + 1}`);
    });
  });

  test('heroBg is always an array of exactly 2 colour strings', () => {
    JP_GROUPS.forEach(group => {
      expect(Array.isArray(group.heroBg)).toBe(true);
      expect(group.heroBg).toHaveLength(2);
      group.heroBg.forEach(c => expect(typeof c).toBe('string'));
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. JP_GROUPS letter cards
// ══════════════════════════════════════════════════════════════════════════════

describe('JP_GROUPS letter cards', () => {
  test('every group has between 5 and 6 letters', () => {
    JP_GROUPS.forEach(group => {
      expect(group.letters.length).toBeGreaterThanOrEqual(5);
      expect(group.letters.length).toBeLessThanOrEqual(6);
    });
  });

  test('every letter card has letter, emoji, word and sound fields', () => {
    JP_GROUPS.forEach(group => {
      group.letters.forEach(letter => {
        expect(letter).toHaveProperty('letter');
        expect(letter).toHaveProperty('emoji');
        expect(letter).toHaveProperty('word');
        expect(letter).toHaveProperty('sound');
      });
    });
  });

  test('no letter card has an empty letter string', () => {
    JP_GROUPS.forEach(group => {
      group.letters.forEach(item => {
        expect(item.letter.length).toBeGreaterThan(0);
      });
    });
  });

  test('no letter card has an empty word string', () => {
    JP_GROUPS.forEach(group => {
      group.letters.forEach(item => {
        expect(item.word.length).toBeGreaterThan(0);
      });
    });
  });

  test('total letter count across all groups is correct (40)', () => {
    const total = JP_GROUPS.reduce((sum, g) => sum + g.letters.length, 0);
    expect(total).toBe(40);
  });

  test('Group 1 contains s, a, t, i, p, n', () => {
    const letters = JP_GROUPS[0].letters.map(l => l.letter);
    expect(letters).toEqual(['s', 'a', 't', 'i', 'p', 'n']);
  });

  test('Group 5 has 5 letters (not 6)', () => {
    expect(JP_GROUPS[4].letters).toHaveLength(5);
  });

  test('Group 6 has 5 letters (not 6)', () => {
    expect(JP_GROUPS[5].letters).toHaveLength(5);
  });

  test('all letter values are lowercase strings', () => {
    JP_GROUPS.forEach(group => {
      group.letters.forEach(item => {
        expect(item.letter).toBe(item.letter.toLowerCase());
      });
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. switchGroup logic — simply updates groupIdx (0-based index)
// ══════════════════════════════════════════════════════════════════════════════

describe('switchGroup index bounds', () => {
  test('index 0 selects Group 1', () => {
    expect(JP_GROUPS[0].name).toBe('Group 1');
  });

  test('index 6 selects Group 7 (last group)', () => {
    expect(JP_GROUPS[6].name).toBe('Group 7');
  });

  test('valid indices are 0 through 6', () => {
    for (let i = 0; i < 7; i++) {
      expect(JP_GROUPS[i]).toBeDefined();
    }
  });

  test('index 7 is out of bounds (undefined)', () => {
    expect(JP_GROUPS[7]).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. showToast message format  — "${emoji} ${sound}… like a ${word}!"
// ══════════════════════════════════════════════════════════════════════════════

function buildToastMessage(item) {
  return `${item.emoji} ${item.sound}… like a ${item.word}!`;
}

describe('toast message format', () => {
  test('formats correctly for letter "s"', () => {
    const item = { emoji: '🐍', sound: 'ssss', word: 'snake' };
    expect(buildToastMessage(item)).toBe('🐍 ssss… like a snake!');
  });

  test('formats correctly for digraph "ch"', () => {
    const item = { emoji: '🚂', sound: 'ch-ch', word: 'chug' };
    expect(buildToastMessage(item)).toBe('🚂 ch-ch… like a chug!');
  });

  test('format includes emoji, sound and word', () => {
    JP_GROUPS[0].letters.forEach(item => {
      const msg = buildToastMessage(item);
      expect(msg).toContain(item.emoji);
      expect(msg).toContain(item.sound);
      expect(msg).toContain(item.word);
    });
  });

  test('message always ends with "!"', () => {
    JP_GROUPS.forEach(group => {
      group.letters.forEach(item => {
        expect(buildToastMessage(item).endsWith('!')).toBe(true);
      });
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. Session throttle  — 60-second gate on logSession calls in handleCardPress
// ══════════════════════════════════════════════════════════════════════════════

function shouldLogSession(lastLogTime, now) {
  return now - lastLogTime >= 60000;
}

describe('PhonicsScreen session throttle', () => {
  test('logs when lastLog is 0 (first ever tap)', () => {
    expect(shouldLogSession(0, Date.now())).toBe(true);
  });

  test('does NOT log if only 30 seconds have passed', () => {
    const now = Date.now();
    expect(shouldLogSession(now - 30000, now)).toBe(false);
  });

  test('logs if exactly 60 seconds have passed', () => {
    const now = Date.now();
    expect(shouldLogSession(now - 60000, now)).toBe(true);
  });

  test('logs if more than 60 seconds have passed', () => {
    const now = Date.now();
    expect(shouldLogSession(now - 120000, now)).toBe(true);
  });

  test('does NOT log if 59 seconds have passed', () => {
    const now = Date.now();
    expect(shouldLogSession(now - 59000, now)).toBe(false);
  });
});
