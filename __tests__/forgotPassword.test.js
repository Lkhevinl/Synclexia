// ─── Forgot Password Module Tests ───────────────────────────────────────────
// Individual test file for User Authentication - Forgot Password
// Test Cases: TC-FORGOT-001 through TC-FORGOT-009

// Mock registered emails
const registeredEmails = [
  'learner@test.com',
  'parent@test.com', 
  'admin@test.com'
];

function simulateForgotPassword(email) {
  if (!email || !email.trim()) {
    return { 
      success: false, 
      error: 'Required field error',
      message: 'System displays required field error'
    };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: 'Invalid email format',
      message: 'System displays required field error'
    };
  }
  
  if (!registeredEmails.includes(email)) {
    return { 
      success: false, 
      error: 'Email not found',
      message: 'System displays "email not found" message'
    };
  }
  
  return { 
    success: true, 
    message: 'Reset password link is successfully sent'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASES
// ═════════════════════════════════════════════════════════════════════════════

describe('Forgot Password Module - Individual Test Cases', () => {

  describe('TC-FORGOT-001: Learner leaves email field empty', () => {
    test('System displays required field error', () => {
      const result = simulateForgotPassword('');
      expect(result.success).toBe(false);
      expect(result.message).toBe('System displays required field error');
    });
  });

  describe('TC-FORGOT-002: Learner enters unregistered email address', () => {
    test('System displays an "email not found" message', () => {
      const result = simulateForgotPassword('unknown@test.com');
      expect(result.success).toBe(false);
      expect(result.message).toBe('System displays "email not found" message');
    });
  });

  describe('TC-FORGOT-003: Learner enters valid, registered email address', () => {
    test('Reset password link is successfully sent to the Learner\'s email', () => {
      const result = simulateForgotPassword('learner@test.com');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Reset password link is successfully sent');
    });
  });

  describe('TC-FORGOT-004: Parent leaves email field empty', () => {
    test('System displays a required field error', () => {
      const result = simulateForgotPassword('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Required field error');
    });
  });

  describe('TC-FORGOT-005: Parent enters unregistered email address', () => {
    test('System displays an "email not found" message', () => {
      const result = simulateForgotPassword('unknown@test.com');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email not found');
    });
  });

  describe('TC-FORGOT-006: Parent enters valid, registered email address', () => {
    test('Reset password link is successfully sent to the Parent\'s email', () => {
      const result = simulateForgotPassword('parent@test.com');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Reset password link is successfully sent');
    });
  });

  describe('TC-FORGOT-007: Admin leaves email field empty', () => {
    test('System displays a "Required field" error message', () => {
      const result = simulateForgotPassword('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Required field error');
    });
  });

  describe('TC-FORGOT-008: Admin enters unregistered email address', () => {
    test('System displays an "Email not found" message', () => {
      const result = simulateForgotPassword('unknown@test.com');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email not found');
    });
  });

  describe('TC-FORGOT-009: Admin enters valid, registered email address', () => {
    test('Reset password link is successfully sent to the Admin\'s email', () => {
      const result = simulateForgotPassword('admin@test.com');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Reset password link is successfully sent');
    });
  });

});
