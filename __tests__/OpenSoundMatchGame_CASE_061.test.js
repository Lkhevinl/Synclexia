// ─── Test Case CASE-061 ──────────────────────────────────────────────────────
// Test Case ID: CASE-061
// Test Case Description: Validate by tapping "Sound Match!" game
// Expected Result: Game screen loads successfully

// Mock Sound Match! game data
const soundMatchGameData = {
  id: 'sound_match',
  title: 'Sound Match!',
  description: 'Match sounds to the correct pictures',
  difficulty: 'medium',
  instructions: 'Listen to the sound and tap the picture that matches!',
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
      sound: 'cow_moo.mp3', 
      correctAnswer: 'cow',
      options: [
        { id: 'pig', image: 'pig.png', label: 'Pig' },
        { id: 'cow', image: 'cow.png', label: 'Cow' },
        { id: 'sheep', image: 'sheep.png', label: 'Sheep' }
      ]
    },
    { 
      id: 3, 
      sound: 'clock_tick.mp3', 
      correctAnswer: 'clock',
      options: [
        { id: 'clock', image: 'clock.png', label: 'Clock' },
        { id: 'phone', image: 'phone.png', label: 'Phone' },
        { id: 'doorbell', image: 'doorbell.png', label: 'Doorbell' }
      ]
    },
    { 
      id: 4, 
      sound: 'car_engine.mp3', 
      correctAnswer: 'car',
      options: [
        { id: 'bike', image: 'bike.png', label: 'Bike' },
        { id: 'car', image: 'car.png', label: 'Car' },
        { id: 'bus', image: 'bus.png', label: 'Bus' }
      ]
    }
  ],
  totalRounds: 4,
  scoring: { correct: 10, wrong: 0 }
};

function openSoundMatchGame(gameName) {
  // Check if game name is provided
  if (!gameName || gameName.trim() === '') {
    return {
      success: false,
      actualResult: 'Game screen failed to load - Game not specified',
      screenLoaded: false,
      data: null
    };
  }

  // Check if it's the Sound Match! game
  const normalizedName = gameName.toLowerCase().replace(/\s+/g, '').replace(/!/g, '');
  const inputLower = gameName.toLowerCase().trim();
  
  // Accept various formats
  const validPatterns = ['soundmatch', 'soundmatch!', 'sound match', 'sound match!'];
  
  // Must contain both "sound" AND "match" to be valid
  const hasSound = inputLower.includes('sound');
  const hasMatch = inputLower.includes('match');
  
  if (!validPatterns.includes(inputLower) && !(hasSound && hasMatch)) {
    return {
      success: false,
      actualResult: 'Game screen failed to load - Invalid game',
      screenLoaded: false,
      data: null
    };
  }

  // Load Sound Match! game screen
  return {
    success: true,
    actualResult: 'Game screen loads successfully',
    screenLoaded: true,
    data: soundMatchGameData,
    roundCount: soundMatchGameData.rounds.length,
    firstRound: soundMatchGameData.rounds[0],
    difficulty: soundMatchGameData.difficulty,
    instructions: soundMatchGameData.instructions
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-061 (Validate by tapping "Sound Match!" game)', () => {

  test('Tap "Sound Match!" - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openSoundMatchGame('Sound Match!');

    console.log('Test Case ID: CASE-061');
    console.log('Test Case Description: Validate by tapping "Sound Match!" game');
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
        console.log(`  Round ${index + 1}: Sound=${round.sound}, Options=${round.options.map(o => o.label).join(', ')}`);
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
    expect(result.data.title).toBe('Sound Match!');
    expect(result.difficulty).toBe('medium');
    expect(result.instructions).toContain('sound');
    expect(result.roundCount).toBe(4);
    expect(result.firstRound.options).toHaveLength(3);
  });

  test('Tap "sound match!" (lowercase) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openSoundMatchGame('sound match!');

    console.log('Test Case ID: CASE-061');
    console.log('Test Case Description: Validate by tapping "Sound Match!" game');
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
    expect(result.data.id).toBe('sound_match');
  });

  test('Tap "SOUND MATCH!" (uppercase) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openSoundMatchGame('SOUND MATCH!');

    console.log('Test Case ID: CASE-061');
    console.log('Test Case Description: Validate by tapping "Sound Match!" game');
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

  test('Tap "Sound Match" (no exclamation) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openSoundMatchGame('Sound Match');

    console.log('Test Case ID: CASE-061');
    console.log('Test Case Description: Validate by tapping "Sound Match!" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: Sound Match (no exclamation)`);

    if (result.success && result.screenLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenLoaded).toBe(true);
    expect(result.data.title).toBe('Sound Match!');
  });

  test('Tap "SoundMatch" (no space) - game screen loads successfully', () => {
    const expectedResult = 'Game screen loads successfully';
    const result = openSoundMatchGame('SoundMatch');

    console.log('Test Case ID: CASE-061');
    console.log('Test Case Description: Validate by tapping "Sound Match!" game');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input: SoundMatch (no space)`);

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
    const result = openSoundMatchGame('Count the Sounds!');

    console.log('Test Case ID: CASE-061');
    console.log('Test Case Description: Validate by tapping "Sound Match!" game');
    console.log('Expected Result: Game screen loads successfully (for Sound Match!)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenLoaded) {
      console.log('Outcome: PASSED - Correctly rejected non-SoundMatch game');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenLoaded).toBe(false);
    expect(result.actualResult).toContain('Invalid game');
  });

  test('Empty game name - screen should not load (negative test)', () => {
    const result = openSoundMatchGame('');

    console.log('Test Case ID: CASE-061');
    console.log('Test Case Description: Validate by tapping "Sound Match!" game');
    console.log('Expected Result: Game screen loads successfully (for Sound Match!)');
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
    const result = openSoundMatchGame(null);

    console.log('Test Case ID: CASE-061');
    console.log('Test Case Description: Validate by tapping "Sound Match!" game');
    console.log('Expected Result: Game screen loads successfully (for Sound Match!)');
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
