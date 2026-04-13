// ─── Test Case CASE-089 ──────────────────────────────────────────────────────
// Test Case ID: CASE-089
// Test Case Description: Validate changing font size option
// Expected Result: Font size updates accordingly

// Mock settings state
let settingsState = {
  userId: 'USER001',
  fontSize: 'medium',
  availableFontSizes: ['small', 'medium', 'large', 'extra-large'],
  fontSizeValues: {
    small: '14px',
    medium: '16px',
    large: '18px',
    'extra-large': '20px'
  }
};

function changeFontSize(userId, newFontSize) {
  // Check if user is authenticated
  if (!userId || userId.trim() === '') {
    return {
      success: false,
      actualResult: 'Font size not updated - User not authenticated',
      fontSizeUpdated: false,
      errorMessage: 'Please log in to change settings'
    };
  }

  // Check if font size is provided
  if (!newFontSize || newFontSize.trim() === '') {
    return {
      success: false,
      actualResult: 'Font size not updated - No font size specified',
      fontSizeUpdated: false,
      errorMessage: 'Please select a font size'
    };
  }

  // Check if font size is valid
  if (!settingsState.availableFontSizes.includes(newFontSize)) {
    return {
      success: false,
      actualResult: 'Font size not updated - Invalid font size',
      fontSizeUpdated: false,
      errorMessage: 'Please select a valid font size',
      invalidValue: newFontSize,
      availableOptions: settingsState.availableFontSizes
    };
  }

  // Check if font size is already set to this value
  if (settingsState.fontSize === newFontSize) {
    return {
      success: true,
      actualResult: 'Font size already set to ' + newFontSize,
      fontSizeUpdated: false,
      currentFontSize: newFontSize,
      fontSizeValue: settingsState.fontSizeValues[newFontSize],
      message: 'Font size is already set to ' + newFontSize
    };
  }

  const oldFontSize = settingsState.fontSize;
  
  // Update font size
  settingsState.fontSize = newFontSize;

  return {
    success: true,
    actualResult: 'Font size updates accordingly',
    fontSizeUpdated: true,
    oldFontSize: oldFontSize,
    newFontSize: newFontSize,
    fontSizeValue: settingsState.fontSizeValues[newFontSize],
    previewText: 'This is a preview of the ' + newFontSize + ' font size.',
    appliesTo: ['All text content', 'Activity instructions', 'Menu items', 'Button labels'],
    message: 'Font size changed from ' + oldFontSize + ' to ' + newFontSize
  };
}

function getCurrentFontSize(userId) {
  if (!userId || userId.trim() === '') {
    return {
      success: false,
      errorMessage: 'Please log in to view settings'
    };
  }

  return {
    success: true,
    currentFontSize: settingsState.fontSize,
    fontSizeValue: settingsState.fontSizeValues[settingsState.fontSize],
    availableFontSizes: settingsState.availableFontSizes,
    fontSizeValues: settingsState.fontSizeValues
  };
}

