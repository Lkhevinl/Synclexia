// ─── Test Case CASE-098 ──────────────────────────────────────────────────────
// Test Case ID: CASE-098
// Test Case Description: Validate deleting an existing user
// Expected Result: User removed successfully

// Mock users data
let usersData = {
  users: [
    { userId: 'ADMIN001', email: 'admin@synclexia.com', firstName: 'Admin', lastName: 'User', role: 'admin', status: 'active', createdAt: '2023-01-01T00:00:00Z' },
    { userId: 'USER001', email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'parent', status: 'active', createdAt: '2023-01-15T10:30:00Z' },
    { userId: 'USER002', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Jones', role: 'parent', status: 'active', createdAt: '2023-02-20T09:15:00Z' },
    { userId: 'USER003', email: 'mike@example.com', firstName: 'Mike', lastName: 'Brown', role: 'learner', status: 'active', createdAt: '2023-03-10T11:00:00Z' }
  ],
  totalUsers: 4
};

function deleteUser(adminId, userId) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'User not removed - Admin not authenticated',
      userRemoved: false,
      errorMessage: 'Please log in as admin to delete users'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'User not removed - Insufficient privileges',
      userRemoved: false,
      errorMessage: 'You do not have permission to delete users'
    };
  }

  // Check if target user exists
  const targetUserIndex = usersData.users.findIndex(u => u.userId === userId);
  if (targetUserIndex === -1) {
    return {
      success: false,
      actualResult: 'User not removed - User not found',
      userRemoved: false,
      errorMessage: 'User not found'
    };
  }

  // Prevent admin from deleting themselves
  if (userId === adminId) {
    return {
      success: false,
      actualResult: 'User not removed - Cannot delete self',
      userRemoved: false,
      errorMessage: 'You cannot delete your own account'
    };
  }

  const deletedUser = usersData.users[targetUserIndex];
  const timestamp = new Date().toISOString();
  
  // Remove user from database
  usersData.users.splice(targetUserIndex, 1);
  usersData.totalUsers--;

  return {
    success: true,
    actualResult: 'User removed successfully',
    userRemoved: true,
    adminId: adminId,
    deletedUserId: userId,
    deletedUser: deletedUser,
    remainingUsers: usersData.totalUsers,
    deletedAt: timestamp,
    message: `User ${deletedUser.firstName} ${deletedUser.lastName} (${userId}) has been removed successfully`
  };
}

