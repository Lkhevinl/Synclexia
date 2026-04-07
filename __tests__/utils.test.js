// ─── Synclexia Unit Tests ─────────────────────────────────────────────────────
// Tests for pure logic functions extracted from your app screens.
// Run with: npm test

// ══════════════════════════════════════════════════════════════════════════════
// 1. generateUniqueCode  (from SignUpScreen & DashboardScreen)
//    Generates a 6-character alphanumeric code for students
// ══════════════════════════════════════════════════════════════════════════════

function generateUniqueCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

describe('generateUniqueCode', () => {
  test('produces a 6-character string', () => {
    const code = generateUniqueCode();
    expect(code).toHaveLength(6);
  });

  test('only contains allowed characters (no 0, 1, O, I)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateUniqueCode();
      expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
      expect(code).not.toMatch(/[01OI]/);
    }
  });

  test('two codes are (almost always) different', () => {
    const a = generateUniqueCode();
    const b = generateUniqueCode();
    // There is a 1 in 32^6 chance this fails — effectively impossible
    expect(a).not.toBe(b);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. shuffle  (from SpellingScreen)
//    Fisher-Yates shuffle used to randomise letter tiles
// ══════════════════════════════════════════════════════════════════════════════

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

describe('shuffle', () => {
  test('returns an array of the same length', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  test('contains all the same elements as the original', () => {
    const original = ['a', 'p', 'p', 'l', 'e'];
    const result = shuffle(original);
    expect(result.sort()).toEqual([...original].sort());
  });

  test('does not modify the original array', () => {
    const original = [1, 2, 3];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  test('works on an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  test('works on a single-element array', () => {
    expect(shuffle(['x'])).toEqual(['x']);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. buildTiles  (from SpellingScreen)
//    Splits a word into shuffled letter tiles, each with a unique ID
// ══════════════════════════════════════════════════════════════════════════════

function buildTiles(word) {
  return shuffle(word.split('').map((ch, i) => ({ id: `${ch}-${i}`, letter: ch })));
}

describe('buildTiles', () => {
  test('produces the same number of tiles as letters in the word', () => {
    expect(buildTiles('cat')).toHaveLength(3);
    expect(buildTiles('apple')).toHaveLength(5);
  });

  test('each tile has an id and a letter property', () => {
    const tiles = buildTiles('dog');
    tiles.forEach(tile => {
      expect(tile).toHaveProperty('id');
      expect(tile).toHaveProperty('letter');
    });
  });

  test('tile ids are unique even for duplicate letters', () => {
    const tiles = buildTiles('apple'); // two p's
    const ids = tiles.map(t => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(tiles.length);
  });

  test('all letters from the word are present in the tiles', () => {
    const word = 'spelling';
    const tiles = buildTiles(word);
    const letters = tiles.map(t => t.letter).sort();
    expect(letters).toEqual(word.split('').sort());
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. Email validation regex  (from SignUpScreen)
//    Validates email format before allowing sign up
// ══════════════════════════════════════════════════════════════════════════════

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

describe('Email validation', () => {
  test('accepts a valid email', () => {
    expect(emailRegex.test('student@school.com')).toBe(true);
  });

  test('accepts email with subdomains', () => {
    expect(emailRegex.test('user@mail.school.edu')).toBe(true);
  });

  test('rejects email with no @', () => {
    expect(emailRegex.test('invalidemail.com')).toBe(false);
  });

  test('rejects email with no domain', () => {
    expect(emailRegex.test('user@')).toBe(false);
  });

  test('rejects email with spaces', () => {
    expect(emailRegex.test('user @school.com')).toBe(false);
  });

  test('rejects completely empty string', () => {
    expect(emailRegex.test('')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. Session throttle logic  (from PhonicsScreen handleCardPress)
//    Prevents logging a session more than once per 60 seconds
// ══════════════════════════════════════════════════════════════════════════════

function shouldLogSession(lastLogTime, now) {
  return now - lastLogTime >= 60000;
}

describe('Session throttle (60-second gate)', () => {
  test('allows logging when no previous log (lastLog = 0)', () => {
    expect(shouldLogSession(0, Date.now())).toBe(true);
  });

  test('blocks logging if less than 60 seconds have passed', () => {
    const now = Date.now();
    const lastLog = now - 30000; // 30 seconds ago
    expect(shouldLogSession(lastLog, now)).toBe(false);
  });

  test('allows logging if exactly 60 seconds have passed', () => {
    const now = Date.now();
    const lastLog = now - 60000;
    expect(shouldLogSession(lastLog, now)).toBe(true);
  });

  test('allows logging if more than 60 seconds have passed', () => {
    const now = Date.now();
    const lastLog = now - 90000; // 90 seconds ago
    expect(shouldLogSession(lastLog, now)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. Password validation  (from SignUpScreen)
// ══════════════════════════════════════════════════════════════════════════════

function validatePassword(password, confirmPassword) {
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (password !== confirmPassword) return 'Passwords do not match. Please try again.';
  return null; // null = no error
}

describe('Password validation', () => {
  test('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('abc', 'abc')).toBe('Password must be at least 8 characters long.');
  });

  test('rejects mismatched passwords', () => {
    expect(validatePassword('password123', 'password456')).toBe('Passwords do not match. Please try again.');
  });

  test('accepts a valid matching password of 8+ characters', () => {
    expect(validatePassword('secure99', 'secure99')).toBeNull();
  });

  test('accepts exactly 8 characters', () => {
    expect(validatePassword('12345678', '12345678')).toBeNull();
  });
});
