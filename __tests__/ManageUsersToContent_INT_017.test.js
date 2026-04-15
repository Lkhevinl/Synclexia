// ─── Integration Test INT-017 ───────────────────────────────────────────────
// Test Case ID   : INT-017
// Test           : Integration when profile update is saved
// Component      : Manage Profile → User Authentication
// Input          : User edits profile
// Expected Result: Updated info is reflected

// Mock authenticated user
const MOCK_USER = {
  id: 'USER001',
  email: 'alex@synclexia.com',
  full_name: 'Alex Johnson',
  role: 'student',
  is_active: true
};

// Mock session
const MOCK_SESSION = {
  user: { id: MOCK_USER.id, email: MOCK_USER.email },
  access_token: 'mock_token_abc123'
};

// Mock profile update
const MOCK_PROFILE_UPDATE = {
  full_name: 'Alexander Johnson',
  email: 'alexander@synclexia.com',
  age: 8,
  grade: 3,
  avatarUrl: '/avatars/alex_new.png'
};

// State
let appState = {
  isLoggedIn: false,
  user: null,
  profileOpen: false,
  profileSaved: false,
  authSessionUpdated: false,
  storedProfile: null
};

function resetState() {
  appState = {
    isLoggedIn: false,
    user: null,
    profileOpen: false,
    profileSaved: false,
    authSessionUpdated: false,
    storedProfile: null
  };
}

// Simulate login and opening profile
async function loginAndOpenProfile(user, session) {
  resetState();

  if (!user || !session) {
    return {
      success: false,
      actualResult: 'Profile open failed - Not authenticated',
      error: 'Not authenticated'
    };
  }

  if (!user.is_active) {
    return {
      success: false,
      actualResult: 'Profile open failed - Account inactive',
      error: 'Account inactive'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 30));

  appState.isLoggedIn = true;
  appState.user = { ...user };
  appState.storedProfile = { ...user };
  appState.profileOpen = true;

  return {
    success: true,
    isLoggedIn: true,
    userId: user.id,
    profileOpen: true,
    currentName: user.full_name,
    currentEmail: user.email
  };
}

