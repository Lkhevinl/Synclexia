// ─── Test Case CASE-004 ──────────────────────────────────────────────────────
// Test Case ID: CASE-004
// Test Case Description: Validate invalid email format
// Expected Result: System displays email format error

function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim() === '') {
    return {
      valid: false,
      actualResult: 'System displays email format error - Email is empty'
    };
  }

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      actualResult: 'System displays email format error - Invalid email format'
    };
  }

  return {
    valid: true,
    actualResult: 'Email format is valid'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-004 (Validate invalid email format)', () => {

  test('Email missing @ symbol', () => {
    const expectedResult = 'System displays email format error';
    const result = validateEmailFormat('john.doe.com');

    console.log('Test Case ID: CASE-004');
    console.log('Test Case Description: Validate invalid email format');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.valid && result.actualResult.includes('email format error')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.valid).toBe(false);
  });

  test('Email missing domain extension', () => {
    const expectedResult = 'System displays email format error';
    const result = validateEmailFormat('john@doe');

    console.log('Test Case ID: CASE-004');
    console.log('Test Case Description: Validate invalid email format');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.valid && result.actualResult.includes('email format error')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.valid).toBe(false);
  });

  test('Email with spaces', () => {
    const expectedResult = 'System displays email format error';
    const result = validateEmailFormat('john doe@test.com');

    console.log('Test Case ID: CASE-004');
    console.log('Test Case Description: Validate invalid email format');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.valid && result.actualResult.includes('email format error')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.valid).toBe(false);
  });

  test('Email with multiple @ symbols', () => {
    const expectedResult = 'System displays email format error';
    const result = validateEmailFormat('john@@test.com');

    console.log('Test Case ID: CASE-004');
    console.log('Test Case Description: Validate invalid email format');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.valid && result.actualResult.includes('email format error')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.valid).toBe(false);
  });

  test('Valid email format', () => {
    const result = validateEmailFormat('john.doe@test.com');

    console.log('Test Case ID: CASE-004');
    console.log('Test Case Description: Validate invalid email format');
    console.log('Expected Result: System displays email format error (when invalid)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.valid) {
      console.log('Outcome: PASSED - Valid email accepted');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.valid).toBe(true);
  });

});
