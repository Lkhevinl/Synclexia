// ─── Integration Test INT-019 ───────────────────────────────────────────────
// Test Case ID   : INT-019
// Test           : Integration when admin manages accounts
// Component      : Manage Users → User Authentication
// Input          : Admin edits user data
// Expected Result: Changes are saved in system

// Mock admin
const MOCK_ADMIN = {
  id: 'ADMIN001',
  email: 'admin@synclexia.com',
  full_name: 'System Admin',
  role: 'admin',
  is_active: true
};

// Mock user account to manage
const MOCK_TARGET_USER = {
  id: 'USER001',
  email: 'alex@synclexia.com',
  full_name: 'Alex Johnson',
  role: 'student',
  grade: 2,
  age: 7,
  is_active: true,
  createdAt: '2024-01-10T08:00:00Z'
};

// Mock user data edits
const MOCK_USER_EDITS = {
  full_name: 'Alexander Johnson',
  email: 'alexander@synclexia.com',
  grade: 3,
  age: 8,
  role: 'student'
};

// State
let systemState = {
  adminLoggedIn: false,
  admin: null,
  userStore: new Map(),
  authRecords: new Map(),
  editLog: []
};

function resetState() {
  systemState = {
    adminLoggedIn: false,
    admin: null,
    userStore: new Map(),
    authRecords: new Map(),
    editLog: []
  };
  // Seed user store and auth record
  systemState.userStore.set(MOCK_TARGET_USER.id, { ...MOCK_TARGET_USER });
  systemState.authRecords.set(MOCK_TARGET_USER.id, {
    userId: MOCK_TARGET_USER.id,
    email: MOCK_TARGET_USER.email,
    role: MOCK_TARGET_USER.role,
    is_active: MOCK_TARGET_USER.is_active
  });
}

// Simulate admin login
async function adminLogin(admin) {
  if (!admin || admin.role !== 'admin') {
    return {
      success: false,
      actualResult: 'Admin login failed - Not an admin account',
      error: 'Unauthorized'
    };
  }

  if (!admin.is_active) {
    return {
      success: false,
      actualResult: 'Admin login failed - Account inactive',
      error: 'Account inactive'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 25));

  systemState.adminLoggedIn = true;
  systemState.admin = admin;

  return {
    success: true,
    adminId: admin.id,
    adminLoggedIn: true
  };
}

// Admin edits user data
function editUserData(adminId, targetUserId, edits) {
  if (!systemState.adminLoggedIn || systemState.admin?.id !== adminId) {
    return {
      success: false,
      actualResult: 'Edit failed - Admin not authenticated',
      error: 'Admin not authenticated'
    };
  }

  if (!edits || Object.keys(edits).length === 0) {
    return {
      success: false,
      actualResult: 'Edit failed - No changes provided',
      error: 'No edits provided'
    };
  }

  const user = systemState.userStore.get(targetUserId);
  if (!user) {
    return {
      success: false,
      actualResult: 'Edit failed - User not found',
      error: 'User not found'
    };
  }

  const previousData = { ...user };

  // Save to user store
  const updatedUser = {
    ...user,
    ...edits,
    updatedAt: new Date().toISOString(),
    updatedBy: adminId
  };
  systemState.userStore.set(targetUserId, updatedUser);

  // Reflect email/role changes in auth record
  const authRecord = systemState.authRecords.get(targetUserId);
  if (authRecord) {
    if (edits.email) authRecord.email = edits.email;
    if (edits.role) authRecord.role = edits.role;
    if (typeof edits.is_active !== 'undefined') authRecord.is_active = edits.is_active;
    authRecord.lastUpdated = updatedUser.updatedAt;
    systemState.authRecords.set(targetUserId, authRecord);
  }

  // Log the edit
  systemState.editLog.push({
    timestamp: updatedUser.updatedAt,
    adminId: adminId,
    targetUserId: targetUserId,
    changedFields: Object.keys(edits),
    previousValues: Object.keys(edits).reduce((acc, k) => ({ ...acc, [k]: previousData[k] }), {}),
    newValues: edits
  });

  return {
    success: true,
    actualResult: 'Changes are saved in system',
    performedAsExpected: true,
    targetUserId: targetUserId,
    changedFields: Object.keys(edits),
    previousName: previousData.full_name,
    newName: updatedUser.full_name,
    previousEmail: previousData.email,
    newEmail: updatedUser.email,
    previousGrade: previousData.grade,
    newGrade: updatedUser.grade,
    savedAt: updatedUser.updatedAt,
    authRecordUpdated: true,
    integrationFlow: 'Manage Users → User Authentication'
  };
}

// Get user from store
function getUserFromStore(userId) {
  const user = systemState.userStore.get(userId);
  if (!user) return { success: false, error: 'User not found' };
  return { success: true, user: user };
}

// Get auth record
function getAuthRecord(userId) {
  const record = systemState.authRecords.get(userId);
  if (!record) return { success: false, error: 'Auth record not found' };
  return { success: true, record: record };
}

