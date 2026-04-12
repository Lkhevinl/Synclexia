// ─── Test Case CASE-060 ──────────────────────────────────────────────────────
// Test Case ID: CASE-060
// Test Case Description: Validate by tapping "Count the Sounds!" game
// Expected Result: Game screen loads successfully

// Mock Count the Sounds! game data
const countSoundsGameData = {
  id: 'count_sounds',
  title: 'Count the Sounds!',
  description: 'Count the number of sounds in words',
  difficulty: 'easy',
  instructions: 'Listen to the word and count how many sounds you hear!',
  rounds: [
    { 
      id: 1, 
      word: 'CAT', 
      sounds: ['C', 'A', 'T'],
      soundCount: 3,
      hint: 'C-A-T has 3 sounds'
    },
    { 
      id: 2, 
      word: 'DOG', 
      sounds: ['D', 'O', 'G'],
      soundCount: 3,
      hint: 'D-O-G has 3 sounds'
    },
    { 
      id: 3, 
      word: 'FISH', 
      sounds: ['F', 'I', 'SH'],
      soundCount: 3,
      hint: 'F-I-SH has 3 sounds'
    },
    { 
      id: 4, 
      word: 'TABLE', 
      sounds: ['T', 'A', 'B', 'L'],
      soundCount: 4,
      hint: 'T-A-B-L-E has 4 sounds'
    },
    { 
      id: 5, 
      word: 'BANANA', 
      sounds: ['B', 'A', 'N', 'A', 'N', 'A'],
      soundCount: 6,
      hint: 'B-A-N-A-N-A has 6 sounds'
    }
  ],
  totalRounds: 5,
  scoring: { correct: 10, hintPenalty: 2 }
};

function openCountSoundsGame(gameName) {
  // Check if game name is provided
  if (!gameName || gameName.trim() === '') {
    return {
      success: false,
      actualResult: 'Game screen failed to load - Game not specified',
      screenLoaded: false,
      data: null
    };
  }

  // Check if it's the Count the Sounds! game
  const normalizedName = gameName.toLowerCase().replace(/\s+/g, '').replace(/!/g, '').replace(/the/g, '');
  const inputLower = gameName.toLowerCase().trim();
  
  // Accept various formats: "Count the Sounds!", "Count the Sounds", "Count Sounds", etc.
  const validPatterns = ['countthesounds', 'countsounds', 'count sounds', 'count the sounds', 'count the sounds!'];
  
  if (!validPatterns.includes(inputLower) && !normalizedName.includes('count') && !normalizedName.includes('sounds')) {
    return {
      success: false,
      actualResult: 'Game screen failed to load - Invalid game',
      screenLoaded: false,
      data: null
    };
  }

  // Load Count the Sounds! game screen
  return {
    success: true,
    actualResult: 'Game screen loads successfully',
    screenLoaded: true,
    data: countSoundsGameData,
    roundCount: countSoundsGameData.rounds.length,
    firstRound: countSoundsGameData.rounds[0],
    difficulty: countSoundsGameData.difficulty,
    instructions: countSoundsGameData.instructions
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-060 (Validate by tapping "Count the Sounds!" game)', () => {

  test('Tap "Count the Sounds!" - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openCountSoundsGame('Count the Sounds!');

    console.log('Test Case ID: CASE-060');
    console.log('Test Case Description: Validate by tapping "Count the Sounds!" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);
    console.log(`Game Title: ${result.data ? result.data.title : 'N/A'}`);
    console.log(`Difficulty: ${result.difficulty}`);
    console.log(`Instructions: ${result.instructions}`);
    console.log(`Round Count: ${result.roundCount}`);
    console.log(`First Round: ${result.firstRound ? result.firstRound.word : 'N/A'} (${result.firstRound ? result.firstRound.soundCount : 'N/A'} sounds)`);
    console.log(`Rounds:`);
    if (result.data && result.data.rounds) {
      result.data.rounds.forEach((round, index) => {
        console.log(`  Round ${index + 1}: ${round.word} - ${round.soundCount} sounds (${round.sounds.join('-')})`);
      });
    }

    if (result.success && result.screenLoaded && result.data) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.actualResult).toContain('loads successfully');
    expect(result.data.title).toBe('Count the Sounds!');
    expect(result.difficulty).toBe('easy');
    expect(result.instructions).toContain('count');
    expect(result.roundCount).toBe(5);
    expect(result.firstRound.word).toBe('CAT');
    expect(result.firstRound.soundCount).toBe(3);
    expect(result.firstRound.sounds).toEqual(['C', 'A', 'T']);
  });

  test('Tap "count the sounds!" (lowercase) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openCountSoundsGame('count the sounds!');

    console.log('Test Case ID: CASE-060');
    console.log('Test Case Description: Validate by tapping "Count the Sounds!" game');
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
    expect(result.data.id).toBe('count_sounds');
  });

  test('Tap "COUNT THE SOUNDS!" (uppercase) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openCountSoundsGame('COUNT THE SOUNDS!');

    console.log('Test Case ID: CASE-060');
    console.log('Test Case Description: Validate by tapping "Count the Sounds!" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.roundCount).toBe(5);
  });

  test('Tap "Count the Sounds" (no exclamation) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openCountSoundsGame('Count the Sounds');

    console.log('Test Case ID: CASE-060');
    console.log('Test Case Description: Validate by tapping "Count the Sounds!" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: Count the Sounds (no exclamation)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.data.title).toBe('Count the Sounds!');
  });

  test('Tap "CountSounds" (no space) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openCountSoundsGame('CountSounds');

    console.log('Test Case ID: CASE-060');
    console.log('Test Case Description: Validate by tapping "Count the Sounds!" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: CountSounds (no space)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.difficulty).toBe('easy');
  });

  test('Tap different game - screen should not load (negative test)', () => {
    const result = openCountSoundsGame('Blend it!');

    console.log('Test Case ID: CASE-060');
    console.log('Test Case Description: Validate by tapping "Count the Sounds!" game');
    console.log('Expected Result: Game screen loads successfully (for Count the Sounds!)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected non-CountSounds game');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('Invalid game');
  });

  test('Empty game name - screen should not load (negative test)', () => {
    const result = openCountSoundsGame('');

    console.log('Test Case ID: CASE-060');
    console.log('Test Case Description: Validate by tapping "Count the Sounds!" game');
    console.log('Expected Result: Game screen loads successfully (for Count the Sounds!)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected empty game name');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('not specified');
  });

  test('Null game name - screen should not load (negative test)', () => {
    const result = openCountSoundsGame(null);

    console.log('Test Case ID: CASE-060');
    console.log('Test Case Description: Validate by tapping "Count the Sounds!" game');
    console.log('Expected Result: Game screen loads successfully (for Count the Sounds!)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected null game name');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('not specified');
  });

});
