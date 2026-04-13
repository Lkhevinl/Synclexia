// ─── Test Case CASE-044 ──────────────────────────────────────────────────────
// Test Case ID: CASE-044
// Test Case Description: Validate by tapping "Spelling Game"
// Expected Result: Spelling Game screen loads successfully

// Mock spelling game data
const spellingGameData = {
  id: 'spelling',
  title: 'Spelling Game',
  description: 'Practice spelling words letter by letter',
  levels: [
    { id: 1, word: 'CAT', difficulty: 'easy', hint: 'A furry pet that meows' },
    { id: 2, word: 'DOG', difficulty: 'easy', hint: 'A loyal pet that barks' },
    { id: 3, word: 'BALL', difficulty: 'easy', hint: 'Round toy you can throw' },
    { id: 4, word: 'TREE', difficulty: 'medium', hint: 'Has leaves and branches' },
    { id: 5, word: 'HOUSE', difficulty: 'medium', hint: 'Where people live' }
  ],
  gameMode: 'letter_by_letter',
  scoring: { correct: 10, hintPenalty: 2 },
  totalLevels: 5
};

function loadSpellingGame(activityName) {
  // Check if activity name is provided
  if (!activityName || activityName.trim() === '') {
    return {
      success: false,
      actualResult: 'Spelling Game screen failed to load - Activity not specified',
      screenLoaded: false,
      data: null
    };
  }

  // Check if it's the spelling game activity
  const normalizedName = activityName.toLowerCase().replace(/\s+/g, '');
  if (normalizedName !== 'spellinggame' && normalizedName !== 'spelling') {
    return {
      success: false,
      actualResult: 'Spelling Game screen failed to load - Invalid activity',
      screenLoaded: false,
      data: null
    };
  }

  // Load spelling game screen
  return {
    success: true,
    actualResult: 'Spelling Game screen loads successfully',
    screenLoaded: true,
    data: spellingGameData,
    levelCount: spellingGameData.levels.length,
    firstLevel: spellingGameData.levels[0],
    gameMode: spellingGameData.gameMode
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-044 (Validate by tapping "Spelling Game")', () => {

  test('Tap Spelling Game - spelling game screen loads successfully', () => {
    const expectedResult = 'Spelling Game screen loads successfully';
    const result = loadSpellingGame('Spelling Game');

    console.log('Test Case ID: CASE-044');
    console.log('Test Case Description: Validate by tapping "Spelling Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);
    console.log(`Game Title: ${result.data ? result.data.title : 'N/A'}`);
    console.log(`Level Count: ${result.levelCount}`);
    console.log(`First Level Word: ${result.firstLevel ? result.firstLevel.word : 'N/A'}`);
    console.log(`Game Mode: ${result.gameMode}`);

    if (result.success && result.screenLoaded && result.data) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.actualResult).toContain('loads successfully');
    expect(result.data.title).toBe('Spelling Game');
    expect(result.levelCount).toBe(5);
    expect(result.gameMode).toBe('letter_by_letter');
  });

  test('Tap spelling game (lowercase) - screen loads successfully', () => {
    const expectedResult = 'Spelling Game screen loads successfully';
    const result = loadSpellingGame('spelling game');

    console.log('Test Case ID: CASE-044');
    console.log('Test Case Description: Validate by tapping "Spelling Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.data.id).toBe('spelling');
  });

  test('Tap SPELLING GAME (uppercase) - screen loads successfully', () => {
    const expectedResult = 'Spelling Game screen loads successfully';
    const result = loadSpellingGame('SPELLING GAME');

    console.log('Test Case ID: CASE-044');
    console.log('Test Case Description: Validate by tapping "Spelling Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.levelCount).toBe(5);
  });

  test('Tap SpellingGame (no space) - screen loads successfully', () => {
    const expectedResult = 'Spelling Game screen loads successfully';
    const result = loadSpellingGame('SpellingGame');

    console.log('Test Case ID: CASE-044');
    console.log('Test Case Description: Validate by tapping "Spelling Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: SpellingGame (no space)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.data.title).toBe('Spelling Game');
  });

  test('Tap different activity - screen should not load (negative test)', () => {
    const result = loadSpellingGame('Math Game');

    console.log('Test Case ID: CASE-044');
    console.log('Test Case Description: Validate by tapping "Spelling Game"');
    console.log('Expected Result: Spelling Game screen loads successfully (for Spelling Game)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected non-Spelling Game activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('failed');
  });

  test('Empty activity name - screen should not load (negative test)', () => {
    const result = loadSpellingGame('');

    console.log('Test Case ID: CASE-044');
    console.log('Test Case Description: Validate by tapping "Spelling Game"');
    console.log('Expected Result: Spelling Game screen loads successfully (for Spelling Game)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected empty activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('not specified');
  });

  test('Null activity name - screen should not load (negative test)', () => {
    const result = loadSpellingGame(null);

    console.log('Test Case ID: CASE-044');
    console.log('Test Case Description: Validate by tapping "Spelling Game"');
    console.log('Expected Result: Spelling Game screen loads successfully (for Spelling Game)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected null activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
  });

});
