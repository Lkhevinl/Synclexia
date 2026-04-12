// ─── Test Case CASE-095 ──────────────────────────────────────────────────────
// Test Case ID: CASE-095
// Test Case Description: Validate adding a user with valid fields
// Expected Result: New user account created successfully

// Mock users data
let usersData = {
  users: [
    { userId: 'USER001', email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'parent', status: 'active', createdAt: '2023-01-15T10:30:00Z' },
    { userId: 'USER002', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Jones', role: 'parent', status: 'active', createdAt: '2023-02-20T09:15:00Z' }
  ],
  totalUsers: 2
};

const VALID_ROLES = ['parent', 'learner', 'admin'];

function addUserValid(adminId, userData) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'New user account not created - Admin not authenticated',
      userAdded: false,
      errorMessage: 'Please log in as admin to add users'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'New user account not created - Insufficient privileges',
      userAdded: false,
      errorMessage: 'You do not have permission to add users'
    };
  }

  // Check for missing required fields
  const requiredFields = ['email', 'firstName', 'lastName', 'role'];
  const missingFields = [];

  for (const field of requiredFields) {
    if (!userData[field] || userData[field].trim() === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      success: false,
      actualResult: 'New user account not created - Missing required fields',
      userAdded: false,
      errorMessage: `Required field(s) missing: ${missingFields.join(', ')}`
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    return {
      success: false,
      actualResult: 'New user account not created - Invalid email',
      userAdded: false,
      errorMessage: 'Invalid email format'
    };
  }

  // Check for duplicate email
  const existingUser = usersData.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingUser) {
    return {
      success: false,
      actualResult: 'New user account not created - Email already exists',
      userAdded: false,
      errorMessage: 'Email already exists'
    };
  }

  // Validate role
  if (!VALID_ROLES.includes(userData.role)) {
    return {
      success: false,
      actualResult: 'New user account not created - Invalid role',
      userAdded: false,
      errorMessage: 'Invalid role specified'
    };
  }

  // Validate names (no special characters)
  if (/[^a-zA-Z\s\-'\.]/.test(userData.firstName) || /[^a-zA-Z\s\-'\.]/.test(userData.lastName)) {
    return {
      success: false,
      actualResult: 'New user account not created - Invalid characters in name',
      userAdded: false,
      errorMessage: 'Name contains invalid characters'
    };
  }

  // Generate new user ID
  const newUserId = `USER${String(usersData.users.length + 1).padStart(3, '0')}`;
  const timestamp = new Date().toISOString();
  
  // Create new user
  const newUser = {
    userId: newUserId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    status: userData.status || 'active',
    createdAt: timestamp
  };

  // Add user to database
  usersData.users.push(newUser);
  usersData.totalUsers++;

  return {
    success: true,
    actualResult: 'New user account created successfully',
    userAdded: true,
    userId: newUserId,
    user: newUser,
    totalUsers: usersData.totalUsers,
    message: `User ${userData.firstName} ${userData.lastName} has been created successfully with ID ${newUserId}`
  };
}

