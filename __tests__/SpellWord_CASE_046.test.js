// ─── Test Case CASE-046 ──────────────────────────────────────────────────────
// Test Case ID: CASE-046
// Test Case Description: Validate selecting letters
// Expected Result: Letters appear in input

// Mock spelling input state
let currentInput = '';
let selectedLetters = [];

function selectLetter(letter) {
  // Check if letter is provided
  if (!letter || letter.trim() === '') {
    return {
      success: false,
      actualResult: 'Letter not selected - No letter provided',
      letterAdded: false,
      currentInput: currentInput
    };
  }

  // Check if letter is a single character
  if (letter.length !== 1 || !/[a-zA-Z]/.test(letter)) {
    return {
      success: false,
      actualResult: 'Letter not selected - Invalid character',
      letterAdded: false,
      currentInput: currentInput
    };
  }

  // Add letter to input
  const upperLetter = letter.toUpperCase();
  currentInput += upperLetter;
  selectedLetters.push(upperLetter);

  return {
    success: true,
    actualResult: 'Letters appear in input',
    letterAdded: true,
    selectedLetter: upperLetter,
    currentInput: currentInput,
    inputLength: currentInput.length,
    selectedLetters: [...selectedLetters]
  };
}

// Reset state before each test
function resetInputState() {
  currentInput = '';
  selectedLetters = [];
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-046 (Validate selecting letters)', () => {

  beforeEach(() => {
    resetInputState();
  });

  test('Select letter C - letter appears in input', () => {
    const expectedResult = 'Letters appear in input';
    const result = selectLetter('C');

    console.log('Test Case ID: CASE-046');
    console.log('Test Case Description: Validate selecting letters');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Letter Added: ${result.letterAdded}`);
    console.log(`Selected Letter: ${result.selectedLetter}`);
    console.log(`Current Input: ${result.currentInput}`);
    console.log(`Input Length: ${result.inputLength}`);

    if (result.success && result.letterAdded && result.currentInput === 'C') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.letterAdded).toBe(true);
    expect(result.actualResult).toContain('appear in input');
    expect(result.selectedLetter).toBe('C');
    expect(result.currentInput).toBe('C');
    expect(result.inputLength).toBe(1);
  });

  test('Select letter A - letter appears in input', () => {
    const expectedResult = 'Letters appear in input';
    const result = selectLetter('A');

    console.log('Test Case ID: CASE-046');
    console.log('Test Case Description: Validate selecting letters');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Current Input: ${result.currentInput}`);

    if (result.success && result.letterAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.letterAdded).toBe(true);
    expect(result.currentInput).toBe('A');
  });
  test('Select letter T - letter appears in input', () => {
    const expectedResult = 'Letters appear in input';
    const result = selectLetter('T');

    console.log('Test Case ID: CASE-046');
    console.log('Test Case Description: Validate selecting letters');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.letterAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.letterAdded).toBe(true);
    expect(result.currentInput).toBe('T');
  });

  test('Select multiple letters - letters appear in input in order', () => {
    const expectedResult = 'Letters appear in input';
    
    // Select C
    const result1 = selectLetter('C');
    expect(result1.currentInput).toBe('C');
    
    // Select A
    const result2 = selectLetter('A');
    expect(result2.currentInput).toBe('CA');
    
    // Select T
    const result3 = selectLetter('T');

    console.log('Test Case ID: CASE-046');
    console.log('Test Case Description: Validate selecting letters');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result3.actualResult}`);
    console.log(`Selected Letters: ${result3.selectedLetters.join(', ')}`);
    console.log(`Current Input: ${result3.currentInput}`);
    console.log(`Input Length: ${result3.inputLength}`);

    if (result3.success && result3.letterAdded && result3.currentInput === 'CAT') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result3.success).toBe(true);
    expect(result3.letterAdded).toBe(true);
    expect(result3.currentInput).toBe('CAT');
    expect(result3.inputLength).toBe(3);
    expect(result3.selectedLetters).toEqual(['C', 'A', 'T']);
  });

  test('Select lowercase letter - appears as uppercase in input', () => {
    const expectedResult = 'Letters appear in input';
    const result = selectLetter('c');

    console.log('Test Case ID: CASE-046');
    console.log('Test Case Description: Validate selecting letters');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Selected: 'c' (lowercase)`);
    console.log(`Appears in input: ${result.currentInput}`);

    if (result.success && result.letterAdded && result.currentInput === 'C') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.letterAdded).toBe(true);
    expect(result.selectedLetter).toBe('C');
    expect(result.currentInput).toBe('C');
  });

  test('Select empty letter - letter not added (negative test)', () => {
    const result = selectLetter('');

    console.log('Test Case ID: CASE-046');
    console.log('Test Case Description: Validate selecting letters');
    console.log('Expected Result: Letters appear in input (when letter is valid)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Current Input: ${result.currentInput}`);

    if (!result.success && !result.letterAdded) {
      console.log('Outcome: PASSED - Correctly rejected empty letter');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.letterAdded).toBe(false);
    expect(result.currentInput).toBe('');
    expect(result.actualResult).toContain('No letter provided');
  });

  test('Select invalid character - letter not added (negative test)', () => {
    const result = selectLetter('1');

    console.log('Test Case ID: CASE-046');
    console.log('Test Case Description: Validate selecting letters');
    console.log('Expected Result: Letters appear in input (when character is a letter)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: '1' (number)`);

    if (!result.success && !result.letterAdded) {
      console.log('Outcome: PASSED - Correctly rejected non-letter character');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.letterAdded).toBe(false);
    expect(result.actualResult).toContain('Invalid character');
  });

  test('Select multi-character string - letter not added (negative test)', () => {
    const result = selectLetter('CA');

    console.log('Test Case ID: CASE-046');
    console.log('Test Case Description: Validate selecting letters');
    console.log('Expected Result: Letters appear in input (when single letter is provided)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: 'CA' (two letters)`);

    if (!result.success && !result.letterAdded) {
      console.log('Outcome: PASSED - Correctly rejected multi-character input');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.letterAdded).toBe(false);
    expect(result.actualResult).toContain('Invalid character');
  });

});
