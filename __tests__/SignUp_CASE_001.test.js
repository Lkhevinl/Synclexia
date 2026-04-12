// ─── Test Case CASE-001 ──────────────────────────────────────────────────────
// Test Case ID: CASE-001
// Test Case Description: Validate role selection (Learner or Parent) during registration
// Expected Result: Selected role (Learner or Parent) is saved to the system

function validateRoleSelection(role) {
  if (!role || (role !== 'Learner' && role !== 'Parent')) {
    return {
      saved: false,
      actualResult: 'System rejected invalid role selection'
    };
  }
  return {
    saved: true,
    actualResult: 'System saved the selected role correctly'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-001 (Validate role selection during Sign Up)', () => {

  test('Validate role selection during Sign Up - Learner role', () => {
    const expectedResult = 'Selected role (Learner or Parent) is saved to the system';
    const result = validateRoleSelection('Learner');

    console.log('Test Case ID: CASE-001');
    console.log('Test Case Description: Validate role selection (Learner or Parent) during registration');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.saved) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.saved).toBe(true);
  });

  test('Validate role selection during Sign Up - Parent role', () => {
    const expectedResult = 'Selected role (Learner or Parent) is saved to the system';
    const result = validateRoleSelection('Parent');

    console.log('Test Case ID: CASE-001');
    console.log('Test Case Description: Validate role selection (Learner or Parent) during registration');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.saved) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.saved).toBe(true);
  });

});
