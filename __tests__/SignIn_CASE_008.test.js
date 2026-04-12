// ─── Test Case CASE-008 ──────────────────────────────────────────────────────
// Test Case ID: CASE-008
// Test Case Description: Validate empty email and password
// Expected Result: Login unsuccessful; error displayed

function validateSignInCredentials(credentials) {
  const errors = [];

  if (!credentials || Object.keys(credentials).length === 0) {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - No credentials provided',
      errors: ['Email is required', 'Password is required']
    };
  }

  if (!credentials.email || credentials.email.trim() === '') {
    errors.push('Email is required');
  }

  if (!credentials.password || credentials.password.trim() === '') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - ' + errors.join(', '),
      errors: errors
    };
  }

  return {
    success: true,
    actualResult: 'Login credentials provided',
    errors: []
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-008 (Validate empty email and password)', () => {

  test('Both email and password empty', () => {
    const expectedResult = 'Login unsuccessful; error displayed';
    const result = validateSignInCredentials({
      email: '',
      password: ''
    });

    console.log('Test Case ID: CASE-008');
    console.log('Test Case Description: Validate empty email and password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.errors.length > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Email is required');
    expect(result.errors).toContain('Password is required');
  });

  test('Email empty, password provided', () => {
    const expectedResult = 'Login unsuccessful; error displayed';
    const result = validateSignInCredentials({
      email: '',
      password: 'somepassword123'
    });

    console.log('Test Case ID: CASE-008');
    console.log('Test Case Description: Validate empty email and password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.errors.includes('Email is required')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Email is required');
    expect(result.errors).not.toContain('Password is required');
  });

  test('Password empty, email provided', () => {
    const expectedResult = 'Login unsuccessful; error displayed';
    const result = validateSignInCredentials({
      email: 'user@test.com',
      password: ''
    });

    console.log('Test Case ID: CASE-008');
    console.log('Test Case Description: Validate empty email and password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.errors.includes('Password is required')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Password is required');
    expect(result.errors).not.toContain('Email is required');
  });

  test('Null credentials', () => {
    const expectedResult = 'Login unsuccessful; error displayed';
    const result = validateSignInCredentials(null);

    console.log('Test Case ID: CASE-008');
    console.log('Test Case Description: Validate empty email and password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.errors.length > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Both email and password provided - should pass validation', () => {
    const result = validateSignInCredentials({
      email: 'valid.user@test.com',
      password: 'validPassword123'
    });

    console.log('Test Case ID: CASE-008');
    console.log('Test Case Description: Validate empty email and password');
    console.log('Expected Result: Login unsuccessful; error displayed (when empty)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.errors.length === 0) {
      console.log('Outcome: PASSED - Credentials provided successfully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
  });

});
