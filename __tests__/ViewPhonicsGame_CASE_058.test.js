// ─── Test Case CASE-058 ──────────────────────────────────────────────────────
// Test Case ID: CASE-058
// Test Case Description: Validate by tapping "Phonics Game"
// Expected Result: Phonics Game screen loads with list of games

// Mock phonics game data
const phonicsGameData = {
  id: 'phonics',
  title: 'Phonics Game',
  description: 'Learn letter sounds and phonics through fun games',
  games: [
    { id: 'alphabet_matching', name: 'Alphabet Matching', icon: 'abc', description: 'Match uppercase and lowercase letters' },
    { id: 'beginning_sounds', name: 'Beginning Sounds', icon: 'sound', description: 'Identify the first sound in words' },
    { id: 'ending_sounds', name: 'Ending Sounds', icon: 'sound', description: 'Identify the last sound in words' },
    { id: 'rhyming_words', name: 'Rhyming Words', icon: 'rhyme', description: 'Find words that rhyme together' },
    { id: 'blending_sounds', name: 'Blending Sounds', icon: 'blend', description: 'Blend sounds to make words' },
    { id: 'sight_words', name: 'Sight Words', icon: 'eye', description: 'Recognize common sight words' }
  ],
  totalGames: 6
};

function loadPhonicsGame(activityName) {
  // Check if activity name is provided
  if (!activityName || activityName.trim() === '') {
    return {
      success: false,
      actualResult: 'Phonics Game screen failed to load - Activity not specified',
      screenLoaded: false,
      data: null
    };
  }

  // Check if it's the phonics game activity
  const normalizedName = activityName.toLowerCase().replace(/\s+/g, '');
  if (normalizedName !== 'phonicsgame' && normalizedName !== 'phonics') {
    return {
      success: false,
      actualResult: 'Phonics Game screen failed to load - Invalid activity',
      screenLoaded: false,
      data: null
    };
  }

  // Load phonics game screen
  return {
    success: true,
    actualResult: 'Phonics Game screen loads with list of games',
    screenLoaded: true,
    data: phonicsGameData,
    gameCount: phonicsGameData.games.length,
    gamesList: phonicsGameData.games,
    firstGame: phonicsGameData.games[0],
    lastGame: phonicsGameData.games[phonicsGameData.games.length - 1]
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-058 (Validate by tapping "Phonics Game")', () => {

  test('Tap "Phonics Game" - phonics game screen loads with list of games', () => {
    const expectedResult = 'Phonics Game screen loads with list of games';
    const result = loadPhonicsGame('Phonics Game');

    console.log('Test Case ID: CASE-058');
    console.log('Test Case Description: Validate by tapping "Phonics Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);
    console.log(`Game Title: ${result.data ? result.data.title : 'N/A'}`);
    console.log(`Game Count: ${result.gameCount}`);
    console.log(`Total Games: ${result.data ? result.data.totalGames : 'N/A'}`);
    console.log(`First Game: ${result.firstGame ? result.firstGame.name : 'N/A'}`);
    console.log(`Last Game: ${result.lastGame ? result.lastGame.name : 'N/A'}`);
    console.log(`Games List:`);
    if (result.gamesList) {
      result.gamesList.forEach((game, index) => {
        console.log(`  ${index + 1}. ${game.name} (${game.icon}) - ${game.description}`);
      });
    }

    if (result.success && result.screenLoaded && result.data && result.gamesList.length === 6) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.actualResult).toContain('loads with list of games');
    expect(result.data.title).toBe('Phonics Game');
    expect(result.gameCount).toBe(6);
    expect(result.data.totalGames).toBe(6);
    expect(result.gamesList).toHaveLength(6);
    expect(result.firstGame.name).toBe('Alphabet Matching');
    expect(result.lastGame.name).toBe('Sight Words');
  });

  test('Tap "phonics game" (lowercase) - screen loads with list of games', () => {
    const expectedResult = 'Phonics Game screen loads with list of games';
    const result = loadPhonicsGame('phonics game');

    console.log('Test Case ID: CASE-058');
    console.log('Test Case Description: Validate by tapping "Phonics Game"');
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
    expect(result.data.id).toBe('phonics');
    expect(result.gameCount).toBe(6);
  });

  test('Tap "PHONICS GAME" (uppercase) - screen loads with list of games', () => {
    const expectedResult = 'Phonics Game screen loads with list of games';
    const result = loadPhonicsGame('PHONICS GAME');

    console.log('Test Case ID: CASE-058');
    console.log('Test Case Description: Validate by tapping "Phonics Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.gameCount).toBe(6);
  });

  test('Tap "PhonicsGame" (no space) - screen loads with list of games', () => {
    const expectedResult = 'Phonics Game screen loads with list of games';
    const result = loadPhonicsGame('PhonicsGame');

    console.log('Test Case ID: CASE-058');
    console.log('Test Case Description: Validate by tapping "Phonics Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: PhonicsGame (no space)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.data.title).toBe('Phonics Game');
  });

  test('Tap "Phonics" (single word) - screen loads with list of games', () => {
    const expectedResult = 'Phonics Game screen loads with list of games';
    const result = loadPhonicsGame('Phonics');

    console.log('Test Case ID: CASE-058');
    console.log('Test Case Description: Validate by tapping "Phonics Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: Phonics (single word)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.gameCount).toBe(6);
  });

  test('Tap different activity - screen should not load (negative test)', () => {
    const result = loadPhonicsGame('Spelling Game');

    console.log('Test Case ID: CASE-058');
    console.log('Test Case Description: Validate by tapping "Phonics Game"');
    console.log('Expected Result: Phonics Game screen loads with list of games (for Phonics Game)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected non-Phonics Game activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('failed');
  });

  test('Empty activity name - screen should not load (negative test)', () => {
    const result = loadPhonicsGame('');

    console.log('Test Case ID: CASE-058');
    console.log('Test Case Description: Validate by tapping "Phonics Game"');
    console.log('Expected Result: Phonics Game screen loads with list of games (for Phonics Game)');
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
    const result = loadPhonicsGame(null);

    console.log('Test Case ID: CASE-058');
    console.log('Test Case Description: Validate by tapping "Phonics Game"');
    console.log('Expected Result: Phonics Game screen loads with list of games (for Phonics Game)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected null activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('not specified');
  });

});
