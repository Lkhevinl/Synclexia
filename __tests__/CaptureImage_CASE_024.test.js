// ─── Test Case CASE-024 ──────────────────────────────────────────────────────
// Test Case ID: CASE-024
// Test Case Description: Validate capture of image with readable text
// Expected Result: Text is extracted successfully

function validateImageCapture(imageQuality) {
  // Define quality thresholds for text extraction
  const MIN_QUALITY_THRESHOLD = 70; // Minimum quality score out of 100

  // Check if image is provided
  if (!imageQuality) {
    return {
      extractionSuccess: false,
      actualResult: 'Text extraction failed - No image provided',
      qualityScore: 0
    };
  }

  // Check if image quality meets threshold
  if (imageQuality.qualityScore < MIN_QUALITY_THRESHOLD) {
    return {
      extractionSuccess: false,
      actualResult: 'Text extraction failed - Image quality too low',
      qualityScore: imageQuality.qualityScore
    };
  }

  // Check for blur detection specifically
  if (imageQuality.isBlurry) {
    return {
      extractionSuccess: false,
      actualResult: 'Text extraction failed - Image is blurry',
      qualityScore: imageQuality.qualityScore
    };
  }

  // Image quality is acceptable for text extraction
  return {
    extractionSuccess: true,
    actualResult: 'Text is extracted successfully',
    qualityScore: imageQuality.qualityScore,
    extractedText: imageQuality.sampleText || 'Sample extracted text',
    confidence: imageQuality.confidence || 0.9
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-024 (Validate capture of image with readable text)', () => {

  test('Clear sharp image - text extracted successfully', () => {
    const expectedResult = 'Text is extracted successfully';
    const mockClearImage = {
      qualityScore: 85,
      isBlurry: false,
      sharpness: 0.9,
      sampleText: 'Clear text for extraction',
      confidence: 0.92
    };
    const result = validateImageCapture(mockClearImage);

    console.log('Test Case ID: CASE-024');
    console.log('Test Case Description: Validate capture of image with readable text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);
    console.log(`Extracted Text: ${result.extractedText}`);
    console.log(`Confidence: ${result.confidence}`);

    if (result.extractionSuccess && result.qualityScore >= 70) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(true);
    expect(result.actualResult).toContain('extracted successfully');
    expect(result.qualityScore).toBe(85);
    expect(result.extractedText).toBe('Clear text for extraction');
  });

  test('High quality image - text extracted successfully', () => {
    const expectedResult = 'Text is extracted successfully';
    const mockHighQualityImage = {
      qualityScore: 95,
      isBlurry: false,
      sharpness: 0.95,
      sampleText: 'High quality readable text',
      confidence: 0.98
    };
    const result = validateImageCapture(mockHighQualityImage);

    console.log('Test Case ID: CASE-024');
    console.log('Test Case Description: Validate capture of image with readable text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);
    console.log(`Extracted Text: ${result.extractedText}`);

    if (result.extractionSuccess) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(true);
    expect(result.actualResult).toContain('extracted successfully');
    expect(result.qualityScore).toBe(95);
    expect(result.confidence).toBe(0.98);
  });

  test('Good quality printed text image - text extracted successfully', () => {
    const expectedResult = 'Text is extracted successfully';
    const mockPrintedTextImage = {
      qualityScore: 88,
      isBlurry: false,
      sharpness: 0.88,
      sampleText: 'This is printed text on paper',
      confidence: 0.94
    };
    const result = validateImageCapture(mockPrintedTextImage);

    console.log('Test Case ID: CASE-024');
    console.log('Test Case Description: Validate capture of image with readable text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);

    if (result.extractionSuccess) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(true);
    expect(result.extractedText).toBe('This is printed text on paper');
  });

  test('Perfect quality image - text extracted successfully', () => {
    const expectedResult = 'Text is extracted successfully';
    const mockPerfectImage = {
      qualityScore: 100,
      isBlurry: false,
      sharpness: 1.0,
      sampleText: 'Perfectly clear text',
      confidence: 0.99
    };
    const result = validateImageCapture(mockPerfectImage);

    console.log('Test Case ID: CASE-024');
    console.log('Test Case Description: Validate capture of image with readable text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);

    if (result.extractionSuccess && result.qualityScore === 100) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(true);
    expect(result.qualityScore).toBe(100);
    expect(result.extractedText).toBe('Perfectly clear text');
  });

  test('Minimum threshold quality image - text extracted successfully', () => {
    const expectedResult = 'Text is extracted successfully';
    const mockMinThresholdImage = {
      qualityScore: 70,
      isBlurry: false,
      sharpness: 0.7,
      sampleText: 'Borderline readable text',
      confidence: 0.75
    };
    const result = validateImageCapture(mockMinThresholdImage);

    console.log('Test Case ID: CASE-024');
    console.log('Test Case Description: Validate capture of image with readable text');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore} (minimum threshold)`);

    if (result.extractionSuccess && result.qualityScore === 70) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(true);
    expect(result.qualityScore).toBe(70);
  });

  test('Blurry image - text extraction failed (negative test)', () => {
    const mockBlurryImage = {
      qualityScore: 45,
      isBlurry: true,
      sharpness: 0.3
    };
    const result = validateImageCapture(mockBlurryImage);

    console.log('Test Case ID: CASE-024');
    console.log('Test Case Description: Validate capture of image with readable text');
    console.log('Expected Result: Text is extracted successfully (for readable images)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);

    if (!result.extractionSuccess) {
      console.log('Outcome: PASSED - Correctly rejected blurry image');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(false);
    expect(result.actualResult).toContain('failed');
  });

  test('Low quality image - text extraction failed (negative test)', () => {
    const mockLowQualityImage = {
      qualityScore: 60,
      isBlurry: false,
      sharpness: 0.6
    };
    const result = validateImageCapture(mockLowQualityImage);

    console.log('Test Case ID: CASE-024');
    console.log('Test Case Description: Validate capture of image with readable text');
    console.log('Expected Result: Text is extracted successfully (for readable images)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Quality Score: ${result.qualityScore}`);

    if (!result.extractionSuccess) {
      console.log('Outcome: PASSED - Correctly rejected low quality image');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.extractionSuccess).toBe(false);
    expect(result.actualResult).toContain('failed');
  });

});
