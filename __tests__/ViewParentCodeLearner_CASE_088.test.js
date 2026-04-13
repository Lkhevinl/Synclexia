// ─── Test Case CASE-088 ──────────────────────────────────────────────────────
// Test Case ID: CASE-088
// Test Case Description: Validate viewing Parent Link Code in hamburger menu
// Expected Result: Parent Link Code displayed

// Mock learner state with parent link code
let learnerState = {
  userId: 'LEARNER001',
  learnerName: 'Alex',
  parentLinkCode: 'PARENT-LINK-ABC123',
  parentLinkCodeExpiry: '2024-12-31T23:59:59Z',
  isLinked: false,
  linkedParentId: null,
  menuOpen: false
};

function openHamburgerMenu(userId) {
  // Check if user is authenticated
  if (!userId || userId.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to open menu - User not authenticated',
      menuOpened: false,
      errorMessage: 'Please log in to access the menu'
    };
  }

  // Check if user is a learner
  if (!userId.startsWith('LEARNER')) {
    return {
      success: false,
      actualResult: 'Unable to open menu - Access denied',
      menuOpened: false,
      errorMessage: 'This menu is only available for learner accounts'
    };
  }

  learnerState.menuOpen = true;

  return {
    success: true,
    actualResult: 'Hamburger menu opened',
    menuOpened: true,
    userId: userId,
    menuItems: [
      'Home',
      'Activities',
      'Progress',
      'Parent Link Code',
      'Settings',
      'Help',
      'Logout'
    ]
  };
}

function viewParentLinkCode(userId) {
  // Check if user is authenticated
  if (!userId || userId.trim() === '') {
    return {
      success: false,
      actualResult: 'Parent Link Code not displayed - User not authenticated',
      codeDisplayed: false,
      errorMessage: 'Please log in to view your Parent Link Code'
    };
  }

  // Check if user is a learner
  if (!userId.startsWith('LEARNER')) {
    return {
      success: false,
      actualResult: 'Parent Link Code not displayed - Access denied',
      codeDisplayed: false,
      errorMessage: 'Parent Link Code is only available for learner accounts'
    };
  }

  // Return parent link code information
  return {
    success: true,
    actualResult: 'Parent Link Code displayed',
    codeDisplayed: true,
    userId: userId,
    learnerName: learnerState.learnerName,
    parentLinkCode: learnerState.parentLinkCode,
    parentLinkCodeExpiry: learnerState.parentLinkCodeExpiry,
    isLinked: learnerState.isLinked,
    linkedParentId: learnerState.linkedParentId,
    instructions: learnerState.isLinked 
      ? 'Your account is linked to parent.'
      : 'Share this code with your parent to link your account. The code expires on ' + new Date(learnerState.parentLinkCodeExpiry).toLocaleDateString() + '.',
    qrCodeAvailable: !learnerState.isLinked
  };
}

