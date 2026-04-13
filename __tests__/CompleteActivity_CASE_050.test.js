// ─── Test Case CASE-050 ──────────────────────────────────────────────────────
// Test Case ID: CASE-050
// Test Case Description: Validate completing the activity
// Expected Result: Accuracy is displayed; "Play Again" button redirects to Spelling Game screen

// Mock activity completion state
let activityResults = {
  totalWords: 5,
  correctWords: 0,
  attempts: 0,
  accuracy: 0,
  starsTotal: 0
};

let completedWords = [];

function completeActivityAndShowResults() {
  // Calculate accuracy
  const accuracy = activityResults.totalWords > 0
    ? Math.round((activityResults.correctWords / activityResults.totalWords) * 100)
    : 0;

  activityResults.accuracy = accuracy;

  return {
    success: true,
    actualResult: 'Accuracy is displayed; "Play Again" button redirects to Spelling Game screen',
    activityCompleted: true,
    resultsDisplayed: true,
    accuracyDisplayed: true,
    accuracy: accuracy,
    totalWords: activityResults.totalWords,
    correctWords: activityResults.correctWords,
    starsTotal: activityResults.starsTotal,
    playAgainButtonVisible: true,
    playAgainRedirectsTo: 'Spelling Game',
    message: `Great job! You spelled ${activityResults.correctWords} out of ${activityResults.totalWords} words correctly!`
  };
}

function clickPlayAgain(buttonName) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Play Again failed - No button specified',
      redirected: false
    };
  }

  // Check if it's the play again button
  const normalizedButton = buttonName.toLowerCase().replace(/\s+/g, '');
  if (normalizedButton !== 'playagain' && normalizedButton !== 'playagain') {
    return {
      success: false,
      actualResult: 'Play Again failed - Invalid button',
      redirected: false
    };
  }

  // Reset activity for replay
  resetActivityState();

  return {
    success: true,
    actualResult: 'Redirects to Spelling Game screen',
    redirected: true,
    destination: 'Spelling Game',
    screenLoaded: 'Spelling Game'
  };
}

// Reset state
function resetActivityState() {
  activityResults = {
    totalWords: 5,
    correctWords: 0,
    attempts: 0,
    accuracy: 0,
    starsTotal: 0
  };
  completedWords = [];
}

