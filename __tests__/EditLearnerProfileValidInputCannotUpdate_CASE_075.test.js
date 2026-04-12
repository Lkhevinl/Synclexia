// ─── Test Case CASE-075 ──────────────────────────────────────────────────────
// Test Case ID: CASE-075
// Test Case Description: Validate user with valid required input
// Expected Result: Cannot update learner profile information

// Mock learner profile state with restrictions
let learnerProfile = {
  learnerId: 'LEARNER001',
  firstName: 'Alex',
  lastName: 'Johnson',
  age: 7,
  grade: '1st Grade',
  avatar: 'avatar1.png',
  learningLevel: 'Beginner',
  accountStatus: 'restricted',
  lastUpdateTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), // 23 hours ago
  restrictionReason: 'Pending verification'
};

let updateAttemptsToday = 3;

function updateLearnerProfileValidBlocked(profileData, parentId) {
  // Check if parent is authenticated
  if (!parentId || parentId.trim() === '') {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Please log in as parent to update profile',
      blockReason: 'authentication'
    };
  }

  // Check if account is restricted
  if (learnerProfile.accountStatus === 'restricted') {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: `Account is restricted: ${learnerProfile.restrictionReason}`,
      blockReason: 'account_restricted',
      accountStatus: learnerProfile.accountStatus
    };
  }

  // Check if account is suspended
  if (learnerProfile.accountStatus === 'suspended') {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Account is suspended. Please contact support.',
      blockReason: 'account_suspended'
    };
  }

  // Check 24-hour cooldown between updates
  const lastUpdate = new Date(learnerProfile.lastUpdateTime);
  const now = new Date();
  const hoursSinceLastUpdate = (now - lastUpdate) / (1000 * 60 * 60);
  
  if (hoursSinceLastUpdate < 24) {
    const hoursRemaining = Math.ceil(24 - hoursSinceLastUpdate);
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: `Please wait ${hoursRemaining} hour(s) before updating again`,
      blockReason: 'cooldown_active',
      hoursRemaining: hoursRemaining
    };
  }

  // Check daily update limit (max 3 per day)
  if (updateAttemptsToday >= 3) {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Maximum daily updates reached (3/3). Try again tomorrow.',
      blockReason: 'daily_limit_reached',
      attemptsToday: updateAttemptsToday
    };
  }

  // All validations passed
  updateAttemptsToday++;
  learnerProfile = { 
    ...learnerProfile, 
    ...profileData, 
    lastUpdateTime: new Date().toISOString() 
  };

  return {
    success: true,
    actualResult: 'Learner profile updated successfully',
    profileUpdated: true,
    updatedFields: Object.keys(profileData)
  };
}

// Reset state before each test
function resetProfileState() {
  learnerProfile = {
    learnerId: 'LEARNER001',
    firstName: 'Alex',
    lastName: 'Johnson',
    age: 7,
    grade: '1st Grade',
    avatar: 'avatar1.png',
    learningLevel: 'Beginner',
    accountStatus: 'restricted',
    lastUpdateTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    restrictionReason: 'Pending verification'
  };
  updateAttemptsToday = 3;
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-075 (Validate user with valid required input)', () => {

  beforeEach(() => {
    resetProfileState();
  });

  test('Valid input but account restricted - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8,
      grade: '2nd Grade'
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValidBlocked(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log('Test Case Description: Validate user with valid required input');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Error Message: ${result.errorMessage}`);
    console.log(`Block Reason: ${result.blockReason}`);
    console.log(`Account Status: ${result.accountStatus}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.actualResult).toContain('Cannot update');
    expect(result.errorMessage).toContain('restricted');
    expect(result.blockReason).toBe('account_restricted');
    expect(result.accountStatus).toBe('restricted');
  });

  test('Valid input but cooldown active - cannot update profile', () => {
    // Set active account but recent update
    learnerProfile.accountStatus = 'active';
    learnerProfile.lastUpdateTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
    updateAttemptsToday = 1;
    
    const expectedResult = 'Cannot update learner profile information';
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValidBlocked(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Hours Since Last Update: 2 (cooldown: 24h)`);
    console.log(`Hours Remaining: ${result.hoursRemaining}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('wait');
    expect(result.blockReason).toBe('cooldown_active');
    expect(result.hoursRemaining).toBeGreaterThan(0);
  });

  test('Valid input but daily limit reached - cannot update profile', () => {
    // Set active account, cooldown passed, but max attempts
    learnerProfile.accountStatus = 'active';
    learnerProfile.lastUpdateTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
    updateAttemptsToday = 3;
    
    const expectedResult = 'Cannot update learner profile information';
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValidBlocked(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Update Attempts Today: ${result.attemptsToday}/3`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('Maximum');
    expect(result.blockReason).toBe('daily_limit_reached');
    expect(result.attemptsToday).toBe(3);
  });

  test('Valid input but account suspended - cannot update profile', () => {
    learnerProfile.accountStatus = 'suspended';
    learnerProfile.restrictionReason = 'Policy violation';
    
    const expectedResult = 'Cannot update learner profile information';
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValidBlocked(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Account Status: suspended`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('suspended');
    expect(result.blockReason).toBe('account_suspended');
  });

  test('Valid input with all restrictions cleared - profile updates (negative test)', () => {
    // Clear all restrictions
    learnerProfile.accountStatus = 'active';
    learnerProfile.lastUpdateTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
    updateAttemptsToday = 0;
    
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValidBlocked(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log('Test Case Description: Validate user with valid required input');
    console.log('Expected Result: Cannot update learner profile information');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED - Profile updated when restrictions removed');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(learnerProfile.lastName).toBe('Smith');
    expect(learnerProfile.age).toBe(8);
    expect(updateAttemptsToday).toBe(1);
  });

  test('Multiple valid attempts on restricted account - all blocked', () => {
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8
    };
    const parentId = 'PARENT001';
    
    // First attempt
    const result1 = updateLearnerProfileValidBlocked(validData, parentId);
    expect(result1.success).toBe(false);
    expect(result1.profileUpdated).toBe(false);
    
    // Second attempt with different valid data
    const result2 = updateLearnerProfileValidBlocked({ ...validData, grade: '3rd Grade' }, parentId);

    console.log('Test Case ID: CASE-075');
    console.log('Test: Multiple valid attempts');
    console.log(`Attempt 1: Updated=${result1.profileUpdated}, Reason=${result1.blockReason}`);
    console.log(`Attempt 2: Updated=${result2.profileUpdated}, Reason=${result2.blockReason}`);

    if (!result2.success && !result2.profileUpdated && result2.blockReason === 'account_restricted') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(false);
    expect(result2.profileUpdated).toBe(false);
    expect(result2.blockReason).toBe('account_restricted');
  });

  test('Valid input without authentication - cannot update (negative test)', () => {
    const validData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 7
    };
    const parentId = '';
    
    const result = updateLearnerProfileValidBlocked(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Block Reason: ${result.blockReason}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('log in');
    expect(result.blockReason).toBe('authentication');
  });

});
