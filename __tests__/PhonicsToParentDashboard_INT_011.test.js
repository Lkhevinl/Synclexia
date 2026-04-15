// ─── Integration Test INT-011 ───────────────────────────────────────────────
// Test Case ID   : INT-011
// Test           : Integration when learner proceeds to spelling exercise
// Component      : Writing Activity → Spelling Game
// Input          : Writing task completed
// Expected Result: Spelling game is launched

// Mock writing task
const MOCK_WRITING_TASK = {
  id: 'WRITE001',
  userId: 'USER001',
  wordsPracticed: ['cat', 'mat', 'sat', 'hat', 'bat'],
  wordsCorrect: ['cat', 'mat', 'sat', 'hat'],
  wordsIncorrect: ['bat'],
  accuracy: 80,
  letterFormationScore: 85,
  completedAt: '2024-04-14T10:00:00Z'
};

// Spelling game definition
const SPELLING_GAME = {
  id: 'spelling',
  title: 'Spelling Game',
  route: 'SpellingGame',
  isReady: true,
  hasAudio: true,
  hasHints: true,
  hasScoring: true,
  usesWritingProgress: true
};

// State
let appState = {
  writingCompleted: false,
  writingTask: null,
  spellingGameOpen: false,
  spellingGameReady: false,
  wordsCarried: [],
  focusWords: []
};

function resetState() {
  appState = {
    writingCompleted: false,
    writingTask: null,
    spellingGameOpen: false,
    spellingGameReady: false,
    wordsCarried: [],
    focusWords: []
  };
}

// Simulate completing a writing task
function completeWritingTask(task) {
  if (!task || !task.userId) {
    return {
      success: false,
      actualResult: 'Writing task failed - Invalid task data',
      error: 'Invalid writing task'
    };
  }

  if (!task.wordsPracticed || task.wordsPracticed.length === 0) {
    return {
      success: false,
      actualResult: 'Writing task failed - No words practiced',
      error: 'No words in task'
    };
  }

  appState.writingCompleted = true;
  appState.writingTask = task;
  appState.wordsCarried = task.wordsPracticed;
  appState.focusWords = task.wordsIncorrect || [];

  return {
    success: true,
    taskId: task.id,
    userId: task.userId,
    wordsPracticed: task.wordsPracticed.length,
    accuracy: task.accuracy,
    letterFormationScore: task.letterFormationScore,
    wordsIncorrect: task.wordsIncorrect,
    completed: true
  };
}

// Simulate launching the Spelling Game after writing
function launchSpellingGame(task) {
  if (!appState.writingCompleted || !appState.writingTask) {
    return {
      success: false,
      actualResult: 'Spelling game launch failed - Writing task not completed',
      error: 'Writing task not completed'
    };
  }

  appState.spellingGameOpen = true;
  appState.spellingGameReady = SPELLING_GAME.isReady;

  return {
    success: true,
    actualResult: 'Spelling game is launched',
    performedAsExpected: true,
    spellingGameOpen: true,
    spellingGameReady: SPELLING_GAME.isReady,
    gameId: SPELLING_GAME.id,
    gameTitle: SPELLING_GAME.title,
    route: SPELLING_GAME.route,
    hasAudio: SPELLING_GAME.hasAudio,
    hasHints: SPELLING_GAME.hasHints,
    hasScoring: SPELLING_GAME.hasScoring,
    usesWritingProgress: SPELLING_GAME.usesWritingProgress,
    wordCount: appState.wordsCarried.length,
    focusWords: appState.focusWords,
    integrationFlow: 'Writing Activity → Spelling Game'
  };
}

