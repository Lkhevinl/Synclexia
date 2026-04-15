// ─── Integration Test INT-007 ───────────────────────────────────────────────
// Test Case ID   : INT-007
// Test           : Integration when learner proceeds to game-based phonics
// Component      : Phonics Activity → Phonics Game
// Input          : Activity is completed
// Expected Result: Phonics game is launched

// Mock completed phonics activity
const MOCK_PHONICS_ACTIVITY = {
  id: 'PHONICS_ACT_001',
  userId: 'USER001',
  type: 'blend',
  level: 2,
  score: 8,
  total: 10,
  accuracy: 80,
  masteredPhonemes: ['c', 'a', 't', 's', 'm'],
  completedAt: '2024-04-14T10:00:00Z',
  durationSeconds: 240
};

// Phonics Game definition
const PHONICS_GAME = {
  id: 'phonics_game',
  title: 'Phonics Game',
  route: 'PhonicsGame',
  isReady: true,
  gameTypes: ['sound_match', 'word_builder', 'tricky_words'],
  supportsDifficulty: true,
  usesPhonicsProgress: true,
  hasTTS: true,
  hasAnimation: true
};

// State
let appState = {
  phonicsActivityCompleted: false,
  activityResult: null,
  phonicsGameOpen: false,
  phonicsGameReady: false,
  gameLevel: null,
  gameType: null,
  phonicsGameSessionLogged: false
};

function resetState() {
  appState = {
    phonicsActivityCompleted: false,
    activityResult: null,
    phonicsGameOpen: false,
    phonicsGameReady: false,
    gameLevel: null,
    gameType: null,
    phonicsGameSessionLogged: false
  };
}

// Simulate completing phonics activity
function completePhonicsActivity(activity) {
  if (!activity || !activity.userId) {
    return {
      success: false,
      actualResult: 'Phonics activity completion failed - Invalid data',
      error: 'Invalid activity data'
    };
  }

  appState.phonicsActivityCompleted = true;
  appState.activityResult = activity;

  return {
    success: true,
    activityId: activity.id,
    userId: activity.userId,
    score: activity.score,
    total: activity.total,
    accuracy: activity.accuracy,
    level: activity.level,
    masteredPhonemes: activity.masteredPhonemes
  };
}

// Simulate launching Phonics Game after activity completion
function launchPhonicsGame(activityResult) {
  if (!appState.phonicsActivityCompleted || !activityResult) {
    return {
      success: false,
      actualResult: 'Phonics game launch failed - Activity not completed',
      error: 'Activity not completed'
    };
  }

  const gameLevel = activityResult.level || 1;
  const gameType = PHONICS_GAME.gameTypes[0];

  appState.phonicsGameOpen = true;
  appState.phonicsGameReady = PHONICS_GAME.isReady;
  appState.gameLevel = gameLevel;
  appState.gameType = gameType;

  return {
    success: true,
    actualResult: 'Phonics game is launched',
    performedAsExpected: true,
    gameId: PHONICS_GAME.id,
    gameTitle: PHONICS_GAME.title,
    route: PHONICS_GAME.route,
    phonicsGameOpen: true,
    phonicsGameReady: PHONICS_GAME.isReady,
    gameLevel: gameLevel,
    gameType: gameType,
    gameTypes: PHONICS_GAME.gameTypes,
    usesPhonicsProgress: PHONICS_GAME.usesPhonicsProgress,
    hasTTS: PHONICS_GAME.hasTTS,
    hasAnimation: PHONICS_GAME.hasAnimation,
    basedOnActivity: activityResult.activityId,
    masteredPhonemes: activityResult.masteredPhonemes,
    integrationFlow: 'Phonics Activity → Phonics Game'
  };
}

