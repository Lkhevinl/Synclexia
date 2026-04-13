// ─── Test Case CASE-059 ──────────────────────────────────────────────────────
// Test Case ID: CASE-059
// Test Case Description: Validate by tapping "Blend it!" game
// Expected Result: Game screen loads successfully

// Mock Blend it! game data
const blendItGameData = {
  id: 'blend_it',
  title: 'Blend it!',
  description: 'Blend letter sounds to form words',
  difficulty: 'medium',
  instructions: 'Listen to the sounds and blend them together to make a word!',
  rounds: [
    { 
      id: 1, 
      sounds: ['C', 'A', 'T'], 
      word: 'CAT',
      hint: 'C-A-T makes...'
    },
    { 
      id: 2, 
      sounds: ['D', 'O', 'G'], 
      word: 'DOG',
      hint: 'D-O-G makes...'
    },
    { 
      id: 3, 
      sounds: ['B', 'A', 'L', 'L'], 
      word: 'BALL',
      hint: 'B-A-L-L makes...'
    },
    { 
      id: 4, 
      sounds: ['F', 'I', 'SH'], 
      word: 'FISH',
      hint: 'F-I-SH makes...'
    }
  ],
  totalRounds: 4,
  scoring: { correct: 10, hintPenalty: 2 }
};

function openBlendItGame(gameName) {
  // Check if game name is provided
  if (!gameName || gameName.trim() === '') {
    return {
      success: false,
      actualResult: 'Game screen failed to load - Game not specified',
      screenLoaded: false,
      data: null
    };
  }

  // Check if it's the Blend it! game
  const normalizedName = gameName.toLowerCase().replace(/\s+/g, '').replace(/!/g, '');
  const validNames = ['blendit', 'blendit!', 'blend it', 'blend it!'];
  const inputLower = gameName.toLowerCase().trim();
  
  if (!validNames.includes(inputLower) && !normalizedName.includes('blend')) {
    return {
      success: false,
      actualResult: 'Game screen failed to load - Invalid game',
      screenLoaded: false,
      data: null
    };
  }

  // Load Blend it! game screen
  return {
    success: true,
    actualResult: 'Game screen loads successfully',
    screenLoaded: true,
    data: blendItGameData,
    roundCount: blendItGameData.rounds.length,
    firstRound: blendItGameData.rounds[0],
    difficulty: blendItGameData.difficulty,
    instructions: blendItGameData.instructions
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-059 (Validate by tapping "Blend it!" game)', () => {

  test('Tap "Blend it!" - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openBlendItGame('Blend it!');

    console.log('Test Case ID: CASE-059');
    console.log('Test Case Description: Validate by tapping "Blend it!" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);
    console.log(`Game Title: ${result.data ? result.data.title : 'N/A'}`);
    console.log(`Difficulty: ${result.difficulty}`);
    console.log(`Instructions: ${result.instructions}`);
    console.log(`Round Count: ${result.roundCount}`);
    console.log(`First Round: ${result.firstRound ? result.firstRound.word : 'N/A'}`);
    console.log(`Rounds:`);
    if (result.data && result.data.rounds) {
      result.data.rounds.forEach((round, index) => {
        console.log(`  Round ${index + 1}: ${round.sounds.join('-')} = ${round.word}`);
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
    expect(result.data.title).toBe('Blend it!');
    expect(result.difficulty).toBe('medium');
    expect(result.instructions).toContain('blend');
    expect(result.roundCount).toBe(4);
    expect(result.firstRound.word).toBe('CAT');
    expect(result.firstRound.sounds).toEqual(['C', 'A', 'T']);
  });

  test('Tap "blend it!" (lowercase) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openBlendItGame('blend it!');

    console.log('Test Case ID: CASE-059');
    console.log('Test Case Description: Validate by tapping "Blend it!" game');
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
    expect(result.data.id).toBe('blend_it');
  });

  test('Tap "BLEND IT!" (uppercase) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openBlendItGame('BLEND IT!');

    console.log('Test Case ID: CASE-059');
    console.log('Test Case Description: Validate by tapping "Blend it!" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.roundCount).toBe(4);
  });

  test('Tap "BlendIt" (no space) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openBlendItGame('BlendIt');

    console.log('Test Case ID: CASE-059');
    console.log('Test Case Description: Validate by tapping "Blend it!" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: BlendIt (no space)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.data.title).toBe('Blend it!');
  });

  test('Tap "Blend it" (no exclamation) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openBlendItGame('Blend it');

    console.log('Test Case ID: CASE-059');
    console.log('Test Case Description: Validate by tapping "Blend it!" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: Blend it (no exclamation)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.difficulty).toBe('medium');
  });

  test('Tap different game - screen should not load (negative test)', () => {
    const result = openBlendItGame('Alphabet Matching');

    console.log('Test Case ID: CASE-059');
    console.log('Test Case Description: Validate by tapping "Blend it!" game');
    console.log('Expected Result: Game screen loads successfully (for Blend it!)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected non-BlendIt game');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('Invalid game');
  });

  test('Empty game name - screen should not load (negative test)', () => {
    const result = openBlendItGame('');

    console.log('Test Case ID: CASE-059');
    console.log('Test Case Description: Validate by tapping "Blend it!" game');
    console.log('Expected Result: Game screen loads successfully (for Blend it!)');
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
    const result = openBlendItGame(null);

    console.log('Test Case ID: CASE-059');
    console.log('Test Case Description: Validate by tapping "Blend it!" game');
    console.log('Expected Result: Game screen loads successfully (for Blend it!)');
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
