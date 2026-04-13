// ─── Test Case CASE-093 ──────────────────────────────────────────────────────
// Test Case ID: CASE-093
// Test Case Description: Validate accessing the user list
// Expected Result: Able to view users

// Mock users data
const USERS_DATA = {
  totalUsers: 5,
  users: [
    {
      userId: 'USER001',
      email: 'john.smith@example.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 'parent',
      status: 'active',
      createdAt: '2023-01-15T10:30:00Z',
      lastLogin: '2024-04-12T14:30:00Z'
    },
    {
      userId: 'USER002',
      email: 'sarah.jones@example.com',
      firstName: 'Sarah',
      lastName: 'Jones',
      role: 'parent',
      status: 'active',
      createdAt: '2023-02-20T09:15:00Z',
      lastLogin: '2024-04-11T16:45:00Z'
    },
    {
      userId: 'LEARNER001',
      email: 'learner.alex@example.com',
      firstName: 'Alex',
      lastName: 'Johnson',
      role: 'learner',
      status: 'active',
      createdAt: '2023-03-10T11:00:00Z',
      lastLogin: '2024-04-12T10:20:00Z'
    },
    {
      userId: 'ADMIN001',
      email: 'admin@synclexia.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      createdAt: '2023-01-01T00:00:00Z',
      lastLogin: '2024-04-13T08:00:00Z'
    },
    {
      userId: 'USER003',
      email: 'mike.brown@example.com',
      firstName: 'Mike',
      lastName: 'Brown',
      role: 'parent',
      status: 'inactive',
      createdAt: '2023-05-05T14:20:00Z',
      lastLogin: '2024-03-01T09:30:00Z'
    }
  ]
};

