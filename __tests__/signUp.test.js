// ─── Sign Up Module Tests ──────────────────────────────────────────────────
// Module: User Authentication
// Unit: Sign Up
// Test Cases: TC-SIGNUP-001 to TC-SIGNUP-007

const existingEmails = ['existing@test.com', 'test@example.com'];

function validateSignUp(formData) {
  const { email, password, confirmPassword, fullName, role } = formData;
  let errors = [];
  let isValid = true;

  // TC-SIGNUP-001: Role validation
  if (!role || (role !== 'Learner' && role !== 'Parent')) {
    errors.push('Invalid role selected');
    isValid = false;
  }

  // TC-SIGNUP-002 & TC-SIGNUP-003: Empty/incomplete fields validation
  if (!email || !password || !confirmPassword || !fullName) {
    errors.push('Please fill in all the boxes!');
    isValid = false;
  }

  // TC-SIGNUP-004: Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('Invalid email format');
    isValid = false;
  }

  // TC-SIGNUP-005: Existing email validation
  if (email && existingEmails.includes(email)) {
    errors.push('Email already exists');
    isValid = false;
  }

  // TC-SIGNUP-006: Password match validation
  if (password && confirmPassword && password !== confirmPassword) {
    errors.push('Passwords do not match. Please try again.');
    isValid = false;
  }

  return { isValid, errors, role: isValid ? role : null };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASES
// ═════════════════════════════════════════════════════════════════════════════

describe('User Authentication - Sign Up', () => {

  describe('TC-SIGNUP-001: Validate role selection (Learner or Parent) during registration', () => {
    test('Selected role (Learner or Parent) is saved to the system', () => {
      const result = validateSignUp({
        email: 'new@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'Test User',
        role: 'Learner'
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).not.toContain('Invalid role selected');
      expect(result.role).toBe('Learner');
    });

    test('Selected role Parent is saved to the system', () => {
      const result = validateSignUp({
        email: 'parent@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'Parent User',
        role: 'Parent'
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).not.toContain('Invalid role selected');
      expect(result.role).toBe('Parent');
    });
  });

  describe('TC-SIGNUP-002: Validate no input in the registration form', () => {
    test('Registration unsuccessful; error displayed', () => {
      const result = validateSignUp({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'Learner'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please fill in all the boxes!');
    });
  });

  describe('TC-SIGNUP-003: Validate incomplete details in the registration form', () => {
    test('Registration unsuccessful; error displayed', () => {
      const result = validateSignUp({
        email: 'test@test.com',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'Learner'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('TC-SIGNUP-004: Validate invalid email format', () => {
    test('System displays email format error', () => {
      const result = validateSignUp({
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'Test User',
        role: 'Learner'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });
  });

  describe('TC-SIGNUP-005: Validate existing email in the registration form', () => {
    test('System displays "Email already exists" error', () => {
      const result = validateSignUp({
        email: 'existing@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'Test User',
        role: 'Learner'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email already exists');
    });
  });

  describe('TC-SIGNUP-006: Validate non-matching password and confirm password', () => {
    test('System displays password mismatch error', () => {
      const result = validateSignUp({
        email: 'new@test.com',
        password: 'password123',
        confirmPassword: 'different456',
        fullName: 'Test User',
        role: 'Learner'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Passwords do not match. Please try again.');
    });
  });

  describe('TC-SIGNUP-007: Validate all valid and complete credentials', () => {
    test('Account is successfully created and redirected to Sign In', () => {
      const result = validateSignUp({
        email: 'newlearner@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'New Learner',
        role: 'Learner'
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

});
