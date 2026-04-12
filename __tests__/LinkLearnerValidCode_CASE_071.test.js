// ─── Test Case CASE-071 ──────────────────────────────────────────────────────
// Test Case ID: CASE-071
// Test Case Description: Validate entering valid parent link code
// Expected Result: Learner account linked successfully; proceed to parent dashboard

// Mock link state
let linkState = {
  isLinked: false,
  parentCode: null,
  learnerId: null,
  linkTimestamp: null,
  parentInfo: null
};

const VALID_CODES = {
  'PARENT123': { parentName: 'John Smith', parentEmail: 'john@example.com' },
  'MOM456': { parentName: 'Jane Doe', parentEmail: 'jane@example.com' },
  'DAD789': { parentName: 'Bob Wilson', parentEmail: 'bob@example.com' },
  'GUARDIAN321': { parentName: 'Mary Johnson', parentEmail: 'mary@example.com' }
};

function linkLearnerValid(code, learnerId) {
  // Check if code is provided
  if (!code || code.trim() === '') {
    return {
      success: false,
      actualResult: 'Link failed - No code provided',
      accountLinked: false,
      errorMessage: 'Please enter a parent link code',
      isLinked: false
    };
  }

  // Check if code format is valid
  const trimmedCode = code.trim().toUpperCase();
  const isValidFormat = /^[A-Z0-9]{6,}$/.test(trimmedCode);

  if (!isValidFormat) {
    return {
      success: false,
      actualResult: 'Link failed - Invalid code format',
      accountLinked: false,
      errorMessage: 'Invalid code format',
      isLinked: false
    };
  }

  // Check if code exists
  if (!VALID_CODES[trimmedCode]) {
    return {
      success: false,
      actualResult: 'Link failed - Invalid code',
      accountLinked: false,
      errorMessage: 'Invalid parent link code',
      isLinked: false
    };
  }

  // Successful link
  const parentInfo = VALID_CODES[trimmedCode];
  linkState.isLinked = true;
  linkState.parentCode = trimmedCode;
  linkState.learnerId = learnerId;
  linkState.linkTimestamp = new Date().toISOString();
  linkState.parentInfo = parentInfo;

  return {
    success: true,
    actualResult: 'Learner account linked successfully; proceed to parent dashboard',
    accountLinked: true,
    parentCode: trimmedCode,
    learnerId: learnerId,
    linkTimestamp: linkState.linkTimestamp,
    parentName: parentInfo.parentName,
    parentEmail: parentInfo.parentEmail,
    isLinked: true,
    redirectTo: 'Parent Dashboard',
    message: `Successfully linked to ${parentInfo.parentName}!`
  };
}

