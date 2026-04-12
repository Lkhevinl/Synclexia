// ─── Test Case CASE-009 ──────────────────────────────────────────────────────
// Test Case ID: CASE-009
// Test Case Description: Validate incorrect email or password
// Expected Result: Login unsuccessful; error displayed

// Mock database of registered users
const registeredUsers = [
  { email: 'john.doe@test.com', password: 'password123' },
  { email: 'jane.smith@example.com', password: 'securePass456' },
  { email: 'learner@synclexia.com', password: 'learner789' },
  { email: 'parent@synclexia.com', password: 'parent2024' }
];

function validateSignInAuthentication(credentials) {
  // First check if both fields are provided
  if (!credentials.email || credentials.email.trim() === '') {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - Email is required'
    };
  }

  if (!credentials.password || credentials.password.trim() === '') {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - Password is required'
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(credentials.email)) {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - Invalid email format'
    };
  }

  // Find user by email
  const user = registeredUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

  if (!user) {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - Email not found'
    };
  }

  // Check password
  if (user.password !== credentials.password) {
    return {
      success: false,
      actualResult: 'Login unsuccessful; error displayed - Incorrect password'
    };
  }

  // Login successful
  return {
    success: true,
    actualResult: 'Login successful'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-009 (Validate incorrect email or password)', () => {

  test('Incorrect email - not registered', () => {
    const expectedResult = 'Login unsuccessful; error displayed';
    const result = validateSignInAuthentication({
      email: 'notregistered@unknown.com',
      password: 'password123'
    });

    console.log('Test Case ID: CASE-009');
    console.log('Test Case Description: Validate incorrect email or password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.actualResult.includes('Email not found')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.actualResult).toContain('Email not found');
  });

  test('Incorrect password for existing user', () => {
    const expectedResult = 'Login unsuccessful; error displayed';
    const result = validateSignInAuthentication({
      email: 'john.doe@test.com',
      password: 'wrongpassword'
    });

    console.log('Test Case ID: CASE-009');
    console.log('Test Case Description: Validate incorrect email or password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.actualResult.includes('Incorrect password')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.actualResult).toContain('Incorrect password');
  });

  test('Both email and password incorrect', () => {
    const expectedResult = 'Login unsuccessful; error displayed';
    const result = validateSignInAuthentication({
      email: 'wrong.email@wrong.com',
      password: 'wrongpass123'
    });

    console.log('Test Case ID: CASE-009');
    console.log('Test Case Description: Validate incorrect email or password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
  });

  test('Case sensitive password check', () => {
    const expectedResult = 'Login unsuccessful; error displayed';
    const result = validateSignInAuthentication({
      email: 'john.doe@test.com',
      password: 'Password123'
    });

    console.log('Test Case ID: CASE-009');
    console.log('Test Case Description: Validate incorrect email or password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.actualResult.includes('Incorrect password')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.actualResult).toContain('Incorrect password');
  });

  test('Valid credentials - should login successfully', () => {
    const result = validateSignInAuthentication({
      email: 'jane.smith@example.com',
      password: 'securePass456'
    });

    console.log('Test Case ID: CASE-009');
    console.log('Test Case Description: Validate incorrect email or password');
    console.log('Expected Result: Login unsuccessful; error displayed (for incorrect credentials)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success) {
      console.log('Outcome: PASSED - Valid credentials accepted');
    } else {
      console.log('Outcome: FAILED - Valid credentials should be accepted');
    }

    expect(result.success).toBe(true);
    expect(result.actualResult).toContain('successful');
  });

});
