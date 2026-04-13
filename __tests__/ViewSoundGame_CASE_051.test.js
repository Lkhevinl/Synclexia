// ─── Test Case CASE-051 ──────────────────────────────────────────────────────
// Test Case ID: CASE-051
// Test Case Description: Validate by tapping "Sound Game"
// Expected Result: Sound Game screen loads with list of games

// Mock sound game data
const soundGameData = {
  id: 'sound',
  title: 'Sound Game',
  description: 'Learn sounds through interactive games',
  games: [
    { id: 'animal_sounds', name: 'Animal Sounds', icon: 'animal', description: 'Match animals with their sounds' },
    { id: 'letter_sounds', name: 'Letter Sounds', icon: 'letter', description: 'Learn phonetic letter sounds' },
    { id: 'nature_sounds', name: 'Nature Sounds', icon: 'nature', description: 'Identify sounds from nature' },
    { id: 'musical_instruments', name: 'Musical Instruments', icon: 'music', description: 'Recognize instrument sounds' },
    { id: 'everyday_sounds', name: 'Everyday Sounds', icon: 'home', description: 'Sounds from daily life' }
  ],
  totalGames: 5
};

function loadSoundGame(activityName) {
  // Check if activity name is provided
  if (!activityName || activityName.trim() === '') {
    return {
      success: false,
      actualResult: 'Sound Game screen failed to load - Activity not specified',
      screenLoaded: false,
      data: null
    };
  }

  // Check if it's the sound game activity
  const normalizedName = activityName.toLowerCase().replace(/\s+/g, '');
  if (normalizedName !== 'soundgame' && normalizedName !== 'sound') {
    return {
      success: false,
      actualResult: 'Sound Game screen failed to load - Invalid activity',
      screenLoaded: false,
      data: null
    };
  }

  // Load sound game screen
  return {
    success: true,
    actualResult: 'Sound Game screen loads with list of games',
    screenLoaded: true,
    data: soundGameData,
    gameCount: soundGameData.games.length,
    gamesList: soundGameData.games,
    firstGame: soundGameData.games[0],
    lastGame: soundGameData.games[soundGameData.games.length - 1]
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-051 (Validate by tapping "Sound Game")', () => {

  test('Tap Sound Game - sound game screen loads with list of games', () => {
    const expectedResult = 'Sound Game screen loads with list of games';
    const result = loadSoundGame('Sound Game');

    console.log('Test Case ID: CASE-051');
    console.log('Test Case Description: Validate by tapping "Sound Game"');
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

    if (result.success && result.screenLoaded && result.data && result.gamesList.length === 5) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.actualResult).toContain('loads with list of games');
    expect(result.data.title).toBe('Sound Game');
    expect(result.gameCount).toBe(5);
    expect(result.data.totalGames).toBe(5);
    expect(result.gamesList).toHaveLength(5);
    expect(result.firstGame.name).toBe('Animal Sounds');
    expect(result.lastGame.name).toBe('Everyday Sounds');
  });

  test('Tap sound game (lowercase) - screen loads with list of games', () => {
    const expectedResult = 'Sound Game screen loads with list of games';
    const result = loadSoundGame('sound game');

    console.log('Test Case ID: CASE-051');
    console.log('Test Case Description: Validate by tapping "Sound Game"');
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
    expect(result.data.id).toBe('sound');
    expect(result.gameCount).toBe(5);
  });

  test('Tap SOUND GAME (uppercase) - screen loads with list of games', () => {
    const expectedResult = 'Sound Game screen loads with list of games';
    const result = loadSoundGame('SOUND GAME');

    console.log('Test Case ID: CASE-051');
    console.log('Test Case Description: Validate by tapping "Sound Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.gameCount).toBe(5);
  });

  test('Tap SoundGame (no space) - screen loads with list of games', () => {
    const expectedResult = 'Sound Game screen loads with list of games';
    const result = loadSoundGame('SoundGame');

    console.log('Test Case ID: CASE-051');
    console.log('Test Case Description: Validate by tapping "Sound Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: SoundGame (no space)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.data.title).toBe('Sound Game');
    expect(result.gamesList[0].name).toBe('Animal Sounds');
    expect(result.gamesList[1].name).toBe('Letter Sounds');
  });

  test('Tap Sound (single word) - screen loads with list of games', () => {
    const expectedResult = 'Sound Game screen loads with list of games';
    const result = loadSoundGame('Sound');

    console.log('Test Case ID: CASE-051');
    console.log('Test Case Description: Validate by tapping "Sound Game"');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: Sound (single word)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.gameCount).toBe(5);
  });

  test('Tap different activity - screen should not load (negative test)', () => {
    const result = loadSoundGame('Spelling Game');

    console.log('Test Case ID: CASE-051');
    console.log('Test Case Description: Validate by tapping "Sound Game"');
    console.log('Expected Result: Sound Game screen loads with list of games (for Sound Game)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected non-Sound Game activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('failed');
  });

  test('Empty activity name - screen should not load (negative test)', () => {
    const result = loadSoundGame('');

    console.log('Test Case ID: CASE-051');
    console.log('Test Case Description: Validate by tapping "Sound Game"');
    console.log('Expected Result: Sound Game screen loads with list of games (for Sound Game)');
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
    const result = loadSoundGame(null);

    console.log('Test Case ID: CASE-051');
    console.log('Test Case Description: Validate by tapping "Sound Game"');
    console.log('Expected Result: Sound Game screen loads with list of games (for Sound Game)');
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
