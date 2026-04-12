// ─── Test Case CASE-076 ──────────────────────────────────────────────────────
// Test Case ID: CASE-076
// Test Case Description: Validate user with valid required input
// Expected Result: Cannot update learner profile information

// Mock learner profile state with restricted access
let learnerProfile = {
  learnerId: 'LEARNER001',
  firstName: 'Alex',
  lastName: 'Johnson',
  age: 7,
  grade: '1st Grade',
  avatar: 'avatar1.png',
  learningLevel: 'Beginner',
  accountStatus: 'restricted', // Account is restricted
  lastUpdateTime: new Date().toISOString()
};

let updateAttempts = 0;

function updateLearnerProfileRestricted(profileData, parentId) {
  // Check if parent is authenticated
  if (!parentId || parentId.trim() === '') {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Please log in as parent to update profile'
    };
  }

  // Check if account is restricted from updates
  if (learnerProfile.accountStatus === 'restricted') {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Account is currently restricted from profile updates. Please contact support.',
      accountStatus: learnerProfile.accountStatus,
      restrictionReason: 'Administrative restriction in place'
    };
  }

  // Check if profile is locked (update cooldown)
  const lastUpdate = new Date(learnerProfile.lastUpdateTime);
  const now = new Date();
  const hoursSinceLastUpdate = (now - lastUpdate) / (1000 * 60 * 60);
  
  if (hoursSinceLastUpdate < 24) {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Profile can only be updated once per 24 hours. Please try again later.',
      hoursRemaining: Math.ceil(24 - hoursSinceLastUpdate)
    };
  }

  // Check update attempt limit
  if (updateAttempts >= 3) {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Maximum update attempts reached for today. Please try again tomorrow.',
      attemptsRemaining: 0
    };
  }

  // All validations passed - this should not happen per the test case
  // But included for completeness
  updateAttempts++;
  learnerProfile = { ...learnerProfile, ...profileData, lastUpdateTime: new Date().toISOString() };

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
    lastUpdateTime: new Date().toISOString()
  };
  updateAttempts = 0;
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-076 (Validate user with valid required input)', () => {

  beforeEach(() => {
    resetProfileState();
  });

  test('Valid input but restricted account - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8,
      grade: '2nd Grade'
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileRestricted(validData, parentId);

    console.log('Test Case ID: CASE-076');
    console.log('Test Case Description: Validate user with valid required input');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Error Message: ${result.errorMessage}`);
    console.log(`Account Status: ${result.accountStatus}`);
    console.log(`Restriction Reason: ${result.restrictionReason}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.actualResult).toContain('Cannot update');
    expect(result.errorMessage).toContain('restricted');
    expect(result.accountStatus).toBe('restricted');
  });

  test('Valid input but update cooldown active - cannot update profile', () => {
    // Set last update to just now (within 24 hours)
    learnerProfile.accountStatus = 'active';
    learnerProfile.lastUpdateTime = new Date().toISOString();
    
    const expectedResult = 'Cannot update learner profile information';
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileRestricted(validData, parentId);

    console.log('Test Case ID: CASE-076');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Last Update: Just now (cooldown active)`);
    console.log(`Hours Remaining: ${result.hoursRemaining}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('24 hours');
    expect(result.hoursRemaining).toBeGreaterThan(0);
  });

  test('Valid input but max attempts reached - cannot update profile', () => {
    // Set max attempts reached
    learnerProfile.accountStatus = 'active';
    learnerProfile.lastUpdateTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
    updateAttempts = 3;
    
    const expectedResult = 'Cannot update learner profile information';
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileRestricted(validData, parentId);

    console.log('Test Case ID: CASE-076');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Update Attempts: ${updateAttempts} (max reached)`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('Maximum');
    expect(result.attemptsRemaining).toBe(0);
  });

  test('Valid input with unrestricted account - profile can update (negative test)', () => {
    // Set up unrestricted account
    learnerProfile.accountStatus = 'active';
    learnerProfile.lastUpdateTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
    updateAttempts = 0;
    
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileRestricted(validData, parentId);

    console.log('Test Case ID: CASE-076');
    console.log('Test Case Description: Validate user with valid required input');
    console.log('Expected Result: Cannot update learner profile information');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Account Status: ${learnerProfile.accountStatus}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED - Profile updated successfully when restrictions removed');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(learnerProfile.lastName).toBe('Smith');
    expect(learnerProfile.age).toBe(8);
  });

  test('Multiple valid attempts on restricted account - all rejected', () => {
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8
    };
    const parentId = 'PARENT001';
    
    // First attempt
    const result1 = updateLearnerProfileRestricted(validData, parentId);
    expect(result1.success).toBe(false);
    expect(result1.profileUpdated).toBe(false);
    
    // Second attempt with different data
    const result2 = updateLearnerProfileRestricted({ ...validData, grade: '2nd Grade' }, parentId);

    console.log('Test Case ID: CASE-076');
    console.log(`Attempt 1: Valid data - Updated: ${result1.profileUpdated}`);
    console.log(`Attempt 2: Valid data - Updated: ${result2.profileUpdated}`);
    console.log(`Account Status: ${learnerProfile.accountStatus}`);

    if (!result2.success && !result2.profileUpdated) {
      console.log('Outcome: PASSED - All valid attempts rejected due to restrictions');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(false);
    expect(result2.profileUpdated).toBe(false);
    expect(learnerProfile.accountStatus).toBe('restricted');
  });

  test('Valid input without parent authentication - cannot update (negative test)', () => {
    const validData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 7
    };
    const parentId = '';
    
    const result = updateLearnerProfileRestricted(validData, parentId);

    console.log('Test Case ID: CASE-076');
    console.log('Test Case Description: Validate user with valid required input');
    console.log('Expected Result: Cannot update learner profile information');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated parent');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

});
