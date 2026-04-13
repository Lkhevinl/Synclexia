// ─── Test Case CASE-053 ──────────────────────────────────────────────────────
// Test Case ID: CASE-053
// Test Case Description: Validate by tapping "Pick-a-Sound" game
// Expected Result: Game screen loads successfully

// Mock Pick-a-Sound game data
const pickASoundGameData = {
  id: 'pick_a_sound',
  title: 'Pick-a-Sound',
  description: 'Listen to sounds and pick the matching picture',
  difficulty: 'medium',
  instructions: 'Listen carefully, then tap the picture that matches the sound!',
  rounds: [
    { 
      id: 1, 
      sound: 'dog_bark.mp3', 
      correctAnswer: 'dog',
      options: [
        { id: 'dog', image: 'dog.png', label: 'Dog' },
        { id: 'cat', image: 'cat.png', label: 'Cat' },
        { id: 'bird', image: 'bird.png', label: 'Bird' }
      ]
    },
    { 
      id: 2, 
      sound: 'car_horn.mp3', 
      correctAnswer: 'car',
      options: [
        { id: 'car', image: 'car.png', label: 'Car' },
        { id: 'train', image: 'train.png', label: 'Train' },
        { id: 'plane', image: 'plane.png', label: 'Plane' }
      ]
    },
    { 
      id: 3, 
      sound: 'phone_ring.mp3', 
      correctAnswer: 'phone',
      options: [
        { id: 'clock', image: 'clock.png', label: 'Clock' },
        { id: 'phone', image: 'phone.png', label: 'Phone' },
        { id: 'doorbell', image: 'doorbell.png', label: 'Doorbell' }
      ]
    }
  ],
  totalRounds: 3,
  scoring: { correct: 10, wrong: 0 }
};

function openPickASoundGame(gameName) {
  // Check if game name is provided
  if (!gameName || gameName.trim() === '') {
    return {
      success: false,
      actualResult: 'Game screen failed to load - Game not specified',
      screenLoaded: false,
      data: null
    };
  }

  // Check if it's the Pick-a-Sound game
  const normalizedName = gameName.toLowerCase().replace(/\s+/g, '').replace(/-/g, '').replace(/a/g, '');
  const validNames = ['pickasound', 'pick-sound', 'pickasound', 'picksound'];
  const inputNormalized = gameName.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
  
  if (!validNames.includes(inputNormalized) && !inputNormalized.includes('pick') && !inputNormalized.includes('sound')) {
    return {
      success: false,
      actualResult: 'Game screen failed to load - Invalid game',
      screenLoaded: false,
      data: null
    };
  }

  // More lenient check for pick-a-sound variations
  const lowerInput = gameName.toLowerCase();
  if (!lowerInput.includes('pick') || !lowerInput.includes('sound')) {
    return {
      success: false,
      actualResult: 'Game screen failed to load - Invalid game',
      screenLoaded: false,
      data: null
    };
  }

  // Load Pick-a-Sound game screen
  return {
    success: true,
    actualResult: 'Game screen loads successfully',
    screenLoaded: true,
    data: pickASoundGameData,
    roundCount: pickASoundGameData.rounds.length,
    firstRound: pickASoundGameData.rounds[0],
    difficulty: pickASoundGameData.difficulty,
    instructions: pickASoundGameData.instructions
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-053 (Validate by tapping "Pick-a-Sound" game)', () => {

  test('Tap "Pick-a-Sound" - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openPickASoundGame('Pick-a-Sound');

    console.log('Test Case ID: CASE-053');
    console.log('Test Case Description: Validate by tapping "Pick-a-Sound" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);
    console.log(`Game Title: ${result.data ? result.data.title : 'N/A'}`);
    console.log(`Difficulty: ${result.difficulty}`);
    console.log(`Instructions: ${result.instructions}`);
    console.log(`Round Count: ${result.roundCount}`);
    console.log(`First Round Options: ${result.firstRound ? result.firstRound.options.length : 'N/A'} choices`);
    console.log(`Rounds:`);
    if (result.data && result.data.rounds) {
      result.data.rounds.forEach((round, index) => {
        console.log(`  Round ${index + 1}: Sound=${round.sound}, Correct=${round.correctAnswer}, Options=${round.options.map(o => o.label).join(', ')}`);
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
    expect(result.data.title).toBe('Pick-a-Sound');
    expect(result.difficulty).toBe('medium');
    expect(result.instructions).toContain('Listen carefully');
    expect(result.roundCount).toBe(3);
    expect(result.firstRound.options).toHaveLength(3);
  });

  test('Tap "pick-a-sound" (lowercase) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openPickASoundGame('pick-a-sound');

    console.log('Test Case ID: CASE-053');
    console.log('Test Case Description: Validate by tapping "Pick-a-Sound" game');
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
    expect(result.data.id).toBe('pick_a_sound');
  });

  test('Tap "PICK-A-SOUND" (uppercase) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openPickASoundGame('PICK-A-SOUND');

    console.log('Test Case ID: CASE-053');
    console.log('Test Case Description: Validate by tapping "Pick-a-Sound" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.roundCount).toBe(3);
  });

  test('Tap "Pick a Sound" (with spaces) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openPickASoundGame('Pick a Sound');

    console.log('Test Case ID: CASE-053');
    console.log('Test Case Description: Validate by tapping "Pick-a-Sound" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: Pick a Sound (with spaces)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.data.title).toBe('Pick-a-Sound');
  });

  test('Tap "PickASound" (no hyphens) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openPickASoundGame('PickASound');

    console.log('Test Case ID: CASE-053');
    console.log('Test Case Description: Validate by tapping "Pick-a-Sound" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: PickASound (no hyphens)`);

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
    const result = openPickASoundGame('Animal Sounds');

    console.log('Test Case ID: CASE-053');
    console.log('Test Case Description: Validate by tapping "Pick-a-Sound" game');
    console.log('Expected Result: Game screen loads successfully (for Pick-a-Sound)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected non-Pick-a-Sound game');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('Invalid game');
  });

  test('Empty game name - screen should not load (negative test)', () => {
    const result = openPickASoundGame('');

    console.log('Test Case ID: CASE-053');
    console.log('Test Case Description: Validate by tapping "Pick-a-Sound" game');
    console.log('Expected Result: Game screen loads successfully (for Pick-a-Sound)');
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
    const result = openPickASoundGame(null);

    console.log('Test Case ID: CASE-053');
    console.log('Test Case Description: Validate by tapping "Pick-a-Sound" game');
    console.log('Expected Result: Game screen loads successfully (for Pick-a-Sound)');
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
