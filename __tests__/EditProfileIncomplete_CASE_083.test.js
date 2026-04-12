// ─── Test Case CASE-083 ──────────────────────────────────────────────────────
// Test Case ID: CASE-083
// Test Case Description: Validate user with incomplete required input
// Expected Result: Cannot update profile information

// Mock user profile state
let userProfile = {
  userId: 'USER001',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Smith',
  phone: '+1-555-123-4567',
  avatar: 'avatar_default.png',
  dateOfBirth: '1985-06-15',
  timezone: 'America/New_York',
  createdAt: '2023-01-01T00:00:00Z',
  lastUpdated: '2024-01-15T10:30:00Z'
};

function updateUserProfileIncomplete(profileData, userId) {
  // Check if user is authenticated
  if (!userId || userId.trim() === '') {
    return {
      success: false,
      actualResult: 'Cannot update profile information',
      profileUpdated: false,
      errorMessage: 'Please log in to update your profile'
    };
  }

  // Check if profile data is provided
  if (!profileData || Object.keys(profileData).length === 0) {
    return {
      success: false,
      actualResult: 'Cannot update profile information',
      profileUpdated: false,
      errorMessage: 'Please provide profile information to update',
      missingFields: ['email', 'firstName', 'lastName']
    };
  }

  const requiredFields = ['email', 'firstName', 'lastName'];
  const missingFields = [];

  // Check for missing required fields
  for (const field of requiredFields) {
    if (!profileData[field] || profileData[field].trim() === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      success: false,
      actualResult: 'Cannot update profile information',
      profileUpdated: false,
      errorMessage: `Required field(s) missing: ${missingFields.join(', ')}`,
      missingFields: missingFields
    };
  }

  // Update profile
  userProfile = { 
    ...userProfile, 
    ...profileData, 
    lastUpdated: new Date().toISOString() 
  };

  return {
    success: true,
    actualResult: 'Profile updated successfully',
    profileUpdated: true,
    updatedFields: Object.keys(profileData),
    userProfile: userProfile
  };
}

// Reset state before each test
function resetProfileState() {
  userProfile = {
    userId: 'USER001',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1-555-123-4567',
    avatar: 'avatar_default.png',
    dateOfBirth: '1985-06-15',
    timezone: 'America/New_York',
    createdAt: '2023-01-01T00:00:00Z',
    lastUpdated: '2024-01-15T10:30:00Z'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-083 (Validate user with incomplete required input)', () => {

  beforeEach(() => {
    resetProfileState();
  });

  test('Update with missing email - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const incompleteData = {
      email: '',
      firstName: 'John',
      lastName: 'Smith'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileIncomplete(incompleteData, userId);

    console.log('Test Case ID: CASE-083');
    console.log('Test Case Description: Validate user with incomplete required input');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Error Message: ${result.errorMessage}`);
    console.log(`Missing Fields: ${result.missingFields ? result.missingFields.join(', ') : 'none'}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.actualResult).toContain('Cannot update');
    expect(result.errorMessage).toContain('email');
    expect(result.missingFields).toContain('email');
  });

  test('Update with missing firstName - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const incompleteData = {
      email: 'user@example.com',
      firstName: '',
      lastName: 'Smith'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileIncomplete(incompleteData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`firstName: "" (missing)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('firstName');
    expect(result.missingFields).toContain('firstName');
  });

  test('Update with missing lastName - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const incompleteData = {
      email: 'user@example.com',
      firstName: 'John',
      lastName: ''
    };
    const userId = 'USER001';
    
    const result = updateUserProfileIncomplete(incompleteData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`lastName: "" (missing)`);
    console.log(`Error: ${result.errorMessage}`);

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

  test('Update with multiple missing fields - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const incompleteData = {
      email: '',
      firstName: '',
      lastName: ''
    };
    const userId = 'USER001';
    
    const result = updateUserProfileIncomplete(incompleteData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`Missing: email, firstName, lastName`);
    console.log(`Missing Fields: ${result.missingFields ? result.missingFields.join(', ') : 'none'}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && result.missingFields.length === 3) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.missingFields).toHaveLength(3);
    expect(result.missingFields).toContain('email');
    expect(result.missingFields).toContain('firstName');
    expect(result.missingFields).toContain('lastName');
  });

  test('Update with empty profile data - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const incompleteData = {};
    const userId = 'USER001';
    
    const result = updateUserProfileIncomplete(incompleteData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`Profile data: {} (empty object)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('provide profile information');
  });

  test('Update with complete data - profile updated (negative test)', () => {
    const completeData = {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileIncomplete(completeData, userId);

    console.log('Test Case ID: CASE-083');
    console.log('Test Case Description: Validate user with incomplete required input');
    console.log('Expected Result: Cannot update profile information (for incomplete input)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED - Complete data accepted');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(userProfile.lastName).toBe('Doe');
    expect(result.updatedFields).toContain('lastName');
  });

  test('Update without authentication - cannot update (negative test)', () => {
    const incompleteData = {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Smith'
    };
    const userId = '';
    
    const result = updateUserProfileIncomplete(incompleteData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('Update only phone (optional field) - profile can update', () => {
    const incompleteData = {
      phone: '+1-555-987-6543'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileIncomplete(incompleteData, userId);

    console.log('Test Case ID: CASE-083');
    console.log('Test: Update optional field only (phone)');
    console.log(`Updated: ${result.profileUpdated}`);
    console.log(`Phone: ${userProfile.phone}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED - Optional fields can be updated independently');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(userProfile.phone).toBe('+1-555-987-6543');
  });

});
