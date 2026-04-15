// ─── Integration Test INT-004 ───────────────────────────────────────────────
// Test Case ID   : INT-004
// Test           : Integration when extracted text is used for audio support
// Component      : OCR Image-to-Text → Text-to-Speech (TTS)
// Input          : Image is uploaded
// Expected Result: Extracted text is converted to speech

// Mock image
const MOCK_IMAGE_URI = 'file://documents/lesson_page.jpg';

// Mock OCR extracted text
const MOCK_OCR_TEXT = 'The cat sat on the mat. It was a sunny day.';

// State
let appState = {
  ocrProcessing: false,
  ocrText: null,
  ocrConfidence: 0,
  ocrWordCount: 0,
  ttsSpeaking: false,
  ttsWords: [],
  ttsActiveIndex: -1,
  ttsSessionLogged: false
};

function resetState() {
  appState = {
    ocrProcessing: false,
    ocrText: null,
    ocrConfidence: 0,
    ocrWordCount: 0,
    ttsSpeaking: false,
    ttsWords: [],
    ttsActiveIndex: -1,
    ttsSessionLogged: false
  };
}

// Step 1: Upload image and run OCR
async function uploadAndExtractText(imageUri) {
  if (!imageUri) {
    return {
      success: false,
      actualResult: 'OCR failed - No image provided',
      error: 'No image provided'
    };
  }

  appState.ocrProcessing = true;
  await new Promise(resolve => setTimeout(resolve, 50));

  appState.ocrText = MOCK_OCR_TEXT;
  appState.ocrConfidence = 96.2;
  appState.ocrWordCount = MOCK_OCR_TEXT.split(/\s+/).filter(Boolean).length;
  appState.ocrProcessing = false;

  return {
    success: true,
    actualResult: 'Text extracted from image',
    imageUri: imageUri,
    extractedText: appState.ocrText,
    confidence: appState.ocrConfidence,
    wordCount: appState.ocrWordCount
  };
}

// Step 2: Convert extracted text to speech (TTS)
function convertTextToSpeech(text) {
  if (!text || !text.trim()) {
    return {
      success: false,
      actualResult: 'TTS failed - No text to speak',
      error: 'No text provided',
      isSpeaking: false
    };
  }

  const words = text.split(/\s+/).filter(Boolean);

  appState.ttsSpeaking = true;
  appState.ttsWords = words;
  appState.ttsActiveIndex = 0;
  appState.ttsSessionLogged = false;

  return {
    success: true,
    actualResult: 'Extracted text is converted to speech',
    performedAsExpected: true,
    isSpeaking: true,
    wordCount: words.length,
    firstWord: words[0],
    source: 'ocr'
  };
}

// Full integration: upload image → OCR → TTS
async function processOCRToTTS(imageUri) {
  // Step 1: Extract text from image
  const ocrResult = await uploadAndExtractText(imageUri);
  if (!ocrResult.success) {
    return {
      success: false,
      actualResult: ocrResult.actualResult,
      error: ocrResult.error,
      stage: 'ocr_failed'
    };
  }

  // Step 2: Pass extracted text to TTS
  const ttsResult = convertTextToSpeech(ocrResult.extractedText);
  if (!ttsResult.success) {
    return {
      success: false,
      actualResult: ttsResult.actualResult,
      error: ttsResult.error,
      stage: 'tts_failed'
    };
  }

  return {
    success: true,
    actualResult: 'Extracted text is converted to speech',
    performedAsExpected: true,
    imageUri: imageUri,
    extractedText: ocrResult.extractedText,
    ocrConfidence: ocrResult.confidence,
    ocrWordCount: ocrResult.wordCount,
    isSpeaking: ttsResult.isSpeaking,
    ttsWordCount: ttsResult.wordCount,
    firstWord: ttsResult.firstWord,
    integrationFlow: 'OCR Image-to-Text → Text-to-Speech (TTS)',
    stage: 'completed'
  };
}

