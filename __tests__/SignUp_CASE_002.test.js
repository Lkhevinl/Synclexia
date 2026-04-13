// ─── Test Case CASE-002 ──────────────────────────────────────────────────────
// Test Case ID: CASE-002
// Test Case Description: Validate no input in the registration form
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
  }
  
  if (!formData.password || formData.password.trim() === '') {
    errors.push('Password is required');
  }
  
  if (!formData.role || formData.role.trim() === '') {
    errors.push('Role selection is required');
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

describe('Test Case CASE-002 (Validate no input in the registration form)', () => {

  test('Empty form submission - all fields missing', () => {
    const expectedResult = 'Registration unsuccessful; error displayed';
    const result = validateRegistrationForm({});

    console.log('Test Case ID: CASE-002');
    console.log('Test Case Description: Validate no input in the registration form');
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

  test('Null form submission', () => {
    const expectedResult = 'Registration unsuccessful; error displayed';
    const result = validateRegistrationForm(null);

    console.log('Test Case ID: CASE-002');
    console.log('Test Case Description: Validate no input in the registration form');
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

  test('Empty string values in all fields', () => {
    const expectedResult = 'Registration unsuccessful; error displayed';
    const result = validateRegistrationForm({
      email: '',
      password: '',
      role: ''
    });

    console.log('Test Case ID: CASE-002');
    console.log('Test Case Description: Validate no input in the registration form');
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

});
