// ─── Test Case CASE-075 ──────────────────────────────────────────────────────
// Test Case ID: CASE-075
// Test Case Description: Validate user with valid required input
// Expected Result: Can update learner profile information

// Mock learner profile state - no restrictions
let learnerProfile = {
  learnerId: 'LEARNER001',
  firstName: 'Alex',
  lastName: 'Johnson',
  age: 7,
  grade: '1st Grade',
  avatar: 'avatar1.png',
  learningLevel: 'Beginner',
  accountStatus: 'active',
  lastUpdateTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
  parentId: 'PARENT001'
};

let updateAttemptsToday = 0;

function updateLearnerProfileValid(profileData, parentId) {
  // Check if parent is authenticated
  if (!parentId || parentId.trim() === '') {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Please log in as parent to update profile'
    };
  }

  // Check if account is restricted
  if (learnerProfile.accountStatus !== 'active') {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Account is restricted'
    };
  }

  // Check 24-hour cooldown
  const lastUpdate = new Date(learnerProfile.lastUpdateTime);
  const now = new Date();
  const hoursSinceLastUpdate = (now - lastUpdate) / (1000 * 60 * 60);
  
  if (hoursSinceLastUpdate < 24) {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Please wait 24 hours between updates'
    };
  }

  // Check daily update limit
  if (updateAttemptsToday >= 3) {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Maximum daily updates reached'
    };
  }

  // Validate age
  if (profileData.age !== undefined) {
    const ageNum = parseInt(profileData.age);
    if (isNaN(ageNum) || ageNum < 3 || ageNum > 18) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'Age must be between 3 and 18'
      };
    }
  }

  // All validations passed - update profile
  updateAttemptsToday++;
  const oldProfile = { ...learnerProfile };
  learnerProfile = { 
    ...learnerProfile, 
    ...profileData, 
    lastUpdateTime: new Date().toISOString() 
  };

  return {
    success: true,
    actualResult: 'Can update learner profile information',
    profileUpdated: true,
    updatedFields: Object.keys(profileData),
    oldValues: {
      firstName: oldProfile.firstName,
      lastName: oldProfile.lastName,
      age: oldProfile.age,
      grade: oldProfile.grade
    },
    newValues: {
      firstName: learnerProfile.firstName,
      lastName: learnerProfile.lastName,
      age: learnerProfile.age,
      grade: learnerProfile.grade
    },
    updateTimestamp: learnerProfile.lastUpdateTime,
    attemptsRemaining: 3 - updateAttemptsToday
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
    accountStatus: 'active',
    lastUpdateTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    parentId: 'PARENT001'
  };
  updateAttemptsToday = 0;
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-075 (Validate user with valid required input)', () => {

  beforeEach(() => {
    resetProfileState();
  });

  test('Valid input - can update learner profile information', () => {
    const expectedResult = 'Can update learner profile information';
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8,
      grade: '2nd Grade'
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValid(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log('Test Case Description: Validate user with valid required input');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Updated Fields: ${result.updatedFields.join(', ')}`);
    console.log(`Old Values:`, result.oldValues);
    console.log(`New Values:`, result.newValues);
    console.log(`Update Timestamp: ${result.updateTimestamp}`);
    console.log(`Attempts Remaining: ${result.attemptsRemaining}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(result.actualResult).toContain('Can update');
    expect(result.updatedFields).toContain('firstName');
    expect(result.updatedFields).toContain('lastName');
    expect(result.updatedFields).toContain('age');
    expect(result.updatedFields).toContain('grade');
    expect(result.oldValues.lastName).toBe('Johnson');
    expect(result.newValues.lastName).toBe('Smith');
    expect(result.oldValues.age).toBe(7);
    expect(result.newValues.age).toBe(8);
    expect(result.attemptsRemaining).toBe(2);
  });

  test('Update firstName only - can update profile', () => {
    const validData = { firstName: 'Alexander' };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValid(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Updated Field: ${result.updatedFields.join(', ')}`);
    console.log(`Old FirstName: ${result.oldValues.firstName}`);
    console.log(`New FirstName: ${result.newValues.firstName}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(result.updatedFields).toEqual(['firstName']);
    expect(learnerProfile.firstName).toBe('Alexander');
  });

  test('Update age only - can update profile', () => {
    const validData = { age: 8 };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValid(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Updated Field: ${result.updatedFields.join(', ')}`);
    console.log(`Old Age: ${result.oldValues.age}`);
    console.log(`New Age: ${result.newValues.age}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(result.updatedFields).toEqual(['age']);
    expect(learnerProfile.age).toBe(8);
  });

  test('Update grade only - can update profile', () => {
    const validData = { grade: '2nd Grade' };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValid(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Updated Field: ${result.updatedFields.join(', ')}`);
    console.log(`Old Grade: ${result.oldValues.grade}`);
    console.log(`New Grade: ${result.newValues.grade}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(result.updatedFields).toEqual(['grade']);
    expect(learnerProfile.grade).toBe('2nd Grade');
  });

  test('Multiple updates within limit - can update profile multiple times', () => {
    const parentId = 'PARENT001';
    
    // First update
    const result1 = updateLearnerProfileValid({ lastName: 'Smith' }, parentId);
    expect(result1.success).toBe(true);
    expect(result1.attemptsRemaining).toBe(2);
    
    // Reset cooldown for second update
    learnerProfile.lastUpdateTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    
    // Second update
    const result2 = updateLearnerProfileValid({ age: 8 }, parentId);

    console.log('Test Case ID: CASE-075');
    console.log('Test: Multiple valid updates');
    console.log(`Update 1: Success=${result1.success}, Remaining=${result1.attemptsRemaining}`);
    console.log(`Update 2: Success=${result2.success}, Remaining=${result2.attemptsRemaining}`);

    if (result2.success && result2.profileUpdated && result2.attemptsRemaining === 1) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(true);
    expect(result2.profileUpdated).toBe(true);
    expect(result2.attemptsRemaining).toBe(1);
    expect(learnerProfile.lastName).toBe('Smith');
    expect(learnerProfile.age).toBe(8);
  });

  test('Profile state updated correctly after successful update', () => {
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8,
      grade: '2nd Grade'
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValid(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log('Test: Verify profile state updated');
    console.log(`FirstName: ${learnerProfile.firstName}`);
    console.log(`LastName: ${learnerProfile.lastName}`);
    console.log(`Age: ${learnerProfile.age}`);
    console.log(`Grade: ${learnerProfile.grade}`);
    console.log(`LastUpdateTime: ${learnerProfile.lastUpdateTime}`);

    if (learnerProfile.lastName === 'Smith' && 
        learnerProfile.age === 8 && 
        learnerProfile.grade === '2nd Grade' &&
        learnerProfile.lastUpdateTime !== undefined) {
      console.log('Outcome: PASSED - Profile state correctly updated');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(learnerProfile.firstName).toBe('Alex');
    expect(learnerProfile.lastName).toBe('Smith');
    expect(learnerProfile.age).toBe(8);
    expect(learnerProfile.grade).toBe('2nd Grade');
    expect(learnerProfile.lastUpdateTime).toBeDefined();
  });

  test('Invalid input - cannot update profile (negative test)', () => {
    const invalidData = { age: 25 }; // Invalid age
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileValid(invalidData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log('Test Case Description: Validate user with valid required input');
    console.log('Expected Result: Can update learner profile information (for valid input)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED - Correctly rejected invalid input');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('between 3 and 18');
  });

  test('No parent authentication - cannot update (negative test)', () => {
    const validData = { firstName: 'Alex', lastName: 'Johnson', age: 7 };
    const parentId = '';
    
    const result = updateLearnerProfileValid(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

});
