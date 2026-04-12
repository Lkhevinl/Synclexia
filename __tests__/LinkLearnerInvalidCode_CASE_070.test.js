// ─── Test Case CASE-070 ──────────────────────────────────────────────────────
// Test Case ID: CASE-070
// Test Case Description: Validate entering invalid parent link code
// Expected Result: Error message displayed; account not linked

// Mock link state
let linkState = {
  isLinked: false,
  parentCode: null,
  learnerId: null,
  linkTimestamp: null
};

const VALID_CODES = ['PARENT123', 'MOM456', 'DAD789', 'GUARDIAN321'];

function linkLearner(code, learnerId) {
  // Check if code is provided
  if (!code || code.trim() === '') {
    return {
      success: false,
      actualResult: 'Error message displayed; account not linked',
      accountLinked: false,
      errorMessage: 'Please enter a parent link code',
      isLinked: false
    };
  }

  // Check if code format is valid (alphanumeric, min 6 chars)
  const trimmedCode = code.trim().toUpperCase();
  const isValidFormat = /^[A-Z0-9]{6,}$/.test(trimmedCode);

  if (!isValidFormat) {
    return {
      success: false,
      actualResult: 'Error message displayed; account not linked',
      accountLinked: false,
      errorMessage: 'Invalid code format. Code must be at least 6 alphanumeric characters.',
      enteredCode: trimmedCode,
      isLinked: false
    };
  }

  // Check if code exists in valid codes
  if (!VALID_CODES.includes(trimmedCode)) {
    return {
      success: false,
      actualResult: 'Error message displayed; account not linked',
      accountLinked: false,
      errorMessage: 'Invalid parent link code. Please check the code and try again.',
      enteredCode: trimmedCode,
      isLinked: false
    };
  }

  // Successful link
  linkState.isLinked = true;
  linkState.parentCode = trimmedCode;
  linkState.learnerId = learnerId;
  linkState.linkTimestamp = new Date().toISOString();

  return {
    success: true,
    actualResult: 'Account linked successfully',
    accountLinked: true,
    parentCode: trimmedCode,
    learnerId: learnerId,
    linkTimestamp: linkState.linkTimestamp,
    isLinked: true
  };
}

