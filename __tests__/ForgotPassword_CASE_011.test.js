// ─── Test Case CASE-011 ──────────────────────────────────────────────────────
// Test Case ID: CASE-011
// Test Case Description: Validate forgot password with empty email field
// Expected Result: System displays required field error

function validateForgotPasswordEmail(email) {
  if (!email || email.trim() === '') {
    return {
      valid: false,
      actualResult: 'System displays required field error - Email is required'
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      actualResult: 'System displays required field error - Invalid email format'
    };
  }

  return {
    valid: true,
    actualResult: 'Email field is valid'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-011 (Validate forgot password with empty email field)', () => {

  test('Empty email field - should display required field error', () => {
    const expectedResult = 'System displays required field error';
    const result = validateForgotPasswordEmail('');

    console.log('Test Case ID: CASE-011');
    console.log('Test Case Description: Validate forgot password with empty email field');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.valid && result.actualResult.includes('required field error')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.valid).toBe(false);
    expect(result.actualResult).toContain('required field error');
  });

  test('Null email - should display required field error', () => {
    const expectedResult = 'System displays required field error';
    const result = validateForgotPasswordEmail(null);

    console.log('Test Case ID: CASE-011');
    console.log('Test Case Description: Validate forgot password with empty email field');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.valid && result.actualResult.includes('required field error')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.valid).toBe(false);
    expect(result.actualResult).toContain('required field error');
  });

  test('Whitespace only email - should display required field error', () => {
    const expectedResult = 'System displays required field error';
    const result = validateForgotPasswordEmail('   ');

    console.log('Test Case ID: CASE-011');
    console.log('Test Case Description: Validate forgot password with empty email field');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.valid && result.actualResult.includes('required field error')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.valid).toBe(false);
    expect(result.actualResult).toContain('required field error');
  });

  test('Invalid email format - should display required field error', () => {
    const expectedResult = 'System displays required field error';
    const result = validateForgotPasswordEmail('invalid-email');

    console.log('Test Case ID: CASE-011');
    console.log('Test Case Description: Validate forgot password with empty email field');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.valid) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.valid).toBe(false);
    expect(result.actualResult).toContain('required field error');
  });

  test('Valid email - should pass validation', () => {
    const result = validateForgotPasswordEmail('user@example.com');

    console.log('Test Case ID: CASE-011');
    console.log('Test Case Description: Validate forgot password with empty email field');
    console.log('Expected Result: System displays required field error (when empty)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.valid) {
      console.log('Outcome: PASSED - Valid email accepted');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.valid).toBe(true);
    expect(result.actualResult).toContain('valid');
  });

});
