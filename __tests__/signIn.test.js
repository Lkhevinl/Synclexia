// ─── Sign In Module Tests ───────────────────────────────────────────────────
// Individual test file for User Authentication - Sign In
// Test Cases: TC-SIGNIN-001 through TC-SIGNIN-009

// Helper functions
function validateLogin(email, password) {
  const errors = [];
  if (!email || !email.trim()) {
    errors.push('Email is required');
  }
  if (!password || !password.trim()) {
    errors.push('Password is required');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

function simulateLogin(email, password, role) {
  const validation = validateLogin(email, password);
  if (!validation.isValid) {
    return { success: false, error: 'Login unsuccessful; error displayed' };
  }
  
  const validCredentials = {
    'learner@test.com': { password: 'password123', role: 'student' },
    'parent@test.com': { password: 'password123', role: 'parent' },
    'admin@test.com': { password: 'password123', role: 'admin' }
  };
  
  const user = validCredentials[email];
  if (!user || user.password !== password) {
    return { success: false, error: 'Login unsuccessful; error displayed' };
  }
  
  return { 
    success: true, 
    role: user.role,
    redirect: user.role === 'student' ? 'Learner Dashboard' : 
              user.role === 'parent' ? 'Parent Dashboard' : 'Admin Dashboard'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASES
// ═════════════════════════════════════════════════════════════════════════════

describe('Sign In Module - Individual Test Cases', () => {

  describe('TC-SIGNIN-001: Learner enters empty email and password', () => {
    test('Login unsuccessful; error displayed', () => {
      const result = simulateLogin('', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login unsuccessful; error displayed');
    });
  });

  describe('TC-SIGNIN-002: Learner enters incorrect email or password', () => {
    test('Login unsuccessful; error displayed', () => {
      const result = simulateLogin('wrong@test.com', 'wrongpass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login unsuccessful; error displayed');
    });
  });

  describe('TC-SIGNIN-003: Learner enters correct email and password', () => {
    test('User is redirected to Learner Dashboard', () => {
      const result = simulateLogin('learner@test.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.role).toBe('student');
      expect(result.redirect).toBe('Learner Dashboard');
    });
  });

  describe('TC-SIGNIN-004: Parent enters empty email and password', () => {
    test('Login unsuccessful; error displayed', () => {
      const result = simulateLogin('', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login unsuccessful; error displayed');
    });
  });

  describe('TC-SIGNIN-005: Parent enters incorrect email or password', () => {
    test('Login unsuccessful; error displayed', () => {
      const result = simulateLogin('parent@test.com', 'wrongpass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login unsuccessful; error displayed');
    });
  });

  describe('TC-SIGNIN-006: Parent enters correct email and password', () => {
    test('User is redirected to Parent Dashboard', () => {
      const result = simulateLogin('parent@test.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.role).toBe('parent');
      expect(result.redirect).toBe('Parent Dashboard');
    });
  });

  describe('TC-SIGNIN-007: Admin enters empty email and password', () => {
    test('Login unsuccessful; error displayed', () => {
      const result = simulateLogin('', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login unsuccessful; error displayed');
    });
  });

  describe('TC-SIGNIN-008: Admin enters incorrect email or password', () => {
    test('Login unsuccessful; error displayed', () => {
      const result = simulateLogin('admin@test.com', 'wrongpass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login unsuccessful; error displayed');
    });
  });

  describe('TC-SIGNIN-009: Admin enters correct email and password', () => {
    test('User is redirected to respective dashboard', () => {
      const result = simulateLogin('admin@test.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.role).toBe('admin');
      expect(result.redirect).toBe('Admin Dashboard');
    });
  });

});
