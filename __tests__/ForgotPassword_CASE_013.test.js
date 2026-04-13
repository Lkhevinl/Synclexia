// ─── Test Case CASE-013 ──────────────────────────────────────────────────────
// Test Case ID: CASE-013
// Test Case Description: Validate forgot password with registered email
// Expected Result: Reset password link is sent to email

// Mock database of registered users
const registeredUsers = [
  { email: 'john.doe@test.com', name: 'John Doe' },
  { email: 'jane.smith@example.com', name: 'Jane Smith' },
  { email: 'learner@synclexia.com', name: 'Alex Learner' },
  { email: 'parent@synclexia.com', name: 'Sarah Parent' }
];

// Mock email sending function
function sendResetPasswordEmail(email) {
  return {
    sent: true,
    message: `Reset password link sent to ${email}`
  };
}

function processForgotPassword(email) {
  // First validate email format
  if (!email || email.trim() === '') {
    return {
      success: false,
      actualResult: 'System displays required field error - Email is required',
      emailSent: false
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      actualResult: 'System displays required field error - Invalid email format',
      emailSent: false
    };
  }

  // Check if email exists in database
  const user = registeredUsers.find(user => user.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return {
      success: false,
      actualResult: 'System displays email not found message',
      emailSent: false
    };
  }

  // Send reset password email
  const emailResult = sendResetPasswordEmail(user.email);

  return {
    success: true,
    actualResult: 'Reset password link is sent to email',
    emailSent: emailResult.sent,
    emailAddress: user.email
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-013 (Validate forgot password with registered email)', () => {

  test('Registered email - reset password link sent', () => {
    const expectedResult = 'Reset password link is sent to email';
    const result = processForgotPassword('john.doe@test.com');

    console.log('Test Case ID: CASE-013');
    console.log('Test Case Description: Validate forgot password with registered email');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Email Sent: ${result.emailSent}`);
    console.log(`Email Address: ${result.emailAddress}`);

    if (result.success && result.emailSent && result.actualResult.includes('sent to email')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(true);
    expect(result.actualResult).toContain('sent to email');
    expect(result.emailAddress).toBe('john.doe@test.com');
  });

  test('Another registered email - reset password link sent', () => {
    const expectedResult = 'Reset password link is sent to email';
    const result = processForgotPassword('jane.smith@example.com');

    console.log('Test Case ID: CASE-013');
    console.log('Test Case Description: Validate forgot password with registered email');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Email Sent: ${result.emailSent}`);
    console.log(`Email Address: ${result.emailAddress}`);

    if (result.success && result.emailSent && result.actualResult.includes('sent to email')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(true);
    expect(result.emailAddress).toBe('jane.smith@example.com');
  });

  test('Case insensitive email - reset password link sent', () => {
    const expectedResult = 'Reset password link is sent to email';
    const result = processForgotPassword('LEARNER@SYNCLEXIA.COM');

    console.log('Test Case ID: CASE-013');
    console.log('Test Case Description: Validate forgot password with registered email');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Email Sent: ${result.emailSent}`);

    if (result.success && result.emailSent) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(true);
    expect(result.emailAddress).toBe('learner@synclexia.com');
  });

  test('Parent email - reset password link sent', () => {
    const expectedResult = 'Reset password link is sent to email';
    const result = processForgotPassword('parent@synclexia.com');

    console.log('Test Case ID: CASE-013');
    console.log('Test Case Description: Validate forgot password with registered email');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Email Sent: ${result.emailSent}`);

    if (result.success && result.emailSent) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(true);
  });

  test('Unregistered email - should not send reset link (negative test)', () => {
    const result = processForgotPassword('not.registered@unknown.com');

    console.log('Test Case ID: CASE-013');
    console.log('Test Case Description: Validate forgot password with registered email');
    console.log('Expected Result: Reset password link is sent to email (for registered emails only)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.emailSent) {
      console.log('Outcome: PASSED - Correctly rejected unregistered email');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.emailSent).toBe(false);
    expect(result.actualResult).toContain('not found');
  });

});
