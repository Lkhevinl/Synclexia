// ─── Test Case CASE-084 ──────────────────────────────────────────────────────
// Test Case ID: CASE-084
// Test Case Description: Validate user with valid required input
// Expected Result: Can update profile information

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

function updateUserProfileValid(profileData, userId) {
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

  // Validate email format if provided
  if (profileData.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Please enter a valid email address',
        invalidField: 'email'
      };
    }
  }

  // Validate firstName if provided
  if (profileData.firstName !== undefined) {
    if (/[^a-zA-Z\s\-'\.]/.test(profileData.firstName)) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'First name contains invalid characters',
        invalidField: 'firstName'
      };
    }
    if (profileData.firstName.length > 50) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'First name too long (max 50 characters)',
        invalidField: 'firstName'
      };
    }
  }

  // Validate lastName if provided
  if (profileData.lastName !== undefined) {
    if (/[^a-zA-Z\s\-'\.]/.test(profileData.lastName)) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Last name contains invalid characters',
        invalidField: 'lastName'
      };
    }
    if (profileData.lastName.length > 50) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Last name too long (max 50 characters)',
        invalidField: 'lastName'
      };
    }
  }

  // Validate phone format if provided
  if (profileData.phone !== undefined && profileData.phone.trim() !== '') {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(profileData.phone)) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Please enter a valid phone number',
        invalidField: 'phone'
      };
    }
  }

  // Validate date of birth if provided
  if (profileData.dateOfBirth !== undefined && profileData.dateOfBirth.trim() !== '') {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(profileData.dateOfBirth)) {
      return {
        success: false,
        actualResult: 'Cannot update profile information',
        profileUpdated: false,
        errorMessage: 'Date of birth must be in YYYY-MM-DD format',
        invalidField: 'dateOfBirth'
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
        invalidField: 'dateOfBirth'
      };
    }
  }

  const oldProfile = { ...userProfile };

  // Update profile
  userProfile = { 
    ...userProfile, 
    ...profileData, 
    lastUpdated: new Date().toISOString() 
  };

  return {
    success: true,
    actualResult: 'Can update profile information',
    profileUpdated: true,
    updatedFields: Object.keys(profileData),
    oldValues: {
      firstName: oldProfile.firstName,
      lastName: oldProfile.lastName,
      email: oldProfile.email,
      phone: oldProfile.phone
    },
    newValues: {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phone: userProfile.phone
    },
    updateTimestamp: userProfile.lastUpdated,
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

describe('Test Case CASE-084 (Validate user with valid required input)', () => {

  beforeEach(() => {
    resetProfileState();
  });

  test('Update with valid email - can update profile information', () => {
    const expectedResult = 'Can update profile information';
    const validData = {
      email: 'newemail@example.com'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileValid(validData, userId);

    console.log('Test Case ID: CASE-084');
    console.log('Test Case Description: Validate user with valid required input');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Updated Fields: ${result.updatedFields.join(', ')}`);
    console.log(`Old Email: ${result.oldValues.email}`);
    console.log(`New Email: ${result.newValues.email}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(result.actualResult).toContain('Can update');
    expect(result.updatedFields).toContain('email');
    expect(result.oldValues.email).toBe('user@example.com');
    expect(result.newValues.email).toBe('newemail@example.com');
    expect(userProfile.email).toBe('newemail@example.com');
  });

  test('Update with valid firstName - can update profile information', () => {
    const validData = {
      firstName: 'Johnny'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileValid(validData, userId);

    console.log('Test Case ID: CASE-084');
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
    expect(userProfile.firstName).toBe('Johnny');
  });

  test('Update with valid lastName - can update profile information', () => {
    const validData = {
      lastName: 'Johnson'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileValid(validData, userId);

    console.log('Test Case ID: CASE-084');
    console.log(`Old LastName: ${result.oldValues.lastName}`);
    console.log(`New LastName: ${result.newValues.lastName}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(result.updatedFields).toEqual(['lastName']);
    expect(userProfile.lastName).toBe('Johnson');
  });

  test('Update with valid phone - can update profile information', () => {
    const validData = {
      phone: '555-987-6543'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileValid(validData, userId);

    console.log('Test Case ID: CASE-084');
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Updated Fields: ${result.updatedFields ? result.updatedFields.join(', ') : 'none'}`);
    if (result.oldValues) {
      console.log(`Old Phone: ${result.oldValues.phone}`);
    }
    if (result.newValues) {
      console.log(`New Phone: ${result.newValues.phone}`);
    }

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
      console.log(`Error: ${result.errorMessage}`);
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(result.updatedFields).toEqual(['phone']);
    expect(userProfile.phone).toBe('555-987-6543');
  });

  test('Update multiple fields with valid data - can update profile information', () => {
    const validData = {
      email: 'updated@example.com',
      firstName: 'Jonathan',
      lastName: 'Williams',
      phone: '555-777-8888'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileValid(validData, userId);

    console.log('Test Case ID: CASE-084');
    console.log('Updating multiple fields:');
    console.log(`Profile Updated: ${result.profileUpdated}`);
    console.log(`Updated Fields: ${result.updatedFields ? result.updatedFields.join(', ') : 'none'}`);
    if (result.oldValues && result.newValues) {
      console.log(`  Email: ${result.oldValues.email} → ${result.newValues.email}`);
      console.log(`  FirstName: ${result.oldValues.firstName} → ${result.newValues.firstName}`);
      console.log(`  LastName: ${result.oldValues.lastName} → ${result.newValues.lastName}`);
      console.log(`  Phone: ${result.oldValues.phone} → ${result.newValues.phone}`);
    }

    if (result.success && result.updatedFields && result.updatedFields.length === 4) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
      if (result.errorMessage) {
        console.log(`Error: ${result.errorMessage}`);
      }
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(result.updatedFields).toHaveLength(4);
    expect(userProfile.email).toBe('updated@example.com');
    expect(userProfile.firstName).toBe('Jonathan');
    expect(userProfile.lastName).toBe('Williams');
    expect(userProfile.phone).toBe('555-777-8888');
  });

  test('Update with valid date of birth - can update profile information', () => {
    const validData = {
      dateOfBirth: '1990-03-25'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileValid(validData, userId);

    console.log('Test Case ID: CASE-084');
    console.log(`New Date of Birth: ${userProfile.dateOfBirth}`);

    if (result.success && result.profileUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(userProfile.dateOfBirth).toBe('1990-03-25');
  });

  test('Profile state updated correctly after update', () => {
    const validData = {
      firstName: 'Robert',
      lastName: 'Anderson'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileValid(validData, userId);

    console.log('Test Case ID: CASE-084');
    console.log('Verifying profile state:');
    console.log(`  FirstName: ${userProfile.firstName}`);
    console.log(`  LastName: ${userProfile.lastName}`);
    console.log(`  LastUpdated: ${userProfile.lastUpdated}`);

    if (userProfile.firstName === 'Robert' && 
        userProfile.lastName === 'Anderson' &&
        userProfile.lastUpdated !== undefined) {
      console.log('Outcome: PASSED - Profile state correctly updated');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(userProfile.firstName).toBe('Robert');
    expect(userProfile.lastName).toBe('Anderson');
    expect(userProfile.lastUpdated).toBeDefined();
  });

  test('Update with invalid data - cannot update (negative test)', () => {
    const invalidData = {
      email: 'not-an-email',
      firstName: 'John'
    };
    const userId = 'USER001';
    
    const result = updateUserProfileValid(invalidData, userId);

    console.log('Test Case ID: CASE-084');
    console.log('Expected Result: Can update profile information (for valid input)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.profileUpdated) {
      console.log('Outcome: PASSED - Correctly rejected invalid email');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.profileUpdated).toBe(false);
    expect(result.errorMessage).toContain('valid email');
  });

  test('Update without authentication - cannot update (negative test)', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Smith'
    };
    const userId = '';
    
    const result = updateUserProfileValid(validData, userId);

    console.log('Test Case ID: CASE-084');
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
