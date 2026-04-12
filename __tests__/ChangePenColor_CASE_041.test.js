// ─── Test Case CASE-041 ──────────────────────────────────────────────────────
// Test Case ID: CASE-041
// Test Case Description: Validate changing pen color
// Expected Result: Pen color changes successfully

// Mock pen state
let currentPenColor = 'black';
const availableColors = ['black', 'blue', 'red', 'green', 'yellow', 'purple', 'orange'];

function changePenColor(color) {
  // Check if color is provided
  if (!color || color.trim() === '') {
    return {
      success: false,
      actualResult: 'Pen color not changed - No color specified',
      colorChanged: false,
      currentColor: currentPenColor
    };
  }

  // Check if color is valid
  const normalizedColor = color.toLowerCase().trim();
  if (!availableColors.includes(normalizedColor)) {
    return {
      success: false,
      actualResult: 'Pen color not changed - Invalid color',
      colorChanged: false,
      currentColor: currentPenColor,
      requestedColor: color
    };
  }

  // Change pen color
  const previousColor = currentPenColor;
  currentPenColor = normalizedColor;

  return {
    success: true,
    actualResult: 'Pen color changes successfully',
    colorChanged: true,
    previousColor: previousColor,
    currentColor: currentPenColor
  };
}

// Reset pen color before each test
function resetPenColor() {
  currentPenColor = 'black';
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-041 (Validate changing pen color)', () => {

  beforeEach(() => {
    resetPenColor();
  });

  test('Change pen color to blue - pen color changes successfully', () => {
    const expectedResult = 'Pen color changes successfully';
    const result = changePenColor('blue');

    console.log('Test Case ID: CASE-041');
    console.log('Test Case Description: Validate changing pen color');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Color Changed: ${result.colorChanged}`);
    console.log(`Previous Color: ${result.previousColor}`);
    console.log(`Current Color: ${result.currentColor}`);

    if (result.success && result.colorChanged && result.currentColor === 'blue') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.colorChanged).toBe(true);
    expect(result.actualResult).toContain('changes successfully');
    expect(result.previousColor).toBe('black');
    expect(result.currentColor).toBe('blue');
  });

  test('Change pen color to red - pen color changes successfully', () => {
    const expectedResult = 'Pen color changes successfully';
    const result = changePenColor('red');

    console.log('Test Case ID: CASE-041');
    console.log('Test Case Description: Validate changing pen color');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Current Color: ${result.currentColor}`);

    if (result.success && result.colorChanged) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.colorChanged).toBe(true);
    expect(result.currentColor).toBe('red');
  });

  test('Change pen color to green - pen color changes successfully', () => {
    const expectedResult = 'Pen color changes successfully';
    const result = changePenColor('green');

    console.log('Test Case ID: CASE-041');
    console.log('Test Case Description: Validate changing pen color');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.colorChanged) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.colorChanged).toBe(true);
    expect(result.currentColor).toBe('green');
  });

  test('Change pen color with uppercase - pen color changes successfully', () => {
    const expectedResult = 'Pen color changes successfully';
    const result = changePenColor('PURPLE');

    console.log('Test Case ID: CASE-041');
    console.log('Test Case Description: Validate changing pen color');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Requested Color: PURPLE`);
    console.log(`Current Color: ${result.currentColor}`);

    if (result.success && result.colorChanged) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.colorChanged).toBe(true);
    expect(result.currentColor).toBe('purple');
  });

  test('Change to same color - color changed to same value', () => {
    const result = changePenColor('black');

    console.log('Test Case ID: CASE-041');
    console.log('Test Case Description: Validate changing pen color');
    console.log('Expected Result: Pen color changes successfully');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Previous Color: ${result.previousColor}`);
    console.log(`Current Color: ${result.currentColor}`);

    if (result.success && result.colorChanged) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.colorChanged).toBe(true);
    expect(result.previousColor).toBe('black');
    expect(result.currentColor).toBe('black');
  });

  test('Invalid color - color not changed (negative test)', () => {
    const result = changePenColor('pink');

    console.log('Test Case ID: CASE-041');
    console.log('Test Case Description: Validate changing pen color');
    console.log('Expected Result: Pen color changes successfully (for valid colors)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Requested Color: pink`);

    if (!result.success && !result.colorChanged) {
      console.log('Outcome: PASSED - Correctly rejected invalid color');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.colorChanged).toBe(false);
    expect(result.currentColor).toBe('black');
    expect(result.actualResult).toContain('Invalid color');
  });

  test('Empty color - color not changed (negative test)', () => {
    const result = changePenColor('');

    console.log('Test Case ID: CASE-041');
    console.log('Test Case Description: Validate changing pen color');
    console.log('Expected Result: Pen color changes successfully (for valid colors)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.colorChanged) {
      console.log('Outcome: PASSED - Correctly rejected empty color');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.colorChanged).toBe(false);
    expect(result.actualResult).toContain('No color specified');
  });

  test('Multiple color changes - each change successful', () => {
    // First change to blue
    const result1 = changePenColor('blue');
    expect(result1.currentColor).toBe('blue');

    // Then change to yellow
    const result2 = changePenColor('yellow');
    expect(result2.currentColor).toBe('yellow');
    expect(result2.previousColor).toBe('blue');

    // Finally change to orange
    const result3 = changePenColor('orange');

    console.log('Test Case ID: CASE-041');
    console.log('Test Case Description: Validate changing pen color');
    console.log('Test: Multiple color changes');
    console.log(`Change 1: black → blue`);
    console.log(`Change 2: blue → yellow`);
    console.log(`Change 3: yellow → orange`);
    console.log(`Final Color: ${result3.currentColor}`);

    if (result3.success && result3.colorChanged && result3.currentColor === 'orange') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result3.success).toBe(true);
    expect(result3.colorChanged).toBe(true);
    expect(result3.currentColor).toBe('orange');
  });

});
