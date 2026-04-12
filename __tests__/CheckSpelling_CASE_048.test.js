// ─── Test Case CASE-048 ──────────────────────────────────────────────────────
// Test Case ID: CASE-048
// Test Case Description: Validate tapping "Check" button with wrong answer
// Expected Result: Feedback shows incorrect; Next button appears

// Mock spelling game state
let currentWord = 'CAT';
let userInput = '';
let checkAttempts = 0;

function checkSpelling(buttonName, input, targetWord) {
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
    return {
      success: true,
      actualResult: 'Feedback shows correct',
      feedbackShown: true,
      isCorrect: true,
      nextButtonVisible: true,
      userInput: normalizedInput,
      targetWord: normalizedTarget,
      attempts: checkAttempts
    };
  }

  // Wrong answer - show incorrect feedback and Next button for retry/next
  return {
    success: true,
    actualResult: 'Feedback shows incorrect; Next button appears',
    feedbackShown: true,
    isCorrect: false,
    nextButtonVisible: true,
    userInput: normalizedInput,
    targetWord: normalizedTarget,
    attempts: checkAttempts,
    feedbackMessage: 'That\'s not quite right. The correct spelling is ' + normalizedTarget,
    hint: 'Listen to the word again and try once more'
  };
}

// Reset state before each test
function resetSpellingState() {
  currentWord = 'CAT';
  userInput = '';
  checkAttempts = 0;
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-048 (Validate tapping "Check" button with wrong answer)', () => {

  beforeEach(() => {
    resetSpellingState();
  });

  test('Tap Check with wrong answer - feedback shows incorrect; Next button appears', () => {
    const expectedResult = 'Feedback shows incorrect; Next button appears';
    const wrongInput = 'BAT';
    const result = checkSpelling('Check', wrongInput, 'CAT');

    console.log('Test Case ID: CASE-048');
    console.log('Test Case Description: Validate tapping "Check" button with wrong answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Feedback Shown: ${result.feedbackShown}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Next Button Visible: ${result.nextButtonVisible}`);
    console.log(`User Input: ${result.userInput}`);
    console.log(`Target Word: ${result.targetWord}`);
    console.log(`Feedback Message: ${result.feedbackMessage}`);
    console.log(`Hint: ${result.hint}`);
    console.log(`Attempts: ${result.attempts}`);

    if (result.success && result.feedbackShown && !result.isCorrect && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.feedbackShown).toBe(true);
    expect(result.isCorrect).toBe(false);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.actualResult).toContain('incorrect');
    expect(result.actualResult).toContain('Next button');
    expect(result.userInput).toBe('BAT');
    expect(result.targetWord).toBe('CAT');
    expect(result.feedbackMessage).toContain('not quite right');
  });

  test('Check with completely wrong spelling - feedback incorrect; Next appears', () => {
    const expectedResult = 'Feedback shows incorrect; Next button appears';
    const result = checkSpelling('Check', 'XYZ', 'DOG');

    console.log('Test Case ID: CASE-048');
    console.log('Test Case Description: Validate tapping "Check" button with wrong answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`User Input: ${result.userInput}`);
    console.log(`Target: ${result.targetWord}`);

    if (result.success && !result.isCorrect && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(false);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.userInput).toBe('XYZ');
    expect(result.targetWord).toBe('DOG');
  });

  test('Check with partial spelling - feedback incorrect; Next appears', () => {
    const expectedResult = 'Feedback shows incorrect; Next button appears';
    const result = checkSpelling('Check', 'CA', 'CAT');

    console.log('Test Case ID: CASE-048');
    console.log('Test Case Description: Validate tapping "Check" button with wrong answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`User Input (partial): ${result.userInput}`);

    if (result.success && !result.isCorrect && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(false);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.userInput).toBe('CA');
  });

  test('Check with extra letters - feedback incorrect; Next appears', () => {
    const expectedResult = 'Feedback shows incorrect; Next button appears';
    const result = checkSpelling('Check', 'CATT', 'CAT');

    console.log('Test Case ID: CASE-048');
    console.log('Test Case Description: Validate tapping "Check" button with wrong answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`User Input (extra letters): ${result.userInput}`);

    if (result.success && !result.isCorrect && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(false);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.userInput).toBe('CATT');
    expect(result.targetWord).toBe('CAT');
  });

  test('Check with case insensitive wrong answer - feedback incorrect; Next appears', () => {
    const expectedResult = 'Feedback shows incorrect; Next button appears';
    const result = checkSpelling('Check', 'bat', 'CAT');

    console.log('Test Case ID: CASE-048');
    console.log('Test Case Description: Validate tapping "Check" button with wrong answer');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`User Input: "${result.userInput}" (lowercase)`);
    console.log(`Target: "${result.targetWord}" (uppercase)`);

    if (result.success && !result.isCorrect && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(false);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.userInput).toBe('BAT');
    expect(result.targetWord).toBe('CAT');
  });

  test('Check with correct answer - feedback correct; Next appears (negative test)', () => {
    const result = checkSpelling('Check', 'CAT', 'CAT');

    console.log('Test Case ID: CASE-048');
    console.log('Test Case Description: Validate tapping "Check" button with wrong answer');
    console.log('Expected Result: Feedback shows incorrect; Next button appears (for wrong answers)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Next Button Visible: ${result.nextButtonVisible}`);

    if (result.success && result.isCorrect && result.nextButtonVisible) {
      console.log('Outcome: PASSED - Correctly handled correct answer');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.actualResult).toContain('correct');
  });

  test('Tap different button - no feedback shown (negative test)', () => {
    const result = checkSpelling('Submit', 'BAT', 'CAT');

    console.log('Test Case ID: CASE-048');
    console.log('Test Case Description: Validate tapping "Check" button with wrong answer');
    console.log('Expected Result: Feedback shows incorrect; Next button appears (for Check button)');
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

  test('Empty input - error message; no feedback (negative test)', () => {
    const result = checkSpelling('Check', '', 'CAT');

    console.log('Test Case ID: CASE-048');
    console.log('Test Case Description: Validate tapping "Check" button with wrong answer');
    console.log('Expected Result: Feedback shows incorrect; Next button appears (when input provided)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error Message: ${result.errorMessage}`);

    if (!result.success && !result.feedbackShown) {
      console.log('Outcome: PASSED - Correctly rejected empty input');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackShown).toBe(false);
    expect(result.errorMessage).toContain('enter a word');
  });

});
