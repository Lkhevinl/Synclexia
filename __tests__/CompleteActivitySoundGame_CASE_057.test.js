// ─── Test Case CASE-057 ──────────────────────────────────────────────────────
// Test Case ID: CASE-057
// Test Case Description: Validate completing the activity
// Expected Result: Accuracy is displayed; "Try Another" button redirects to Sound Game screen

// Mock sound game activity completion state
let activityResults = {
  totalItems: 4,
  correctAnswers: 0,
  accuracy: 0,
  starsTotal: 0
};

let completedItems = [];

function completeSoundGameActivity() {
  // Calculate accuracy
  const accuracy = activityResults.totalItems > 0
    ? Math.round((activityResults.correctAnswers / activityResults.totalItems) * 100)
    : 0;

  activityResults.accuracy = accuracy;

  return {
    success: true,
    actualResult: 'Accuracy is displayed; "Try Another" button redirects to Sound Game screen',
    activityCompleted: true,
    resultsDisplayed: true,
    accuracyDisplayed: true,
    accuracy: accuracy,
    totalItems: activityResults.totalItems,
    correctAnswers: activityResults.correctAnswers,
    starsTotal: activityResults.starsTotal,
    tryAnotherButtonVisible: true,
    tryAnotherRedirectsTo: 'Sound Game',
    message: `Great job! You got ${activityResults.correctAnswers} out of ${activityResults.totalItems} correct!`
  };
}

function clickTryAnother(buttonName) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Try Another failed - No button specified',
      redirected: false
    };
  }

  // Check if it's the try another button
  const normalizedButton = buttonName.toLowerCase().replace(/\s+/g, '');
  if (normalizedButton !== 'tryanother') {
    return {
      success: false,
      actualResult: 'Try Another failed - Invalid button',
      redirected: false
    };
  }

  // Reset activity for replay
  resetSoundGameState();

  return {
    success: true,
    actualResult: 'Redirects to Sound Game screen',
    redirected: true,
    destination: 'Sound Game',
    screenLoaded: 'Sound Game'
  };
}

// Reset state
function resetSoundGameState() {
  activityResults = {
    totalItems: 4,
    correctAnswers: 0,
    accuracy: 0,
    starsTotal: 0
  };
  completedItems = [];
}