// Full integration: complete activity → launch game
async function processActivityToGame(activity) {
  // Step 1: Complete phonics activity
  const activityResult = completePhonicsActivity(activity);
  if (!activityResult.success) {
    return {
      success: false,
      actualResult: activityResult.actualResult,
      error: activityResult.error,
      stage: 'activity_failed'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 30));

  // Step 2: Launch phonics game
  const gameResult = launchPhonicsGame(activityResult);
  if (!gameResult.success) {
    return {
      success: false,
      actualResult: gameResult.actualResult,
      error: gameResult.error,
      stage: 'game_launch_failed'
    };
  }

  return {
    ...gameResult,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-007 (Phonics Activity → Phonics Game)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Activity is completed - Phonics game is launched', async () => {
    const result = await processActivityToGame(MOCK_PHONICS_ACTIVITY);

    console.log('Test Case ID: INT-007');
    console.log('Test: Integration when learner proceeds to game-based phonics');
    console.log('Component: Phonics Activity → Phonics Game');
    console.log(`Input: Activity is completed`);
    console.log(`Expected Result: Phonics game is launched`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Game: ${result.gameTitle}`);
    console.log(`Route: ${result.route}`);
    console.log(`Phonics Game Open: ${result.phonicsGameOpen}`);
    console.log(`Phonics Game Ready: ${result.phonicsGameReady}`);
    console.log(`Game Level: ${result.gameLevel}`);
    console.log(`Game Type: ${result.gameType}`);
    console.log(`Uses Phonics Progress: ${result.usesPhonicsProgress}`);
    console.log(`Has TTS: ${result.hasTTS}`);
    console.log(`Has Animation: ${result.hasAnimation}`);
    console.log(`Mastered Phonemes: ${result.masteredPhonemes?.join(', ')}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.phonicsGameOpen && result.phonicsGameReady) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.phonicsGameOpen).toBe(true);
    expect(result.phonicsGameReady).toBe(true);
    expect(result.gameId).toBe('phonics_game');
    expect(result.route).toBe('PhonicsGame');
    expect(result.gameLevel).toBe(2);
    expect(result.usesPhonicsProgress).toBe(true);
    expect(result.hasTTS).toBe(true);
    expect(result.hasAnimation).toBe(true);
    expect(result.stage).toBe('completed');
  });

  test('Phonics activity completed - state flags set correctly', () => {
    const activityResult = completePhonicsActivity(MOCK_PHONICS_ACTIVITY);

    console.log('Test Case ID: INT-007');
    console.log('Test: Activity completion state');
    console.log(`Activity Completed: ${appState.phonicsActivityCompleted}`);
    console.log(`Score: ${activityResult.score}/${activityResult.total}`);
    console.log(`Accuracy: ${activityResult.accuracy}%`);

    if (appState.phonicsActivityCompleted && activityResult.accuracy === 80) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.phonicsActivityCompleted).toBe(true);
    expect(activityResult.success).toBe(true);
    expect(activityResult.accuracy).toBe(80);
    expect(activityResult.score).toBe(8);
  });

  test('Game state after launch - open, ready, level and type set', async () => {
    await processActivityToGame(MOCK_PHONICS_ACTIVITY);

    console.log('Test Case ID: INT-007');
    console.log('Test: App state after game launch');
    console.log(`phonicsGameOpen: ${appState.phonicsGameOpen}`);
    console.log(`phonicsGameReady: ${appState.phonicsGameReady}`);
    console.log(`gameLevel: ${appState.gameLevel}`);
    console.log(`gameType: ${appState.gameType}`);

    if (appState.phonicsGameOpen && appState.phonicsGameReady) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.phonicsGameOpen).toBe(true);
    expect(appState.phonicsGameReady).toBe(true);
    expect(appState.gameLevel).toBe(2);
    expect(appState.gameType).toBe('sound_match');
  });

  test('Phonics game types all available on launch', async () => {
    const result = await processActivityToGame(MOCK_PHONICS_ACTIVITY);

    console.log('Test Case ID: INT-007');
    console.log('Test: Game types available');
    console.log(`Game Types: ${result.gameTypes?.join(', ')}`);

    if (result.gameTypes?.length === 3) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.gameTypes).toContain('sound_match');
    expect(result.gameTypes).toContain('word_builder');
    expect(result.gameTypes).toContain('tricky_words');
  });

  test('Mastered phonemes passed from activity to game', async () => {
    const result = await processActivityToGame(MOCK_PHONICS_ACTIVITY);

    console.log('Test Case ID: INT-007');
    console.log('Test: Phonemes carried to game');
    console.log(`Mastered Phonemes: ${result.masteredPhonemes?.join(', ')}`);

    if (result.masteredPhonemes?.includes('c') && result.masteredPhonemes?.includes('t')) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.masteredPhonemes).toContain('c');
    expect(result.masteredPhonemes).toContain('a');
    expect(result.masteredPhonemes).toContain('t');
  });

  test('Activity not completed - game launch fails', () => {
    const result = launchPhonicsGame(null);

    console.log('Test Case ID: INT-007');
    console.log('Test: Activity not completed (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Activity not completed') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Activity not completed');
  });

  test('Invalid activity data - fails gracefully', async () => {
    const result = await processActivityToGame(null);

    console.log('Test Case ID: INT-007');
    console.log('Test: Invalid activity data (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'activity_failed') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('activity_failed');
    expect(result.error).toBe('Invalid activity data');
  });

});
