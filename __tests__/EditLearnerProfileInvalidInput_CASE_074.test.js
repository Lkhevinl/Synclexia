// ─── Test Case CASE-074 ──────────────────────────────────────────────────────
// Test Case ID: CASE-074
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

function updateLearnerProfileInvalidInput(profileData, parentId) {
  // Check if parent is authenticated
  if (!parentId || parentId.trim() === '') {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Please log in as parent to update profile'
    };
  }

  // Check if profile data is provided
  if (!profileData || Object.keys(profileData).length === 0) {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Please provide profile information to update'
    };
  }

  // Validate age format and range
  if (profileData.age !== undefined) {
    const ageNum = parseInt(profileData.age);
    if (isNaN(ageNum)) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'Age must be a valid number',
        invalidField: 'age',
        invalidValue: profileData.age
      };
    }
    if (ageNum < 3 || ageNum > 18) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'Age must be between 3 and 18',
        invalidField: 'age',
        invalidValue: profileData.age
      };
    }
  }

  // Validate firstName - no special characters
  if (profileData.firstName !== undefined) {
    if (/[^a-zA-Z\s\-'\.]/.test(profileData.firstName)) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'First name contains invalid characters',
        invalidField: 'firstName',
        invalidValue: profileData.firstName
      };
    }
    if (profileData.firstName.length > 50) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'First name too long (max 50 characters)',
        invalidField: 'firstName',
        invalidValue: profileData.firstName
      };
    }
  }

  // Validate lastName - no special characters
  if (profileData.lastName !== undefined) {
    if (/[^a-zA-Z\s\-'\.]/.test(profileData.lastName)) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'Last name contains invalid characters',
        invalidField: 'lastName',
        invalidValue: profileData.lastName
      };
    }
    if (profileData.lastName.length > 50) {
      return {
        success: false,
        actualResult: 'Cannot update learner profile information',
        profileUpdated: false,
        errorMessage: 'Last name too long (max 50 characters)',
        invalidField: 'lastName',
        invalidValue: profileData.lastName
      };
    }
  }

  // Validate grade format
  const validGrades = ['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade'];
  if (profileData.grade !== undefined && !validGrades.includes(profileData.grade)) {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Invalid grade selected',
      invalidField: 'grade',
      invalidValue: profileData.grade
    };
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

describe('Test Case CASE-074 (Validate user with invalid required input)', () => {

  beforeEach(() => {
    resetProfileState();
  });

  test('Update with invalid age format (text) - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 'abc'
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalidInput(invalidData, parentId);

    console.log('Test Case ID: CASE-074');
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

  test('Update with age out of range (2) - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 2
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalidInput(invalidData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Age: 2 (below minimum)`);
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

  test('Update with age out of range (25) - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 25
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalidInput(invalidData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Age: 25 (above maximum)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('between 3 and 18');
  });

  test('Update with special characters in firstName - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'Alex@123!',
      lastName: 'Johnson',
      age: 7
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalidInput(invalidData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`firstName: "${invalidData.firstName}"`);
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

  test('Update with invalid grade - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const invalidData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 7,
      grade: 'College'
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalidInput(invalidData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Grade: "${invalidData.grade}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('Invalid grade');
    expect(result.invalidField).toBe('grade');
  });

  test('Update with valid data - profile updated (negative test)', () => {
    const validData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8,
      grade: '2nd Grade'
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfileInvalidInput(validData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log('Test Case Description: Validate user with invalid required input');
    console.log('Expected Result: Cannot update learner profile information (for invalid input)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED - Valid data accepted');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(learnerProfile.lastName).toBe('Smith');
    expect(learnerProfile.age).toBe(8);
  });

  test('Update without authentication - cannot update (negative test)', () => {
    const profileData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 7
    };
    const parentId = '';
    
    const result = updateLearnerProfileInvalidInput(profileData, parentId);

    console.log('Test Case ID: CASE-074');
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