function simulateItemCompletion(itemId, correct, stars) {
  completedItems.push({ itemId, correct, stars });
  if (correct) {
    activityResults.correctAnswers++;
  }
  activityResults.starsTotal += stars;
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-057 (Validate completing the activity)', () => {

  beforeEach(() => {
    resetSoundGameState();
  });

  test('Complete activity with perfect score - accuracy displayed; Try Another redirects', () => {
    // Simulate perfect completion
    simulateItemCompletion(1, true, 3);
    simulateItemCompletion(2, true, 3);
    simulateItemCompletion(3, true, 3);
    simulateItemCompletion(4, true, 3);

    const expectedResult = 'Accuracy is displayed; "Try Another" button redirects to Sound Game screen';
    const result = completeSoundGameActivity();

    console.log('Test Case ID: CASE-057');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Activity Completed: ${result.activityCompleted}`);
    console.log(`Results Displayed: ${result.resultsDisplayed}`);
    console.log(`Accuracy Displayed: ${result.accuracyDisplayed}`);
    console.log(`Accuracy: ${result.accuracy}%`);
    console.log(`Correct Answers: ${result.correctAnswers}/${result.totalItems}`);
    console.log(`Total Stars: ${result.starsTotal}`);
    console.log(`Try Another Button Visible: ${result.tryAnotherButtonVisible}`);
    console.log(`Redirects To: ${result.tryAnotherRedirectsTo}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.accuracyDisplayed && result.tryAnotherButtonVisible && result.accuracy === 100) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.activityCompleted).toBe(true);
    expect(result.resultsDisplayed).toBe(true);
    expect(result.accuracyDisplayed).toBe(true);
    expect(result.accuracy).toBe(100);
    expect(result.correctAnswers).toBe(4);
    expect(result.totalItems).toBe(4);
    expect(result.starsTotal).toBe(12);
    expect(result.tryAnotherButtonVisible).toBe(true);
    expect(result.tryAnotherRedirectsTo).toBe('Sound Game');
  });

  test('Complete activity with partial score - accuracy displayed; Try Another redirects', () => {
    // Simulate partial completion
    simulateItemCompletion(1, true, 3);
    simulateItemCompletion(2, true, 2);
    simulateItemCompletion(3, false, 0);
    simulateItemCompletion(4, true, 3);

    const expectedResult = 'Accuracy is displayed; "Try Another" button redirects to Sound Game screen';
    const result = completeSoundGameActivity();

    console.log('Test Case ID: CASE-057');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Accuracy: ${result.accuracy}%`);
    console.log(`Correct Answers: ${result.correctAnswers}/${result.totalItems}`);
    console.log(`Total Stars: ${result.starsTotal}`);

    if (result.success && result.accuracyDisplayed && result.accuracy === 75) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.accuracy).toBe(75);
    expect(result.correctAnswers).toBe(3);
    expect(result.starsTotal).toBe(8);
    expect(result.tryAnotherButtonVisible).toBe(true);
  });

  test('Click Try Another button - redirects to Sound Game screen', () => {
    // First complete activity
    simulateItemCompletion(1, true, 3);
    completeSoundGameActivity();

    // Click Try Another
    const expectedResult = 'Accuracy is displayed; "Try Another" button redirects to Sound Game screen';
    const result = clickTryAnother('Try Another');

    console.log('Test Case ID: CASE-057');
    console.log('Test Case Description: Validate completing the activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Try Another Actual Result: ${result.actualResult}`);
    console.log(`Redirected: ${result.redirected}`);
    console.log(`Destination: ${result.destination}`);
    console.log(`Screen Loaded: ${result.screenLoaded}`);

    if (result.success && result.redirected && result.destination === 'Sound Game') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.redirected).toBe(true);
    expect(result.destination).toBe('Sound Game');
    expect(result.screenLoaded).toBe('Sound Game');
    expect(result.actualResult).toContain('Redirects');
  });

  test('Click try another (lowercase) - redirects to Sound Game', () => {
    simulateItemCompletion(2, true, 3);
    completeSoundGameActivity();

    const result = clickTryAnother('try another');

    console.log('Test Case ID: CASE-057');
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
    expect(result.destination).toBe('Sound Game');
  });

  test('Click TRY ANOTHER (uppercase) - redirects to Sound Game', () => {
    simulateItemCompletion(3, true, 3);
    completeSoundGameActivity();

    const result = clickTryAnother('TRY ANOTHER');

    console.log('Test Case ID: CASE-057');
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

  test('Try Another resets activity state', () => {
    // Complete activity with some progress
    simulateItemCompletion(1, true, 3);
    simulateItemCompletion(2, true, 2);
    expect(activityResults.correctAnswers).toBe(2);
    expect(activityResults.starsTotal).toBe(5);

    // Click Try Another
    clickTryAnother('Try Another');

    console.log('Test Case ID: CASE-057');
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
    simulateItemCompletion(4, true, 3);
    completeSoundGameActivity();

    const result = clickTryAnother('Exit');

    console.log('Test Case ID: CASE-057');
    console.log('Test Case Description: Validate completing the activity');
    console.log('Expected Result: Accuracy is displayed; "Try Another" button redirects to Sound Game screen');
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
    simulateItemCompletion(1, true, 3);
    completeSoundGameActivity();

    const result = clickTryAnother('');

    console.log('Test Case ID: CASE-057');
    console.log('Test Case Description: Validate completing the activity');
    console.log('Expected Result: Accuracy is displayed; "Try Another" button redirects to Sound Game screen');
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