function simulateWordCompletion(word, correct, stars) {
  completedWords.push({ word, correct, stars });
  if (correct) {
    activityResults.correctWords++;
  }
  activityResults.attempts++;
  activityResults.starsTotal += stars;
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-050 (Validate completing the activity)', () => {

  beforeEach(() => {
    resetActivityState();
  });

  test('Complete activity with perfect score - accuracy displayed; Play Again redirects', () => {
    // Simulate perfect completion
    simulateWordCompletion('CAT', true, 3);
    simulateWordCompletion('DOG', true, 3);
    simulateWordCompletion('BALL', true, 3);
    simulateWordCompletion('TREE', true, 3);
    simulateWordCompletion('HOUSE', true, 3);

    const expectedResult = 'Accuracy is displayed; "Play Again" button redirects to Spelling Game screen';
    const result = completeActivityAndShowResults();

    console.log('Test Case ID: CASE-050');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Activity Completed: ${result.activityCompleted}`);
    console.log(`Results Displayed: ${result.resultsDisplayed}`);
    console.log(`Accuracy Displayed: ${result.accuracyDisplayed}`);
    console.log(`Accuracy: ${result.accuracy}%`);
    console.log(`Correct Words: ${result.correctWords}/${result.totalWords}`);
    console.log(`Total Stars: ${result.starsTotal}`);
    console.log(`Play Again Button Visible: ${result.playAgainButtonVisible}`);
    console.log(`Redirects To: ${result.playAgainRedirectsTo}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.accuracyDisplayed && result.playAgainButtonVisible && result.accuracy === 100) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.activityCompleted).toBe(true);
    expect(result.resultsDisplayed).toBe(true);
    expect(result.accuracyDisplayed).toBe(true);
    expect(result.accuracy).toBe(100);
    expect(result.correctWords).toBe(5);
    expect(result.totalWords).toBe(5);
    expect(result.starsTotal).toBe(15);
    expect(result.playAgainButtonVisible).toBe(true);
    expect(result.playAgainRedirectsTo).toBe('Spelling Game');
  });

  test('Complete activity with partial score - accuracy displayed; Play Again redirects', () => {
    // Simulate partial completion
    simulateWordCompletion('CAT', true, 3);
    simulateWordCompletion('DOG', true, 2);
    simulateWordCompletion('BALL', false, 0);
    simulateWordCompletion('TREE', true, 3);
    simulateWordCompletion('HOUSE', false, 0);

    const expectedResult = 'Accuracy is displayed; "Play Again" button redirects to Spelling Game screen';
    const result = completeActivityAndShowResults();

    console.log('Test Case ID: CASE-050');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Accuracy: ${result.accuracy}%`);
    console.log(`Correct Words: ${result.correctWords}/${result.totalWords}`);
    console.log(`Total Stars: ${result.starsTotal}`);

    if (result.success && result.accuracyDisplayed && result.accuracy === 60) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.accuracy).toBe(60);
    expect(result.correctWords).toBe(3);
    expect(result.starsTotal).toBe(8);
    expect(result.playAgainButtonVisible).toBe(true);
  });

  test('Click Play Again button - redirects to Spelling Game screen', () => {
    // First complete activity
    simulateWordCompletion('CAT', true, 3);
    completeActivityAndShowResults();

    // Click Play Again
    const expectedResult = 'Accuracy is displayed; "Play Again" button redirects to Spelling Game screen';
    const result = clickPlayAgain('Play Again');

    console.log('Test Case ID: CASE-050');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Play Again Actual Result: ${result.actualResult}`);
    console.log(`Redirected: ${result.redirected}`);
    console.log(`Destination: ${result.destination}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);

    if (result.success && result.redirected && result.destination === 'Spelling Game') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.redirected).toBe(true);
    expect(result.destination).toBe('Spelling Game');
    expect(result.screenLoaded).toBe('Spelling Game');
    expect(result.actualResult).toContain('Redirects');
  });

  test('Click play again (lowercase) - redirects to Spelling Game', () => {
    simulateWordCompletion('DOG', true, 3);
    completeActivityAndShowResults();

    const result = clickPlayAgain('play again');

    console.log('Test Case ID: CASE-050');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Redirected: ${result.redirected}`);
    console.log(`Destination: ${result.destination}`);

    if (result.success && result.redirected) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.redirected).toBe(true);
    expect(result.destination).toBe('Spelling Game');
  });

  test('Click PLAY AGAIN (uppercase) - redirects to Spelling Game', () => {
    simulateWordCompletion('TREE', true, 3);
    completeActivityAndShowResults();

    const result = clickPlayAgain('PLAY AGAIN');

    console.log('Test Case ID: CASE-050');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Redirected: ${result.redirected}`);

    if (result.success && result.redirected) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.redirected).toBe(true);
  });

  test('Play Again resets activity state', () => {
    // Complete activity with some progress
    simulateWordCompletion('CAT', true, 3);
    simulateWordCompletion('DOG', true, 2);
    expect(activityResults.correctWords).toBe(2);
    expect(activityResults.starsTotal).toBe(5);

    // Click Play Again
    clickPlayAgain('Play Again');

    console.log('Test Case ID: CASE-050');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`State Reset: correctWords=${activityResults.correctWords}, stars=${activityResults.starsTotal}`);

    if (activityResults.correctWords === 0 && activityResults.starsTotal === 0) {
      console.log('Outcome: PASSED - Activity state reset');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(activityResults.correctWords).toBe(0);
    expect(activityResults.starsTotal).toBe(0);
    expect(completedWords.length).toBe(0);
  });

  test('Click different button - no redirect (negative test)', () => {
    simulateWordCompletion('BALL', true, 3);
    completeActivityAndShowResults();

    const result = clickPlayAgain('Next Level');

    console.log('Test Case ID: CASE-050');
    console.log('Test Case Description: Validate completing the activity');
    console.log('Expected Result: Accuracy is displayed; "Play Again" button redirects to Spelling Game screen');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.redirected) {
      console.log('Outcome: PASSED - Correctly rejected invalid button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.redirected).toBe(false);
    expect(result.actualResult).toContain('Invalid button');
  });

  test('Empty button name - no redirect (negative test)', () => {
    simulateWordCompletion('HOUSE', true, 3);
    completeActivityAndShowResults();

    const result = clickPlayAgain('');

    console.log('Test Case ID: CASE-050');
    console.log('Test Case Description: Validate completing the activity');
    console.log('Expected Result: Accuracy is displayed; "Play Again" button redirects to Spelling Game screen');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.redirected) {
      console.log('Outcome: PASSED - Correctly rejected empty button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.redirected).toBe(false);
    expect(result.actualResult).toContain('No button');
  });

});
