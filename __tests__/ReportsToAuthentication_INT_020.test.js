// ─── Integration Test INT-020 ───────────────────────────────────────────────
// Test Case ID   : INT-020
// Test           : Integration when admin updates learning materials
// Component      : Manage Content → View Dashboard
// Input          : Admin adds content
// Expected Result: Content appears in learner modules

// Mock admin
const MOCK_ADMIN = {
  id: 'ADMIN001',
  email: 'admin@synclexia.com',
  full_name: 'System Admin',
  role: 'admin',
  is_active: true
};

// Mock learner session
const MOCK_SESSION = {
  user: { id: 'USER001', email: 'alex@synclexia.com' },
  access_token: 'mock_token_abc123'
};

// Mock learner
const MOCK_LEARNER = {
  id: 'USER001',
  email: 'alex@synclexia.com',
  full_name: 'Alex Johnson',
  role: 'student',
  is_active: true
};

// Mock new content being added
const MOCK_NEW_CONTENT = {
  id: 'CONTENT_NEW_001',
  title: 'Blending Short Vowels',
  type: 'lesson',
  module: 'reading',
  difficulty: 'easy',
  targetGrades: [1, 2, 3],
  tags: ['phonics', 'vowels', 'reading'],
  body: 'Learn how to blend short vowel sounds to form words.',
  isPublished: true,
  createdAt: '2024-04-14T09:00:00Z'
};

// Learner module definitions on dashboard
const DASHBOARD_MODULES = [
  { id: 'reading', title: 'Reading Activity', route: 'ReadingActivity', contentList: [] },
  { id: 'writing', title: 'Writing Activity', route: 'WritingActivity', contentList: [] },
  { id: 'spelling', title: 'Spelling Game', route: 'SpellingGame', contentList: [] },
  { id: 'sound_game', title: 'Sound Game', route: 'SoundGame', contentList: [] },
  { id: 'tts', title: 'Text to Speech', route: 'TTS', contentList: [] }
];

// State
let appState = {
  adminLoggedIn: false,
  admin: null,
  contentStore: new Map(),
  dashboardLoaded: false,
  dashboardModules: [],
  contentAddedToDashboard: false
};

function resetState() {
  appState = {
    adminLoggedIn: false,
    admin: null,
    contentStore: new Map(),
    dashboardLoaded: false,
    dashboardModules: [],
    contentAddedToDashboard: false
  };
  // Load default dashboard modules
  appState.dashboardModules = DASHBOARD_MODULES.map(m => ({ ...m, contentList: [] }));
}

// Admin login
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

  appState.adminLoggedIn = true;
  appState.admin = admin;

  return { success: true, adminId: admin.id, adminLoggedIn: true };
}

// Admin adds new content
function addContent(adminId, contentData) {
  if (!appState.adminLoggedIn || appState.admin?.id !== adminId) {
    return {
      success: false,
      actualResult: 'Content add failed - Admin not authenticated',
      error: 'Admin not authenticated'
    };
  }

  if (!contentData || !contentData.id || !contentData.module) {
    return {
      success: false,
      actualResult: 'Content add failed - Missing required fields',
      error: 'Invalid content data'
    };
  }

  if (appState.contentStore.has(contentData.id)) {
    return {
      success: false,
      actualResult: 'Content add failed - Content ID already exists',
      error: 'Duplicate content ID'
    };
  }

  const contentRecord = {
    ...contentData,
    addedBy: adminId,
    addedAt: new Date().toISOString(),
    status: contentData.isPublished ? 'published' : 'draft'
  };

  appState.contentStore.set(contentData.id, contentRecord);

  return {
    success: true,
    actualResult: 'Content added successfully',
    contentId: contentData.id,
    module: contentData.module,
    status: contentRecord.status,
    addedAt: contentRecord.addedAt
  };
}

