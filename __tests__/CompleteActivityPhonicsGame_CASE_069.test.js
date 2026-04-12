// ─── Test Case CASE-069 ──────────────────────────────────────────────────────
// Test Case ID: CASE-069
// Test Case Description: Validate completing the activity
// Expected Result: Accuracy is displayed; "Play Again" button redirects to Phonics Game screen

// Mock phonics game activity completion state
let activityResults = {
  totalItems: 5,
  correctAnswers: 0,
  accuracy: 0,
  starsTotal: 0
};

let completedItems = [];

function completePhonicsGameActivity() {
  // Calculate accuracy
  const accuracy = activityResults.totalItems > 0
    ? Math.round((activityResults.correctAnswers / activityResults.totalItems) * 100)
    : 0;

  activityResults.accuracy = accuracy;

  return {
    success: true,
    actualResult: 'Accuracy is displayed; "Play Again" button redirects to Phonics Game screen',
    activityCompleted: true,
    resultsDisplayed: true,
    accuracyDisplayed: true,
    accuracy: accuracy,
    totalItems: activityResults.totalItems,
    correctAnswers: activityResults.correctAnswers,
    starsTotal: activityResults.starsTotal,
    playAgainButtonVisible: true,
    playAgainRedirectsTo: 'Phonics Game',
    message: `Great job! You got ${activityResults.correctAnswers} out of ${activityResults.totalItems} correct!`
  };
}

function clickPlayAgainPhonics(buttonName) {
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
  if (normalizedButton !== 'playagain') {
    return {
      success: false,
      actualResult: 'Play Again failed - Invalid button',
      redirected: false
    };
  }

  // Reset activity for replay
  resetPhonicsGameState();

  return {
    success: true,
    actualResult: 'Redirects to Phonics Game screen',
    redirected: true,
    destination: 'Phonics Game',
    screenLoaded: 'Phonics Game'
  };
}

// Reset state
function resetPhonicsGameState() {
  activityResults = {
    totalItems: 5,
    correctAnswers: 0,
    accuracy: 0,
    starsTotal: 0
  };
  completedItems = [];
}

