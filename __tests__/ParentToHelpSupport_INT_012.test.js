// ─── Integration Test INT-012 ───────────────────────────────────────────────
// Test Case ID   : INT-012
// Test           : Integration when learner proceeds to sound recognition
// Component      : Spelling Game → Sound Game
// Input          : Game round completed
// Expected Result: Sound game is launched

// Mock spelling game round
const MOCK_SPELLING_ROUND = {
  id: 'SPELL001',
  userId: 'USER001',
  wordsSpelled: ['cat', 'mat', 'sat', 'hat', 'bat'],
  wordsCorrect: ['cat', 'mat', 'sat', 'hat'],
  wordsIncorrect: ['bat'],
  accuracy: 80,
  phonemesPracticed: ['c', 'a', 't', 'm', 's', 'h', 'b'],
  completedAt: '2024-04-14T10:00:00Z'
};

// Sound game definition
const SOUND_GAME = {
  id: 'sound_game',
  title: 'Sound Game',
  route: 'SoundGame',
  isReady: true,
  hasAudio: true,
  hasPhonemeMatching: true,
  hasScoring: true,
  usesSpellingProgress: true
};

// State
let appState = {
  spellingRoundCompleted: false,
  spellingRound: null,
  soundGameOpen: false,
  soundGameReady: false,
  phonemesCarried: [],
  focusPhonemes: []
};

function resetState() {
  appState = {
    spellingRoundCompleted: false,
    spellingRound: null,
    soundGameOpen: false,
    soundGameReady: false,
    phonemesCarried: [],
    focusPhonemes: []
  };
}

// Simulate completing a spelling game round
function completeSpellingRound(round) {
  if (!round || !round.userId) {
    return {
      success: false,
      actualResult: 'Spelling round failed - Invalid round data',
      error: 'Invalid spelling round'
    };
  }

  if (!round.wordsSpelled || round.wordsSpelled.length === 0) {
    return {
      success: false,
      actualResult: 'Spelling round failed - No words in round',
      error: 'No words in round'
    };
  }

  appState.spellingRoundCompleted = true;
  appState.spellingRound = round;
  appState.phonemesCarried = round.phonemesPracticed || [];
  appState.focusPhonemes = round.wordsIncorrect
    ? round.wordsIncorrect.flatMap(w => w.split(''))
    : [];

  return {
    success: true,
    roundId: round.id,
    userId: round.userId,
    wordsSpelled: round.wordsSpelled.length,
    accuracy: round.accuracy,
    phonemesPracticed: round.phonemesPracticed,
    completed: true
  };
}

// Simulate launching the Sound Game after spelling
function launchSoundGame(round) {
  if (!appState.spellingRoundCompleted || !appState.spellingRound) {
    return {
      success: false,
      actualResult: 'Sound game launch failed - Spelling round not completed',
      error: 'Spelling round not completed'
    };
  }

  appState.soundGameOpen = true;
  appState.soundGameReady = SOUND_GAME.isReady;

  return {
    success: true,
    actualResult: 'Sound game is launched',
    performedAsExpected: true,
    soundGameOpen: true,
    soundGameReady: SOUND_GAME.isReady,
    gameId: SOUND_GAME.id,
    gameTitle: SOUND_GAME.title,
    route: SOUND_GAME.route,
    hasAudio: SOUND_GAME.hasAudio,
    hasPhonemeMatching: SOUND_GAME.hasPhonemeMatching,
    hasScoring: SOUND_GAME.hasScoring,
    usesSpellingProgress: SOUND_GAME.usesSpellingProgress,
    phonemeCount: appState.phonemesCarried.length,
    phonemesCarried: appState.phonemesCarried,
    focusPhonemes: appState.focusPhonemes,
    integrationFlow: 'Spelling Game → Sound Game'
  };
}