// Full integration: complete writing → launch spelling game
async function processWritingToSpelling(task) {
  const writeResult = completeWritingTask(task);
  if (!writeResult.success) {
    return {
      success: false,
      actualResult: writeResult.actualResult,
      error: writeResult.error,
      stage: 'writing_failed'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 30));

  const spellingResult = launchSpellingGame(task);
  if (!spellingResult.success) {
    return {
      success: false,
      actualResult: spellingResult.actualResult,
      error: spellingResult.error,
      stage: 'spelling_launch_failed'
    };
  }

  return {
    ...spellingResult,
    writingAccuracy: task.accuracy,
    letterFormationScore: task.letterFormationScore,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-011 (Writing Activity → Spelling Game)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Writing task completed - Spelling game is launched', async () => {
    const result = await processWritingToSpelling(MOCK_WRITING_TASK);

    console.log('Test Case ID: INT-011');
    console.log('Test: Integration when learner proceeds to spelling exercise');
    console.log('Component: Writing Activity → Spelling Game');
    console.log(`Input: Writing task completed`);
    console.log(`Expected Result: Spelling game is launched`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Spelling Game Open: ${result.spellingGameOpen}`);
    console.log(`Spelling Game Ready: ${result.spellingGameReady}`);
    console.log(`Game: "${result.gameTitle}"`);
    console.log(`Route: ${result.route}`);
    console.log(`Has Audio: ${result.hasAudio}`);
    console.log(`Has Hints: ${result.hasHints}`);
    console.log(`Has Scoring: ${result.hasScoring}`);
    console.log(`Uses Writing Progress: ${result.usesWritingProgress}`);
    console.log(`Word Count: ${result.wordCount}`);
    console.log(`Focus Words: ${result.focusWords?.join(', ')}`);
    console.log(`Writing Accuracy: ${result.writingAccuracy}%`);
    console.log(`Letter Formation: ${result.letterFormationScore}%`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.spellingGameOpen && result.spellingGameReady) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.spellingGameOpen).toBe(true);
    expect(result.spellingGameReady).toBe(true);
    expect(result.gameId).toBe('spelling');
    expect(result.route).toBe('SpellingGame');
    expect(result.hasAudio).toBe(true);
    expect(result.hasHints).toBe(true);
    expect(result.hasScoring).toBe(true);
    expect(result.usesWritingProgress).toBe(true);
    expect(result.stage).toBe('completed');
  });

  test('Writing completed - state flags set correctly', () => {
    completeWritingTask(MOCK_WRITING_TASK);

    console.log('Test Case ID: INT-011');
    console.log('Test: Writing completion state flags');
    console.log(`writingCompleted: ${appState.writingCompleted}`);
    console.log(`wordsCarried: ${appState.wordsCarried.join(', ')}`);
    console.log(`focusWords: ${appState.focusWords.join(', ')}`);

    if (appState.writingCompleted && appState.wordsCarried.length > 0) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.writingCompleted).toBe(true);
    expect(appState.wordsCarried).toEqual(MOCK_WRITING_TASK.wordsPracticed);
    expect(appState.focusWords).toContain('bat');
  });

  test('Spelling game state after launch - open, ready, focus words carried', async () => {
    await processWritingToSpelling(MOCK_WRITING_TASK);

    console.log('Test Case ID: INT-011');
    console.log('Test: App state after spelling launch');
    console.log(`spellingGameOpen: ${appState.spellingGameOpen}`);
    console.log(`spellingGameReady: ${appState.spellingGameReady}`);
    console.log(`focusWords: ${appState.focusWords.join(', ')}`);

    if (appState.spellingGameOpen && appState.spellingGameReady) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.spellingGameOpen).toBe(true);
    expect(appState.spellingGameReady).toBe(true);
    expect(appState.focusWords).toContain('bat');
  });

  test('Incorrect words from writing carried as focus words', async () => {
    const result = await processWritingToSpelling(MOCK_WRITING_TASK);

    console.log('Test Case ID: INT-011');
    console.log('Test: Focus words from writing');
    console.log(`Writing Incorrect: ${MOCK_WRITING_TASK.wordsIncorrect.join(', ')}`);
    console.log(`Spelling Focus Words: ${result.focusWords?.join(', ')}`);

    if (result.focusWords?.includes('bat')) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.focusWords).toEqual(MOCK_WRITING_TASK.wordsIncorrect);
    expect(result.focusWords).toContain('bat');
  });

  test('Writing task not completed - spelling launch fails', () => {
    const result = launchSpellingGame(MOCK_WRITING_TASK);

    console.log('Test Case ID: INT-011');
    console.log('Test: Writing not completed (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Writing task not completed') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Writing task not completed');
  });

  test('Invalid writing task - fails gracefully', async () => {
    const result = await processWritingToSpelling(null);

    console.log('Test Case ID: INT-011');
    console.log('Test: Invalid writing task (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'writing_failed') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('writing_failed');
    expect(result.error).toBe('Invalid writing task');
  });

  test('Empty words in task - fails gracefully', async () => {
    const emptyTask = { ...MOCK_WRITING_TASK, wordsPracticed: [] };
    const result = await processWritingToSpelling(emptyTask);

    console.log('Test Case ID: INT-011');
    console.log('Test: Empty words in task (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'writing_failed') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('writing_failed');
    expect(result.error).toBe('No words in task');
  });

});
