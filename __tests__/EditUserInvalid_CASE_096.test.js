// ─── Test Case CASE-096 ──────────────────────────────────────────────────────
// Test Case ID: CASE-096
// Test Case Description: Validate editing user details with invalid inputs
// Expected Result: User details updated successfully

// Mock users data
let usersData = {
  users: [
    { userId: 'USER001', email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'parent', status: 'active' },
    { userId: 'USER002', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Jones', role: 'parent', status: 'active' },
    { userId: 'USER003', email: 'mike@example.com', firstName: 'Mike', lastName: 'Brown', role: 'learner', status: 'active' }
  ]
};

const VALID_ROLES = ['parent', 'learner', 'admin'];
const VALID_STATUSES = ['active', 'inactive'];

function editUserInvalid(adminId, userId, userData) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'User details not updated - Admin not authenticated',
      detailsUpdated: false,
      errorMessage: 'Please log in as admin to edit users'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'User details not updated - Insufficient privileges',
      detailsUpdated: false,
      errorMessage: 'You do not have permission to edit users'
    };
  }

  // Check if target user exists
  const targetUserIndex = usersData.users.findIndex(u => u.userId === userId);
  if (targetUserIndex === -1) {
    return {
      success: false,
      actualResult: 'User details not updated - User not found',
      detailsUpdated: false,
      errorMessage: 'User not found'
    };
  }

  const targetUser = usersData.users[targetUserIndex];
  const validationErrors = [];

  // Validate email if provided
  if (userData.email !== undefined) {
    if (userData.email.trim() === '') {
      validationErrors.push('Email cannot be empty');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        validationErrors.push('Invalid email format');
      } else {
        // Check for duplicate email (excluding current user)
        const existingUser = usersData.users.find(u => 
          u.email.toLowerCase() === userData.email.toLowerCase() && u.userId !== userId
        );
        if (existingUser) {
          validationErrors.push('Email already exists for another user');
        }
      }
    }
  }

  // Validate firstName if provided
  if (userData.firstName !== undefined) {
    if (userData.firstName.trim() === '') {
      validationErrors.push('First name cannot be empty');
    } else if (/[^a-zA-Z\s\-'\.]/.test(userData.firstName)) {
      validationErrors.push('First name contains invalid characters');
    }
  }

  // Validate lastName if provided
  if (userData.lastName !== undefined) {
    if (userData.lastName.trim() === '') {
      validationErrors.push('Last name cannot be empty');
    } else if (/[^a-zA-Z\s\-'\.]/.test(userData.lastName)) {
      validationErrors.push('Last name contains invalid characters');
    }
  }

  // Validate role if provided
  if (userData.role !== undefined) {
    if (!VALID_ROLES.includes(userData.role)) {
      validationErrors.push(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`);
    }
  }

  // Validate status if provided
  if (userData.status !== undefined) {
    if (!VALID_STATUSES.includes(userData.status)) {
      validationErrors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  // If there are validation errors, don't update
  if (validationErrors.length > 0) {
    return {
      success: false,
      actualResult: 'User details not updated - Validation errors',
      detailsUpdated: false,
      errorMessage: 'Please fix the following errors',
      validationErrors: validationErrors,
      userId: userId
    };
  }

  // Update user details
  usersData.users[targetUserIndex] = {
    ...targetUser,
    ...userData,
    updatedAt: new Date().toISOString()
  };

  return {
    success: true,
    actualResult: 'User details updated successfully',
    detailsUpdated: true,
    userId: userId,
    updatedFields: Object.keys(userData),
    user: usersData.users[targetUserIndex]
  };
}

// Reset state before each test
function resetUsersData() {
  usersData = {
    users: [
      { userId: 'USER001', email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'parent', status: 'active' },
      { userId: 'USER002', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Jones', role: 'parent', status: 'active' },
      { userId: 'USER003', email: 'mike@example.com', firstName: 'Mike', lastName: 'Brown', role: 'learner', status: 'active' }
    ]
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-096 (Validate editing user details with invalid inputs)', () => {

  beforeEach(() => {
    resetUsersData();
  });

  test('Edit with invalid email format - user details not updated; validation error displayed', () => {
    const expectedResult = 'User details updated successfully';
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      email: 'not-an-email'
    };
    
    const result = editUserInvalid(adminId, userId, userData);

    console.log('Test Case ID: CASE-096');
    console.log('Test Case Description: Validate editing user details with invalid inputs');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Details Updated: ${result.detailsUpdated}`);
    console.log(`Error Message: ${result.errorMessage}`);
    console.log(`Validation Errors: ${result.validationErrors ? result.validationErrors.join('; ') : 'none'}`);

    if (!result.success && !result.detailsUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.detailsUpdated).toBe(false);
    expect(result.actualResult).toContain('not updated');
    expect(result.validationErrors).toContain('Invalid email format');
  });

  test('Edit with duplicate email - user details not updated; validation error displayed', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      email: 'sarah@example.com' // USER002's email
    };
    
    const result = editUserInvalid(adminId, userId, userData);

    console.log('Test Case ID: CASE-096');
    console.log(`Email: "${userData.email}" (belongs to another user)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Validation Errors: ${result.validationErrors ? result.validationErrors.join('; ') : 'none'}`);

    if (!result.success && !result.detailsUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.detailsUpdated).toBe(false);
    expect(result.validationErrors).toContain('Email already exists for another user');
  });

  test('Edit with empty email - user details not updated; validation error displayed', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      email: ''
    };
    
    const result = editUserInvalid(adminId, userId, userData);

    console.log('Test Case ID: CASE-096');
    console.log(`Email: "" (empty)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.detailsUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.detailsUpdated).toBe(false);
    expect(result.validationErrors).toContain('Email cannot be empty');
  });

  test('Edit with invalid role - user details not updated; validation error displayed', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      role: 'superuser'
    };
    
    const result = editUserInvalid(adminId, userId, userData);

    console.log('Test Case ID: CASE-096');
    console.log(`Role: "${userData.role}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Validation Errors: ${result.validationErrors ? result.validationErrors.join('; ') : 'none'}`);

    if (!result.success && !result.detailsUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.detailsUpdated).toBe(false);
    expect(result.validationErrors[0]).toContain('Invalid role');
  });

  test('Edit with special characters in name - user details not updated; validation error displayed', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      firstName: 'John@123!'
    };
    
    const result = editUserInvalid(adminId, userId, userData);

    console.log('Test Case ID: CASE-096');
    console.log(`FirstName: "${userData.firstName}" (invalid characters)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.detailsUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.detailsUpdated).toBe(false);
    expect(result.validationErrors).toContain('First name contains invalid characters');
  });

  test('Edit non-existent user - user details not updated; validation error displayed', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER999';
    const userData = {
      firstName: 'New'
    };
    
    const result = editUserInvalid(adminId, userId, userData);

    console.log('Test Case ID: CASE-096');
    console.log(`User ID: ${userId} (does not exist)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.detailsUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.detailsUpdated).toBe(false);
    expect(result.errorMessage).toContain('not found');
  });

  test('Edit without admin authentication - user details not updated; validation error displayed', () => {
    const adminId = '';
    const userId = 'USER001';
    const userData = {
      firstName: 'Johnny'
    };
    
    const result = editUserInvalid(adminId, userId, userData);

    console.log('Test Case ID: CASE-096');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.detailsUpdated) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated admin');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.detailsUpdated).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('Edit with non-admin account - user details not updated; validation error displayed', () => {
    const adminId = 'USER002'; // Regular user
    const userId = 'USER001';
    const userData = {
      firstName: 'Johnny'
    };
    
    const result = editUserInvalid(adminId, userId, userData);

    console.log('Test Case ID: CASE-096');
    console.log(`Admin ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.detailsUpdated) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.detailsUpdated).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

  test('Edit with valid data - user details updated successfully (negative test)', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      firstName: 'Johnny',
      lastName: 'Smithson'
    };
    
    const result = editUserInvalid(adminId, userId, userData);

    console.log('Test Case ID: CASE-096');
    console.log('Test Case Description: Validate editing user details with invalid inputs');
    console.log('Expected Result: User details updated successfully (for valid inputs)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Details Updated: ${result.detailsUpdated}`);
    console.log(`Updated Fields: ${result.updatedFields ? result.updatedFields.join(', ') : 'none'}`);
    console.log(`User FirstName: ${result.user.firstName}`);
    console.log(`User LastName: ${result.user.lastName}`);

    if (result.success && result.detailsUpdated) {
      console.log('Outcome: PASSED - Valid edit accepted');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.detailsUpdated).toBe(true);
    expect(result.actualResult).toContain('updated successfully');
    expect(result.user.firstName).toBe('Johnny');
    expect(result.user.lastName).toBe('Smithson');
  });

});