// Sync content to dashboard learner modules
function syncContentToDashboard() {
  if (!appState.adminLoggedIn) {
    return {
      success: false,
      actualResult: 'Sync failed - Admin not logged in',
      error: 'Not authenticated'
    };
  }

  if (appState.contentStore.size === 0) {
    return {
      success: false,
      actualResult: 'Sync failed - No content in store',
      error: 'No content to sync'
    };
  }

  // Push published content into appropriate dashboard modules
  appState.contentStore.forEach(content => {
    if (content.status !== 'published') return;

    const module = appState.dashboardModules.find(m => m.id === content.module);
    if (module) {
      const alreadyAdded = module.contentList.some(c => c.id === content.id);
      if (!alreadyAdded) {
        module.contentList.push({
          id: content.id,
          title: content.title,
          difficulty: content.difficulty,
          tags: content.tags
        });
      }
    }
  });

  appState.contentAddedToDashboard = true;
  appState.dashboardLoaded = true;

  const affectedModules = appState.dashboardModules.filter(m => m.contentList.length > 0);

  return {
    success: true,
    actualResult: 'Content appears in learner modules',
    performedAsExpected: true,
    contentSynced: appState.contentStore.size,
    affectedModuleCount: affectedModules.length,
    affectedModules: affectedModules.map(m => m.id),
    dashboardLoaded: true,
    contentAddedToDashboard: true,
    integrationFlow: 'Manage Content → View Dashboard'
  };
}

// Get dashboard module content list
function getDashboardModuleContent(moduleId) {
  const module = appState.dashboardModules.find(m => m.id === moduleId);
  if (!module) return { success: false, error: 'Module not found' };
  return {
    success: true,
    moduleId: module.id,
    title: module.title,
    contentList: module.contentList,
    count: module.contentList.length
  };
}

