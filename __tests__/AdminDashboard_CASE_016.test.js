// ─── Test Case CASE-016 ──────────────────────────────────────────────────────
// Test Case ID: CASE-016
// Test Case Description: Validate successful login
// Expected Result: Load admin dashboard

// Mock database of registered users with roles
const registeredUsers = [
  { email: 'admin@test.com', password: 'admin123', role: 'Admin', name: 'Super Admin', userId: 'A001' },
  { email: 'admin@synclexia.com', password: 'admin456', role: 'Admin', name: 'System Admin', userId: 'A002' },
  { email: 'moderator@example.com', password: 'mod789', role: 'Admin', name: 'Moderator', userId: 'A003' }
];

function loadAdminDashboard(credentials) {
  // Validate credentials are provided
  if (!credentials || !credentials.email || !credentials.password) {
    return {
      success: false,
      actualResult: 'Login failed - Credentials required',
      dashboardLoaded: false,
      redirectTo: null,
      user: null
    };
  }

  // Find user by email
  const user = registeredUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

  if (!user) {
    return {
      success: false,
      actualResult: 'Login failed - User not found',
      dashboardLoaded: false,
      redirectTo: null,
      user: null
    };
  }

  // Validate password
  if (user.password !== credentials.password) {
    return {
      success: false,
      actualResult: 'Login failed - Invalid password',
      dashboardLoaded: false,
      redirectTo: null,
      user: null
    };
  }

  // Validate user is an Admin
  if (user.role !== 'Admin') {
    return {
      success: false,
      actualResult: 'Login failed - User is not an Admin',
      dashboardLoaded: false,
      redirectTo: null,
      user: null
    };
  }

  // Successful login - load admin dashboard
  return {
    success: true,
    actualResult: 'Load admin dashboard',
    dashboardLoaded: true,
    redirectTo: '/dashboard/admin',
    user: {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-016 (Validate successful login)', () => {

  test('Successful Admin login - dashboard loaded', () => {
    const expectedResult = 'Load admin dashboard';
    const result = loadAdminDashboard({
      email: 'admin@test.com',
      password: 'admin123'
    });

    console.log('Test Case ID: CASE-016');
    console.log('Test Case Description: Validate successful login');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Dashboard Loaded: ${result.dashboardLoaded}`);
    console.log(`Redirect To: ${result.redirectTo}`);

    if (result.success && result.dashboardLoaded && result.redirectTo === '/dashboard/admin') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.dashboardLoaded).toBe(true);
    expect(result.actualResult).toContain('admin dashboard');
    expect(result.redirectTo).toBe('/dashboard/admin');
    expect(result.user.role).toBe('Admin');
  });

  test('Another Admin login - dashboard loaded', () => {
    const expectedResult = 'Load admin dashboard';
    const result = loadAdminDashboard({
      email: 'admin@synclexia.com',
      password: 'admin456'
    });

    console.log('Test Case ID: CASE-016');
    console.log('Test Case Description: Validate successful login');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Dashboard Loaded: ${result.dashboardLoaded}`);

    if (result.success && result.dashboardLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.dashboardLoaded).toBe(true);
    expect(result.user.name).toBe('System Admin');
  });

  test('Third Admin login - dashboard loaded', () => {
    const expectedResult = 'Load admin dashboard';
    const result = loadAdminDashboard({
      email: 'moderator@example.com',
      password: 'mod789'
    });

    console.log('Test Case ID: CASE-016');
    console.log('Test Case Description: Validate successful login');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Dashboard Loaded: ${result.dashboardLoaded}`);

    if (result.success && result.dashboardLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.dashboardLoaded).toBe(true);
    expect(result.user.userId).toBe('A003');
  });

  test('Invalid password - dashboard should not load', () => {
    const result = loadAdminDashboard({
      email: 'admin@test.com',
      password: 'wrongpassword'
    });

    console.log('Test Case ID: CASE-016');
    console.log('Test Case Description: Validate successful login');
    console.log('Expected Result: Load admin dashboard (for valid login)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Dashboard Loaded: ${result.dashboardLoaded}`);

    if (!result.success && !result.dashboardLoaded) {
      console.log('Outcome: PASSED - Correctly rejected invalid password');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.dashboardLoaded).toBe(false);
    expect(result.actualResult).toContain('failed');
  });

  test('Non-existent user - dashboard should not load', () => {
    const result = loadAdminDashboard({
      email: 'nonexistent@user.com',
      password: 'password123'
    });

    console.log('Test Case ID: CASE-016');
    console.log('Test Case Description: Validate successful login');
    console.log('Expected Result: Load admin dashboard (for valid login)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Dashboard Loaded: ${result.dashboardLoaded}`);

    if (!result.success && !result.dashboardLoaded) {
      console.log('Outcome: PASSED - Correctly rejected non-existent user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.dashboardLoaded).toBe(false);
    expect(result.actualResult).toContain('not found');
  });

});
