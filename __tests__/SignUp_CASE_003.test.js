// ─── Test Case CASE-003 ──────────────────────────────────────────────────────
// Test Case ID: CASE-003
// Test Case Description: Validate incomplete details in the registration form
// Expected Result: Registration unsuccessful; error displayed

function validateRegistrationForm(formData) {
  const errors = [];

  if (!formData || Object.keys(formData).length === 0) {
    return {
      success: false,
      actualResult: 'Registration unsuccessful; error displayed - Form is empty',
      errors: ['All fields are required']
    };
  }

  if (!formData.email || formData.email.trim() === '') {
    errors.push('Email is required');
  } else if (!formData.email.includes('@')) {
    errors.push('Invalid email format');
  }

  if (!formData.password || formData.password.trim() === '') {
    errors.push('Password is required');
  } else if (formData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!formData.role || formData.role.trim() === '') {
    errors.push('Role selection is required');
  }

  if (!formData.firstName || formData.firstName.trim() === '') {
    errors.push('First name is required');
  }

  if (errors.length > 0) {
    return {
      success: false,
      actualResult: 'Registration unsuccessful; error displayed - ' + errors.join(', '),
      errors: errors
    };
  }

  return {
    success: true,
    actualResult: 'Registration successful',
    errors: []
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-003 (Validate incomplete details in the registration form)', () => {

  test('Missing email only', () => {
    const expectedResult = 'Registration unsuccessful; error displayed';
    const result = validateRegistrationForm({
      email: '',
      password: 'secure123',
      role: 'Learner',
      firstName: 'John'
    });

    console.log('Test Case ID: CASE-003');
    console.log('Test Case Description: Validate incomplete details in the registration form');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.errors.includes('Email is required')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Email is required');
  });

  test('Missing password only', () => {
    const expectedResult = 'Registration unsuccessful; error displayed';
    const result = validateRegistrationForm({
      email: 'john@test.com',
      password: '',
      role: 'Learner',
      firstName: 'John'
    });

    console.log('Test Case ID: CASE-003');
    console.log('Test Case Description: Validate incomplete details in the registration form');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.errors.includes('Password is required')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Password is required');
  });

  test('Missing role only', () => {
    const expectedResult = 'Registration unsuccessful; error displayed';
    const result = validateRegistrationForm({
      email: 'john@test.com',
      password: 'secure123',
      role: '',
      firstName: 'John'
    });

    console.log('Test Case ID: CASE-003');
    console.log('Test Case Description: Validate incomplete details in the registration form');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.errors.includes('Role selection is required')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Role selection is required');
  });

  test('Password too short', () => {
    const expectedResult = 'Registration unsuccessful; error displayed';
    const result = validateRegistrationForm({
      email: 'john@test.com',
      password: '123',
      role: 'Learner',
      firstName: 'John'
    });

    console.log('Test Case ID: CASE-003');
    console.log('Test Case Description: Validate incomplete details in the registration form');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.errors.includes('Password must be at least 6 characters')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Password must be at least 6 characters');
  });

  test('Multiple missing fields', () => {
    const expectedResult = 'Registration unsuccessful; error displayed';
    const result = validateRegistrationForm({
      email: '',
      password: '',
      role: 'Learner',
      firstName: ''
    });

    console.log('Test Case ID: CASE-003');
    console.log('Test Case Description: Validate incomplete details in the registration form');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.errors.length > 1) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

});
