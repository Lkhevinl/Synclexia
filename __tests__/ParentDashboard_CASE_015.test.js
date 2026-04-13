// ─── Test Case CASE-015 ──────────────────────────────────────────────────────
// Test Case ID: CASE-015
// Test Case Description: Validate successful login
// Expected Result: Load parent dashboard

// Mock database of registered users with roles
const registeredUsers = [
  { email: 'parent@test.com', password: 'parent123', role: 'Parent', name: 'Jane Parent', userId: 'P001' },
  { email: 'guardian@example.com', password: 'guardian789', role: 'Parent', name: 'Mike Guardian', userId: 'P002' },
  { email: 'mom@synclexia.com', password: 'mom456', role: 'Parent', name: 'Sarah Mom', userId: 'P003' }
];

function loadParentDashboard(credentials) {
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

  // Validate user is a Parent
  if (user.role !== 'Parent') {
    return {
      success: false,
      actualResult: 'Login failed - User is not a Parent',
      dashboardLoaded: false,
      redirectTo: null,
      user: null
    };
  }

  // Successful login - load parent dashboard
  return {
    success: true,
    actualResult: 'Load parent dashboard',
    dashboardLoaded: true,
    redirectTo: '/dashboard/parent',
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

describe('Test Case CASE-015 (Validate successful login)', () => {

  test('Successful Parent login - dashboard loaded', () => {
    const expectedResult = 'Load parent dashboard';
    const result = loadParentDashboard({
      email: 'parent@test.com',
      password: 'parent123'
    });

    console.log('Test Case ID: CASE-015');
    console.log('Test Case Description: Validate successful login');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Dashboard Loaded: ${result.dashboardLoaded}`);
    console.log(`Redirect To: ${result.redirectTo}`);

    if (result.success && result.dashboardLoaded && result.redirectTo === '/dashboard/parent') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.dashboardLoaded).toBe(true);
    expect(result.actualResult).toContain('parent dashboard');
    expect(result.redirectTo).toBe('/dashboard/parent');
    expect(result.user.role).toBe('Parent');
  });

  test('Another Parent login - dashboard loaded', () => {
    const expectedResult = 'Load parent dashboard';
    const result = loadParentDashboard({
      email: 'guardian@example.com',
      password: 'guardian789'
    });

    console.log('Test Case ID: CASE-015');
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
    expect(result.user.name).toBe('Mike Guardian');
  });

  test('Third Parent login - dashboard loaded', () => {
    const expectedResult = 'Load parent dashboard';
    const result = loadParentDashboard({
      email: 'mom@synclexia.com',
      password: 'mom456'
    });

    console.log('Test Case ID: CASE-015');
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
    expect(result.user.userId).toBe('P003');
  });

  test('Invalid password - dashboard should not load', () => {
    const result = loadParentDashboard({
      email: 'parent@test.com',
      password: 'wrongpassword'
    });

    console.log('Test Case ID: CASE-015');
    console.log('Test Case Description: Validate successful login');
    console.log('Expected Result: Load parent dashboard (for valid login)');
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
    const result = loadParentDashboard({
      email: 'nonexistent@user.com',
      password: 'password123'
    });

    console.log('Test Case ID: CASE-015');
    console.log('Test Case Description: Validate successful login');
    console.log('Expected Result: Load parent dashboard (for valid login)');
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
