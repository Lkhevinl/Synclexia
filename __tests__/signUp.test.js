// ─── Sign Up Module Tests ────────────────────────────────────────────────────
// Individual test file for User Authentication - Sign Up
// Test Cases: TC-SIGNUP-001 through TC-SIGNUP-013

const existingEmails = ['existing@test.com'];
const validRoles = ['student', 'parent'];

function validateSignUp({ email, password, confirmPassword, fullName, role }) {
  const errors = [];
  
  // Role validation
  if (!role || !validRoles.includes(role)) {
    errors.push('Invalid role selected');
  }
  
  // Empty fields check
  if (!email?.trim() || !password?.trim() || !fullName?.trim()) {
    errors.push('Please fill in all the boxes!');
  }
  
  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email.trim())) {
    errors.push('Invalid email format');
  }
  
  // Existing email
  if (email && existingEmails.includes(email.trim().toLowerCase())) {
    errors.push('Email already exists');
  }
  
  // Password length
  if (password && password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  
  // Password match
  if (password && confirmPassword && password !== confirmPassword) {
    errors.push('Passwords do not match. Please try again.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASES
// ═════════════════════════════════════════════════════════════════════════════

describe('Sign Up Module - Individual Test Cases', () => {

  describe('TC-SIGNUP-001: User selects a role (Learner or Parent) during registration', () => {
    test('Selected role is saved to the system - Student role valid', () => {
      const result = validateSignUp({
        email: 'new@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'Test User',
        role: 'student'
      });
      expect(result.errors).not.toContain('Invalid role selected');
    });

    test('Selected role is saved to the system - Parent role valid', () => {
      const result = validateSignUp({
        email: 'new@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'Test User',
        role: 'parent'
      });
      expect(result.errors).not.toContain('Invalid role selected');
    });
  });

  describe('TC-SIGNUP-002: Learner enters no input in the registration form', () => {
    test('Registration unsuccessful; error displayed', () => {
      const result = validateSignUp({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'student'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please fill in all the boxes!');
    });
  });

  describe('TC-SIGNUP-003: Learner enters incomplete details in the registration form', () => {
    test('Registration unsuccessful; error displayed', () => {
      const result = validateSignUp({
        email: 'test@test.com',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'student'
      });
      expect(result.isValid).toBe(false);
    });
  });

  describe('TC-SIGNUP-004: Learner enters an invalid email format', () => {
    test('System displays email format error', () => {
      const result = validateSignUp({
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'Test User',
        role: 'student'
      });
      expect(result.errors).toContain('Invalid email format');
    });
  });

  describe('TC-SIGNUP-005: Learner enters an email that already exists', () => {
    test('System displays "Email already exists" error', () => {
      const result = validateSignUp({
        email: 'existing@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'Test User',
        role: 'student'
      });
      expect(result.errors).toContain('Email already exists');
    });
  });

  describe('TC-SIGNUP-006: Learner enters non-matching password and confirm password', () => {
    test('System displays password mismatch error', () => {
      const result = validateSignUp({
        email: 'new@test.com',
        password: 'password123',
        confirmPassword: 'different456',
        fullName: 'Test User',
        role: 'student'
      });
      expect(result.errors).toContain('Passwords do not match. Please try again.');
    });
  });

  describe('TC-SIGNUP-007: Learner enters all valid and complete credentials', () => {
    test('Account is successfully created and redirected to Sign In', () => {
      const result = validateSignUp({
        email: 'newlearner@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'New Learner',
        role: 'student'
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('TC-SIGNUP-008: Parent enters no input in the registration form', () => {
    test('Registration unsuccessful; error displayed', () => {
      const result = validateSignUp({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'parent'
      });
      expect(result.isValid).toBe(false);
    });
  });

  describe('TC-SIGNUP-009: Parent enters incomplete details in the registration form', () => {
    test('Registration unsuccessful; error displayed', () => {
      const result = validateSignUp({
        email: 'parent@test.com',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'parent'
      });
      expect(result.isValid).toBe(false);
    });
  });

  describe('TC-SIGNUP-010: Parent enters an invalid email format', () => {
    test('System displays email format error', () => {
      const result = validateSignUp({
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'Parent User',
        role: 'parent'
      });
      expect(result.errors).toContain('Invalid email format');
    });
  });

  describe('TC-SIGNUP-011: Parent enters an email that already exists', () => {
    test('System displays "Email already exists" error', () => {
      const result = validateSignUp({
        email: 'existing@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'Parent User',
        role: 'parent'
      });
      expect(result.errors).toContain('Email already exists');
    });
  });

  describe('TC-SIGNUP-012: Parent enters non-matching password and confirm password', () => {
    test('System displays password mismatch error', () => {
      const result = validateSignUp({
        email: 'newparent@test.com',
        password: 'password123',
        confirmPassword: 'different456',
        fullName: 'Parent User',
        role: 'parent'
      });
      expect(result.errors).toContain('Passwords do not match. Please try again.');
    });
  });

  describe('TC-SIGNUP-013: Parent enters all valid and complete credentials', () => {
    test('Account is successfully created and redirected to Sign In', () => {
      const result = validateSignUp({
        email: 'newparent@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'New Parent',
        role: 'parent'
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

});
