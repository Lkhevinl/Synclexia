// ─── Test Case CASE-047 ──────────────────────────────────────────────────────
// Test Case ID: CASE-047
// Test Case Description: Validate by tapping "Clear" button
// Expected Result: Input field is cleared

// Mock spelling input state
let currentInput = '';
let selectedLetters = [];

function clearInput(buttonName) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Input field not cleared - No button specified',
      inputCleared: false,
      currentInput: currentInput
    };
  }

  // Check if it's the clear button
  if (buttonName.toLowerCase() !== 'clear') {
    return {
      success: false,
      actualResult: 'Input field not cleared - Invalid button',
      inputCleared: false,
      currentInput: currentInput
    };
  }

  // Store previous state for logging
  const previousInput = currentInput;
  const previousLength = selectedLetters.length;

  // Clear input field
  currentInput = '';
  selectedLetters = [];

  return {
    success: true,
    actualResult: 'Input field is cleared',
    inputCleared: true,
    previousInput: previousInput,
    previousLength: previousLength,
    currentInput: currentInput,
    currentLength: 0
  };
}

// Reset state before each test
function resetInputState() {
  currentInput = '';
  selectedLetters = [];
}

function addLettersToInput(letters) {
  for (const letter of letters) {
    currentInput += letter.toUpperCase();
    selectedLetters.push(letter.toUpperCase());
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-047 (Validate by tapping "Clear" button)', () => {

  beforeEach(() => {
    resetInputState();
  });

  test('Tap Clear with input - input field is cleared', () => {
    // Add some letters first
    addLettersToInput(['C', 'A', 'T']);
    expect(currentInput).toBe('CAT');

    const expectedResult = 'Input field is cleared';
    const result = clearInput('Clear');

    console.log('Test Case ID: CASE-047');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input Cleared: ${result.inputCleared}`);
    console.log(`Previous Input: ${result.previousInput}`);
    console.log(`Previous Length: ${result.previousLength}`);
    console.log(`Current Input: "${result.currentInput}"`);
    console.log(`Current Length: ${result.currentLength}`);

    if (result.success && result.inputCleared && result.currentInput === '') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.inputCleared).toBe(true);
    expect(result.actualResult).toContain('cleared');
    expect(result.previousInput).toBe('CAT');
    expect(result.previousLength).toBe(3);
    expect(result.currentInput).toBe('');
    expect(result.currentLength).toBe(0);
  });

  test('Tap clear (lowercase) - input field is cleared', () => {
    addLettersToInput(['D', 'O', 'G']);

    const expectedResult = 'Input field is cleared';
    const result = clearInput('clear');

    console.log('Test Case ID: CASE-047');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input Cleared: ${result.inputCleared}`);

    if (result.success && result.inputCleared) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.inputCleared).toBe(true);
    expect(result.previousInput).toBe('DOG');
    expect(result.currentInput).toBe('');
  });

  test('Tap CLEAR (uppercase) - input field is cleared', () => {
    addLettersToInput(['B', 'A', 'L', 'L']);

    const expectedResult = 'Input field is cleared';
    const result = clearInput('CLEAR');

    console.log('Test Case ID: CASE-047');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.inputCleared) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.inputCleared).toBe(true);
  });

  test('Tap Clear with single letter - input field is cleared', () => {
    addLettersToInput(['A']);

    const expectedResult = 'Input field is cleared';
    const result = clearInput('Clear');

    console.log('Test Case ID: CASE-047');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Previous Input: ${result.previousInput}`);
    console.log(`Previous Length: ${result.previousLength}`);

    if (result.success && result.inputCleared && result.previousLength === 1) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.inputCleared).toBe(true);
    expect(result.previousInput).toBe('A');
    expect(result.currentInput).toBe('');
  });

  test('Tap Clear with empty input - field remains empty', () => {
    // Input is already empty from beforeEach
    const expectedResult = 'Input field is cleared';
    const result = clearInput('Clear');

    console.log('Test Case ID: CASE-047');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Previous Input: "${result.previousInput}"`);
    console.log(`Current Input: "${result.currentInput}"`);

    if (result.success && result.inputCleared) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.inputCleared).toBe(true);
    expect(result.previousInput).toBe('');
    expect(result.currentInput).toBe('');
  });

  test('Tap different button - input not cleared (negative test)', () => {
    addLettersToInput(['T', 'R', 'E', 'E']);

    const result = clearInput('Submit');

    console.log('Test Case ID: CASE-047');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log('Expected Result: Input field is cleared (for Clear button)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Current Input: ${currentInput}`);

    if (!result.success && !result.inputCleared) {
      console.log('Outcome: PASSED - Correctly rejected invalid button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.inputCleared).toBe(false);
    expect(currentInput).toBe('TREE'); // Input should remain unchanged
    expect(result.actualResult).toContain('Invalid button');
  });

  test('Tap empty button name - input not cleared (negative test)', () => {
    addLettersToInput(['H', 'O', 'U', 'S', 'E']);

    const result = clearInput('');

    console.log('Test Case ID: CASE-047');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log('Expected Result: Input field is cleared (for Clear button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.inputCleared) {
      console.log('Outcome: PASSED - Correctly rejected empty button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.inputCleared).toBe(false);
    expect(currentInput).toBe('HOUSE');
    expect(result.actualResult).toContain('No button');
  });

  test('Clear then add new letters - new input works correctly', () => {
    // Add initial letters
    addLettersToInput(['C', 'A', 'R']);
    expect(currentInput).toBe('CAR');

    // Clear input
    clearInput('Clear');
    expect(currentInput).toBe('');

    // Add new letters
    addLettersToInput(['B', 'U', 'S']);

    console.log('Test Case ID: CASE-047');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log('Test: Clear then add new letters');
    console.log(`Previous Input: CAR`);
    console.log(`After Clear: ""`);
    console.log(`New Input: ${currentInput}`);

    if (currentInput === 'BUS') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(currentInput).toBe('BUS');
  });

});