// Reset state before each test
function resetUsersData() {
  usersData = {
    users: [
      { userId: 'ADMIN001', email: 'admin@synclexia.com', firstName: 'Admin', lastName: 'User', role: 'admin', status: 'active', createdAt: '2023-01-01T00:00:00Z' },
      { userId: 'USER001', email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'parent', status: 'active', createdAt: '2023-01-15T10:30:00Z' },
      { userId: 'USER002', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Jones', role: 'parent', status: 'active', createdAt: '2023-02-20T09:15:00Z' },
      { userId: 'USER003', email: 'mike@example.com', firstName: 'Mike', lastName: 'Brown', role: 'learner', status: 'active', createdAt: '2023-03-10T11:00:00Z' }
    ],
    totalUsers: 4
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-098 (Validate deleting an existing user)', () => {

  beforeEach(() => {
    resetUsersData();
  });

  test('Delete existing user - user removed successfully', () => {
    const expectedResult = 'User removed successfully';
    const adminId = 'ADMIN001';
    const userId = 'USER003';
    const usersBefore = usersData.totalUsers;
    
    const userToDelete = usersData.users.find(u => u.userId === userId);
    
    const result = deleteUser(adminId, userId);

    console.log('Test Case ID: CASE-098');
    console.log('Test Case Description: Validate deleting an existing user');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Admin ID: ${result.adminId}`);
    console.log(`Deleted User ID: ${result.deletedUserId}`);
    console.log(`Deleted User: ${result.deletedUser.firstName} ${result.deletedUser.lastName} (${result.deletedUser.email})`);
    console.log(`Users Before: ${usersBefore}`);
    console.log(`Remaining Users: ${result.remainingUsers}`);
    console.log(`Deleted At: ${result.deletedAt}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.userRemoved && result.remainingUsers === usersBefore - 1) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.userRemoved).toBe(true);
    expect(result.actualResult).toContain('removed successfully');
    expect(result.deletedUserId).toBe('USER003');
    expect(result.deletedUser.email).toBe('mike@example.com');
    expect(result.remainingUsers).toBe(3);
    expect(usersData.totalUsers).toBe(3);
    expect(usersData.users.find(u => u.userId === 'USER003')).toBeUndefined();
  });

  test('Delete parent user - user removed successfully', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER001';
    
    const result = deleteUser(adminId, userId);

    console.log('Test Case ID: CASE-098');
    console.log(`Deleted User Role: ${result.deletedUser.role}`);
    console.log(`Remaining Users: ${result.remainingUsers}`);

    if (result.success && result.userRemoved) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.userRemoved).toBe(true);
    expect(result.deletedUser.role).toBe('parent');
    expect(usersData.users.find(u => u.userId === 'USER001')).toBeUndefined();
  });

  test('Delete learner user - user removed successfully', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER003';
    
    const result = deleteUser(adminId, userId);

    console.log('Test Case ID: CASE-098');
    console.log(`Deleted User Role: ${result.deletedUser.role}`);
    console.log(`Remaining Users: ${result.remainingUsers}`);

    if (result.success && result.userRemoved) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.userRemoved).toBe(true);
    expect(result.deletedUser.role).toBe('learner');
    expect(usersData.users.find(u => u.userId === 'USER003')).toBeUndefined();
  });

  test('Multiple users deleted - count decreases correctly', () => {
    const adminId = 'ADMIN001';
    
    // Delete first user
    const result1 = deleteUser(adminId, 'USER001');
    expect(result1.success).toBe(true);
    expect(result1.remainingUsers).toBe(3);
    
    // Delete second user
    const result2 = deleteUser(adminId, 'USER002');

    console.log('Test Case ID: CASE-098');
    console.log('Test: Multiple users deleted');
    console.log(`After first delete: ${result1.remainingUsers} users remaining`);
    console.log(`After second delete: ${result2.remainingUsers} users remaining`);
    console.log(`Deleted User 1: ${result1.deletedUserId}`);
    console.log(`Deleted User 2: ${result2.deletedUserId}`);

    if (result2.success && result2.remainingUsers === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(true);
    expect(result2.remainingUsers).toBe(2);
    expect(usersData.totalUsers).toBe(2);
    expect(usersData.users).toHaveLength(2);
  });

  test('User completely removed from database', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER002';
    
    const result = deleteUser(adminId, userId);

    console.log('Test Case ID: CASE-098');
    console.log('Verifying user completely removed:');
    
    const searchById = usersData.users.find(u => u.userId === userId);
    const searchByEmail = usersData.users.find(u => u.email === 'sarah@example.com');
    
    console.log(`  User ID search result: ${searchById}`);
    console.log(`  Email search result: ${searchByEmail}`);
    console.log(`  Total users: ${usersData.totalUsers}`);

    if (!searchById && !searchByEmail && usersData.totalUsers === 3) {
      console.log('Outcome: PASSED - User completely removed');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(searchById).toBeUndefined();
    expect(searchByEmail).toBeUndefined();
    expect(usersData.totalUsers).toBe(3);
    expect(usersData.users.some(u => u.userId === 'USER002')).toBe(false);
  });

  test('Delete non-existent user - user not removed (negative test)', () => {
    const adminId = 'ADMIN001';
    const userId = 'USER999';
    const usersBefore = usersData.totalUsers;
    
    const result = deleteUser(adminId, userId);

    console.log('Test Case ID: CASE-098');
    console.log(`User ID: ${userId} (does not exist)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Users Before: ${usersBefore}`);
    console.log(`Users After: ${usersData.totalUsers}`);

    if (!result.success && !result.userRemoved && usersData.totalUsers === usersBefore) {
      console.log('Outcome: PASSED - Correctly rejected non-existent user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userRemoved).toBe(false);
    expect(result.errorMessage).toContain('not found');
    expect(usersData.totalUsers).toBe(4);
  });

  test('Delete self - user not removed (negative test)', () => {
    const adminId = 'ADMIN001';
    const userId = 'ADMIN001';
    const usersBefore = usersData.totalUsers;
    
    const result = deleteUser(adminId, userId);

    console.log('Test Case ID: CASE-098');
    console.log(`Admin ID: ${adminId} trying to delete self`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Users Before: ${usersBefore}`);
    console.log(`Users After: ${usersData.totalUsers}`);

    if (!result.success && !result.userRemoved && usersData.totalUsers === usersBefore) {
      console.log('Outcome: PASSED - Correctly prevented self-deletion');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userRemoved).toBe(false);
    expect(result.errorMessage).toContain('cannot delete');
    expect(usersData.totalUsers).toBe(4);
  });

  test('Without admin authentication - user not removed (negative test)', () => {
    const adminId = '';
    const userId = 'USER001';
    const usersBefore = usersData.totalUsers;
    
    const result = deleteUser(adminId, userId);

    console.log('Test Case ID: CASE-098');
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Users Before: ${usersBefore}`);
    console.log(`Users After: ${usersData.totalUsers}`);

    if (!result.success && !result.userRemoved && usersData.totalUsers === usersBefore) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated admin');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userRemoved).toBe(false);
    expect(result.errorMessage).toContain('log in');
    expect(usersData.totalUsers).toBe(4);
  });

  test('With non-admin account - user not removed (negative test)', () => {
    const adminId = 'USER002'; // Regular user
    const userId = 'USER001';
    const usersBefore = usersData.totalUsers;
    
    const result = deleteUser(adminId, userId);

    console.log('Test Case ID: CASE-098');
    console.log(`User ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Users Before: ${usersBefore}`);
    console.log(`Users After: ${usersData.totalUsers}`);

    if (!result.success && !result.userRemoved && usersData.totalUsers === usersBefore) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.userRemoved).toBe(false);
    expect(result.errorMessage).toContain('permission');
    expect(usersData.totalUsers).toBe(4);
  });

});
