// ─── Test Case CASE-094 ──────────────────────────────────────────────────────
// Test Case ID: CASE-094
// Test Case Description: Validate adding a user with invalid fields
// Expected Result: User not added; validation error displayed

// Mock users data
let usersData = {
  users: [
    { userId: 'USER001', email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'parent', status: 'active' },
    { userId: 'USER002', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Jones', role: 'parent', status: 'active' }
  ],
  totalUsers: 2
};

const VALID_ROLES = ['parent', 'learner', 'admin'];
const VALID_STATUSES = ['active', 'inactive'];

function addUserInvalid(adminId, userData) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'User not added; validation error displayed',
      userAdded: false,
      errorMessage: 'Please log in as admin to add users'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'User not added; validation error displayed',
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
      actualResult: 'User not added; validation error displayed',
      userAdded: false,
      errorMessage: `Required field(s) missing: ${missingFields.join(', ')}`,
      validationErrors: missingFields.map(field => `${field} is required`)
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    return {
      success: false,
      actualResult: 'User not added; validation error displayed',
      userAdded: false,
      errorMessage: 'Invalid email format',
      validationErrors: ['Please enter a valid email address']
    };
  }

  // Check for duplicate email
  const existingUser = usersData.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingUser) {
    return {
      success: false,
      actualResult: 'User not added; validation error displayed',
      userAdded: false,
      errorMessage: 'Email already exists',
      validationErrors: ['A user with this email already exists']
    };
  }

  // Validate role
  if (!VALID_ROLES.includes(userData.role)) {
    return {
      success: false,
      actualResult: 'User not added; validation error displayed',
      userAdded: false,
      errorMessage: 'Invalid role specified',
      validationErrors: [`Role must be one of: ${VALID_ROLES.join(', ')}`]
    };
  }

  // Validate firstName (no special characters)
  if (/[^a-zA-Z\s\-'\.]/.test(userData.firstName)) {
    return {
      success: false,
      actualResult: 'User not added; validation error displayed',
      userAdded: false,
      errorMessage: 'First name contains invalid characters',
      validationErrors: ['First name can only contain letters, spaces, hyphens, and periods']
    };
  }

  // Validate lastName (no special characters)
  if (/[^a-zA-Z\s\-'\.]/.test(userData.lastName)) {
    return {
      success: false,
      actualResult: 'User not added; validation error displayed',
      userAdded: false,
      errorMessage: 'Last name contains invalid characters',
      validationErrors: ['Last name can only contain letters, spaces, hyphens, and periods']
    };
  }

  // All validations passed - add user
  const newUserId = `USER${String(usersData.users.length + 1).padStart(3, '0')}`;
  const newUser = {
    userId: newUserId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    status: userData.status || 'active',
    createdAt: new Date().toISOString()
  };

  usersData.users.push(newUser);
  usersData.totalUsers++;

  return {
    success: true,
    actualResult: 'User added successfully',
    userAdded: true,
    userId: newUserId,
    user: newUser
  };
}

// Reset state before each test
function resetUsersData() {
  usersData = {
    users: [
      { userId: 'USER001', email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'parent', status: 'active' },
      { userId: 'USER002', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Jones', role: 'parent', status: 'active' }
    ],
    totalUsers: 2
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-094 (Validate adding a user with invalid fields)', () => {

  beforeEach(() => {
    resetUsersData();
  });

  test('Add user with missing email - user not added; validation error displayed', () => {
    const expectedResult = 'User not added; validation error displayed';
    const adminId = 'ADMIN001';
    const userData = {
      email: '',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'parent'
    };
    
    const result = addUserInvalid(adminId, userData);

    console.log('Test Case ID: CASE-094');
    console.log('Test Case Description: Validate adding a user with invalid fields');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`User Added: ${result.userAdded}`);
    console.log(`Error Message: ${result.errorMessage}`);
    console.log(`Validation Errors: ${result.validationErrors ? result.validationErrors.join('; ') : 'none'}`);

    if (!result.success && !result.userAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userAdded).toBe(false);
    expect(result.actualResult).toContain('User not added');
    expect(result.errorMessage).toContain('email');
    expect(result.validationErrors).toContain('email is required');
    expect(usersData.totalUsers).toBe(2);
  });

  test('Add user with invalid email format - user not added; validation error displayed', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'not-an-email',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'parent'
    };
    
    const result = addUserInvalid(adminId, userData);

    console.log('Test Case ID: CASE-094');
    console.log(`Email: "${userData.email}" (invalid format)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.userAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userAdded).toBe(false);
    expect(result.errorMessage).toContain('Invalid email');
  });

  test('Add user with duplicate email - user not added; validation error displayed', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'john@example.com', // Already exists
      firstName: 'Johnny',
      lastName: 'Smith',
      role: 'learner'
    };
    
    const result = addUserInvalid(adminId, userData);

    console.log('Test Case ID: CASE-094');
    console.log(`Email: "${userData.email}" (already exists)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.userAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userAdded).toBe(false);
    expect(result.errorMessage).toContain('already exists');
  });

  test('Add user with missing firstName - user not added; validation error displayed', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'mike@example.com',
      firstName: '',
      lastName: 'Brown',
      role: 'parent'
    };
    
    const result = addUserInvalid(adminId, userData);

    console.log('Test Case ID: CASE-094');
    console.log(`FirstName: "" (missing)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.userAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userAdded).toBe(false);
    expect(result.errorMessage).toContain('firstName');
  });

  test('Add user with invalid role - user not added; validation error displayed', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'mike@example.com',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'superuser' // Invalid role
    };
    
    const result = addUserInvalid(adminId, userData);

    console.log('Test Case ID: CASE-094');
    console.log(`Role: "${userData.role}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Valid Roles: parent, learner, admin`);

    if (!result.success && !result.userAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userAdded).toBe(false);
    expect(result.errorMessage).toContain('Invalid role');
  });

  test('Add user with special characters in name - user not added; validation error displayed', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'mike@example.com',
      firstName: 'Mike@123!',
      lastName: 'Brown',
      role: 'parent'
    };
    
    const result = addUserInvalid(adminId, userData);

    console.log('Test Case ID: CASE-094');
    console.log(`FirstName: "${userData.firstName}" (contains special chars)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.userAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userAdded).toBe(false);
    expect(result.errorMessage).toContain('invalid characters');
  });

  test('Add user without admin authentication - user not added; validation error displayed', () => {
    const adminId = '';
    const userData = {
      email: 'mike@example.com',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'parent'
    };
    
    const result = addUserInvalid(adminId, userData);

    console.log('Test Case ID: CASE-094');
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

  test('Add user with non-admin account - user not added; validation error displayed', () => {
    const adminId = 'USER001'; // Regular user, not admin
    const userData = {
      email: 'mike@example.com',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'parent'
    };
    
    const result = addUserInvalid(adminId, userData);

    console.log('Test Case ID: CASE-094');
    console.log(`Admin ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.userAdded) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userAdded).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

  test('Add user with valid data - user added (negative test)', () => {
    const adminId = 'ADMIN001';
    const userData = {
      email: 'mike@example.com',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'parent'
    };
    
    const result = addUserInvalid(adminId, userData);

    console.log('Test Case ID: CASE-094');
    console.log('Test Case Description: Validate adding a user with invalid fields');
    console.log('Expected Result: User not added; validation error displayed (for invalid fields)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`User Added: ${result.userAdded}`);

    if (result.success && result.userAdded) {
      console.log('Outcome: PASSED - Valid user added successfully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.userAdded).toBe(true);
    expect(result.userId).toBe('USER003');
    expect(usersData.totalUsers).toBe(3);
  });

});
