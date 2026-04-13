// ─── Test Case CASE-049 ──────────────────────────────────────────────────────
// Test Case ID: CASE-049
// Test Case Description: Validate tapping "Check" button with correct answer
// Expected Result: Feedback shows correct; Next button appears

// Mock spelling game state
let currentWord = 'CAT';
let userInput = '';
let checkAttempts = 0;
let starsEarned = 0;

function checkSpellingCorrect(buttonName, input, targetWord) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Check failed - No button specified',
      feedbackShown: false,
      isCorrect: false,
      nextButtonVisible: false
    };
  }

  // Check if it's the check button
  if (buttonName.toLowerCase() !== 'check') {
    return {
      success: false,
      actualResult: 'Check failed - Invalid button',
      feedbackShown: false,
      isCorrect: false,
      nextButtonVisible: false
    };
  }

  // Check if input is provided
  if (!input || input.trim() === '') {
    return {
      success: false,
      actualResult: 'Check failed - No input provided',
      feedbackShown: false,
      isCorrect: false,
      nextButtonVisible: false,
      errorMessage: 'Please enter a word first'
    };
  }

  checkAttempts++;

  // Check if spelling is correct
  const normalizedInput = input.toUpperCase().trim();
  const normalizedTarget = targetWord.toUpperCase().trim();

  if (normalizedInput === normalizedTarget) {
    // Correct answer - award stars based on attempts
    starsEarned = checkAttempts === 1 ? 3 : checkAttempts === 2 ? 2 : 1;

    return {
      success: true,
      actualResult: 'Feedback shows correct; Next button appears',
      feedbackShown: true,
      isCorrect: true,
      nextButtonVisible: true,
      userInput: normalizedInput,
      targetWord: normalizedTarget,
      attempts: checkAttempts,
      starsEarned: starsEarned,
      feedbackMessage: 'Excellent! That\'s the correct spelling!',
      celebration: true
    };
  }

  // Wrong answer
  return {
    success: true,
    actualResult: 'Feedback shows incorrect',
    feedbackShown: true,
    isCorrect: false,
    nextButtonVisible: true,
    userInput: normalizedInput,
    targetWord: normalizedTarget,
    attempts: checkAttempts,
    feedbackMessage: 'That\'s not quite right. Try again!'
  };
}

