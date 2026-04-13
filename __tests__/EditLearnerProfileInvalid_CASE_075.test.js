// ─── Test Case CASE-075 ──────────────────────────────────────────────────────
// Test Case ID: CASE-075
// Test Case Description: Validate user with invalid required input
// Expected Result: Cannot update learner profile information

// Mock learner profile state
let learnerProfile = {
  learnerId: 'LEARNER001',
  firstName: 'Alex',
  lastName: 'Johnson',
  age: 7,
  grade: '1st Grade',
  avatar: 'avatar1.png',
  learningLevel: 'Beginner'
};

function updateLearnerProfileInvalid(profileData, parentId) {
  // Check if parent is authenticated
  if (!parentId || parentId.trim() === '') {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information - Not authenticated',
      profileUpdated: false,
      errorMessage: 'Please log in as parent to update profile'
    };
  }

  // Check if profile data is provided
  if (!profileData || Object.keys(profileData).length === 0) {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information - No data provided',
      profileUpdated: false,
      errorMessage: 'Please provide profile information to update'
    };
  }

  // Validate age (if provided)
  if (profileData.age !== undefined) {
    const age = parseInt(profileData.age);
    if (isNaN(age)) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'Age must be a valid number',
        invalidField: 'age',
        invalidValue: profileData.age
      };
    }
    if (age < 3 || age > 18) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'Age must be between 3 and 18 years',
        invalidField: 'age',
        invalidValue: profileData.age
      };
    }
  }

  // Validate firstName (if provided)
  if (profileData.firstName !== undefined) {
    if (profileData.firstName.length > 50) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'First name must be 50 characters or less',
        invalidField: 'firstName',
        invalidValue: profileData.firstName
      };
    }
    if (/[^a-zA-Z\s\-'.]/.test(profileData.firstName)) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'First name contains invalid characters',
        invalidField: 'firstName',
        invalidValue: profileData.firstName
      };
    }
  }

  // Validate lastName (if provided)
  if (profileData.lastName !== undefined) {
    if (profileData.lastName.length > 50) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'Last name must be 50 characters or less',
        invalidField: 'lastName',
        invalidValue: profileData.lastName
      };
    }
    if (/[^a-zA-Z\s\-'.]/.test(profileData.lastName)) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'Last name contains invalid characters',
        invalidField: 'lastName',
        invalidValue: profileData.lastName
      };
    }
  }

  // Update profile
  learnerProfile = { ...learnerProfile, ...profileData };

  return {
    success: true,
    actualResult: 'Learner profile updated successfully',
    profileUpdated: true,
    updatedFields: Object.keys(profileData),
    learnerProfile: learnerProfile
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
    learningLevel: 'Beginner'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-075 (Validate user with invalid required input)', () => {

  beforeEach(() => {
    resetProfileState();
  });

  test('Update with invalid age (text) - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 'abc'
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalid(invalidData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log('Test Case Description: Validate user with invalid required input');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Error Message: ${result.errorMessage}`);
    console.log(`Invalid Field: ${result.invalidField}`);
    console.log(`Invalid Value: ${result.invalidValue}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.actualResult).toContain('Cannot update');
    expect(result.errorMessage).toContain('valid number');
    expect(result.invalidField).toBe('age');
    expect(result.invalidValue).toBe('abc');
  });

  test('Update with age too young (2) - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 2
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalid(invalidData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Age: 2 (too young)`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('between 3 and 18');
    expect(result.invalidField).toBe('age');
  });

  test('Update with age too old (25) - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 25
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalid(invalidData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Age: 25 (too old)`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('between 3 and 18');
    expect(result.invalidField).toBe('age');
  });

  test('Update with firstName too long - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'A'.repeat(60),
      lastName: 'Johnson',
      age: 7
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalid(invalidData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`firstName length: ${invalidData.firstName.length} (too long)`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('50 characters');
    expect(result.invalidField).toBe('firstName');
  });

  test('Update with invalid characters in firstName - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'Alex@123',
      lastName: 'Johnson',
      age: 7
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalid(invalidData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`firstName: "${invalidData.firstName}" (invalid characters)`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('invalid characters');
    expect(result.invalidField).toBe('firstName');
  });

  test('Update with invalid characters in lastName - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'Alex',
      lastName: 'Johnson!@#',
      age: 7
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalid(invalidData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`lastName: "${invalidData.lastName}" (invalid characters)`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('invalid characters');
    expect(result.invalidField).toBe('lastName');
  });

  test('Update with valid data - profile updated (negative test)', () => {
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalid(validData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log('Test Case Description: Validate user with invalid required input');
    console.log('Expected Result: Cannot update learner profile information (for invalid input)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED - Correctly handled valid data');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(learnerProfile.lastName).toBe('Smith');
    expect(learnerProfile.age).toBe(8);
  });

  test('Update without parent authentication - cannot update (negative test)', () => {
    const profileData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 7
    };
    const parentId = '';
    
    const result = updateLearnerProfileInvalid(profileData, parentId);

    console.log('Test Case ID: CASE-075');
    console.log('Test Case Description: Validate user with invalid required input');
    console.log('Expected Result: Cannot update learner profile information (for invalid input)');
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