// Reset state before each test
function resetLinkState() {
  linkState = {
    isLinked: false,
    parentCode: null,
    learnerId: null,
    linkTimestamp: null,
    parentInfo: null
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-071 (Validate entering valid parent link code)', () => {

  beforeEach(() => {
    resetLinkState();
  });

  test('Enter valid code PARENT123 - account linked; proceed to parent dashboard', () => {
    const expectedResult = 'Learner account linked successfully; proceed to parent dashboard';
    const validCode = 'PARENT123';
    const learnerId = 'LEARNER001';
    
    const result = linkLearnerValid(validCode, learnerId);

    console.log('Test Case ID: CASE-071');
    console.log('Test Case Description: Validate entering valid parent link code');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Account Linked: ${result.accountLinked}`);
    console.log(`Is Linked: ${result.isLinked}`);
    console.log(`Parent Code: ${result.parentCode}`);
    console.log(`Learner ID: ${result.learnerId}`);
    console.log(`Parent Name: ${result.parentName}`);
    console.log(`Parent Email: ${result.parentEmail}`);
    console.log(`Link Timestamp: ${result.linkTimestamp}`);
    console.log(`Redirect To: ${result.redirectTo}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.accountLinked && result.isLinked && result.redirectTo === 'Parent Dashboard') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.accountLinked).toBe(true);
    expect(result.isLinked).toBe(true);
    expect(result.actualResult).toContain('linked successfully');
    expect(result.actualResult).toContain('proceed to parent dashboard');
    expect(result.parentCode).toBe('PARENT123');
    expect(result.learnerId).toBe('LEARNER001');
    expect(result.parentName).toBe('John Smith');
    expect(result.parentEmail).toBe('john@example.com');
    expect(result.redirectTo).toBe('Parent Dashboard');
    expect(linkState.isLinked).toBe(true);
    expect(linkState.parentCode).toBe('PARENT123');
  });

  test('Enter valid code MOM456 - account linked; proceed to parent dashboard', () => {
    const expectedResult = 'Learner account linked successfully; proceed to parent dashboard';
    const validCode = 'MOM456';
    const learnerId = 'LEARNER002';
    
    const result = linkLearnerValid(validCode, learnerId);

    console.log('Test Case ID: CASE-071');
    console.log('Test Case Description: Validate entering valid parent link code');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Parent Name: ${result.parentName}`);
    console.log(`Parent Email: ${result.parentEmail}`);

    if (result.success && result.accountLinked && result.isLinked) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.accountLinked).toBe(true);
    expect(result.isLinked).toBe(true);
    expect(result.parentCode).toBe('MOM456');
    expect(result.parentName).toBe('Jane Doe');
    expect(result.parentEmail).toBe('jane@example.com');
    expect(result.redirectTo).toBe('Parent Dashboard');
  });

  test('Enter valid code DAD789 (lowercase input) - account linked; case insensitive', () => {
    const expectedResult = 'Learner account linked successfully; proceed to parent dashboard';
    const validCode = 'dad789'; // lowercase input
    const learnerId = 'LEARNER003';
    
    const result = linkLearnerValid(validCode, learnerId);

    console.log('Test Case ID: CASE-071');
    console.log('Test Case Description: Validate entering valid parent link code');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Input Code: ${validCode} (lowercase)`);
    console.log(`Stored Code: ${result.parentCode} (uppercase)`);
    console.log(`Parent Name: ${result.parentName}`);

    if (result.success && result.accountLinked && result.parentCode === 'DAD789') {
      console.log('Outcome: PASSED - Case insensitive matching works');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.accountLinked).toBe(true);
    expect(result.parentCode).toBe('DAD789');
    expect(result.parentName).toBe('Bob Wilson');
  });

  test('Enter valid code GUARDIAN321 - account linked; proceed to parent dashboard', () => {
    const expectedResult = 'Learner account linked successfully; proceed to parent dashboard';
    const validCode = 'GUARDIAN321';
    const learnerId = 'LEARNER004';
    
    const result = linkLearnerValid(validCode, learnerId);

    console.log('Test Case ID: CASE-071');
    console.log('Test Case Description: Validate entering valid parent link code');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Parent Name: ${result.parentName}`);
    console.log(`Account Linked: ${result.accountLinked}`);

    if (result.success && result.accountLinked && result.isLinked) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.accountLinked).toBe(true);
    expect(result.isLinked).toBe(true);
    expect(result.parentCode).toBe('GUARDIAN321');
    expect(result.parentName).toBe('Mary Johnson');
    expect(result.redirectTo).toBe('Parent Dashboard');
  });

  test('Link state persists after successful link', () => {
    const validCode = 'PARENT123';
    const learnerId = 'LEARNER005';
    
    const result = linkLearnerValid(validCode, learnerId);
    
    // Verify state was updated
    console.log('Test Case ID: CASE-071');
    console.log('Test Case Description: Validate entering valid parent link code');
    console.log('Test: Link state persists');
    console.log(`State - isLinked: ${linkState.isLinked}`);
    console.log(`State - parentCode: ${linkState.parentCode}`);
    console.log(`State - learnerId: ${linkState.learnerId}`);
    console.log(`State - parentName: ${linkState.parentInfo ? linkState.parentInfo.parentName : 'N/A'}`);

    if (linkState.isLinked && linkState.parentCode === 'PARENT123' && linkState.learnerId === 'LEARNER005') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(linkState.isLinked).toBe(true);
    expect(linkState.parentCode).toBe('PARENT123');
    expect(linkState.learnerId).toBe('LEARNER005');
    expect(linkState.parentInfo).not.toBeNull();
    expect(linkState.parentInfo.parentName).toBe('John Smith');
  });

  test('Enter invalid code - link fails (negative test)', () => {
    const invalidCode = 'INVALID1';
    const learnerId = 'LEARNER006';
    
    const result = linkLearnerValid(invalidCode, learnerId);

    console.log('Test Case ID: CASE-071');
    console.log('Test Case Description: Validate entering valid parent link code');
    console.log('Expected Result: Learner account linked successfully (for valid code)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Account Linked: ${result.accountLinked}`);

    if (!result.success && !result.accountLinked && !result.isLinked) {
      console.log('Outcome: PASSED - Correctly rejected invalid code');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.accountLinked).toBe(false);
    expect(result.isLinked).toBe(false);
    expect(linkState.isLinked).toBe(false);
    expect(linkState.parentCode).toBeNull();
  });

  test('Enter empty code - link fails (negative test)', () => {
    const learnerId = 'LEARNER007';
    
    const result = linkLearnerValid('', learnerId);

    console.log('Test Case ID: CASE-071');
    console.log('Test Case Description: Validate entering valid parent link code');
    console.log('Expected Result: Learner account linked successfully (when code provided)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.accountLinked) {
      console.log('Outcome: PASSED - Correctly rejected empty code');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.accountLinked).toBe(false);
    expect(result.errorMessage).toContain('enter a parent link code');
  });

});