// Reset state before each test
function resetSpellingState() {
  currentWord = 'CAT';
  userInput = '';
  checkAttempts = 0;
  starsEarned = 0;
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-049 (Validate tapping "Check" button with correct answer)', () => {

  beforeEach(() => {
    resetSpellingState();
  });

  test('Tap Check with correct answer - feedback shows correct; Next button appears', () => {
    const expectedResult = 'Feedback shows correct; Next button appears';
    const correctInput = 'CAT';
    const result = checkSpellingCorrect('Check', correctInput, 'CAT');

    console.log('Test Case ID: CASE-049');
    console.log('Test Case Description: Validate tapping "Check" button with correct answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Feedback Shown: ${result.feedbackShown}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Next Button Visible: ${result.nextButtonVisible}`);
    console.log(`User Input: ${result.userInput}`);
    console.log(`Target Word: ${result.targetWord}`);
    console.log(`Feedback Message: ${result.feedbackMessage}`);
    console.log(`Stars Earned: ${result.starsEarned}`);
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Celebration: ${result.celebration}`);

    if (result.success && result.feedbackShown && result.isCorrect && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.feedbackShown).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.actualResult).toContain('correct');
    expect(result.actualResult).toContain('Next button');
    expect(result.userInput).toBe('CAT');
    expect(result.targetWord).toBe('CAT');
    expect(result.feedbackMessage).toContain('correct');
    expect(result.starsEarned).toBe(3);
    expect(result.attempts).toBe(1);
    expect(result.celebration).toBe(true);
  });

  test('Check correct answer on first attempt - 3 stars awarded', () => {
    const expectedResult = 'Feedback shows correct; Next button appears';
    const result = checkSpellingCorrect('Check', 'DOG', 'DOG');

    console.log('Test Case ID: CASE-049');
    console.log('Test Case Description: Validate tapping "Check" button with correct answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Stars Earned (first attempt): ${result.starsEarned}`);

    if (result.success && result.isCorrect && result.starsEarned === 3) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.starsEarned).toBe(3);
    expect(result.attempts).toBe(1);
  });

  test('Check correct answer on second attempt - 2 stars awarded', () => {
    // First attempt - wrong answer
    checkSpellingCorrect('Check', 'BAT', 'CAT');
    
    // Second attempt - correct answer
    const expectedResult = 'Feedback shows correct; Next button appears';
    const result = checkSpellingCorrect('Check', 'CAT', 'CAT');

    console.log('Test Case ID: CASE-049');
    console.log('Test Case Description: Validate tapping "Check" button with correct answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Stars Earned (second attempt): ${result.starsEarned}`);

    if (result.success && result.isCorrect && result.starsEarned === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.starsEarned).toBe(2);
    expect(result.attempts).toBe(2);
  });

  test('Check correct answer on third attempt - 1 star awarded', () => {
    // First two attempts - wrong answers
    checkSpellingCorrect('Check', 'BAT', 'CAT');
    checkSpellingCorrect('Check', 'RAT', 'CAT');
    
    // Third attempt - correct answer
    const expectedResult = 'Feedback shows correct; Next button appears';
    const result = checkSpellingCorrect('Check', 'CAT', 'CAT');

    console.log('Test Case ID: CASE-049');
    console.log('Test Case Description: Validate tapping "Check" button with correct answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Stars Earned (third attempt): ${result.starsEarned}`);

    if (result.success && result.isCorrect && result.starsEarned === 1) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.starsEarned).toBe(1);
    expect(result.attempts).toBe(3);
  });

  test('Check correct answer with lowercase input - case insensitive match', () => {
    const expectedResult = 'Feedback shows correct; Next button appears';
    const result = checkSpellingCorrect('Check', 'cat', 'CAT');

    console.log('Test Case ID: CASE-049');
    console.log('Test Case Description: Validate tapping "Check" button with correct answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`User Input (lowercase): "${result.userInput}"`);
    console.log(`Target (uppercase): "${result.targetWord}"`);

    if (result.success && result.isCorrect && result.userInput === 'CAT') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.userInput).toBe('CAT');
    expect(result.targetWord).toBe('CAT');
  });

  test('Check correct answer with mixed case input - normalized match', () => {
    const expectedResult = 'Feedback shows correct; Next button appears';
    const result = checkSpellingCorrect('Check', 'BaLl', 'BALL');

    console.log('Test Case ID: CASE-049');
    console.log('Test Case Description: Validate tapping "Check" button with correct answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`User Input (mixed case): "${result.userInput}"`);

    if (result.success && result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.userInput).toBe('BALL');
  });

  test('check (lowercase) button - feedback correct; Next appears', () => {
    const expectedResult = 'Feedback shows correct; Next button appears';
    const result = checkSpellingCorrect('check', 'TREE', 'TREE');

    console.log('Test Case ID: CASE-049');
    console.log('Test Case Description: Validate tapping "Check" button with correct answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.isCorrect && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
  });

  test('Tap different button - no feedback shown (negative test)', () => {
    const result = checkSpellingCorrect('Submit', 'CAT', 'CAT');

    console.log('Test Case ID: CASE-049');
    console.log('Test Case Description: Validate tapping "Check" button with correct answer');
    console.log('Expected Result: Feedback shows correct; Next button appears (for Check button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.feedbackShown) {
      console.log('Outcome: PASSED - Correctly rejected invalid button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackShown).toBe(false);
    expect(result.actualResult).toContain('Invalid button');
  });

  test('Check with wrong answer - feedback shows incorrect (negative test)', () => {
    const result = checkSpellingCorrect('Check', 'BAT', 'CAT');

    console.log('Test Case ID: CASE-049');
    console.log('Test Case Description: Validate tapping "Check" button with correct answer');
    console.log('Expected Result: Feedback shows correct; Next button appears (for correct answer)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && !result.isCorrect) {
      console.log('Outcome: PASSED - Correctly handled wrong answer');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(false);
    expect(result.actualResult).toContain('incorrect');
  });

});