// Reset state before each test
function resetUsersData() {
  usersData = {
    users: [
      { userId: 'USER001', email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'parent', status: 'active', createdAt: '2023-01-15T10:30:00Z' },
      { userId: 'USER002', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Jones', role: 'parent', status: 'active', createdAt: '2023-02-20T09:15:00Z' }
    ],
    totalUsers: 2
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-095 (Validate adding a user with valid fields)', () => {

  beforeEach(() => {
    resetUsersData();
  });

  test('Add parent user with valid fields - new user account created successfully', () => {
    const expectedResult = 'New user account created successfully';
    const adminId = 'ADMIN001';
    const userData = {
      email: 'mike@example.com',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'parent',
      status: 'active'
    };
    
    console.log('Test Case ID: CASE-095');
    console.log('Test Case Description: Validate adding a user with valid fields');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Admin ID: ${adminId}`);
    console.log(`User Data:`, userData);
    console.log(`Total Users Before: ${usersData.totalUsers}`);

    const result = addUserValid(adminId, userData);

    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`User Added: ${result.userAdded}`);
    console.log(`New User ID: ${result.userId}`);
    console.log(`New User:`, result.user);
    console.log(`Total Users After: ${result.totalUsers}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.userAdded && result.userId) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.userAdded).toBe(true);
    expect(result.actualResult).toContain('created successfully');
    expect(result.userId).toBe('USER003');
    expect(result.user.email).toBe('mike@example.com');
    expect(result.user.firstName).toBe('Michael');
    expect(result.user.lastName).toBe('Brown');
    expect(result.user.role).toBe('parent');
    expect(result.user.status).toBe('active');
    expect(result.user.createdAt).toBeDefined();
    expect(result.totalUsers).toBe(3);
    expect(usersData.totalUsers).toBe(3);
  });

  test('Add learner user with valid fields - new user account created successfully', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Johnson',
      role: 'learner',
      status: 'active'
    };
    
    const result = addUserValid(adminId, userData);

    console.log('Test Case ID: CASE-095');
    console.log(`Role: ${result.user.role}`);
    console.log(`User ID: ${result.userId}`);
    console.log(`User Added: ${result.userAdded}`);

    if (result.success && result.userAdded && result.user.role === 'learner') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.userAdded).toBe(true);
    expect(result.user.role).toBe('learner');
    expect(result.userId).toBe('USER003');
  });

  test('Add admin user with valid fields - new user account created successfully', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'newadmin@example.com',
      firstName: 'New',
      lastName: 'Admin',
      role: 'admin',
      status: 'active'
    };
    
    const result = addUserValid(adminId, userData);

    console.log('Test Case ID: CASE-095');
    console.log(`Role: ${result.user.role}`);
    console.log(`User ID: ${result.userId}`);

    if (result.success && result.userAdded && result.user.role === 'admin') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.userAdded).toBe(true);
    expect(result.user.role).toBe('admin');
  });

  test('Add user without status defaults to active', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'default@example.com',
      firstName: 'Default',
      lastName: 'Status',
      role: 'parent'
      // status not provided
    };
    
    const result = addUserValid(adminId, userData);

    console.log('Test Case ID: CASE-095');
    console.log(`Status (not provided, should default): ${result.user.status}`);

    if (result.success && result.user.status === 'active') {
      console.log('Outcome: PASSED - Status defaulted to active');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.userAdded).toBe(true);
    expect(result.user.status).toBe('active');
  });

  test('Multiple users added - user IDs increment correctly', () => {
    const adminId = 'ADMIN001';
    
    // First user
    const result1 = addUserValid(adminId, {
      email: 'first@example.com',
      firstName: 'First',
      lastName: 'User',
      role: 'parent'
    });
    expect(result1.userId).toBe('USER003');
    
    // Second user
    const result2 = addUserValid(adminId, {
      email: 'second@example.com',
      firstName: 'Second',
      lastName: 'User',
      role: 'learner'
    });

    console.log('Test Case ID: CASE-095');
    console.log('Test: Multiple users added');
    console.log(`First User ID: ${result1.userId}`);
    console.log(`Second User ID: ${result2.userId}`);
    console.log(`Total Users: ${usersData.totalUsers}`);

    if (result2.success && result2.userId === 'USER004' && usersData.totalUsers === 4) {
      console.log('Outcome: PASSED - User IDs incremented correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.userId).toBe('USER004');
    expect(usersData.totalUsers).toBe(4);
  });

  test('User data persisted correctly after creation', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'persist@example.com',
      firstName: 'Persist',
      lastName: 'Test',
      role: 'parent'
    };
    
    const result = addUserValid(adminId, userData);

    console.log('Test Case ID: CASE-095');
    console.log('Verifying user data persisted:');
    console.log(`  User ID: ${result.user.userId}`);
    console.log(`  Email: ${result.user.email}`);
    console.log(`  Name: ${result.user.firstName} ${result.user.lastName}`);
    console.log(`  Role: ${result.user.role}`);
    console.log(`  Status: ${result.user.status}`);
    console.log(`  Created At: ${result.user.createdAt}`);

    // Verify in usersData
    const persistedUser = usersData.users.find(u => u.userId === result.userId);
    
    if (persistedUser && persistedUser.email === userData.email) {
      console.log('Outcome: PASSED - User data persisted correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(persistedUser).toBeDefined();
    expect(persistedUser.email).toBe(userData.email);
    expect(persistedUser.firstName).toBe(userData.firstName);
    expect(persistedUser.lastName).toBe(userData.lastName);
  });

  test('Invalid email - user not created (negative test)', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'invalid-email',
      firstName: 'Invalid',
      lastName: 'Email',
      role: 'parent'
    };
    
    const result = addUserValid(adminId, userData);

    console.log('Test Case ID: CASE-095');
    console.log('Test Case Description: Validate adding a user with valid fields');
    console.log('Expected Result: New user account created successfully (for valid fields)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.userAdded) {
      console.log('Outcome: PASSED - Correctly rejected invalid email');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userAdded).toBe(false);
    expect(result.errorMessage).toContain('Invalid email');
  });

  test('Without admin authentication - user not created (negative test)', () => {
    const adminId = '';
    const userData = {
      email: 'valid@example.com',
      firstName: 'Valid',
      lastName: 'User',
      role: 'parent'
    };
    
    const result = addUserValid(adminId, userData);

    console.log('Test Case ID: CASE-095');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.userAdded) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated admin');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userAdded).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('Duplicate email - user not created (negative test)', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'john@example.com', // Already exists
      firstName: 'Duplicate',
      lastName: 'Email',
      role: 'parent'
    };
    
    const result = addUserValid(adminId, userData);

    console.log('Test Case ID: CASE-095');
    console.log(`Email: ${userData.email} (already exists)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.userAdded) {
      console.log('Outcome: PASSED - Correctly rejected duplicate email');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userAdded).toBe(false);
    expect(result.errorMessage).toContain('already exists');
  });

});
