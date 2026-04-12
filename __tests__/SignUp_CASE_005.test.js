// ─── Test Case CASE-005 ──────────────────────────────────────────────────────
// Test Case ID: CASE-005
// Test Case Description: Validate existing email in the registration form
// Expected Result: System displays "Email already exists" error

// Mock database of existing users
const existingUsers = [
  { email: 'john.doe@test.com' },
  { email: 'jane.smith@example.com' },
  { email: 'parent@synclexia.com' },
  { email: 'learner123@gmail.com' }
];

function validateExistingEmail(email) {
  if (!email || email.trim() === '') {
    return {
      available: false,
      actualResult: 'System displays error - Email is required'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      available: false,
      actualResult: 'System displays email format error'
    };
  }

  const emailExists = existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase());

  if (emailExists) {
    return {
      available: false,
      actualResult: 'System displays "Email already exists" error'
    };
  }

  return {
    available: true,
    actualResult: 'Email is available for registration'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-005 (Validate existing email in the registration form)', () => {

  test('Existing email - john.doe@test.com', () => {
    const expectedResult = 'System displays "Email already exists" error';
    const result = validateExistingEmail('john.doe@test.com');

    console.log('Test Case ID: CASE-005');
    console.log('Test Case Description: Validate existing email in the registration form');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.available && result.actualResult.includes('Email already exists')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.available).toBe(false);
    expect(result.actualResult).toContain('Email already exists');
  });

  test('Existing email - jane.smith@example.com', () => {
    const expectedResult = 'System displays "Email already exists" error';
    const result = validateExistingEmail('jane.smith@example.com');

    console.log('Test Case ID: CASE-005');
    console.log('Test Case Description: Validate existing email in the registration form');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.available && result.actualResult.includes('Email already exists')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.available).toBe(false);
    expect(result.actualResult).toContain('Email already exists');
  });

  test('Existing email - case insensitive check', () => {
    const expectedResult = 'System displays "Email already exists" error';
    const result = validateExistingEmail('JOHN.DOE@TEST.COM');

    console.log('Test Case ID: CASE-005');
    console.log('Test Case Description: Validate existing email in the registration form');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.available && result.actualResult.includes('Email already exists')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.available).toBe(false);
    expect(result.actualResult).toContain('Email already exists');
  });

  test('New email - should be available', () => {
    const result = validateExistingEmail('new.user@website.com');

    console.log('Test Case ID: CASE-005');
    console.log('Test Case Description: Validate existing email in the registration form');
    console.log('Expected Result: System displays "Email already exists" error (when email exists)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.available) {
      console.log('Outcome: PASSED - New email is available');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.available).toBe(true);
    expect(result.actualResult).toContain('available');
  });

  test('Another new email - should be available', () => {
    const result = validateExistingEmail('unique.email@domain.org');

    console.log('Test Case ID: CASE-005');
    console.log('Test Case Description: Validate existing email in the registration form');
    console.log('Expected Result: System displays "Email already exists" error (when email exists)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.available) {
      console.log('Outcome: PASSED - New email is available');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.available).toBe(true);
  });

});