// Reset state before each test
function resetLinkState() {
  linkState = {
    isLinked: false,
    parentCode: null,
    learnerId: null,
    linkTimestamp: null
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-070 (Validate entering invalid parent link code)', () => {

  beforeEach(() => {
    resetLinkState();
  });

  test('Enter invalid code XYZ123 - error message displayed; account not linked', () => {
    const expectedResult = 'Error message displayed; account not linked';
    const invalidCode = 'XYZ123';
    const learnerId = 'LEARNER001';
    
    const result = linkLearner(invalidCode, learnerId);

    console.log('Test Case ID: CASE-070');
    console.log('Test Case Description: Validate entering invalid parent link code');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Account Linked: ${result.accountLinked}`);
    console.log(`Is Linked: ${result.isLinked}`);
    console.log(`Entered Code: ${result.enteredCode}`);
    console.log(`Error Message: ${result.errorMessage}`);

    if (!result.success && !result.accountLinked && !result.isLinked) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.accountLinked).toBe(false);
    expect(result.isLinked).toBe(false);
    expect(result.actualResult).toContain('Error message');
    expect(result.actualResult).toContain('not linked');
    expect(result.errorMessage).toContain('Invalid');
    expect(linkState.isLinked).toBe(false);
    expect(linkState.parentCode).toBeNull();
  });

  test('Enter invalid code ABC999 - error message displayed; account not linked', () => {
    const expectedResult = 'Error message displayed; account not linked';
    const invalidCode = 'ABC999';
    const learnerId = 'LEARNER002';
    
    const result = linkLearner(invalidCode, learnerId);

    console.log('Test Case ID: CASE-070');
    console.log('Test Case Description: Validate entering invalid parent link code');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Account Linked: ${result.accountLinked}`);
    console.log(`Is Linked: ${result.isLinked}`);

    if (!result.success && !result.accountLinked) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.accountLinked).toBe(false);
    expect(result.isLinked).toBe(false);
    expect(linkState.isLinked).toBe(false);
  });

  test('Enter empty code - error message displayed; account not linked', () => {
    const expectedResult = 'Error message displayed; account not linked';
    const invalidCode = '';
    const learnerId = 'LEARNER003';
    
    const result = linkLearner(invalidCode, learnerId);

    console.log('Test Case ID: CASE-070');
    console.log('Test Case Description: Validate entering invalid parent link code');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error Message: ${result.errorMessage}`);

    if (!result.success && !result.accountLinked) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.accountLinked).toBe(false);
    expect(result.isLinked).toBe(false);
    expect(result.errorMessage).toContain('enter a parent link code');
  });

  test('Enter code too short (AB12) - error message displayed; account not linked', () => {
    const expectedResult = 'Error message displayed; account not linked';
    const invalidCode = 'AB12';
    const learnerId = 'LEARNER004';
    
    const result = linkLearner(invalidCode, learnerId);

    console.log('Test Case ID: CASE-070');
    console.log('Test Case Description: Validate entering invalid parent link code');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Entered Code: ${invalidCode} (too short)`);
    console.log(`Error Message: ${result.errorMessage}`);

    if (!result.success && !result.accountLinked) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.accountLinked).toBe(false);
    expect(result.isLinked).toBe(false);
    expect(result.errorMessage).toContain('at least 6');
  });

  test('Enter code with special characters - error message displayed; account not linked', () => {
    const expectedResult = 'Error message displayed; account not linked';
    const invalidCode = 'PARENT@123';
    const learnerId = 'LEARNER005';
    
    const result = linkLearner(invalidCode, learnerId);

    console.log('Test Case ID: CASE-070');
    console.log('Test Case Description: Validate entering invalid parent link code');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Entered Code: ${invalidCode} (special characters)`);
    console.log(`Error Message: ${result.errorMessage}`);

    if (!result.success && !result.accountLinked) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.accountLinked).toBe(false);
    expect(result.isLinked).toBe(false);
    expect(result.errorMessage).toContain('alphanumeric');
  });

  test('Enter valid code - account linked (negative test)', () => {
    const validCode = 'PARENT123';
    const learnerId = 'LEARNER006';
    
    const result = linkLearner(validCode, learnerId);

    console.log('Test Case ID: CASE-070');
    console.log('Test Case Description: Validate entering invalid parent link code');
    console.log('Expected Result: Error message displayed; account not linked (for invalid code)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Account Linked: ${result.accountLinked}`);
    console.log(`Parent Code: ${result.parentCode}`);
    console.log(`Is Linked: ${result.isLinked}`);

    if (result.success && result.accountLinked && result.isLinked) {
      console.log('Outcome: PASSED - Correctly handled valid code');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.accountLinked).toBe(true);
    expect(result.isLinked).toBe(true);
    expect(linkState.isLinked).toBe(true);
    expect(linkState.parentCode).toBe('PARENT123');
  });

  test('Multiple invalid attempts - all rejected; account remains unlinked', () => {
    const learnerId = 'LEARNER007';
    
    // First invalid attempt
    const result1 = linkLearner('INVALID1', learnerId);
    expect(result1.accountLinked).toBe(false);
    expect(linkState.isLinked).toBe(false);
    
    // Second invalid attempt
    const result2 = linkLearner('INVALID2', learnerId);

    console.log('Test Case ID: CASE-070');
    console.log('Test Case Description: Validate entering invalid parent link code');
    console.log('Test: Multiple invalid attempts');
    console.log(`Attempt 1: INVALID1 - Linked: ${result1.accountLinked}`);
    console.log(`Attempt 2: INVALID2 - Linked: ${result2.accountLinked}`);
    console.log(`Final State - Is Linked: ${linkState.isLinked}`);

    if (!result2.accountLinked && !linkState.isLinked) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(false);
    expect(result2.accountLinked).toBe(false);
    expect(linkState.isLinked).toBe(false);
    expect(linkState.parentCode).toBeNull();
  });

});