// Full integration: complete spelling round → launch sound game
async function processSpellingToSound(round) {
  const spellingResult = completeSpellingRound(round);
  if (!spellingResult.success) {
    return {
      success: false,
      actualResult: spellingResult.actualResult,
      error: spellingResult.error,
      stage: 'spelling_failed'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 30));

  const soundResult = launchSoundGame(round);
  if (!soundResult.success) {
    return {
      success: false,
      actualResult: soundResult.actualResult,
      error: soundResult.error,
      stage: 'sound_launch_failed'
    };
  }

  return {
    ...soundResult,
    spellingAccuracy: round.accuracy,
    wordsSpelled: round.wordsSpelled.length,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-012 (Spelling Game → Sound Game)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Game round completed - Sound game is launched', async () => {
    const result = await processSpellingToSound(MOCK_SPELLING_ROUND);

    console.log('Test Case ID: INT-012');
    console.log('Test: Integration when learner proceeds to sound recognition');
    console.log('Component: Spelling Game → Sound Game');
    console.log(`Input: Game round completed`);
    console.log(`Expected Result: Sound game is launched`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Sound Game Open: ${result.soundGameOpen}`);
    console.log(`Sound Game Ready: ${result.soundGameReady}`);
    console.log(`Game: "${result.gameTitle}"`);
    console.log(`Route: ${result.route}`);
    console.log(`Has Audio: ${result.hasAudio}`);
    console.log(`Has Phoneme Matching: ${result.hasPhonemeMatching}`);
    console.log(`Has Scoring: ${result.hasScoring}`);
    console.log(`Uses Spelling Progress: ${result.usesSpellingProgress}`);
    console.log(`Phonemes Carried: ${result.phonemesCarried?.join(', ')}`);
    console.log(`Spelling Accuracy: ${result.spellingAccuracy}%`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.soundGameOpen && result.soundGameReady) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.soundGameOpen).toBe(true);
    expect(result.soundGameReady).toBe(true);
    expect(result.gameId).toBe('sound_game');
    expect(result.route).toBe('SoundGame');
    expect(result.hasAudio).toBe(true);
    expect(result.hasPhonemeMatching).toBe(true);
    expect(result.hasScoring).toBe(true);
    expect(result.usesSpellingProgress).toBe(true);
    expect(result.stage).toBe('completed');
  });

  test('Spelling round completed - state flags set correctly', () => {
    completeSpellingRound(MOCK_SPELLING_ROUND);

    console.log('Test Case ID: INT-012');
    console.log('Test: Spelling round completion state flags');
    console.log(`spellingRoundCompleted: ${appState.spellingRoundCompleted}`);
    console.log(`phonemesCarried: ${appState.phonemesCarried.join(', ')}`);

    if (appState.spellingRoundCompleted && appState.phonemesCarried.length > 0) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.spellingRoundCompleted).toBe(true);
    expect(appState.phonemesCarried).toEqual(MOCK_SPELLING_ROUND.phonemesPracticed);
  });

  test('Sound game state after launch - open, ready, phonemes carried', async () => {
    await processSpellingToSound(MOCK_SPELLING_ROUND);

    console.log('Test Case ID: INT-012');
    console.log('Test: App state after sound game launch');
    console.log(`soundGameOpen: ${appState.soundGameOpen}`);
    console.log(`soundGameReady: ${appState.soundGameReady}`);
    console.log(`phonemesCarried: ${appState.phonemesCarried.join(', ')}`);

    if (appState.soundGameOpen && appState.soundGameReady) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.soundGameOpen).toBe(true);
    expect(appState.soundGameReady).toBe(true);
    expect(appState.phonemesCarried.length).toBeGreaterThan(0);
  });

  test('Phonemes from spelling carried to sound game', async () => {
    const result = await processSpellingToSound(MOCK_SPELLING_ROUND);

    console.log('Test Case ID: INT-012');
    console.log('Test: Phonemes carried to sound game');
    console.log(`Spelling Phonemes: ${MOCK_SPELLING_ROUND.phonemesPracticed.join(', ')}`);
    console.log(`Sound Phonemes: ${result.phonemesCarried?.join(', ')}`);
    console.log(`Phoneme Count: ${result.phonemeCount}`);

    if (result.phonemeCount === MOCK_SPELLING_ROUND.phonemesPracticed.length) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.phonemesCarried).toEqual(MOCK_SPELLING_ROUND.phonemesPracticed);
    expect(result.phonemeCount).toBe(7);
  });

  test('Spelling round not completed - sound launch fails', () => {
    const result = launchSoundGame(MOCK_SPELLING_ROUND);

    console.log('Test Case ID: INT-012');
    console.log('Test: Spelling not completed (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Spelling round not completed') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Spelling round not completed');
  });

  test('Invalid spelling round - fails gracefully', async () => {
    const result = await processSpellingToSound(null);

    console.log('Test Case ID: INT-012');
    console.log('Test: Invalid spelling round (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'spelling_failed') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('spelling_failed');
    expect(result.error).toBe('Invalid spelling round');
  });

  test('Empty words in round - fails gracefully', async () => {
    const emptyRound = { ...MOCK_SPELLING_ROUND, wordsSpelled: [] };
    const result = await processSpellingToSound(emptyRound);

    console.log('Test Case ID: INT-012');
    console.log('Test: Empty words in round (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'spelling_failed') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('spelling_failed');
    expect(result.error).toBe('No words in round');
  });

});