// Reset state before each test
function resetSettingsState() {
  settingsState = {
    userId: 'USER001',
    fontSize: 'medium',
    availableFontSizes: ['small', 'medium', 'large', 'extra-large'],
    fontSizeValues: {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-089 (Validate changing font size option)', () => {

  beforeEach(() => {
    resetSettingsState();
  });

  test('Change to large font size - font size updates accordingly', () => {
    const expectedResult = 'Font size updates accordingly';
    const userId = 'USER001';
    const newFontSize = 'large';
    const oldFontSize = settingsState.fontSize;
    
    const result = changeFontSize(userId, newFontSize);

    console.log('Test Case ID: CASE-089');
    console.log('Test Case Description: Validate changing font size option');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Font Size Updated: ${result.fontSizeUpdated}`);
    console.log(`Old Font Size: ${result.oldFontSize}`);
    console.log(`New Font Size: ${result.newFontSize}`);
    console.log(`Font Size Value: ${result.fontSizeValue}`);
    console.log(`Preview: ${result.previewText}`);
    console.log(`Applies To: ${result.appliesTo ? result.appliesTo.join(', ') : 'none'}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.fontSizeUpdated && result.newFontSize === 'large') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.fontSizeUpdated).toBe(true);
    expect(result.actualResult).toContain('updates accordingly');
    expect(result.oldFontSize).toBe('medium');
    expect(result.newFontSize).toBe('large');
    expect(result.fontSizeValue).toBe('18px');
    expect(settingsState.fontSize).toBe('large');
  });

  test('Change to small font size - font size updates accordingly', () => {
    const userId = 'USER001';
    const newFontSize = 'small';
    
    const result = changeFontSize(userId, newFontSize);

    console.log('Test Case ID: CASE-089');
    console.log(`New Font Size: ${result.newFontSize}`);
    console.log(`Font Size Value: ${result.fontSizeValue}`);

    if (result.success && result.fontSizeUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.fontSizeUpdated).toBe(true);
    expect(result.newFontSize).toBe('small');
    expect(result.fontSizeValue).toBe('14px');
    expect(settingsState.fontSize).toBe('small');
  });

  test('Change to extra-large font size - font size updates accordingly', () => {
    const userId = 'USER001';
    const newFontSize = 'extra-large';
    
    const result = changeFontSize(userId, newFontSize);

    console.log('Test Case ID: CASE-089');
    console.log(`New Font Size: ${result.newFontSize}`);
    console.log(`Font Size Value: ${result.fontSizeValue}`);

    if (result.success && result.fontSizeUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.fontSizeUpdated).toBe(true);
    expect(result.newFontSize).toBe('extra-large');
    expect(result.fontSizeValue).toBe('20px');
  });

  test('Select same font size - no update needed', () => {
    const userId = 'USER001';
    const newFontSize = 'medium'; // Already set to medium
    
    const result = changeFontSize(userId, newFontSize);

    console.log('Test Case ID: CASE-089');
    console.log(`Current Font Size: ${result.currentFontSize}`);
    console.log(`Font Size Updated: ${result.fontSizeUpdated}`);
    console.log(`Message: ${result.message}`);

    if (result.success && !result.fontSizeUpdated) {
      console.log('Outcome: PASSED - No update needed for same size');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.fontSizeUpdated).toBe(false);
    expect(result.currentFontSize).toBe('medium');
    expect(result.message).toContain('already set');
  });

  test('View current font size settings', () => {
    const userId = 'USER001';
    
    const result = getCurrentFontSize(userId);

    console.log('Test Case ID: CASE-089');
    console.log(`Current Font Size: ${result.currentFontSize}`);
    console.log(`Font Size Value: ${result.fontSizeValue}`);
    console.log(`Available Sizes: ${result.availableFontSizes ? result.availableFontSizes.join(', ') : 'none'}`);

    if (result.success && result.currentFontSize === 'medium') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.currentFontSize).toBe('medium');
    expect(result.fontSizeValue).toBe('16px');
    expect(result.availableFontSizes).toContain('small');
    expect(result.availableFontSizes).toContain('medium');
    expect(result.availableFontSizes).toContain('large');
    expect(result.availableFontSizes).toContain('extra-large');
  });

  test('Invalid font size - cannot change (negative test)', () => {
    const userId = 'USER001';
    const newFontSize = 'tiny';
    
    const result = changeFontSize(userId, newFontSize);

    console.log('Test Case ID: CASE-089');
    console.log(`Font Size: "${newFontSize}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Available Options: ${result.availableOptions ? result.availableOptions.join(', ') : 'none'}`);

    if (!result.success && !result.fontSizeUpdated) {
      console.log('Outcome: PASSED - Correctly rejected invalid font size');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.fontSizeUpdated).toBe(false);
    expect(result.errorMessage).toContain('valid font size');
    expect(result.availableOptions).toContain('small');
    expect(result.availableOptions).toContain('large');
  });

  test('Without authentication - cannot change (negative test)', () => {
    const userId = '';
    const newFontSize = 'large';
    
    const result = changeFontSize(userId, newFontSize);

    console.log('Test Case ID: CASE-089');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.fontSizeUpdated) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.fontSizeUpdated).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('Empty font size - cannot change (negative test)', () => {
    const userId = 'USER001';
    const newFontSize = '';
    
    const result = changeFontSize(userId, newFontSize);

    console.log('Test Case ID: CASE-089');
    console.log(`Font Size: "" (empty)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.fontSizeUpdated) {
      console.log('Outcome: PASSED - Correctly rejected empty font size');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.fontSizeUpdated).toBe(false);
    expect(result.errorMessage).toContain('select a font size');
  });

});
