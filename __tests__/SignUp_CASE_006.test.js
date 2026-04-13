// ─── Test Case CASE-006 ──────────────────────────────────────────────────────
// Test Case ID: CASE-006
// Test Case Description: Validate non-matching password and confirm password
// Expected Result: System displays password mismatch error

function validatePasswordMatch(password, confirmPassword) {
  if (!password || password.trim() === '') {
    return {
      match: false,
      actualResult: 'System displays error - Password is required'
    };
  }

  if (!confirmPassword || confirmPassword.trim() === '') {
    return {
      match: false,
      actualResult: 'System displays error - Confirm password is required'
    };
  }

  if (password !== confirmPassword) {
    return {
      match: false,
      actualResult: 'System displays password mismatch error'
    };
  }

  return {
    match: true,
    actualResult: 'Passwords match successfully'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-006 (Validate non-matching password and confirm password)', () => {

  test('Passwords do not match', () => {
    const expectedResult = 'System displays password mismatch error';
    const result = validatePasswordMatch('password123', 'password456');

    console.log('Test Case ID: CASE-006');
    console.log('Test Case Description: Validate non-matching password and confirm password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.match && result.actualResult.includes('password mismatch error')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.match).toBe(false);
    expect(result.actualResult).toContain('password mismatch error');
  });

  test('Confirm password is empty', () => {
    const expectedResult = 'System displays password mismatch error';
    const result = validatePasswordMatch('password123', '');

    console.log('Test Case ID: CASE-006');
    console.log('Test Case Description: Validate non-matching password and confirm password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.match) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.match).toBe(false);
  });

  test('Password is empty', () => {
    const expectedResult = 'System displays password mismatch error';
    const result = validatePasswordMatch('', 'password123');

    console.log('Test Case ID: CASE-006');
    console.log('Test Case Description: Validate non-matching password and confirm password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.match) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.match).toBe(false);
  });

  test('Case sensitivity check - Passwords differ in case', () => {
    const expectedResult = 'System displays password mismatch error';
    const result = validatePasswordMatch('Password123', 'password123');

    console.log('Test Case ID: CASE-006');
    console.log('Test Case Description: Validate non-matching password and confirm password');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.match && result.actualResult.includes('password mismatch error')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.match).toBe(false);
    expect(result.actualResult).toContain('password mismatch error');
  });

  test('Matching passwords - should succeed', () => {
    const result = validatePasswordMatch('securePassword123', 'securePassword123');

    console.log('Test Case ID: CASE-006');
    console.log('Test Case Description: Validate non-matching password and confirm password');
    console.log('Expected Result: System displays password mismatch error (when passwords do not match)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.match) {
      console.log('Outcome: PASSED - Passwords match successfully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.match).toBe(true);
    expect(result.actualResult).toContain('match successfully');
  });

});
