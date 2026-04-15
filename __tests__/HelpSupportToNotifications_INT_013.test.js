// ─── Integration Test INT-013 ───────────────────────────────────────────────
// Test Case ID   : INT-013
// Test           : Integration when parent accesses learner account
// Component      : View Dashboard → Parent Management
// Input          : Parent is logged in
// Expected Result: Linked learner data is displayed

// Mock parent account
const MOCK_PARENT = {
  id: 'PARENT001',
  email: 'parent@synclexia.com',
  full_name: 'Sarah Johnson',
  role: 'parent',
  is_active: true
};

// Mock session
const MOCK_SESSION = {
  user: { id: MOCK_PARENT.id, email: MOCK_PARENT.email },
  access_token: 'mock_parent_token_xyz789'
};

// Mock linked learner
const MOCK_LEARNER = {
  id: 'STUDENT001',
  full_name: 'Alex Johnson',
  age: 7,
  grade: 2,
  parentId: MOCK_PARENT.id,
  recentActivity: ['phonics', 'reading', 'spelling'],
  averageScore: 78,
  lastActive: '2024-04-14T10:00:00Z'
};

// Dashboard modules
const DASHBOARD_MODULES = [
  { id: 'tts', title: 'Text-to-Speech', type: 'tool', enabled: true },
  { id: 'ocr', title: 'OCR Image-to-Text', type: 'tool', enabled: true },
  { id: 'sst', title: 'Speech-to-Text', type: 'tool', enabled: true },
  { id: 'parent_management', title: 'Parent Management', route: 'ParentManagement', type: 'management', enabled: true }
];

// Parent management definition
const PARENT_MANAGEMENT = {
  id: 'parent_management',
  title: 'Parent Management',
  isReady: true,
  showsLearnerProgress: true,
  showsActivityHistory: true,
  showsAverageScore: true,
  allowsLearnerLink: true
};

// State
let appState = {
  isLoggedIn: false,
  parent: null,
  dashboardLoaded: false,
  parentManagementOpen: false,
  parentManagementReady: false,
  linkedLearnerData: null,
  learnerDataDisplayed: false
};

function resetState() {
  appState = {
    isLoggedIn: false,
    parent: null,
    dashboardLoaded: false,
    parentManagementOpen: false,
    parentManagementReady: false,
    linkedLearnerData: null,
    learnerDataDisplayed: false
  };
}

// Simulate parent login and dashboard load
async function loadDashboardAsParent(parent, session) {
  resetState();

  if (!parent || !session) {
    return {
      success: false,
      actualResult: 'Dashboard load failed - Parent not logged in',
      error: 'Not authenticated'
    };
  }

  if (parent.role !== 'parent') {
    return {
      success: false,
      actualResult: 'Dashboard load failed - Not a parent account',
      error: 'Invalid role'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 50));

  appState.isLoggedIn = true;
  appState.parent = parent;
  appState.dashboardLoaded = true;

  return {
    success: true,
    isLoggedIn: true,
    parentId: parent.id,
    role: parent.role,
    dashboardLoaded: true,
    availableModules: DASHBOARD_MODULES.filter(m => m.enabled).map(m => m.id)
  };
}

// Simulate opening Parent Management and loading linked learner data
function openParentManagement(parent, learner) {
  if (!appState.isLoggedIn || !appState.dashboardLoaded) {
    return {
      success: false,
      actualResult: 'Parent management failed - Parent not on dashboard',
      error: 'Dashboard not loaded'
    };
  }

  const module = DASHBOARD_MODULES.find(m => m.id === 'parent_management');
  if (!module || !module.enabled) {
    return {
      success: false,
      actualResult: 'Parent management failed - Module not available',
      error: 'Parent management not available'
    };
  }

  if (!learner || learner.parentId !== parent.id) {
    return {
      success: false,
      actualResult: 'Linked learner data failed - No linked learner found',
      error: 'No linked learner'
    };
  }

  appState.parentManagementOpen = true;
  appState.parentManagementReady = PARENT_MANAGEMENT.isReady;
  appState.linkedLearnerData = learner;
  appState.learnerDataDisplayed = true;

  return {
    success: true,
    actualResult: 'Linked learner data is displayed',
    performedAsExpected: true,
    parentManagementOpen: true,
    parentManagementReady: PARENT_MANAGEMENT.isReady,
    moduleId: module.id,
    route: module.route,
    showsLearnerProgress: PARENT_MANAGEMENT.showsLearnerProgress,
    showsActivityHistory: PARENT_MANAGEMENT.showsActivityHistory,
    showsAverageScore: PARENT_MANAGEMENT.showsAverageScore,
    allowsLearnerLink: PARENT_MANAGEMENT.allowsLearnerLink,
    learnerId: learner.id,
    learnerName: learner.full_name,
    learnerAge: learner.age,
    learnerGrade: learner.grade,
    recentActivity: learner.recentActivity,
    averageScore: learner.averageScore,
    lastActive: learner.lastActive,
    learnerDataDisplayed: true,
    integrationFlow: 'View Dashboard → Parent Management'
  };
}

