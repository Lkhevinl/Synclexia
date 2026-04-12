// ─── Test Case CASE-012 ──────────────────────────────────────────────────────
// Test Case ID: CASE-012
// Test Case Description: Validate forgot password with unregistered email
// Expected Result: System displays email not found message

// Mock database of registered users
const registeredUsers = [
  { email: 'john.doe@test.com' },
  { email: 'jane.smith@example.com' },
  { email: 'learner@synclexia.com' },
  { email: 'parent@synclexia.com' }
];

function validateForgotPasswordUser(email) {
  // First validate email format
  if (!email || email.trim() === '') {
    return {
      found: false,
      actualResult: 'System displays required field error - Email is required'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      found: false,
      actualResult: 'System displays required field error - Invalid email format'
    };
  }

  // Check if email exists in database
  const userExists = registeredUsers.some(user => user.email.toLowerCase() === email.toLowerCase());

  if (!userExists) {
    return {
      found: false,
      actualResult: 'System displays email not found message'
    };
  }

  return {
    found: true,
    actualResult: 'Email found in system'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-012 (Validate forgot password with unregistered email)', () => {

  test('Unregistered email - should display email not found', () => {
    const expectedResult = 'System displays email not found message';
    const result = validateForgotPasswordUser('not.registered@unknown.com');

    console.log('Test Case ID: CASE-012');
    console.log('Test Case Description: Validate forgot password with unregistered email');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.found && result.actualResult.includes('email not found')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.found).toBe(false);
    expect(result.actualResult).toContain('email not found');
  });

  test('Another unregistered email - should display email not found', () => {
    const expectedResult = 'System displays email not found message';
    const result = validateForgotPasswordUser('random.user@nonexistent.com');

    console.log('Test Case ID: CASE-012');
    console.log('Test Case Description: Validate forgot password with unregistered email');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.found && result.actualResult.includes('email not found')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.found).toBe(false);
    expect(result.actualResult).toContain('email not found');
  });

  test('Email with typo - should display email not found', () => {
    const expectedResult = 'System displays email not found message';
    const result = validateForgotPasswordUser('john.doe@tset.com'); // typo in domain

    console.log('Test Case ID: CASE-012');
    console.log('Test Case Description: Validate forgot password with unregistered email');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.found && result.actualResult.includes('email not found')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.found).toBe(false);
    expect(result.actualResult).toContain('email not found');
  });

  test('Registered email - should be found (negative test)', () => {
    const result = validateForgotPasswordUser('john.doe@test.com');

    console.log('Test Case ID: CASE-012');
    console.log('Test Case Description: Validate forgot password with unregistered email');
    console.log('Expected Result: System displays email not found message (for unregistered emails)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.found) {
      console.log('Outcome: PASSED - Registered email correctly found');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.found).toBe(true);
    expect(result.actualResult).toContain('found');
  });

});
