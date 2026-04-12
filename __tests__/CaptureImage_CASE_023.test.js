// ─── Test Case CASE-023 ──────────────────────────────────────────────────────
// Test Case ID: CASE-023
// Test Case Description: Validate capture of blurry image
// Expected Result: Text extraction unsuccessful

function validateImageCapture(imageQuality) {
  // Define quality thresholds for text extraction
  const MIN_QUALITY_THRESHOLD = 70; // Minimum quality score out of 100

  // Check if image is provided
  if (!imageQuality) {
    return {
      extractionSuccess: false,
      actualResult: 'Text extraction unsuccessful - No image provided',
      qualityScore: 0
    };
  }

  // Check if image quality meets threshold
  if (imageQuality.qualityScore < MIN_QUALITY_THRESHOLD) {
    return {
      extractionSuccess: false,
      actualResult: 'Text extraction unsuccessful - Image quality too low (blurry)',
      qualityScore: imageQuality.qualityScore,
      reason: 'Blurry image detected'
    };
  }

  // Check for blur detection specifically
  if (imageQuality.isBlurry) {
    return {
      extractionSuccess: false,
      actualResult: 'Text extraction unsuccessful - Image is blurry',
      qualityScore: imageQuality.qualityScore,
      reason: 'Blur detected'
    };
  }

  // Image quality is acceptable for text extraction
  return {
    extractionSuccess: true,
    actualResult: 'Text extraction successful',
    qualityScore: imageQuality.qualityScore,
    extractedText: imageQuality.sampleText || 'Sample extracted text'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-023 (Validate capture of blurry image)', () => {

  test('Blurry image - text extraction unsuccessful', () => {
    const expectedResult = 'Text extraction unsuccessful';
    const mockBlurryImage = {
      qualityScore: 45,
      isBlurry: true,
      sharpness: 0.3
    };
    const result = validateImageCapture(mockBlurryImage);

    console.log('Test Case ID: CASE-023');
    console.log('Test Case Description: Validate capture of blurry image');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);
    console.log(`Reason: ${result.reason}`);

    if (!result.extractionSuccess && result.reason === 'Blurry image detected') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(false);
    expect(result.actualResult).toContain('Text extraction unsuccessful');
    expect(result.reason).toBe('Blurry image detected');
  });

  test('Very blurry image - text extraction unsuccessful', () => {
    const expectedResult = 'Text extraction unsuccessful';
    const mockVeryBlurryImage = {
      qualityScore: 25,
      isBlurry: true,
      sharpness: 0.1
    };
    const result = validateImageCapture(mockVeryBlurryImage);

    console.log('Test Case ID: CASE-023');
    console.log('Test Case Description: Validate capture of blurry image');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);

    if (!result.extractionSuccess) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(false);
    expect(result.qualityScore).toBe(25);
  });

  test('Slightly blurry image - text extraction unsuccessful', () => {
    const expectedResult = 'Text extraction unsuccessful';
    const mockSlightlyBlurryImage = {
      qualityScore: 55,
      isBlurry: true,
      sharpness: 0.5
    };
    const result = validateImageCapture(mockSlightlyBlurryImage);

    console.log('Test Case ID: CASE-023');
    console.log('Test Case Description: Validate capture of blurry image');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);

    if (!result.extractionSuccess) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(false);
    expect(result.actualResult).toContain('unsuccessful');
  });

  test('Low quality image (not marked blurry but low score) - text extraction unsuccessful', () => {
    const expectedResult = 'Text extraction unsuccessful';
    const mockLowQualityImage = {
      qualityScore: 60,
      isBlurry: false,
      sharpness: 0.6
    };
    const result = validateImageCapture(mockLowQualityImage);

    console.log('Test Case ID: CASE-023');
    console.log('Test Case Description: Validate capture of blurry image');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);

    if (!result.extractionSuccess) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(false);
    expect(result.qualityScore).toBe(60);
  });

  test('No image provided - text extraction unsuccessful', () => {
    const expectedResult = 'Text extraction unsuccessful';
    const result = validateImageCapture(null);

    console.log('Test Case ID: CASE-023');
    console.log('Test Case Description: Validate capture of blurry image');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.extractionSuccess) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(false);
    expect(result.actualResult).toContain('unsuccessful');
  });

  test('Clear sharp image - text extraction successful (negative test)', () => {
    const mockClearImage = {
      qualityScore: 85,
      isBlurry: false,
      sharpness: 0.9,
      sampleText: 'Clear text for extraction'
    };
    const result = validateImageCapture(mockClearImage);

    console.log('Test Case ID: CASE-023');
    console.log('Test Case Description: Validate capture of blurry image');
    console.log('Expected Result: Text extraction unsuccessful (for blurry images)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);

    if (result.extractionSuccess && result.qualityScore >= 70) {
      console.log('Outcome: PASSED - Clear image allows text extraction');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(true);
    expect(result.actualResult).toContain('successful');
    expect(result.qualityScore).toBe(85);
  });

  test('High quality image - text extraction successful (negative test)', () => {
    const mockHighQualityImage = {
      qualityScore: 95,
      isBlurry: false,
      sharpness: 0.95,
      sampleText: 'High quality text'
    };
    const result = validateImageCapture(mockHighQualityImage);

    console.log('Test Case ID: CASE-023');
    console.log('Test Case Description: Validate capture of blurry image');
    console.log('Expected Result: Text extraction unsuccessful (for blurry images)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);

    if (result.extractionSuccess) {
      console.log('Outcome: PASSED - High quality image allows text extraction');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(true);
    expect(result.qualityScore).toBe(95);
  });

});