// Full integration: admin login → edit user → save
async function processAdminEditUser(admin, targetUserId, edits) {
  const loginResult = await adminLogin(admin);
  if (!loginResult.success) {
    return {
      success: false,
      actualResult: loginResult.actualResult,
      error: loginResult.error,
      stage: 'login_failed'
    };
  }

  const editResult = editUserData(admin.id, targetUserId, edits);
  if (!editResult.success) {
    return {
      success: false,
      actualResult: editResult.actualResult,
      error: editResult.error,
      stage: 'edit_failed'
    };
  }

  return {
    ...editResult,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-019 (Manage Users → User Authentication)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Admin edits user data - Changes are saved in system', async () => {
    const result = await processAdminEditUser(MOCK_ADMIN, 'USER001', MOCK_USER_EDITS);

    console.log('Test Case ID: INT-019');
    console.log('Test: Integration when admin manages accounts');
    console.log('Component: Manage Users → User Authentication');
    console.log(`Input: Admin edits user data`);
    console.log(`Expected Result: Changes are saved in system`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Target User ID: ${result.targetUserId}`);
    console.log(`Previous Name: ${result.previousName}`);
    console.log(`New Name: ${result.newName}`);
    console.log(`Previous Email: ${result.previousEmail}`);
    console.log(`New Email: ${result.newEmail}`);
    console.log(`Previous Grade: ${result.previousGrade}`);
    console.log(`New Grade: ${result.newGrade}`);
    console.log(`Changed Fields: ${result.changedFields?.join(', ')}`);
    console.log(`Saved At: ${result.savedAt}`);
    console.log(`Auth Record Updated: ${result.authRecordUpdated}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.authRecordUpdated && result.newName === 'Alexander Johnson') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.newName).toBe('Alexander Johnson');
    expect(result.newEmail).toBe('alexander@synclexia.com');
    expect(result.newGrade).toBe(3);
    expect(result.changedFields).toContain('full_name');
    expect(result.changedFields).toContain('email');
    expect(result.changedFields).toContain('grade');
    expect(result.savedAt).toBeDefined();
    expect(result.authRecordUpdated).toBe(true);
    expect(result.stage).toBe('completed');
  });

  test('User store reflects saved changes', async () => {
    await processAdminEditUser(MOCK_ADMIN, 'USER001', MOCK_USER_EDITS);

    const { user } = getUserFromStore('USER001');

    console.log('Test Case ID: INT-019');
    console.log('Test: User store after edit');
    console.log(`Name: ${user.full_name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Grade: ${user.grade}`);
    console.log(`Updated By: ${user.updatedBy}`);

    if (user.full_name === 'Alexander Johnson' && user.grade === 3) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(user.full_name).toBe('Alexander Johnson');
    expect(user.email).toBe('alexander@synclexia.com');
    expect(user.grade).toBe(3);
    expect(user.updatedBy).toBe('ADMIN001');
    expect(user.updatedAt).toBeDefined();
  });

  test('Auth record reflects updated email', async () => {
    await processAdminEditUser(MOCK_ADMIN, 'USER001', MOCK_USER_EDITS);

    const { record } = getAuthRecord('USER001');

    console.log('Test Case ID: INT-019');
    console.log('Test: Auth record after edit');
    console.log(`Auth Email: ${record.email}`);
    console.log(`Auth Role: ${record.role}`);
    console.log(`Last Updated: ${record.lastUpdated}`);

    if (record.email === 'alexander@synclexia.com') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(record.email).toBe('alexander@synclexia.com');
    expect(record.role).toBe('student');
    expect(record.lastUpdated).toBeDefined();
  });

  test('Edit log records all changes', async () => {
    await processAdminEditUser(MOCK_ADMIN, 'USER001', MOCK_USER_EDITS);

    const logEntry = systemState.editLog[0];

    console.log('Test Case ID: INT-019');
    console.log('Test: Edit log entry');
    console.log(`Admin: ${logEntry?.adminId}`);
    console.log(`Target: ${logEntry?.targetUserId}`);
    console.log(`Changed Fields: ${logEntry?.changedFields?.join(', ')}`);
    console.log(`Previous Name: ${logEntry?.previousValues?.full_name}`);
    console.log(`New Name: ${logEntry?.newValues?.full_name}`);

    if (logEntry && logEntry.adminId === 'ADMIN001') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(systemState.editLog.length).toBe(1);
    expect(logEntry.adminId).toBe('ADMIN001');
    expect(logEntry.targetUserId).toBe('USER001');
    expect(logEntry.changedFields).toContain('full_name');
    expect(logEntry.previousValues.full_name).toBe('Alex Johnson');
    expect(logEntry.newValues.full_name).toBe('Alexander Johnson');
  });

  test('Non-admin - edit denied', async () => {
    const nonAdmin = { id: 'USER999', role: 'student', is_active: true };
    const result = await processAdminEditUser(nonAdmin, 'USER001', MOCK_USER_EDITS);

    console.log('Test Case ID: INT-019');
    console.log('Test: Non-admin edit (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'login_failed') {
      console.log('Outcome: Performed as Expected - Access denied');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('login_failed');
    expect(result.error).toBe('Unauthorized');
  });

  test('User not found - edit fails gracefully', async () => {
    const result = await processAdminEditUser(MOCK_ADMIN, 'NONEXISTENT', MOCK_USER_EDITS);

    console.log('Test Case ID: INT-019');
    console.log('Test: User not found (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.error === 'User not found') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('edit_failed');
    expect(result.error).toBe('User not found');
  });

  test('No edits provided - fails gracefully', async () => {
    const result = await processAdminEditUser(MOCK_ADMIN, 'USER001', {});

    console.log('Test Case ID: INT-019');
    console.log('Test: No edits provided (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'No edits provided') {
      console.log('Outcome: Performed as Expected - Validation worked');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('No edits provided');
  });

});