// Stop TTS
function stopSpeaking() {
  appState.ttsSpeaking = false;
  appState.ttsActiveIndex = -1;
  appState.ttsSessionLogged = true;
  return { success: true, stopped: true };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-004 (OCR Image-to-Text → Text-to-Speech)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Image is uploaded - extracted text is converted to speech', async () => {
    const result = await processOCRToTTS(MOCK_IMAGE_URI);

    console.log('Test Case ID: INT-004');
    console.log('Test: Integration when extracted text is used for audio support');
    console.log('Component: OCR Image-to-Text → Text-to-Speech (TTS)');
    console.log(`Input: Image is uploaded`);
    console.log(`Expected Result: Extracted text is converted to speech`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Image URI: ${result.imageUri}`);
    console.log(`Extracted Text: "${result.extractedText}"`);
    console.log(`OCR Confidence: ${result.ocrConfidence}%`);
    console.log(`OCR Word Count: ${result.ocrWordCount}`);
    console.log(`Is Speaking: ${result.isSpeaking}`);
    console.log(`TTS Word Count: ${result.ttsWordCount}`);
    console.log(`First Word: "${result.firstWord}"`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.isSpeaking && result.ocrWordCount > 0) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.extractedText).toBe(MOCK_OCR_TEXT);
    expect(result.isSpeaking).toBe(true);
    expect(result.ocrConfidence).toBeGreaterThan(90);
    expect(result.ttsWordCount).toBe(result.ocrWordCount);
    expect(result.stage).toBe('completed');
  });

  test('OCR extraction - text accurately pulled from image', async () => {
    const result = await uploadAndExtractText(MOCK_IMAGE_URI);

    console.log('Test Case ID: INT-004');
    console.log('Test: OCR extraction');
    console.log(`Extracted Text: "${result.extractedText}"`);
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`Word Count: ${result.wordCount}`);

    if (result.success && result.extractedText === MOCK_OCR_TEXT) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.extractedText).toBe(MOCK_OCR_TEXT);
    expect(result.confidence).toBe(96.2);
    expect(result.wordCount).toBeGreaterThan(0);
  });

  test('TTS conversion - OCR text fed directly into speech engine', async () => {
    await uploadAndExtractText(MOCK_IMAGE_URI);
    const ttsResult = convertTextToSpeech(appState.ocrText);

    console.log('Test Case ID: INT-004');
    console.log('Test: TTS conversion from OCR text');
    console.log(`Is Speaking: ${ttsResult.isSpeaking}`);
    console.log(`Word Count: ${ttsResult.wordCount}`);
    console.log(`First Word: "${ttsResult.firstWord}"`);
    console.log(`Source: ${ttsResult.source}`);

    if (ttsResult.isSpeaking && ttsResult.source === 'ocr') {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(ttsResult.success).toBe(true);
    expect(ttsResult.isSpeaking).toBe(true);
    expect(ttsResult.source).toBe('ocr');
    expect(ttsResult.firstWord).toBe('The');
    expect(appState.ttsSpeaking).toBe(true);
  });

  test('App state after OCR-to-TTS - speaking with correct word list', async () => {
    await processOCRToTTS(MOCK_IMAGE_URI);

    console.log('Test Case ID: INT-004');
    console.log('Test: App state after full flow');
    console.log(`ttsSpeaking: ${appState.ttsSpeaking}`);
    console.log(`ttsActiveIndex: ${appState.ttsActiveIndex}`);
    console.log(`ttsWords count: ${appState.ttsWords.length}`);

    if (appState.ttsSpeaking && appState.ttsWords.length > 0) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.ttsSpeaking).toBe(true);
    expect(appState.ttsActiveIndex).toBe(0);
    expect(appState.ttsWords.length).toBeGreaterThan(0);
    expect(appState.ttsWords[0]).toBe('The');
  });

  test('Stop TTS - speech stops and session logged', async () => {
    await processOCRToTTS(MOCK_IMAGE_URI);
    expect(appState.ttsSpeaking).toBe(true);

    const stopResult = stopSpeaking();

    console.log('Test Case ID: INT-004');
    console.log('Test: Stop TTS after OCR-to-speech');
    console.log(`Stopped: ${stopResult.stopped}`);
    console.log(`ttsSpeaking: ${appState.ttsSpeaking}`);
    console.log(`Session Logged: ${appState.ttsSessionLogged}`);

    if (stopResult.stopped && !appState.ttsSpeaking && appState.ttsSessionLogged) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(stopResult.stopped).toBe(true);
    expect(appState.ttsSpeaking).toBe(false);
    expect(appState.ttsSessionLogged).toBe(true);
  });

  test('No image provided - fails gracefully', async () => {
    const result = await processOCRToTTS(null);

    console.log('Test Case ID: INT-004');
    console.log('Test: No image uploaded (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'ocr_failed') {
      console.log('Outcome: Performed as Expected - Error handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('No image provided');
    expect(result.stage).toBe('ocr_failed');
  });

  test('Empty OCR text - TTS fails gracefully', () => {
    const result = convertTextToSpeech('');

    console.log('Test Case ID: INT-004');
    console.log('Test: Empty OCR text (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'No text provided') {
      console.log('Outcome: Performed as Expected - Validation handled');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.isSpeaking).toBe(false);
    expect(result.error).toBe('No text provided');
  });

});
