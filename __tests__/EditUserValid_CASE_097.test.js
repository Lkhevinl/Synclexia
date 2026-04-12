  // ─── Test Case CASE-097 ──────────────────────────────────────────────────────
// Test Case ID: CASE-097
// Test Case Description: Validate editing user details with valid inputs
// Expected Result: User details updated successfully

// Mock users data
let usersData = {
  users: [
    { userId: 'USER001', email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'parent', status: 'active', createdAt: '2023-01-15T10:30:00Z' },
    { userId: 'USER002', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Jones', role: 'parent', status: 'active', createdAt: '2023-02-20T09:15:00Z' },
    { userId: 'USER003', email: 'mike@example.com', firstName: 'Mike', lastName: 'Brown', role: 'learner', status: 'active', createdAt: '2023-03-10T11:00:00Z' }
  ]
};

const VALID_ROLES = ['parent', 'learner', 'admin'];
const VALID_STATUSES = ['active', 'inactive'];

function editUserValid(adminId, userId, userData) {
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

  // Validate email if provided
  if (userData.email !== undefined) {
    if (userData.email.trim() === '') {
      return {
        success: false,
        actualResult: 'User details not updated - Email cannot be empty',
        detailsUpdated: false,
        errorMessage: 'Email cannot be empty'
      };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return {
        success: false,
        actualResult: 'User details not updated - Invalid email format',
        detailsUpdated: false,
        errorMessage: 'Invalid email format'
      };
    }
    // Check for duplicate email
    const existingUser = usersData.users.find(u => 
      u.email.toLowerCase() === userData.email.toLowerCase() && u.userId !== userId
    );
    if (existingUser) {
      return {
        success: false,
        actualResult: 'User details not updated - Email already exists',
        detailsUpdated: false,
        errorMessage: 'Email already exists for another user'
      };
    }
  }

  // Validate role if provided
  if (userData.role !== undefined && !VALID_ROLES.includes(userData.role)) {
    return {
      success: false,
      actualResult: 'User details not updated - Invalid role',
      detailsUpdated: false,
      errorMessage: 'Invalid role specified'
    };
  }

  // Validate status if provided
  if (userData.status !== undefined && !VALID_STATUSES.includes(userData.status)) {
    return {
      success: false,
      actualResult: 'User details not updated - Invalid status',
      detailsUpdated: false,
      errorMessage: 'Invalid status specified'
    };
  }

  const oldUser = { ...targetUser };
  const timestamp = new Date().toISOString();
  
  // Update user details
  usersData.users[targetUserIndex] = {
    ...targetUser,
    ...userData,
    updatedAt: timestamp
  };

  return {
    success: true,
    actualResult: 'User details updated successfully',
    detailsUpdated: true,
    userId: userId,
    oldValues: {
      firstName: oldUser.firstName,
      lastName: oldUser.lastName,
      email: oldUser.email,
      role: oldUser.role,
      status: oldUser.status
    },
    newValues: {
      firstName: usersData.users[targetUserIndex].firstName,
      lastName: usersData.users[targetUserIndex].lastName,
      email: usersData.users[targetUserIndex].email,
      role: usersData.users[targetUserIndex].role,
      status: usersData.users[targetUserIndex].status
    },
    updatedFields: Object.keys(userData),
    updatedAt: timestamp,
    user: usersData.users[targetUserIndex]
  };
}

// Reset state before each test
function resetUsersData() {
  usersData = {
    users: [
      { userId: 'USER001', email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'parent', status: 'active', createdAt: '2023-01-15T10:30:00Z' },
      { userId: 'USER002', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Jones', role: 'parent', status: 'active', createdAt: '2023-02-20T09:15:00Z' },
      { userId: 'USER003', email: 'mike@example.com', firstName: 'Mike', lastName: 'Brown', role: 'learner', status: 'active', createdAt: '2023-03-10T11:00:00Z' }
    ]
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-097 (Validate editing user details with valid inputs)', () => {

  beforeEach(() => {
    resetUsersData();
  });

  test('Edit user firstName with valid input - user details updated successfully', () => {
    const expectedResult = 'User details updated successfully';
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      firstName: 'Johnny'
    };
    
    const oldFirstName = usersData.users.find(u => u.userId === userId).firstName;
    
    const result = editUserValid(adminId, userId, userData);

    console.log('Test Case ID: CASE-097');
    console.log('Test Case Description: Validate editing user details with valid inputs');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Details Updated: ${result.detailsUpdated}`);
    console.log(`User ID: ${result.userId}`);
    console.log(`Old FirstName: ${result.oldValues.firstName}`);
    console.log(`New FirstName: ${result.newValues.firstName}`);
    console.log(`Updated Fields: ${result.updatedFields.join(', ')}`);
    console.log(`Updated At: ${result.updatedAt}`);

    if (result.success && result.detailsUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.detailsUpdated).toBe(true);
    expect(result.actualResult).toContain('updated successfully');
    expect(result.oldValues.firstName).toBe('John');
    expect(result.newValues.firstName).toBe('Johnny');
    expect(result.updatedFields).toContain('firstName');
    expect(result.updatedAt).toBeDefined();
  });

  test('Edit user email with valid input - user details updated successfully', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      email: 'john.smith@example.com'
    };
    
    const result = editUserValid(adminId, userId, userData);

    console.log('Test Case ID: CASE-097');
    console.log(`Old Email: ${result.oldValues.email}`);
    console.log(`New Email: ${result.newValues.email}`);

    if (result.success && result.detailsUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.detailsUpdated).toBe(true);
    expect(result.oldValues.email).toBe('john@example.com');
    expect(result.newValues.email).toBe('john.smith@example.com');
    expect(result.updatedFields).toContain('email');
  });

  test('Edit user role with valid input - user details updated successfully', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER003'; // Currently a learner
    const userData = {
      role: 'parent'
    };
    
    const result = editUserValid(adminId, userId, userData);

    console.log('Test Case ID: CASE-097');
    console.log(`Old Role: ${result.oldValues.role}`);
    console.log(`New Role: ${result.newValues.role}`);

    if (result.success && result.detailsUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.detailsUpdated).toBe(true);
    expect(result.oldValues.role).toBe('learner');
    expect(result.newValues.role).toBe('parent');
    expect(result.updatedFields).toContain('role');
  });

  test('Edit user status with valid input - user details updated successfully', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      status: 'inactive'
    };
    
    const result = editUserValid(adminId, userId, userData);

    console.log('Test Case ID: CASE-097');
    console.log(`Old Status: ${result.oldValues.status}`);
    console.log(`New Status: ${result.newValues.status}`);

    if (result.success && result.detailsUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.detailsUpdated).toBe(true);
    expect(result.oldValues.status).toBe('active');
    expect(result.newValues.status).toBe('inactive');
    expect(result.updatedFields).toContain('status');
  });

  test('Edit multiple fields with valid inputs - user details updated successfully', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      firstName: 'Jonathan',
      lastName: 'Smithson',
      email: 'jsmith@example.com'
    };
    
    const result = editUserValid(adminId, userId, userData);

    console.log('Test Case ID: CASE-097');
    console.log('Editing multiple fields:');
    console.log(`  FirstName: ${result.oldValues.firstName} → ${result.newValues.firstName}`);
    console.log(`  LastName: ${result.oldValues.lastName} → ${result.newValues.lastName}`);
    console.log(`  Email: ${result.oldValues.email} → ${result.newValues.email}`);
    console.log(`Updated Fields: ${result.updatedFields.join(', ')}`);

    if (result.success && result.updatedFields.length === 3) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.detailsUpdated).toBe(true);
    expect(result.updatedFields).toHaveLength(3);
    expect(result.updatedFields).toContain('firstName');
    expect(result.updatedFields).toContain('lastName');
    expect(result.updatedFields).toContain('email');
    expect(result.user.firstName).toBe('Jonathan');
    expect(result.user.lastName).toBe('Smithson');
    expect(result.user.email).toBe('jsmith@example.com');
  });

  test('User data persisted correctly after edit', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      firstName: 'Johnny',
      lastName: 'Smith'
    };
    
    const result = editUserValid(adminId, userId, userData);

    console.log('Test Case ID: CASE-097');
    console.log('Verifying user data persisted:');
    
    // Verify in usersData
    const persistedUser = usersData.users.find(u => u.userId === userId);
    
    console.log(`  User ID: ${persistedUser.userId}`);
    console.log(`  FirstName: ${persistedUser.firstName}`);
    console.log(`  LastName: ${persistedUser.lastName}`);
    console.log(`  Updated At: ${persistedUser.updatedAt}`);

    if (persistedUser.firstName === 'Johnny' && persistedUser.updatedAt) {
      console.log('Outcome: PASSED - User data persisted correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(persistedUser.firstName).toBe('Johnny');
    expect(persistedUser.lastName).toBe('Smith');
    expect(persistedUser.updatedAt).toBeDefined();
  });

  test('Invalid email format - user details not updated (negative test)', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      email: 'not-an-email'
    };
    
    const result = editUserValid(adminId, userId, userData);

    console.log('Test Case ID: CASE-097');
    console.log('Test Case Description: Validate editing user details with valid inputs');
    console.log('Expected Result: User details updated successfully (for valid inputs)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.detailsUpdated) {
      console.log('Outcome: PASSED - Correctly rejected invalid email');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.detailsUpdated).toBe(false);
    expect(result.errorMessage).toContain('Invalid email');
  });

  test('Duplicate email - user details not updated (negative test)', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    const userData = {
      email: 'sarah@example.com' // USER002's email
    };
    
    const result = editUserValid(adminId, userId, userData);

    console.log('Test Case ID: CASE-097');
    console.log(`Email: ${userData.email} (belongs to another user)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.detailsUpdated) {
      console.log('Outcome: PASSED - Correctly rejected duplicate email');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.detailsUpdated).toBe(false);
    expect(result.errorMessage).toContain('already exists');
  });

  test('Without admin authentication - user details not updated (negative test)', () => {
    const adminId = '';
    const userId = 'USER001';
    const userData = {
      firstName: 'Johnny'
    };
    
    const result = editUserValid(adminId, userId, userData);

    console.log('Test Case ID: CASE-097');
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

});
