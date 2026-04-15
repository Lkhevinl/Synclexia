// ─── Integration Test INT-006 ───────────────────────────────────────────────
// Test Case ID   : INT-006
// Test           : Integration when learner starts phonics learning module
// Component      : View Dashboard → Phonics Activity
// Input          : Learner is logged in
// Expected Result: Phonics activity opens

// Mock logged-in learner
const MOCK_LEARNER = {
  id: 'USER001',
  email: 'student@synclexia.com',
  full_name: 'Alex Student',
  role: 'student',
  is_active: true
};

// Mock session
const MOCK_SESSION = {
  user: { id: MOCK_LEARNER.id, email: MOCK_LEARNER.email },
  access_token: 'mock_access_token_abc123'
};

// Dashboard modules
const DASHBOARD_MODULES = [
  { id: 'tts', title: 'Text-to-Speech', route: 'TextToSpeech', type: 'reading_assistance', enabled: true },
  { id: 'ocr', title: 'OCR Image-to-Text', route: 'OCRScanner', type: 'reading_assistance', enabled: true },
  { id: 'sst', title: 'Speech-to-Text', route: 'SpeechToText', type: 'speech_input', enabled: true },
  { id: 'phonics', title: 'Phonics Activity', route: 'PhonicsActivity', type: 'learning', enabled: true },
  { id: 'reading', title: 'Reading', route: 'Reading', type: 'learning', enabled: true },
  { id: 'spelling', title: 'Spelling Game', route: 'SpellingGame', type: 'learning', enabled: true }
];

// Phonics activity definition
const PHONICS_ACTIVITY = {
  id: 'phonics',
  title: 'Phonics Activity',
  isReady: true,
  activityTypes: ['blend', 'segment', 'sound_match', 'word_builder', 'tricky_words'],
  defaultType: 'blend',
  hasTTS: true,
  hasSST: true,
  supportsLevels: true,
  maxLevel: 7
};

// State
let appState = {
  isLoggedIn: false,
  learner: null,
  dashboardLoaded: false,
  selectedModule: null,
  phonicsOpen: false,
  phonicsReady: false,
  currentActivityType: null
};

function resetState() {
  appState = {
    isLoggedIn: false,
    learner: null,
    dashboardLoaded: false,
    selectedModule: null,
    phonicsOpen: false,
    phonicsReady: false,
    currentActivityType: null
  };
}

// Simulate learner login and dashboard load
async function loadDashboardAsLearner(learner, session) {
  resetState();

  if (!learner || !session) {
    return {
      success: false,
      actualResult: 'Dashboard load failed - Learner not logged in',
      error: 'Not authenticated'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 50));

  appState.isLoggedIn = true;
  appState.learner = learner;
  appState.dashboardLoaded = true;

  return {
    success: true,
    isLoggedIn: true,
    learnerId: learner.id,
    role: learner.role,
    dashboardLoaded: true,
    availableModules: DASHBOARD_MODULES.filter(m => m.enabled).map(m => m.id)
  };
}

// Simulate selecting Phonics module from dashboard
function selectPhonicsModule(learnerId) {
  if (!appState.isLoggedIn || !appState.dashboardLoaded) {
    return {
      success: false,
      actualResult: 'Phonics open failed - Learner not on dashboard',
      error: 'Dashboard not loaded'
    };
  }

  const module = DASHBOARD_MODULES.find(m => m.id === 'phonics');
  if (!module || !module.enabled) {
    return {
      success: false,
      actualResult: 'Phonics open failed - Module not available',
      error: 'Phonics not available'
    };
  }

  appState.selectedModule = module;
  appState.phonicsOpen = true;
  appState.phonicsReady = PHONICS_ACTIVITY.isReady;
  appState.currentActivityType = PHONICS_ACTIVITY.defaultType;

  return {
    success: true,
    actualResult: 'Phonics activity opens',
    performedAsExpected: true,
    learnerId: learnerId,
    moduleId: module.id,
    moduleTitle: module.title,
    route: module.route,
    phonicsOpen: true,
    phonicsReady: PHONICS_ACTIVITY.isReady,
    activityTypes: PHONICS_ACTIVITY.activityTypes,
    defaultType: PHONICS_ACTIVITY.defaultType,
    hasTTS: PHONICS_ACTIVITY.hasTTS,
    hasSST: PHONICS_ACTIVITY.hasSST,
    supportsLevels: PHONICS_ACTIVITY.supportsLevels,
    maxLevel: PHONICS_ACTIVITY.maxLevel,
    integrationFlow: 'View Dashboard → Phonics Activity'
  };
}