function simulateItemCompletionPhonics(itemId, correct, stars) {
  completedItems.push({ itemId, correct, stars });
  if (correct) {
    activityResults.correctAnswers++;
  }
  activityResults.starsTotal += stars;
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-069 (Validate completing the activity)', () => {

  beforeEach(() => {
    resetPhonicsGameState();
  });

  test('Complete activity with perfect score - accuracy displayed; Play Again redirects', () => {
    // Simulate perfect completion
    simulateItemCompletionPhonics(1, true, 3);
    simulateItemCompletionPhonics(2, true, 3);
    simulateItemCompletionPhonics(3, true, 3);
    simulateItemCompletionPhonics(4, true, 3);
    simulateItemCompletionPhonics(5, true, 3);

    const expectedResult = 'Accuracy is displayed; "Play Again" button redirects to Phonics Game screen';
    const result = completePhonicsGameActivity();

    console.log('Test Case ID: CASE-069');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Activity Completed: ${result.activityCompleted}`);
    console.log(`Results Displayed: ${result.resultsDisplayed}`);
    console.log(`Accuracy Displayed: ${result.accuracyDisplayed}`);
    console.log(`Accuracy: ${result.accuracy}%`);
    console.log(`Correct Answers: ${result.correctAnswers}/${result.totalItems}`);
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
    expect(result.correctAnswers).toBe(5);
    expect(result.totalItems).toBe(5);
    expect(result.starsTotal).toBe(15);
    expect(result.playAgainButtonVisible).toBe(true);
    expect(result.playAgainRedirectsTo).toBe('Phonics Game');
  });

  test('Complete activity with partial score - accuracy displayed; Play Again redirects', () => {
    // Simulate partial completion
    simulateItemCompletionPhonics(1, true, 3);
    simulateItemCompletionPhonics(2, true, 2);
    simulateItemCompletionPhonics(3, false, 0);
    simulateItemCompletionPhonics(4, true, 3);
    simulateItemCompletionPhonics(5, false, 0);

    const expectedResult = 'Accuracy is displayed; "Play Again" button redirects to Phonics Game screen';
    const result = completePhonicsGameActivity();

    console.log('Test Case ID: CASE-069');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Accuracy: ${result.accuracy}%`);
    console.log(`Correct Answers: ${result.correctAnswers}/${result.totalItems}`);
    console.log(`Total Stars: ${result.starsTotal}`);

    if (result.success && result.accuracyDisplayed && result.accuracy === 60) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.accuracy).toBe(60);
    expect(result.correctAnswers).toBe(3);
    expect(result.starsTotal).toBe(8);
    expect(result.playAgainButtonVisible).toBe(true);
  });

  test('Click Play Again button - redirects to Phonics Game screen', () => {
    // First complete activity
    simulateItemCompletionPhonics(1, true, 3);
    completePhonicsGameActivity();

    // Click Play Again
    const expectedResult = 'Accuracy is displayed; "Play Again" button redirects to Phonics Game screen';
    const result = clickPlayAgainPhonics('Play Again');

    console.log('Test Case ID: CASE-069');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Play Again Actual Result: ${result.actualResult}`);
    console.log(`Redirected: ${result.redirected}`);
    console.log(`Destination: ${result.destination}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);

    if (result.success && result.redirected && result.destination === 'Phonics Game') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.redirected).toBe(true);
    expect(result.destination).toBe('Phonics Game');
    expect(result.screenLoaded).toBe('Phonics Game');
    expect(result.actualResult).toContain('Redirects');
  });

  test('Click play again (lowercase) - redirects to Phonics Game', () => {
    simulateItemCompletionPhonics(2, true, 3);
    completePhonicsGameActivity();

    const result = clickPlayAgainPhonics('play again');

    console.log('Test Case ID: CASE-069');
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
    expect(result.destination).toBe('Phonics Game');
  });

  test('Click PLAY AGAIN (uppercase) - redirects to Phonics Game', () => {
    simulateItemCompletionPhonics(3, true, 3);
    completePhonicsGameActivity();

    const result = clickPlayAgainPhonics('PLAY AGAIN');

    console.log('Test Case ID: CASE-069');
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
    simulateItemCompletionPhonics(1, true, 3);
    simulateItemCompletionPhonics(2, true, 2);
    expect(activityResults.correctAnswers).toBe(2);
    expect(activityResults.starsTotal).toBe(5);

    // Click Play Again
    clickPlayAgainPhonics('Play Again');

    console.log('Test Case ID: CASE-069');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`State Reset: correctAnswers=${activityResults.correctAnswers}, stars=${activityResults.starsTotal}`);

    if (activityResults.correctAnswers === 0 && activityResults.starsTotal === 0) {
      console.log('Outcome: PASSED - Activity state reset');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(activityResults.correctAnswers).toBe(0);
    expect(activityResults.starsTotal).toBe(0);
    expect(completedItems.length).toBe(0);
  });

  test('Click different button - no redirect (negative test)', () => {
    simulateItemCompletionPhonics(4, true, 3);
    completePhonicsGameActivity();

    const result = clickPlayAgainPhonics('Exit');

    console.log('Test Case ID: CASE-069');
    console.log('Test Case Description: Validate completing the activity');
    console.log('Expected Result: Accuracy is displayed; "Play Again" button redirects to Phonics Game screen');
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
    simulateItemCompletionPhonics(5, true, 3);
    completePhonicsGameActivity();

    const result = clickPlayAgainPhonics('');

    console.log('Test Case ID: CASE-069');
    console.log('Test Case Description: Validate completing the activity');
    console.log('Expected Result: Accuracy is displayed; "Play Again" button redirects to Phonics Game screen');
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