// Reset state before each test
function resetLearnerState() {
  learnerState = {
    userId: 'LEARNER001',
    learnerName: 'Alex',
    parentLinkCode: 'PARENT-LINK-ABC123',
    parentLinkCodeExpiry: '2024-12-31T23:59:59Z',
    isLinked: false,
    linkedParentId: null,
    menuOpen: false
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-088 (Validate viewing Parent Link Code in hamburger menu)', () => {

  beforeEach(() => {
    resetLearnerState();
  });

  test('Open hamburger menu - menu opened successfully', () => {
    const expectedResult = 'Parent Link Code displayed';
    const userId = 'LEARNER001';
    
    const result = openHamburgerMenu(userId);

    console.log('Test Case ID: CASE-088');
    console.log('Test Case Description: Validate viewing Parent Link Code in hamburger menu');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Menu Opened: ${result.menuOpened}`);
    console.log(`Menu Items: ${result.menuItems ? result.menuItems.join(', ') : 'none'}`);
    console.log(`Parent Link Code in Menu: ${result.menuItems ? result.menuItems.includes('Parent Link Code') : false}`);

    if (result.success && result.menuOpened && result.menuItems.includes('Parent Link Code')) {
      console.log('Outcome: PASSED - Menu opened with Parent Link Code option');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.menuOpened).toBe(true);
    expect(result.menuItems).toContain('Parent Link Code');
  });

  test('View Parent Link Code - Parent Link Code displayed', () => {
    const expectedResult = 'Parent Link Code displayed';
    const userId = 'LEARNER001';
    
    const result = viewParentLinkCode(userId);

    console.log('Test Case ID: CASE-088');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Code Displayed: ${result.codeDisplayed}`);
    console.log(`Learner Name: ${result.learnerName}`);
    console.log(`Parent Link Code: ${result.parentLinkCode}`);
    console.log(`Code Expiry: ${result.parentLinkCodeExpiry}`);
    console.log(`Is Linked: ${result.isLinked}`);
    console.log(`QR Code Available: ${result.qrCodeAvailable}`);
    console.log(`Instructions: ${result.instructions}`);

    if (result.success && result.codeDisplayed && result.parentLinkCode) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.codeDisplayed).toBe(true);
    expect(result.actualResult).toContain('displayed');
    expect(result.parentLinkCode).toBe('PARENT-LINK-ABC123');
    expect(result.learnerName).toBe('Alex');
    expect(result.parentLinkCodeExpiry).toBe('2024-12-31T23:59:59Z');
    expect(result.isLinked).toBe(false);
    expect(result.qrCodeAvailable).toBe(true);
    expect(result.instructions).toContain('Share this code');
  });

  test('Parent Link Code has correct format', () => {
    const userId = 'LEARNER001';
    
    const result = viewParentLinkCode(userId);

    console.log('Test Case ID: CASE-088');
    console.log(`Code Format: ${result.parentLinkCode}`);
    console.log(`Contains PARENT-LINK prefix: ${result.parentLinkCode.startsWith('PARENT-LINK-')}`);

    if (result.parentLinkCode && result.parentLinkCode.startsWith('PARENT-LINK-')) {
      console.log('Outcome: PASSED - Code format is valid');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.parentLinkCode).toMatch(/^PARENT-LINK-[A-Z0-9]+$/);
    expect(result.parentLinkCode.length).toBeGreaterThan(12);
  });

  test('Parent Link Code expiry date displayed', () => {
    const userId = 'LEARNER001';
    
    const result = viewParentLinkCode(userId);

    console.log('Test Case ID: CASE-088');
    console.log(`Expiry Date: ${result.parentLinkCodeExpiry}`);
    console.log(`Instructions: ${result.instructions}`);

    if (result.parentLinkCodeExpiry && result.instructions.includes('expires')) {
      console.log('Outcome: PASSED - Expiry information displayed');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.parentLinkCodeExpiry).toBeDefined();
    expect(result.parentLinkCodeExpiry).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.instructions).toContain('expires');
  });

  test('Linked learner shows linked status', () => {
    learnerState.isLinked = true;
    learnerState.linkedParentId = 'PARENT001';
    learnerState.parentLinkCode = null; // No code when linked
    
    const userId = 'LEARNER001';
    
    const result = viewParentLinkCode(userId);

    console.log('Test Case ID: CASE-088');
    console.log(`Is Linked: ${result.isLinked}`);
    console.log(`Linked Parent ID: ${result.linkedParentId}`);
    console.log(`Parent Link Code: ${result.parentLinkCode}`);

    if (result.isLinked && result.linkedParentId === 'PARENT001') {
      console.log('Outcome: PASSED - Linked status displayed correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.isLinked).toBe(true);
    expect(result.linkedParentId).toBe('PARENT001');
  });

  test('Without authentication - cannot view code (negative test)', () => {
    const userId = '';
    
    const result = viewParentLinkCode(userId);

    console.log('Test Case ID: CASE-088');
    console.log('Expected Result: Parent Link Code displayed (for authenticated learners)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.codeDisplayed) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.codeDisplayed).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('Parent account cannot view learner code (negative test)', () => {
    const userId = 'PARENT001';
    
    const result = viewParentLinkCode(userId);

    console.log('Test Case ID: CASE-088');
    console.log(`User ID: ${userId} (parent account)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.codeDisplayed) {
      console.log('Outcome: PASSED - Correctly rejected parent account');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.codeDisplayed).toBe(false);
    expect(result.errorMessage).toContain('learner accounts');
  });

});
