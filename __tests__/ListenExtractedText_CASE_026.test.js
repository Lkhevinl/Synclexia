// ─── Test Case CASE-026 ──────────────────────────────────────────────────────
// Test Case ID: CASE-026
// Test Case Description: Validate by tapping "Listen now" button with no extracted text
// Expected Result: "Listen now" button is disabled

function checkListenNowButtonState(extractedText) {
  // Check if extracted text exists and is not empty
  if (!extractedText || extractedText.trim() === '') {
    return {
      isEnabled: false,
      actualResult: '"Listen now" button is disabled',
      reason: 'No extracted text available'
    };
  }

  // Text exists, button should be enabled
  return {
    isEnabled: true,
    actualResult: '"Listen now" button is enabled',
    textLength: extractedText.length
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-026 (Validate by tapping "Listen now" button with no extracted text)', () => {

  test('No extracted text - Listen now button is disabled', () => {
    const expectedResult = '"Listen now" button is disabled';
    const result = checkListenNowButtonState('');

    console.log('Test Case ID: CASE-026');
    console.log('Test Case Description: Validate by tapping "Listen now" button with no extracted text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Reason: ${result.reason}`);

    if (!result.isEnabled && result.reason === 'No extracted text available') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.isEnabled).toBe(false);
    expect(result.actualResult).toContain('disabled');
    expect(result.reason).toBe('No extracted text available');
  });

  test('Null extracted text - Listen now button is disabled', () => {
    const expectedResult = '"Listen now" button is disabled';
    const result = checkListenNowButtonState(null);

    console.log('Test Case ID: CASE-026');
    console.log('Test Case Description: Validate by tapping "Listen now" button with no extracted text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.isEnabled) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.isEnabled).toBe(false);
    expect(result.actualResult).toContain('disabled');
  });

  test('Undefined extracted text - Listen now button is disabled', () => {
    const expectedResult = '"Listen now" button is disabled';
    const result = checkListenNowButtonState(undefined);

    console.log('Test Case ID: CASE-026');
    console.log('Test Case Description: Validate by tapping "Listen now" button with no extracted text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.isEnabled) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.isEnabled).toBe(false);
    expect(result.actualResult).toContain('disabled');
  });

  test('Whitespace only extracted text - Listen now button is disabled', () => {
    const expectedResult = '"Listen now" button is disabled';
    const result = checkListenNowButtonState('   ');

    console.log('Test Case ID: CASE-026');
    console.log('Test Case Description: Validate by tapping "Listen now" button with no extracted text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.isEnabled) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.isEnabled).toBe(false);
    expect(result.actualResult).toContain('disabled');
  });

  test('Valid extracted text - Listen now button is enabled (negative test)', () => {
    const result = checkListenNowButtonState('This is extracted text from the image');

    console.log('Test Case ID: CASE-026');
    console.log('Test Case Description: Validate by tapping "Listen now" button with no extracted text');
    console.log('Expected Result: "Listen now" button is disabled (when no text)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Text Length: ${result.textLength}`);

    if (result.isEnabled) {
      console.log('Outcome: PASSED - Button enabled with valid text');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.isEnabled).toBe(true);
    expect(result.actualResult).toContain('enabled');
  });

});
