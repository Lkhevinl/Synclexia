// ─── Test Case CASE-083 ──────────────────────────────────────────────────────
// Test Case ID: CASE-083
// Test Case Description: Validate user with invalid required input
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
  timezone: 'America/New_York'
};

function updateUserProfileInvalid(profileData, userId) {
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
      errorMessage: 'Please provide profile information to update'
    };
  }

  // Validate email format
  if (profileData.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Please enter a valid email address',
        invalidField: 'email',
        invalidValue: profileData.email
      };
    }
  }

  // Validate firstName - no special characters
  if (profileData.firstName !== undefined) {
    if (/[^a-zA-Z\s\-'\.]/.test(profileData.firstName)) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'First name contains invalid characters',
        invalidField: 'firstName',
        invalidValue: profileData.firstName
      };
    }
    if (profileData.firstName.length > 50) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
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
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Last name contains invalid characters',
        invalidField: 'lastName',
        invalidValue: profileData.lastName
      };
    }
    if (profileData.lastName.length > 50) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Last name too long (max 50 characters)',
        invalidField: 'lastName',
        invalidValue: profileData.lastName
      };
    }
  }

  // Validate phone format
  if (profileData.phone !== undefined && profileData.phone.trim() !== '') {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(profileData.phone)) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Please enter a valid phone number',
        invalidField: 'phone',
        invalidValue: profileData.phone
      };
    }
  }

  // Validate date of birth
  if (profileData.dateOfBirth !== undefined && profileData.dateOfBirth.trim() !== '') {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(profileData.dateOfBirth)) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Date of birth must be in YYYY-MM-DD format',
        invalidField: 'dateOfBirth',
        invalidValue: profileData.dateOfBirth
      };
    }
    const dob = new Date(profileData.dateOfBirth);
    const today = new Date();
    if (dob > today) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Date of birth cannot be in the future',
        invalidField: 'dateOfBirth',
        invalidValue: profileData.dateOfBirth
      };
    }
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
    timezone: 'America/New_York'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-083 (Validate user with invalid required input)', () => {

  beforeEach(() => {
    resetProfileState();
  });

  test('Update with invalid email format - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const invalidData = {
      email: 'invalid-email-format',
      firstName: 'John',
      lastName: 'Smith'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileInvalid(invalidData, userId);

    console.log('Test Case ID: CASE-083');
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
    expect(result.errorMessage).toContain('valid email');
    expect(result.invalidField).toBe('email');
    expect(result.invalidValue).toBe('invalid-email-format');
  });

  test('Update with special characters in firstName - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const invalidData = {
      email: 'user@example.com',
      firstName: 'John@123!',
      lastName: 'Smith'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileInvalid(invalidData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`firstName: "${invalidData.firstName}" (invalid characters)`);
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

  test('Update with firstName too long - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const invalidData = {
      email: 'user@example.com',
      firstName: 'A'.repeat(51),
      lastName: 'Smith'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileInvalid(invalidData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`firstName length: ${invalidData.firstName.length} (max 50)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('too long');
    expect(result.invalidField).toBe('firstName');
  });

  test('Update with special characters in lastName - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const invalidData = {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Smith#$%'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileInvalid(invalidData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`lastName: "${invalidData.lastName}" (invalid characters)`);
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

  test('Update with invalid phone format - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const invalidData = {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Smith',
      phone: 'not-a-phone-number'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileInvalid(invalidData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`phone: "${invalidData.phone}" (invalid format)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('valid phone');
    expect(result.invalidField).toBe('phone');
  });

  test('Update with invalid date of birth format - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const invalidData = {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: '06-15-1985'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileInvalid(invalidData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`dateOfBirth: "${invalidData.dateOfBirth}" (wrong format)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('YYYY-MM-DD');
    expect(result.invalidField).toBe('dateOfBirth');
  });

  test('Update with future date of birth - cannot update profile', () => {
    const expectedResult = 'Cannot update profile information';
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const invalidData = {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: futureDate.toISOString().split('T')[0]
    };
    const userId = 'USER001';
    
    const result = updateUserProfileInvalid(invalidData, userId);

    console.log('Test Case ID: CASE-083');
    console.log(`dateOfBirth: "${invalidData.dateOfBirth}" (future date)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('future');
    expect(result.invalidField).toBe('dateOfBirth');
  });

  test('Update with valid data - profile updated (negative test)', () => {
    const validData = {
      email: 'newemail@example.com',
      firstName: 'Johnny',
      lastName: 'Smith'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileInvalid(validData, userId);

    console.log('Test Case ID: CASE-083');
    console.log('Test Case Description: Validate user with invalid required input');
    console.log('Expected Result: Cannot update profile information (for invalid input)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED - Valid data accepted');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(userProfile.firstName).toBe('Johnny');
    expect(userProfile.email).toBe('newemail@example.com');
  });

  test('Update without authentication - cannot update (negative test)', () => {
    const invalidData = {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Smith'
    };
    const userId = '';
    
    const result = updateUserProfileInvalid(invalidData, userId);

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

});