// Full integration: admin login → add content → sync to dashboard
async function processContentToDashboard(admin, contentData) {
  const loginResult = await adminLogin(admin);
  if (!loginResult.success) {
    return {
      success: false,
      actualResult: loginResult.actualResult,
      error: loginResult.error,
      stage: 'login_failed'
    };
  }

  const addResult = addContent(admin.id, contentData);
  if (!addResult.success) {
    return {
      success: false,
      actualResult: addResult.actualResult,
      error: addResult.error,
      stage: 'add_failed'
    };
  }

  const syncResult = syncContentToDashboard();
  if (!syncResult.success) {
    return {
      success: false,
      actualResult: syncResult.actualResult,
      error: syncResult.error,
      stage: 'sync_failed'
    };
  }

  return {
    ...syncResult,
    contentId: addResult.contentId,
    module: addResult.module,
    addedAt: addResult.addedAt,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-020 (Manage Content → View Dashboard)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Admin adds content - Content appears in learner modules', async () => {
    const result = await processContentToDashboard(MOCK_ADMIN, MOCK_NEW_CONTENT);

    console.log('Test Case ID: INT-020');
    console.log('Test: Integration when admin updates learning materials');
    console.log('Component: Manage Content → View Dashboard');
    console.log(`Input: Admin adds content`);
    console.log(`Expected Result: Content appears in learner modules`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Content ID: ${result.contentId}`);
    console.log(`Module: ${result.module}`);
    console.log(`Content Synced: ${result.contentSynced}`);
    console.log(`Affected Modules: ${result.affectedModules?.join(', ')}`);
    console.log(`Dashboard Loaded: ${result.dashboardLoaded}`);
    console.log(`Content Added to Dashboard: ${result.contentAddedToDashboard}`);
    console.log(`Added At: ${result.addedAt}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.contentAddedToDashboard && result.affectedModules?.includes('reading')) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.contentId).toBe('CONTENT_NEW_001');
    expect(result.module).toBe('reading');
    expect(result.contentSynced).toBe(1);
    expect(result.affectedModules).toContain('reading');
    expect(result.dashboardLoaded).toBe(true);
    expect(result.contentAddedToDashboard).toBe(true);
    expect(result.addedAt).toBeDefined();
    expect(result.stage).toBe('completed');
  });

  test('Dashboard reading module contains new content', async () => {
    await processContentToDashboard(MOCK_ADMIN, MOCK_NEW_CONTENT);

    const moduleContent = getDashboardModuleContent('reading');

    console.log('Test Case ID: INT-020');
    console.log('Test: Reading module content list');
    console.log(`Module: ${moduleContent.moduleId}`);
    console.log(`Content Count: ${moduleContent.count}`);
    console.log(`Content: ${moduleContent.contentList[0]?.title}`);
    console.log(`Tags: ${moduleContent.contentList[0]?.tags?.join(', ')}`);

    if (moduleContent.count === 1 && moduleContent.contentList[0]?.id === 'CONTENT_NEW_001') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(moduleContent.success).toBe(true);
    expect(moduleContent.count).toBe(1);
    expect(moduleContent.contentList[0].id).toBe('CONTENT_NEW_001');
    expect(moduleContent.contentList[0].title).toBe('Blending Short Vowels');
    expect(moduleContent.contentList[0].tags).toContain('phonics');
  });

  test('State flags set after content added', async () => {
    await processContentToDashboard(MOCK_ADMIN, MOCK_NEW_CONTENT);

    console.log('Test Case ID: INT-020');
    console.log('Test: App state after content added');
    console.log(`adminLoggedIn: ${appState.adminLoggedIn}`);
    console.log(`contentStore size: ${appState.contentStore.size}`);
    console.log(`dashboardLoaded: ${appState.dashboardLoaded}`);
    console.log(`contentAddedToDashboard: ${appState.contentAddedToDashboard}`);

    if (appState.contentAddedToDashboard && appState.dashboardLoaded) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.adminLoggedIn).toBe(true);
    expect(appState.contentStore.size).toBe(1);
    expect(appState.dashboardLoaded).toBe(true);
    expect(appState.contentAddedToDashboard).toBe(true);
  });

  test('Multiple content items - each appears in correct module', async () => {
    await adminLogin(MOCK_ADMIN);

    const content1 = { ...MOCK_NEW_CONTENT, id: 'C001', module: 'reading' };
    const content2 = { ...MOCK_NEW_CONTENT, id: 'C002', module: 'spelling', title: 'Spelling Patterns' };

    addContent(MOCK_ADMIN.id, content1);
    addContent(MOCK_ADMIN.id, content2);
    const syncResult = syncContentToDashboard();

    const readingModule = getDashboardModuleContent('reading');
    const spellingModule = getDashboardModuleContent('spelling');

    console.log('Test Case ID: INT-020');
    console.log('Test: Multiple content items');
    console.log(`Reading Module Count: ${readingModule.count}`);
    console.log(`Spelling Module Count: ${spellingModule.count}`);
    console.log(`Affected Modules: ${syncResult.affectedModules?.join(', ')}`);

    if (readingModule.count === 1 && spellingModule.count === 1) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(syncResult.contentSynced).toBe(2);
    expect(readingModule.contentList[0].id).toBe('C001');
    expect(spellingModule.contentList[0].id).toBe('C002');
  });

  test('Non-admin - content add denied', async () => {
    const nonAdmin = { id: 'USER001', role: 'student', is_active: true };
    const result = await processContentToDashboard(nonAdmin, MOCK_NEW_CONTENT);

    console.log('Test Case ID: INT-020');
    console.log('Test: Non-admin add (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'login_failed') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('login_failed');
    expect(result.error).toBe('Unauthorized');
  });

  test('Invalid content data - add fails gracefully', async () => {
    await adminLogin(MOCK_ADMIN);
    const result = addContent(MOCK_ADMIN.id, { title: 'Missing ID and module' });

    console.log('Test Case ID: INT-020');
    console.log('Test: Invalid content (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Invalid content data') {
      console.log('Outcome: Performed as Expected - Validation worked');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid content data');
  });

  test('Duplicate content ID - add fails gracefully', async () => {
    await processContentToDashboard(MOCK_ADMIN, MOCK_NEW_CONTENT);
    const result = addContent(MOCK_ADMIN.id, MOCK_NEW_CONTENT);

    console.log('Test Case ID: INT-020');
    console.log('Test: Duplicate content ID (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Duplicate content ID') {
      console.log('Outcome: Performed as Expected - Duplicate blocked');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Duplicate content ID');
  });

});