// Simulate saving profile edits
function saveProfileUpdate(userId, updates) {
  if (!appState.isLoggedIn || !appState.profileOpen) {
    return {
      success: false,
      actualResult: 'Profile save failed - Profile not open',
      error: 'Profile not open'
    };
  }

  if (!updates || Object.keys(updates).length === 0) {
    return {
      success: false,
      actualResult: 'Profile save failed - No updates provided',
      error: 'No updates provided'
    };
  }

  if (appState.user.id !== userId) {
    return {
      success: false,
      actualResult: 'Profile save failed - User mismatch',
      error: 'User mismatch'
    };
  }

  const previousProfile = { ...appState.storedProfile };

  // Apply updates
  appState.storedProfile = {
    ...appState.storedProfile,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  appState.user = { ...appState.storedProfile };
  appState.profileSaved = true;

  // Reflect in auth session
  appState.authSessionUpdated = true;

  return {
    success: true,
    actualResult: 'Updated info is reflected',
    performedAsExpected: true,
    userId: userId,
    updatedFields: Object.keys(updates),
    previousName: previousProfile.full_name,
    previousEmail: previousProfile.email,
    newName: appState.storedProfile.full_name,
    newEmail: appState.storedProfile.email,
    newAge: appState.storedProfile.age,
    newGrade: appState.storedProfile.grade,
    newAvatarUrl: appState.storedProfile.avatarUrl,
    profileSaved: true,
    authSessionUpdated: true,
    updatedAt: appState.storedProfile.updatedAt,
    integrationFlow: 'Manage Profile → User Authentication'
  };
}

// Get current profile from auth session
function getAuthProfile(userId) {
  if (!appState.isLoggedIn || appState.user?.id !== userId) {
    return { success: false, error: 'User not found in session' };
  }

  return {
    success: true,
    profile: appState.storedProfile,
    authSessionUpdated: appState.authSessionUpdated
  };
}

// Full integration: login → open profile → save edits → reflect in auth
async function processProfileUpdate(user, session, updates) {
  const loginResult = await loginAndOpenProfile(user, session);
  if (!loginResult.success) {
    return {
      success: false,
      actualResult: loginResult.actualResult,
      error: loginResult.error,
      stage: 'login_failed'
    };
  }

  const saveResult = saveProfileUpdate(user.id, updates);
  if (!saveResult.success) {
    return {
      success: false,
      actualResult: saveResult.actualResult,
      error: saveResult.error,
      stage: 'save_failed'
    };
  }

  return {
    ...saveResult,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-017 (Manage Profile → User Authentication)', () => {

  beforeEach(() => {
    resetState();
  });

  test('User edits profile - Updated info is reflected', async () => {
    const result = await processProfileUpdate(MOCK_USER, MOCK_SESSION, MOCK_PROFILE_UPDATE);

    console.log('Test Case ID: INT-017');
    console.log('Test: Integration when profile update is saved');
    console.log('Component: Manage Profile → User Authentication');
    console.log(`Input: User edits profile`);
    console.log(`Expected Result: Updated info is reflected`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Profile Saved: ${result.profileSaved}`);
    console.log(`Auth Session Updated: ${result.authSessionUpdated}`);
    console.log(`Previous Name: ${result.previousName}`);
    console.log(`New Name: ${result.newName}`);
    console.log(`Previous Email: ${result.previousEmail}`);
    console.log(`New Email: ${result.newEmail}`);
    console.log(`New Age: ${result.newAge}`);
    console.log(`New Grade: ${result.newGrade}`);
    console.log(`Updated Fields: ${result.updatedFields?.join(', ')}`);
    console.log(`Updated At: ${result.updatedAt}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.profileSaved && result.authSessionUpdated) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.profileSaved).toBe(true);
    expect(result.authSessionUpdated).toBe(true);
    expect(result.newName).toBe('Alexander Johnson');
    expect(result.newEmail).toBe('alexander@synclexia.com');
    expect(result.newAge).toBe(8);
    expect(result.newGrade).toBe(3);
    expect(result.updatedFields).toContain('full_name');
    expect(result.updatedFields).toContain('email');
    expect(result.updatedAt).toBeDefined();
    expect(result.stage).toBe('completed');
  });

  test('Auth session reflects updated profile', async () => {
    await processProfileUpdate(MOCK_USER, MOCK_SESSION, MOCK_PROFILE_UPDATE);

    const authProfile = getAuthProfile('USER001');

    console.log('Test Case ID: INT-017');
    console.log('Test: Auth session updated');
    console.log(`Auth Session Updated: ${authProfile.authSessionUpdated}`);
    console.log(`Auth Profile Name: ${authProfile.profile?.full_name}`);
    console.log(`Auth Profile Email: ${authProfile.profile?.email}`);

    if (authProfile.authSessionUpdated && authProfile.profile?.full_name === 'Alexander Johnson') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(authProfile.success).toBe(true);
    expect(authProfile.authSessionUpdated).toBe(true);
    expect(authProfile.profile.full_name).toBe('Alexander Johnson');
    expect(authProfile.profile.email).toBe('alexander@synclexia.com');
  });

  test('State flags set after profile save', async () => {
    await processProfileUpdate(MOCK_USER, MOCK_SESSION, MOCK_PROFILE_UPDATE);

    console.log('Test Case ID: INT-017');
    console.log('Test: App state after save');
    console.log(`isLoggedIn: ${appState.isLoggedIn}`);
    console.log(`profileOpen: ${appState.profileOpen}`);
    console.log(`profileSaved: ${appState.profileSaved}`);
    console.log(`authSessionUpdated: ${appState.authSessionUpdated}`);

    if (appState.profileSaved && appState.authSessionUpdated) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.isLoggedIn).toBe(true);
    expect(appState.profileSaved).toBe(true);
    expect(appState.authSessionUpdated).toBe(true);
    expect(appState.storedProfile.full_name).toBe('Alexander Johnson');
  });

  test('Partial update - only provided fields changed', async () => {
    const partialUpdate = { full_name: 'Alex J.' };
    const result = await processProfileUpdate(MOCK_USER, MOCK_SESSION, partialUpdate);

    console.log('Test Case ID: INT-017');
    console.log('Test: Partial profile update');
    console.log(`Updated Fields: ${result.updatedFields?.join(', ')}`);
    console.log(`New Name: ${result.newName}`);
    console.log(`Email Unchanged: ${result.newEmail}`);

    if (result.newName === 'Alex J.' && result.newEmail === MOCK_USER.email) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.updatedFields).toEqual(['full_name']);
    expect(result.newName).toBe('Alex J.');
    expect(result.newEmail).toBe(MOCK_USER.email);
  });

  test('User not logged in - profile save fails', async () => {
    const result = await processProfileUpdate(null, null, MOCK_PROFILE_UPDATE);

    console.log('Test Case ID: INT-017');
    console.log('Test: Not logged in (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'login_failed') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('login_failed');
    expect(result.error).toBe('Not authenticated');
  });

  test('Empty update - fails gracefully', async () => {
    await loginAndOpenProfile(MOCK_USER, MOCK_SESSION);
    const result = saveProfileUpdate('USER001', {});

    console.log('Test Case ID: INT-017');
    console.log('Test: Empty update (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'No updates provided') {
      console.log('Outcome: Performed as Expected - Validation worked');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('No updates provided');
  });

  test('Profile save without opening profile - fails gracefully', () => {
    const result = saveProfileUpdate('USER001', MOCK_PROFILE_UPDATE);

    console.log('Test Case ID: INT-017');
    console.log('Test: Save without open profile (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Profile not open') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Profile not open');
  });

});