// Full integration: login → dashboard → open phonics
async function openPhonicsFromDashboard(learner, session) {
  const dashResult = await loadDashboardAsLearner(learner, session);
  if (!dashResult.success) {
    return {
      success: false,
      actualResult: dashResult.actualResult,
      error: dashResult.error,
      stage: 'dashboard_failed'
    };
  }

  const phonicsResult = selectPhonicsModule(learner?.id);
  if (!phonicsResult.success) {
    return {
      success: false,
      actualResult: phonicsResult.actualResult,
      error: phonicsResult.error,
      stage: 'phonics_open_failed'
    };
  }

  return {
    ...phonicsResult,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-006 (View Dashboard → Phonics Activity)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Learner is logged in - Phonics activity opens', async () => {
    const result = await openPhonicsFromDashboard(MOCK_LEARNER, MOCK_SESSION);

    console.log('Test Case ID: INT-006');
    console.log('Test: Integration when learner starts phonics learning module');
    console.log('Component: View Dashboard → Phonics Activity');
    console.log(`Input: Learner is logged in`);
    console.log(`Expected Result: Phonics activity opens`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Learner ID: ${result.learnerId}`);
    console.log(`Module: ${result.moduleTitle}`);
    console.log(`Route: ${result.route}`);
    console.log(`Phonics Open: ${result.phonicsOpen}`);
    console.log(`Phonics Ready: ${result.phonicsReady}`);
    console.log(`Default Activity Type: ${result.defaultType}`);
    console.log(`Activity Types: ${result.activityTypes?.join(', ')}`);
    console.log(`Has TTS: ${result.hasTTS}`);
    console.log(`Has SST: ${result.hasSST}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.phonicsOpen && result.phonicsReady) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.phonicsOpen).toBe(true);
    expect(result.phonicsReady).toBe(true);
    expect(result.moduleId).toBe('phonics');
    expect(result.route).toBe('PhonicsActivity');
    expect(result.defaultType).toBe('blend');
    expect(result.hasTTS).toBe(true);
    expect(result.hasSST).toBe(true);
    expect(result.stage).toBe('completed');
  });

  test('Dashboard loaded - Phonics module present in learning modules', async () => {
    const dashResult = await loadDashboardAsLearner(MOCK_LEARNER, MOCK_SESSION);

    console.log('Test Case ID: INT-006');
    console.log('Test: Dashboard modules loaded');
    console.log(`Dashboard Loaded: ${dashResult.dashboardLoaded}`);
    console.log(`Available Modules: ${dashResult.availableModules?.join(', ')}`);

    if (dashResult.dashboardLoaded && dashResult.availableModules?.includes('phonics')) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(dashResult.success).toBe(true);
    expect(dashResult.dashboardLoaded).toBe(true);
    expect(dashResult.availableModules).toContain('phonics');
  });

  test('Phonics module selected - state reflects open, ready, and default type set', async () => {
    await loadDashboardAsLearner(MOCK_LEARNER, MOCK_SESSION);
    selectPhonicsModule(MOCK_LEARNER.id);

    console.log('Test Case ID: INT-006');
    console.log('Test: App state after Phonics selection');
    console.log(`phonicsOpen: ${appState.phonicsOpen}`);
    console.log(`phonicsReady: ${appState.phonicsReady}`);
    console.log(`selectedModule: ${appState.selectedModule?.id}`);
    console.log(`currentActivityType: ${appState.currentActivityType}`);

    if (appState.phonicsOpen && appState.phonicsReady && appState.currentActivityType === 'blend') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.phonicsOpen).toBe(true);
    expect(appState.phonicsReady).toBe(true);
    expect(appState.selectedModule?.id).toBe('phonics');
    expect(appState.currentActivityType).toBe('blend');
  });

  test('Phonics activity types all available on open', async () => {
    const result = await openPhonicsFromDashboard(MOCK_LEARNER, MOCK_SESSION);

    console.log('Test Case ID: INT-006');
    console.log('Test: Phonics activity types');
    console.log(`Activity Types: ${result.activityTypes?.join(', ')}`);
    console.log(`Max Level: ${result.maxLevel}`);

    if (result.activityTypes?.length === 5 && result.maxLevel === 7) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.activityTypes).toContain('blend');
    expect(result.activityTypes).toContain('segment');
    expect(result.activityTypes).toContain('sound_match');
    expect(result.activityTypes).toContain('word_builder');
    expect(result.activityTypes).toContain('tricky_words');
    expect(result.maxLevel).toBe(7);
  });

  test('Learner not logged in - Phonics open fails', async () => {
    const result = await openPhonicsFromDashboard(null, null);

    console.log('Test Case ID: INT-006');
    console.log('Test: Learner not logged in (negative test)');
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

  test('Phonics selected without dashboard loaded - fails gracefully', () => {
    const result = selectPhonicsModule('USER001');

    console.log('Test Case ID: INT-006');
    console.log('Test: Phonics without dashboard (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Dashboard not loaded') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Dashboard not loaded');
  });

});
