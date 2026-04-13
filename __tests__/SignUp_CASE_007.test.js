// ─── Test Case CASE-007 ──────────────────────────────────────────────────────
// Test Case ID: CASE-007
// Test Case Description: Validate all valid and complete credentials
// Expected Result: Account is successfully created and redirected to Sign In

// Mock database of existing users
const existingUsers = [
  { email: 'john.doe@test.com' },
  { email: 'existing@user.com' }
];

function validateRegistrationComplete(formData) {
  // Check all required fields are present
  if (!formData.email || formData.email.trim() === '' ||
      !formData.password || formData.password.trim() === '' ||
      !formData.confirmPassword || formData.confirmPassword.trim() === '' ||
      !formData.role || formData.role.trim() === '' ||
      !formData.firstName || formData.firstName.trim() === '') {
    return {
      success: false,
      actualResult: 'Registration failed - Incomplete details',
      redirectTo: null
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return {
      success: false,
      actualResult: 'Registration failed - Invalid email format',
      redirectTo: null
    };
  }

  // Check if email already exists
  const emailExists = existingUsers.some(user => user.email.toLowerCase() === formData.email.toLowerCase());
  if (emailExists) {
    return {
      success: false,
      actualResult: 'Registration failed - Email already exists',
      redirectTo: null
    };
  }

  // Validate password match
  if (formData.password !== formData.confirmPassword) {
    return {
      success: false,
      actualResult: 'Registration failed - Passwords do not match',
      redirectTo: null
    };
  }

  // Validate password length
  if (formData.password.length < 6) {
    return {
      success: false,
      actualResult: 'Registration failed - Password too short',
      redirectTo: null
    };
  }

  // Validate role
  if (formData.role !== 'Learner' && formData.role !== 'Parent') {
    return {
      success: false,
      actualResult: 'Registration failed - Invalid role selection',
      redirectTo: null
    };
  }

  // All validations passed - registration successful
  return {
    success: true,
    actualResult: 'Account is successfully created and redirected to Sign In',
    redirectTo: '/signin'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-007 (Validate all valid and complete credentials)', () => {

  test('Complete valid registration - Learner role', () => {
    const expectedResult = 'Account is successfully created and redirected to Sign In';
    const formData = {
      email: 'new.learner@test.com',
      password: 'securePassword123',
      confirmPassword: 'securePassword123',
      role: 'Learner',
      firstName: 'John'
    };
    const result = validateRegistrationComplete(formData);

    console.log('Test Case ID: CASE-007');
    console.log('Test Case Description: Validate all valid and complete credentials');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.redirectTo === '/signin') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.actualResult).toContain('successfully created');
    expect(result.redirectTo).toBe('/signin');
  });

  test('Complete valid registration - Parent role', () => {
    const expectedResult = 'Account is successfully created and redirected to Sign In';
    const formData = {
      email: 'new.parent@example.com',
      password: 'parentPass456',
      confirmPassword: 'parentPass456',
      role: 'Parent',
      firstName: 'Sarah'
    };
    const result = validateRegistrationComplete(formData);

    console.log('Test Case ID: CASE-007');
    console.log('Test Case Description: Validate all valid and complete credentials');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.redirectTo === '/signin') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.actualResult).toContain('successfully created');
    expect(result.redirectTo).toBe('/signin');
  });

  test('Valid registration with different valid email format', () => {
    const expectedResult = 'Account is successfully created and redirected to Sign In';
    const formData = {
      email: 'user.name+tag@domain.co.uk',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'Learner',
      firstName: 'Michael'
    };
    const result = validateRegistrationComplete(formData);

    console.log('Test Case ID: CASE-007');
    console.log('Test Case Description: Validate all valid and complete credentials');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.redirectTo === '/signin') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/signin');
  });

  test('Invalid - existing email should fail', () => {
    const formData = {
      email: 'john.doe@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'Learner',
      firstName: 'John'
    };
    const result = validateRegistrationComplete(formData);

    console.log('Test Case ID: CASE-007');
    console.log('Test Case Description: Validate all valid and complete credentials');
    console.log('Expected Result: Account is successfully created and redirected to Sign In (for new users only)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success) {
      console.log('Outcome: PASSED - Correctly rejected existing email');
    } else {
      console.log('Outcome: FAILED - Should have rejected existing email');
    }

    expect(result.success).toBe(false);
    expect(result.actualResult).toContain('Email already exists');
  });

  test('Invalid - mismatched passwords should fail', () => {
    const formData = {
      email: 'another.new@user.com',
      password: 'password123',
      confirmPassword: 'different123',
      role: 'Parent',
      firstName: 'Jane'
    };
    const result = validateRegistrationComplete(formData);

    console.log('Test Case ID: CASE-007');
    console.log('Test Case Description: Validate all valid and complete credentials');
    console.log('Expected Result: Account is successfully created and redirected to Sign In (when all valid)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success) {
      console.log('Outcome: PASSED - Correctly rejected mismatched passwords');
    } else {
      console.log('Outcome: FAILED - Should have rejected mismatched passwords');
    }

    expect(result.success).toBe(false);
    expect(result.actualResult).toContain('do not match');
  });

});
