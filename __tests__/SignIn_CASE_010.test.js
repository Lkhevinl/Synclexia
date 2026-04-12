// ─── Test Case CASE-010 ──────────────────────────────────────────────────────
// Test Case ID: CASE-010
// Test Case Description: Validate correct email and password
// Expected Result: User is redirected to their respective dashboard

// Mock database of registered users with roles
const registeredUsers = [
  { email: 'learner@test.com', password: 'learner123', role: 'Learner', name: 'John Learner' },
  { email: 'parent@test.com', password: 'parent456', role: 'Parent', name: 'Jane Parent' },
  { email: 'student@example.com', password: 'student789', role: 'Learner', name: 'Alex Student' },
  { email: 'guardian@synclexia.com', password: 'guardian2024', role: 'Parent', name: 'Sam Guardian' }
];

function validateSignInSuccess(credentials) {
  // Check if both fields are provided
  if (!credentials.email || credentials.email.trim() === '') {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - Email is required',
      redirectTo: null,
      user: null
    };
  }

  if (!credentials.password || credentials.password.trim() === '') {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - Password is required',
      redirectTo: null,
      user: null
    };
  }

  // Find user by email
  const user = registeredUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

  if (!user) {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - Email not found',
      redirectTo: null,
      user: null
    };
  }

  // Check password
  if (user.password !== credentials.password) {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - Incorrect password',
      redirectTo: null,
      user: null
    };
  }

  // Login successful - determine redirect based on role
  const redirectTo = user.role === 'Learner' ? '/dashboard/learner' : '/dashboard/parent';

  return {
    success: true,
    actualResult: 'User is redirected to their respective dashboard',
    redirectTo: redirectTo,
    user: {
      email: user.email,
      role: user.role,
      name: user.name
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-010 (Validate correct email and password)', () => {

  test('Valid Learner login - redirected to Learner dashboard', () => {
    const expectedResult = 'User is redirected to their respective dashboard';
    const result = validateSignInSuccess({
      email: 'learner@test.com',
      password: 'learner123'
    });

    console.log('Test Case ID: CASE-010');
    console.log('Test Case Description: Validate correct email and password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Redirect To: ${result.redirectTo}`);

    if (result.success && result.redirectTo === '/dashboard/learner') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/dashboard/learner');
    expect(result.user.role).toBe('Learner');
  });

  test('Valid Parent login - redirected to Parent dashboard', () => {
    const expectedResult = 'User is redirected to their respective dashboard';
    const result = validateSignInSuccess({
      email: 'parent@test.com',
      password: 'parent456'
    });

    console.log('Test Case ID: CASE-010');
    console.log('Test Case Description: Validate correct email and password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Redirect To: ${result.redirectTo}`);

    if (result.success && result.redirectTo === '/dashboard/parent') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/dashboard/parent');
    expect(result.user.role).toBe('Parent');
  });

  test('Valid Student login - redirected to Learner dashboard', () => {
    const expectedResult = 'User is redirected to their respective dashboard';
    const result = validateSignInSuccess({
      email: 'student@example.com',
      password: 'student789'
    });

    console.log('Test Case ID: CASE-010');
    console.log('Test Case Description: Validate correct email and password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Redirect To: ${result.redirectTo}`);

    if (result.success && result.redirectTo === '/dashboard/learner') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/dashboard/learner');
  });

  test('Valid Guardian login - redirected to Parent dashboard', () => {
    const expectedResult = 'User is redirected to their respective dashboard';
    const result = validateSignInSuccess({
      email: 'guardian@synclexia.com',
      password: 'guardian2024'
    });

    console.log('Test Case ID: CASE-010');
    console.log('Test Case Description: Validate correct email and password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Redirect To: ${result.redirectTo}`);

    if (result.success && result.redirectTo === '/dashboard/parent') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/dashboard/parent');
  });

  test('Invalid credentials should not redirect', () => {
    const result = validateSignInSuccess({
      email: 'wrong@email.com',
      password: 'wrongpassword'
    });

    console.log('Test Case ID: CASE-010');
    console.log('Test Case Description: Validate correct email and password');
    console.log('Expected Result: User is redirected to their respective dashboard (for valid credentials)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.redirectTo === null) {
      console.log('Outcome: PASSED - Invalid credentials correctly rejected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.redirectTo).toBeNull();
  });

});