function viewUsers(adminId) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to view users - User not authenticated',
      usersViewable: false,
      errorMessage: 'Please log in to view users'
    };
  }

  // Check if user has admin privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'Unable to view users - Insufficient privileges',
      usersViewable: false,
      errorMessage: 'You do not have permission to view the user list'
    };
  }

  // Return users data
  return {
    success: true,
    actualResult: 'Able to view users',
    usersViewable: true,
    adminId: adminId,
    totalUsers: USERS_DATA.totalUsers,
    users: USERS_DATA.users,
    activeUsers: USERS_DATA.users.filter(u => u.status === 'active').length,
    inactiveUsers: USERS_DATA.users.filter(u => u.status === 'inactive').length,
    parents: USERS_DATA.users.filter(u => u.role === 'parent').length,
    learners: USERS_DATA.users.filter(u => u.role === 'learner').length,
    admins: USERS_DATA.users.filter(u => u.role === 'admin').length
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-093 (Validate accessing the user list)', () => {

  test('Admin accesses user list - able to view users', () => {
    const expectedResult = 'Able to view users';
    const adminId = 'ADMIN001';
    
    const result = viewUsers(adminId);

    console.log('Test Case ID: CASE-093');
    console.log('Test Case Description: Validate accessing the user list');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Users Viewable: ${result.usersViewable}`);
    console.log(`Admin ID: ${result.adminId}`);
    console.log(`Total Users: ${result.totalUsers}`);
    console.log(`Active Users: ${result.activeUsers}`);
    console.log(`Inactive Users: ${result.inactiveUsers}`);
    console.log(`Parents: ${result.parents}`);
    console.log(`Learners: ${result.learners}`);
    console.log(`Admins: ${result.admins}`);
    console.log('Users List:');
    if (result.users) {
      result.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.role}) - ${user.status}`);
      });
    }

    if (result.success && result.usersViewable && result.users.length > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.usersViewable).toBe(true);
    expect(result.actualResult).toContain('Able to view users');
    expect(result.adminId).toBe('ADMIN001');
    expect(result.totalUsers).toBe(5);
    expect(result.users).toHaveLength(5);
    expect(result.activeUsers).toBe(4);
    expect(result.inactiveUsers).toBe(1);
    expect(result.parents).toBe(3);
    expect(result.learners).toBe(1);
    expect(result.admins).toBe(1);
  });

  test('User list contains all required fields', () => {
    const adminId = 'ADMIN001';
    
    const result = viewUsers(adminId);
    const firstUser = result.users[0];

    console.log('Test Case ID: CASE-093');
    console.log(`User ID: ${firstUser.userId}`);
    console.log(`Email: ${firstUser.email}`);
    console.log(`Name: ${firstUser.firstName} ${firstUser.lastName}`);
    console.log(`Role: ${firstUser.role}`);
    console.log(`Status: ${firstUser.status}`);
    console.log(`Created: ${firstUser.createdAt}`);
    console.log(`Last Login: ${firstUser.lastLogin}`);

    if (firstUser.userId && firstUser.email && firstUser.firstName && firstUser.lastName &&
        firstUser.role && firstUser.status && firstUser.createdAt) {
      console.log('Outcome: PASSED - All required fields present');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(firstUser.userId).toBeDefined();
    expect(firstUser.email).toBeDefined();
    expect(firstUser.firstName).toBeDefined();
    expect(firstUser.lastName).toBeDefined();
    expect(firstUser.role).toBeDefined();
    expect(firstUser.status).toBeDefined();
    expect(firstUser.createdAt).toBeDefined();
    expect(firstUser.lastLogin).toBeDefined();
  });

  test('User roles are categorized correctly', () => {
    const adminId = 'ADMIN001';
    
    const result = viewUsers(adminId);

    console.log('Test Case ID: CASE-093');
    console.log(`Total Users: ${result.totalUsers}`);
    console.log(`Parents: ${result.parents}`);
    console.log(`Learners: ${result.learners}`);
    console.log(`Admins: ${result.admins}`);
    console.log(`Active: ${result.activeUsers}`);
    console.log(`Inactive: ${result.inactiveUsers}`);

    if (result.parents + result.learners + result.admins === result.totalUsers &&
        result.activeUsers + result.inactiveUsers === result.totalUsers) {
      console.log('Outcome: PASSED - All categories accounted for');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.parents + result.learners + result.admins).toBe(result.totalUsers);
    expect(result.activeUsers + result.inactiveUsers).toBe(result.totalUsers);
  });

  test('Inactive users are included in list', () => {
    const adminId = 'ADMIN001';
    
    const result = viewUsers(adminId);
    const inactiveUser = result.users.find(u => u.status === 'inactive');

    console.log('Test Case ID: CASE-093');
    console.log(`Inactive User Found: ${inactiveUser ? 'Yes' : 'No'}`);
    if (inactiveUser) {
      console.log(`  Name: ${inactiveUser.firstName} ${inactiveUser.lastName}`);
      console.log(`  Status: ${inactiveUser.status}`);
    }

    if (inactiveUser && inactiveUser.status === 'inactive') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(inactiveUser).toBeDefined();
    expect(inactiveUser.status).toBe('inactive');
  });

  test('Without authentication - cannot view users (negative test)', () => {
    const adminId = '';
    
    const result = viewUsers(adminId);

    console.log('Test Case ID: CASE-093');
    console.log('Expected Result: Able to view users (for authorized admins)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.usersViewable) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.usersViewable).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('Non-admin user - cannot view users (negative test)', () => {
    const adminId = 'USER001'; // Regular user, not admin
    
    const result = viewUsers(adminId);

    console.log('Test Case ID: CASE-093');
    console.log(`User ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.usersViewable) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.usersViewable).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

  test('Learner account - cannot view users (negative test)', () => {
    const adminId = 'LEARNER001';
    
    const result = viewUsers(adminId);

    console.log('Test Case ID: CASE-093');
    console.log(`User ID: ${adminId} (learner account)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.usersViewable) {
      console.log('Outcome: PASSED - Correctly rejected learner account');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.usersViewable).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

});