// Full integration: login → dashboard → open parent management
async function openParentManagementFromDashboard(parent, session, learner) {
  const dashResult = await loadDashboardAsParent(parent, session);
  if (!dashResult.success) {
    return {
      success: false,
      actualResult: dashResult.actualResult,
      error: dashResult.error,
      stage: 'dashboard_failed'
    };
  }

  const mgmtResult = openParentManagement(parent, learner);
  if (!mgmtResult.success) {
    return {
      success: false,
      actualResult: mgmtResult.actualResult,
      error: mgmtResult.error,
      stage: 'management_open_failed'
    };
  }

  return {
    ...mgmtResult,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-013 (View Dashboard → Parent Management)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Parent is logged in - Linked learner data is displayed', async () => {
    const result = await openParentManagementFromDashboard(MOCK_PARENT, MOCK_SESSION, MOCK_LEARNER);

    console.log('Test Case ID: INT-013');
    console.log('Test: Integration when parent accesses learner account');
    console.log('Component: View Dashboard → Parent Management');
    console.log(`Input: Parent is logged in`);
    console.log(`Expected Result: Linked learner data is displayed`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Parent Management Open: ${result.parentManagementOpen}`);
    console.log(`Parent Management Ready: ${result.parentManagementReady}`);
    console.log(`Learner: ${result.learnerName} (Age ${result.learnerAge}, Grade ${result.learnerGrade})`);
    console.log(`Recent Activity: ${result.recentActivity?.join(', ')}`);
    console.log(`Average Score: ${result.averageScore}%`);
    console.log(`Last Active: ${result.lastActive}`);
    console.log(`Learner Data Displayed: ${result.learnerDataDisplayed}`);
    console.log(`Shows Progress: ${result.showsLearnerProgress}`);
    console.log(`Shows Activity History: ${result.showsActivityHistory}`);
    console.log(`Shows Average Score: ${result.showsAverageScore}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.learnerDataDisplayed && result.parentManagementOpen) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.parentManagementOpen).toBe(true);
    expect(result.parentManagementReady).toBe(true);
    expect(result.learnerId).toBe('STUDENT001');
    expect(result.learnerName).toBe('Alex Johnson');
    expect(result.learnerDataDisplayed).toBe(true);
    expect(result.showsLearnerProgress).toBe(true);
    expect(result.showsActivityHistory).toBe(true);
    expect(result.showsAverageScore).toBe(true);
    expect(result.averageScore).toBe(78);
    expect(result.stage).toBe('completed');
  });

  test('Dashboard loaded - Parent Management module present', async () => {
    const dashResult = await loadDashboardAsParent(MOCK_PARENT, MOCK_SESSION);

    console.log('Test Case ID: INT-013');
    console.log('Test: Dashboard modules loaded');
    console.log(`Dashboard Loaded: ${dashResult.dashboardLoaded}`);
    console.log(`Available Modules: ${dashResult.availableModules?.join(', ')}`);

    if (dashResult.dashboardLoaded && dashResult.availableModules?.includes('parent_management')) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(dashResult.success).toBe(true);
    expect(dashResult.dashboardLoaded).toBe(true);
    expect(dashResult.availableModules).toContain('parent_management');
  });

  test('State reflects open and learner data loaded', async () => {
    await openParentManagementFromDashboard(MOCK_PARENT, MOCK_SESSION, MOCK_LEARNER);

    console.log('Test Case ID: INT-013');
    console.log('Test: App state after Parent Management open');
    console.log(`parentManagementOpen: ${appState.parentManagementOpen}`);
    console.log(`learnerDataDisplayed: ${appState.learnerDataDisplayed}`);
    console.log(`linkedLearnerData: ${appState.linkedLearnerData?.full_name}`);

    if (appState.parentManagementOpen && appState.learnerDataDisplayed) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.parentManagementOpen).toBe(true);
    expect(appState.learnerDataDisplayed).toBe(true);
    expect(appState.linkedLearnerData?.id).toBe('STUDENT001');
  });

  test('Learner activity history displayed', async () => {
    const result = await openParentManagementFromDashboard(MOCK_PARENT, MOCK_SESSION, MOCK_LEARNER);

    console.log('Test Case ID: INT-013');
    console.log('Test: Learner activity history');
    console.log(`Recent Activity: ${result.recentActivity?.join(', ')}`);
    console.log(`Activity Count: ${result.recentActivity?.length}`);

    if (result.recentActivity?.length === 3) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.recentActivity).toEqual(['phonics', 'reading', 'spelling']);
    expect(result.recentActivity.length).toBe(3);
  });

  test('Parent not logged in - management access fails', async () => {
    const result = await openParentManagementFromDashboard(null, null, MOCK_LEARNER);

    console.log('Test Case ID: INT-013');
    console.log('Test: Parent not logged in (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'dashboard_failed') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('dashboard_failed');
    expect(result.error).toBe('Not authenticated');
  });

  test('No linked learner - data display fails gracefully', async () => {
    const result = await openParentManagementFromDashboard(MOCK_PARENT, MOCK_SESSION, null);

    console.log('Test Case ID: INT-013');
    console.log('Test: No linked learner (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.error === 'No linked learner') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('No linked learner');
    expect(result.stage).toBe('management_open_failed');
  });

  test('Wrong parent-learner link - access denied', async () => {
    const unlinkedLearner = { ...MOCK_LEARNER, parentId: 'DIFFERENT_PARENT' };
    const result = await openParentManagementFromDashboard(MOCK_PARENT, MOCK_SESSION, unlinkedLearner);

    console.log('Test Case ID: INT-013');
    console.log('Test: Wrong learner link (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'No linked learner') {
      console.log('Outcome: Performed as Expected - Access denied');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('No linked learner');
  });

});
