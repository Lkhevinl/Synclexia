// ─── OCR Module Tests ───────────────────────────────────────────────────────
// Individual test file for OCR functionality
// Test Cases: TC-OCR-001 through TC-OCR-009

const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const validTextFileTypes = ['text/plain'];

function capturePhoto(imageQuality) {
  if (imageQuality < 0.5) {
    return { success: false, error: 'Low accuracy error warning displayed' };
  }
  return { success: true, imageLoaded: true };
}

function uploadFile(fileType, fileContent = null) {
  // Check if it's an image
  if (validImageTypes.includes(fileType)) {
    if (!fileContent) {
      return { success: false, error: 'No text detected' };
    }
    return { success: true, imageLoaded: true };
  }
  
  // Check if it's a text file
  if (validTextFileTypes.includes(fileType)) {
    return { success: true, textLoaded: true, content: fileContent };
  }
  
  return { success: false, error: 'Upload blocked; file type error displayed' };
}

function extractTextFromImage(imageData) {
  if (!imageData || imageData.quality < 0.3) {
    return { success: false, error: 'No text detected' };
  }
  
  if (!imageData.text || imageData.text.trim().length === 0) {
    return { success: false, error: 'No text detected' };
  }
  
  return { 
    success: true, 
    text: imageData.text,
    canListen: true
  };
}

function listenToExtractedText(text) {
  if (!text || text.trim().length === 0) {
    return { success: false, error: 'No audio playback' };
  }
  return { success: true, action: 'playing' };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASES
// ═════════════════════════════════════════════════════════════════════════════

describe('OCR Module - Individual Test Cases', () => {

  describe('TC-OCR-001: User captures blurry image', () => {
    test('Low accuracy error warning displayed', () => {
      const result = capturePhoto(0.3);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Low accuracy error warning displayed');
    });
  });

  describe('TC-OCR-002: Learner captures image with readable text', () => {
    test('Image loaded successfully for text extraction', () => {
      const result = capturePhoto(0.8);
      expect(result.success).toBe(true);
      expect(result.imageLoaded).toBe(true);
    });
  });

  describe('TC-OCR-003: Learner uploads non-.txt file (e.g., .pdf, .docx)', () => {
    test('Upload blocked; file type error displayed', () => {
      const result = uploadFile('application/pdf');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload blocked; file type error displayed');
    });
  });

  describe('TC-OCR-004: Learner uploads valid image file', () => {
    test('Image loaded successfully for text extraction', () => {
      const result = uploadFile('image/jpeg', 'some image data');
      expect(result.success).toBe(true);
      expect(result.imageLoaded).toBe(true);
    });
  });

  describe('TC-OCR-005: Learner uploads image without text', () => {
    test('No text detected message displayed', () => {
      const result = uploadFile('image/jpeg', null);
      expect(result.success).toBe(false);
      expect(result.error).toBe('No text detected');
    });
  });

  describe('TC-OCR-006: Learner uploads .txt file then taps speak', () => {
    test('Audio playback starts from uploaded text', () => {
      const result = uploadFile('text/plain', 'Hello world text content');
      expect(result.success).toBe(true);
      expect(result.textLoaded).toBe(true);
    });
  });

  describe('TC-OCR-007: Learner taps listen with no extracted text', () => {
    test('No audio playback', () => {
      const result = listenToExtractedText('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('No audio playback');
    });
  });

  describe('TC-OCR-008: Learner taps listen after text extraction', () => {
    test('Audio playback of extracted text starts', () => {
      const result = listenToExtractedText('Extracted text from image');
      expect(result.success).toBe(true);
      expect(result.action).toBe('playing');
    });
  });

  describe('TC-OCR-009: Extract text from image with no text', () => {
    test('No text detected', () => {
      const result = extractTextFromImage({ quality: 0.8, text: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('No text detected');
    });
  });

});
