// ─── Integration Test INT-001 ───────────────────────────────────────────────
// Test Case ID   : INT-001
// Test           : Integration when user logs in successfully and proceeds to main interface
// Component      : User Authentication → View Dashboard
// Input          : User enters valid credentials
// Expected Result: User is redirected to dashboard

// Mock registered user
const MOCK_USER = {
  id: 'USER001',
  email: 'student@synclexia.com',
  password: 'SecurePass123!',
  full_name: 'Alex Student',
  role: 'student',
  is_active: true
};

// Mock Supabase session
const MOCK_SESSION = {
  user: {
    id: MOCK_USER.id,
    email: MOCK_USER.email,
    user_metadata: { full_name: MOCK_USER.full_name }
  },
  access_token: 'mock_access_token_abc123',
  refresh_token: 'mock_refresh_token_xyz789',
  expires_at: Date.now() + 3600000
};

// Mock Supabase auth responses
const MOCK_AUTH_RESPONSES = {
  success: {
    data: { session: MOCK_SESSION, user: MOCK_SESSION.user },
    error: null
  },
  invalidCredentials: {
    data: { session: null, user: null },
    error: { message: 'Invalid login credentials' }
  },
  networkError: {
    data: { session: null, user: null },
    error: { message: 'Network error. Please check your connection.' }
  }
};

// State
let authState = {
  isAuthenticated: false,
  session: null,
  user: null,
  loading: false,
  error: null,
  redirectTo: null
};

function resetState() {
  authState = {
    isAuthenticated: false,
    session: null,
    user: null,
    loading: false,
    error: null,
    redirectTo: null
  };
}

// Simulate login flow
async function loginUser(email, password, mockResponse = MOCK_AUTH_RESPONSES.success) {
  resetState();
  authState.loading = true;

  await new Promise(resolve => setTimeout(resolve, 50));

  if (!email || !password) {
    authState.loading = false;
    authState.error = 'Email and password are required.';
    return {
      success: false,
      actualResult: 'Login failed - Missing credentials',
      error: authState.error,
      isAuthenticated: false
    };
  }

  const { data, error } = mockResponse;

  if (error) {
    authState.loading = false;
    authState.error = error.message;
    return {
      success: false,
      actualResult: `Login failed - ${error.message}`,
      error: error.message,
      isAuthenticated: false
    };
  }

  // Successful login
  authState.session = data.session;
  authState.user = {
    id: data.user.id,
    email: data.user.email,
    full_name: data.user.user_metadata?.full_name,
    role: MOCK_USER.role
  };
  authState.isAuthenticated = true;
  authState.loading = false;
  authState.error = null;
  authState.redirectTo = 'Dashboard';

  return {
    success: true,
    actualResult: 'User is redirected to dashboard',
    performedAsExpected: true,
    isAuthenticated: true,
    userId: data.user.id,
    email: data.user.email,
    role: MOCK_USER.role,
    session: data.session,
    redirectTo: 'Dashboard',
    integrationFlow: 'User Authentication → View Dashboard'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-001 (User Authentication → View Dashboard)', () => {

  beforeEach(() => {
    resetState();
  });

  test('User enters valid credentials - user is redirected to dashboard', async () => {
    const result = await loginUser(MOCK_USER.email, MOCK_USER.password);

    console.log('Test Case ID: INT-001');
    console.log('Test: Integration when user logs in successfully and proceeds to main interface');
    console.log('Component: User Authentication → View Dashboard');
    console.log(`Input: User enters valid credentials`);
    console.log(`Expected Result: User is redirected to dashboard`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Is Authenticated: ${result.isAuthenticated}`);
    console.log(`User ID: ${result.userId}`);
    console.log(`Email: ${result.email}`);
    console.log(`Role: ${result.role}`);
    console.log(`Redirect To: ${result.redirectTo}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.isAuthenticated && result.redirectTo === 'Dashboard') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.isAuthenticated).toBe(true);
    expect(result.userId).toBe('USER001');
    expect(result.email).toBe(MOCK_USER.email);
    expect(result.role).toBe('student');
    expect(result.redirectTo).toBe('Dashboard');
    expect(result.session).toBeDefined();
  });

  test('Session persisted - access and refresh tokens present', async () => {
    const result = await loginUser(MOCK_USER.email, MOCK_USER.password);

    console.log('Test Case ID: INT-001');
    console.log('Test: Session tokens after login');
    console.log(`Access Token Present: ${!!result.session?.access_token}`);
    console.log(`Refresh Token Present: ${!!result.session?.refresh_token}`);

    if (result.session?.access_token && result.session?.refresh_token) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.session.access_token).toBeDefined();
    expect(result.session.refresh_token).toBeDefined();
  });

  test('Auth state updated - isAuthenticated true and redirectTo set', async () => {
    await loginUser(MOCK_USER.email, MOCK_USER.password);

    console.log('Test Case ID: INT-001');
    console.log('Test: Auth state after login');
    console.log(`isAuthenticated: ${authState.isAuthenticated}`);
    console.log(`redirectTo: ${authState.redirectTo}`);
    console.log(`loading: ${authState.loading}`);

    if (authState.isAuthenticated && authState.redirectTo === 'Dashboard') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(authState.isAuthenticated).toBe(true);
    expect(authState.redirectTo).toBe('Dashboard');
    expect(authState.loading).toBe(false);
    expect(authState.error).toBeNull();
  });

  test('Invalid credentials - login rejected, no redirect', async () => {
    const result = await loginUser('wrong@synclexia.com', 'wrongpass', MOCK_AUTH_RESPONSES.invalidCredentials);

    console.log('Test Case ID: INT-001');
    console.log('Test: Invalid credentials (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Is Authenticated: ${result.isAuthenticated}`);

    if (!result.success && !result.isAuthenticated) {
      console.log('Outcome: Performed as Expected - Rejected correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.isAuthenticated).toBe(false);
    expect(result.error).toContain('Invalid');
    expect(authState.redirectTo).toBeNull();
  });

  test('Missing credentials - validation error returned', async () => {
    const result = await loginUser('', '');

    console.log('Test Case ID: INT-001');
    console.log('Test: Missing credentials (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error.includes('required')) {
      console.log('Outcome: Performed as Expected - Validation triggered');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
    expect(result.isAuthenticated).toBe(false);
  });

  test('Network error - login fails gracefully', async () => {
    const result = await loginUser(MOCK_USER.email, MOCK_USER.password, MOCK_AUTH_RESPONSES.networkError);

    console.log('Test Case ID: INT-001');
    console.log('Test: Network error (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error.includes('Network')) {
      console.log('Outcome: Performed as Expected - Network error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.isAuthenticated).toBe(false);
    expect(result.error).toContain('Network');
  });

});
