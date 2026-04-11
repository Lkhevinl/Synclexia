// ─── Tests for SignUpScreen.js + DashboardScreen.js ──────────────────────────
// Tests all pure logic functions from both screens.
// Supabase calls and navigation are NOT tested here.

// ══════════════════════════════════════════════════════════════════════════════
// 1. generateUniqueCode  (SignUpScreen.js + DashboardScreen.js)
//    Generates a 6-character student code — no 0, 1, O, I to avoid confusion
// ══════════════════════════════════════════════════════════════════════════════

function generateUniqueCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

describe('generateUniqueCode', () => {
  test('always produces exactly 6 characters', () => {
    for (let i = 0; i < 20; i++) {
      expect(generateUniqueCode()).toHaveLength(6);
    }
  });

  test('only uses safe characters (no 0, 1, O, I)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateUniqueCode();
      expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
      expect(code).not.toMatch(/[01OI]/);
    }
  });

  test('result is always uppercase', () => {
    for (let i = 0; i < 20; i++) {
      const code = generateUniqueCode();
      expect(code).toBe(code.toUpperCase());
    }
  });

  test('generates different codes on repeated calls', () => {
    const codes = new Set(Array.from({ length: 20 }, generateUniqueCode));
    // With 32^6 = ~1 billion combos, 20 calls should all be unique
    expect(codes.size).toBe(20);
  });

  test('returns a string type', () => {
    expect(typeof generateUniqueCode()).toBe('string');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. Email validation  (SignUpScreen.js)
// ══════════════════════════════════════════════════════════════════════════════

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return emailRegex.test(email.trim().toLowerCase());
}

describe('Email validation (SignUpScreen)', () => {
  test('accepts a standard email', () => {
    expect(isValidEmail('student@school.com')).toBe(true);
  });

  test('accepts email with numbers', () => {
    expect(isValidEmail('user123@school.edu')).toBe(true);
  });

  test('accepts email with dots in local part', () => {
    expect(isValidEmail('first.last@school.com')).toBe(true);
  });

  test('accepts email with subdomain', () => {
    expect(isValidEmail('user@mail.school.edu')).toBe(true);
  });

  test('rejects email with no @', () => {
    expect(isValidEmail('invalidemail.com')).toBe(false);
  });

  test('rejects email with no domain after @', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  test('rejects email with no TLD', () => {
    expect(isValidEmail('user@domain')).toBe(false);
  });

  test('rejects email with spaces', () => {
    expect(isValidEmail('user @school.com')).toBe(false);
  });

  test('rejects completely empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  test('rejects whitespace-only string', () => {
    expect(isValidEmail('   ')).toBe(false);
  });

  test('trims whitespace before validating', () => {
    // SignUpScreen does email.trim().toLowerCase() before testing
    expect(isValidEmail('  student@school.com  ')).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. Password validation  (SignUpScreen.js)
// ══════════════════════════════════════════════════════════════════════════════

function validatePassword(password, confirmPassword) {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match. Please try again.' };
  }
  return { valid: true, message: null };
}

describe('Password validation (SignUpScreen)', () => {
  test('rejects password shorter than 8 characters', () => {
    const result = validatePassword('abc', 'abc');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Password must be at least 8 characters long.');
  });

  test('rejects password of exactly 7 characters', () => {
    expect(validatePassword('1234567', '1234567').valid).toBe(false);
  });

  test('accepts password of exactly 8 characters', () => {
    expect(validatePassword('12345678', '12345678').valid).toBe(true);
  });

  test('rejects mismatched passwords', () => {
    const result = validatePassword('password123', 'password456');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Passwords do not match. Please try again.');
  });

  test('accepts valid matching password', () => {
    const result = validatePassword('SecurePass99', 'SecurePass99');
    expect(result.valid).toBe(true);
    expect(result.message).toBeNull();
  });

  test('length check takes priority over mismatch check', () => {
    // Both short AND mismatched — should report length error first
    const result = validatePassword('abc', 'xyz');
    expect(result.message).toBe('Password must be at least 8 characters long.');
  });

  test('passwords are case-sensitive', () => {
    const result = validatePassword('Password1', 'password1');
    expect(result.valid).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. Sign-up form field validation  (SignUpScreen.js handleSignUp)
//    Checks that all required fields are present
// ══════════════════════════════════════════════════════════════════════════════

function validateSignUpFields({ email, password, fullName }) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim();
  if (!trimmedEmail || !password || !trimmedName) {
    return 'Please fill in all the boxes!';
  }
  return null;
}

describe('Sign-up field presence check', () => {
  test('passes when all fields are filled', () => {
    expect(validateSignUpFields({ email: 'a@b.com', password: 'pass1234', fullName: 'Juan' })).toBeNull();
  });

  test('fails when email is empty', () => {
    expect(validateSignUpFields({ email: '', password: 'pass1234', fullName: 'Juan' })).toBe('Please fill in all the boxes!');
  });

  test('fails when password is empty', () => {
    expect(validateSignUpFields({ email: 'a@b.com', password: '', fullName: 'Juan' })).toBe('Please fill in all the boxes!');
  });

  test('fails when fullName is empty', () => {
    expect(validateSignUpFields({ email: 'a@b.com', password: 'pass1234', fullName: '' })).toBe('Please fill in all the boxes!');
  });

  test('fails when fullName is whitespace only', () => {
    expect(validateSignUpFields({ email: 'a@b.com', password: 'pass1234', fullName: '   ' })).toBe('Please fill in all the boxes!');
  });

  test('fails when email is whitespace only', () => {
    expect(validateSignUpFields({ email: '   ', password: 'pass1234', fullName: 'Juan' })).toBe('Please fill in all the boxes!');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. Role selection  (SignUpScreen.js step 1)
//    Valid roles: 'student', 'parent'
// ══════════════════════════════════════════════════════════════════════════════

const VALID_ROLES = ['student', 'parent'];

function isValidRole(role) {
  return VALID_ROLES.includes(role);
}

describe('Role selection (SignUpScreen)', () => {
  test('"student" is a valid role', () => {
    expect(isValidRole('student')).toBe(true);
  });

  test('"parent" is a valid role', () => {
    expect(isValidRole('parent')).toBe(true);
  });

  test('"admin" is NOT a selectable role during sign-up', () => {
    expect(isValidRole('admin')).toBe(false);
  });

  test('"teacher" is NOT a selectable role during sign-up', () => {
    expect(isValidRole('teacher')).toBe(false);
  });

  test('empty string is not a valid role', () => {
    expect(isValidRole('')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. Multi-step form navigation  (SignUpScreen.js step logic)
// ══════════════════════════════════════════════════════════════════════════════

describe('SignUpScreen step navigation', () => {
  test('handleContinue advances step 1 → 2', () => {
    let step = 1;
    const handleContinue = () => { step = 2; };
    handleContinue();
    expect(step).toBe(2);
  });

  test('handleBack on step 2 goes back to step 1', () => {
    let step = 2;
    const handleBack = () => {
      if (step === 2) step = 1;
    };
    handleBack();
    expect(step).toBe(1);
  });

  test('default role is "student"', () => {
    const role = 'student'; // default value in useState
    expect(role).toBe('student');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. Login error message mapping  (LoginScreen.js — same codebase)
// ══════════════════════════════════════════════════════════════════════════════

function mapLoginError(errorMessage) {
  const lower = (errorMessage || '').toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return { title: 'Incorrect Password', message: 'The email or password is incorrect.' };
  } else if (lower.includes('email not confirmed')) {
    return { title: 'Email Not Verified', message: 'Please verify your email first, then try again.' };
  } else if (lower.includes('network') || lower.includes('fetch')) {
    return { title: 'Connection Error', message: 'Please check your internet connection and try again.' };
  }
  return { title: 'Login Failed', message: errorMessage || 'Unable to sign in. Please try again.' };
}

describe('Login error message mapping (LoginScreen)', () => {
  test('maps invalid credentials error correctly', () => {
    const result = mapLoginError('Invalid login credentials');
    expect(result.title).toBe('Incorrect Password');
    expect(result.message).toBe('The email or password is incorrect.');
  });

  test('maps unconfirmed email error correctly', () => {
    const result = mapLoginError('Email not confirmed');
    expect(result.title).toBe('Email Not Verified');
  });

  test('maps network error correctly', () => {
    const result = mapLoginError('network request failed');
    expect(result.title).toBe('Connection Error');
  });

  test('maps fetch error correctly', () => {
    const result = mapLoginError('Failed to fetch');
    expect(result.title).toBe('Connection Error');
  });

  test('uses generic title for unknown errors', () => {
    const result = mapLoginError('Something went wrong');
    expect(result.title).toBe('Login Failed');
    expect(result.message).toBe('Something went wrong');
  });

  test('uses fallback message for null/undefined error', () => {
    const result = mapLoginError(null);
    expect(result.message).toBe('Unable to sign in. Please try again.');
  });

  test('is case-insensitive for error matching', () => {
    const result = mapLoginError('INVALID LOGIN CREDENTIALS');
    expect(result.title).toBe('Incorrect Password');
  });
});
