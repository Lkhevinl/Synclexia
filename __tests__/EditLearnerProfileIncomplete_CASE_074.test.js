// ─── Test Case CASE-074 ──────────────────────────────────────────────────────
// Test Case ID: CASE-074
// Test Case Description: Validate user with incomplete required input
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

const REQUIRED_FIELDS = ['firstName', 'lastName', 'age'];

function updateLearnerProfile(profileData, parentId) {
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

  // Check for missing required fields
  const missingFields = REQUIRED_FIELDS.filter(field => 
    !profileData[field] || profileData[field].toString().trim() === ''
  );

  if (missingFields.length > 0) {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: `Required fields missing: ${missingFields.join(', ')}`,
      missingFields: missingFields
    };
  }

  // Validate age is a number
  if (isNaN(parseInt(profileData.age)) || parseInt(profileData.age) < 3 || parseInt(profileData.age) > 18) {
    return {
      success: false,
      actualResult: 'Cannot update learner profile information',
      profileUpdated: false,
      errorMessage: 'Age must be a number between 3 and 18'
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

describe('Test Case CASE-074 (Validate user with incomplete required input)', () => {

  beforeEach(() => {
    resetProfileState();
  });

  test('Update with missing firstName - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const incompleteData = {
      lastName: 'Johnson',
      age: 7
      // firstName is missing
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfile(incompleteData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log('Test Case Description: Validate user with incomplete required input');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Error Message: ${result.errorMessage}`);
    console.log(`Missing Fields: ${result.missingFields ? result.missingFields.join(', ') : 'N/A'}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.actualResult).toContain('Cannot update');
    expect(result.errorMessage).toContain('firstName');
    expect(result.missingFields).toContain('firstName');
  });

  test('Update with missing lastName - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const incompleteData = {
      firstName: 'Alex',
      age: 7
      // lastName is missing
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfile(incompleteData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log('Test Case Description: Validate user with incomplete required input');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Missing Fields: ${result.missingFields ? result.missingFields.join(', ') : 'N/A'}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('lastName');
    expect(result.missingFields).toContain('lastName');
  });

  test('Update with missing age - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const incompleteData = {
      firstName: 'Alex',
      lastName: 'Johnson'
      // age is missing
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfile(incompleteData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log('Test Case Description: Validate user with incomplete required input');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Missing Fields: ${result.missingFields ? result.missingFields.join(', ') : 'N/A'}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('age');
    expect(result.missingFields).toContain('age');
  });

  test('Update with multiple missing fields - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const incompleteData = {
      // firstName, lastName, and age all missing
      grade: '2nd Grade'
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfile(incompleteData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log('Test Case Description: Validate user with incomplete required input');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Missing Fields: ${result.missingFields ? result.missingFields.join(', ') : 'N/A'}`);

    if (!result.success && !result.profileUpdated && result.missingFields.length === 3) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.missingFields).toHaveLength(3);
    expect(result.missingFields).toContain('firstName');
    expect(result.missingFields).toContain('lastName');
    expect(result.missingFields).toContain('age');
  });

  test('Update with empty firstName - cannot update profile', () => {
    const expectedResult = 'Cannot update learner profile information';
    const incompleteData = {
      firstName: '',
      lastName: 'Johnson',
      age: 7
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfile(incompleteData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`firstName: "" (empty string)`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('firstName');
  });

  test('Update with complete data - profile updated (negative test)', () => {
    const completeData = {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 8,
      grade: '2nd Grade'
    };
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfile(completeData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log('Test Case Description: Validate user with incomplete required input');
    console.log('Expected Result: Cannot update learner profile information (for incomplete input)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Updated LastName: ${result.learnerProfile ? result.learnerProfile.lastName : 'N/A'}`);
    console.log(`Updated Age: ${result.learnerProfile ? result.learnerProfile.age : 'N/A'}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED - Correctly handled complete data');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(learnerProfile.lastName).toBe('Smith');
    expect(learnerProfile.age).toBe(8);
  });

  test('Update without parent authentication - cannot update profile (negative test)', () => {
    const profileData = {
      firstName: 'Alex',
      lastName: 'Johnson',
      age: 7
    };
    const parentId = '';
    
    const result = updateLearnerProfile(profileData, parentId);

    console.log('Test Case ID: CASE-074');
    console.log('Test Case Description: Validate user with incomplete required input');
    console.log('Expected Result: Cannot update learner profile information (for incomplete input)');
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

  test('Update with no data - cannot update profile (negative test)', () => {
    const parentId = 'PARENT001';
    
    const result = updateLearnerProfile({}, parentId);

    console.log('Test Case ID: CASE-074');
    console.log('Test Case Description: Validate user with incomplete required input');
    console.log('Expected Result: Cannot update learner profile information');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED - Correctly rejected empty data');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('provide profile information');
  });

});
