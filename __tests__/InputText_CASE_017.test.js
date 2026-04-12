// ─── Test Case CASE-017 ──────────────────────────────────────────────────────
// Test Case ID: CASE-017
// Test Case Description: Validate entering text into input field
// Expected Result: Text appears in input box

function validateTextInput(inputValue) {
  // Check if input value exists and is a string
  if (inputValue === undefined || inputValue === null) {
    return {
      entered: false,
      actualResult: 'Text does not appear in input box - No input provided'
    };
  }

  // Check if input is a string
  if (typeof inputValue !== 'string') {
    return {
      entered: false,
      actualResult: 'Text does not appear in input box - Invalid input type'
    };
  }

  // Check if input has content (even if just whitespace)
  if (inputValue.length >= 0) {
    return {
      entered: true,
      actualResult: 'Text appears in input box',
      value: inputValue,
      length: inputValue.length
    };
  }

  return {
    entered: false,
    actualResult: 'Text does not appear in input box'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-017 (Validate entering text into input field)', () => {

  test('Enter valid text - text appears in input box', () => {
    const expectedResult = 'Text appears in input box';
    const result = validateTextInput('Hello World');

    console.log('Test Case ID: CASE-017');
    console.log('Test Case Description: Validate entering text into input field');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input Value: ${result.value}`);
    console.log(`Character Count: ${result.length}`);

    if (result.entered && result.value === 'Hello World') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.entered).toBe(true);
    expect(result.actualResult).toContain('appears in input box');
    expect(result.value).toBe('Hello World');
  });

  test('Enter single character - text appears in input box', () => {
    const expectedResult = 'Text appears in input box';
    const result = validateTextInput('A');

    console.log('Test Case ID: CASE-017');
    console.log('Test Case Description: Validate entering text into input field');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input Value: ${result.value}`);

    if (result.entered && result.value === 'A') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.entered).toBe(true);
    expect(result.value).toBe('A');
  });

  test('Enter empty string - text appears in input box (empty)', () => {
    const expectedResult = 'Text appears in input box';
    const result = validateTextInput('');

    console.log('Test Case ID: CASE-017');
    console.log('Test Case Description: Validate entering text into input field');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input Value: "${result.value}"`);
    console.log(`Character Count: ${result.length}`);

    if (result.entered && result.value === '' && result.length === 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.entered).toBe(true);
    expect(result.value).toBe('');
    expect(result.length).toBe(0);
  });

  test('Enter text with numbers - text appears in input box', () => {
    const expectedResult = 'Text appears in input box';
    const result = validateTextInput('Test123');

    console.log('Test Case ID: CASE-017');
    console.log('Test Case Description: Validate entering text into input field');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input Value: ${result.value}`);

    if (result.entered && result.value === 'Test123') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.entered).toBe(true);
    expect(result.value).toBe('Test123');
  });

  test('Enter text with special characters - text appears in input box', () => {
    const expectedResult = 'Text appears in input box';
    const result = validateTextInput('Hello@#$%^&*()');

    console.log('Test Case ID: CASE-017');
    console.log('Test Case Description: Validate entering text into input field');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input Value: ${result.value}`);

    if (result.entered && result.value === 'Hello@#$%^&*()') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.entered).toBe(true);
    expect(result.value).toBe('Hello@#$%^&*()');
  });

  test('Null input - text does not appear', () => {
    const result = validateTextInput(null);

    console.log('Test Case ID: CASE-017');
    console.log('Test Case Description: Validate entering text into input field');
    console.log('Expected Result: Text appears in input box (when text is entered)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.entered) {
      console.log('Outcome: PASSED - Correctly rejected null input');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.entered).toBe(false);
    expect(result.actualResult).toContain('does not appear');
  });

  test('Long text input - text appears in input box', () => {
    const longText = 'This is a very long text that should still appear correctly in the input box when entered by the user';
    const expectedResult = 'Text appears in input box';
    const result = validateTextInput(longText);

    console.log('Test Case ID: CASE-017');
    console.log('Test Case Description: Validate entering text into input field');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Input Value Length: ${result.length}`);

    if (result.entered && result.value === longText) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.entered).toBe(true);
    expect(result.value).toBe(longText);
    expect(result.length).toBe(longText.length);
  });

});
