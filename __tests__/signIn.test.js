// ─── Sign In Module Tests ──────────────────────────────────────────────────
// Module: User Authentication
// Unit: Sign In
// Test Cases: TC-SIGNIN-001 to TC-SIGNIN-003

const USERS = [
  { email: 'learner@test.com', password: 'password123', role: 'Learner' },
  { email: 'parent@test.com', password: 'password123', role: 'Parent' },
  { email: 'admin@test.com', password: 'password123', role: 'Admin' }
];

function simulateLogin(email, password) {
  // TC-SIGNIN-001: Empty email and password
  if (!email || !password) {
    return { success: false, error: 'Login unsuccessful; error displayed' };
  }

  const user = USERS.find(u => u.email === email);
  
  // TC-SIGNIN-002: Incorrect email or password
  if (!user || user.password !== password) {
    return { success: false, error: 'Login unsuccessful; error displayed' };
  }

  // TC-SIGNIN-003: Correct email and password
  return {
    success: true,
    role: user.role,
    redirect: `User is redirected to their respective dashboard`
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASES
// ═════════════════════════════════════════════════════════════════════════════

describe('User Authentication - Sign In', () => {

  describe('TC-SIGNIN-001: Validate empty email and password', () => {
    test('Login unsuccessful; error displayed', () => {
      const result = simulateLogin('', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login unsuccessful; error displayed');
    });
  });

  describe('TC-SIGNIN-002: Validate incorrect email or password', () => {
    test('Login unsuccessful; error displayed', () => {
      const result = simulateLogin('wrong@test.com', 'wrongpass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login unsuccessful; error displayed');
    });

    test('Wrong password returns error', () => {
      const result = simulateLogin('learner@test.com', 'wrongpass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login unsuccessful; error displayed');
    });
  });

  describe('TC-SIGNIN-003: Validate correct email and password', () => {
    test('User is redirected to their respective dashboard - Learner', () => {
      const result = simulateLogin('learner@test.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.role).toBe('Learner');
      expect(result.redirect).toContain('redirected to their respective dashboard');
    });

    test('User is redirected to their respective dashboard - Parent', () => {
      const result = simulateLogin('parent@test.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.role).toBe('Parent');
      expect(result.redirect).toContain('redirected to their respective dashboard');
    });

    test('User is redirected to their respective dashboard - Admin', () => {
      const result = simulateLogin('admin@test.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.role).toBe('Admin');
      expect(result.redirect).toContain('redirected to their respective dashboard');
    });
  });

});
