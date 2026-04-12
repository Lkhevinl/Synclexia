// ─── Test Case CASE-025 ──────────────────────────────────────────────────────
// Test Case ID: CASE-025
// Test Case Description: Validate upload of unsupported file type
// Expected Result: Upload blocked; error message displayed

function validateImageUpload(file) {
  // Define supported image formats
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

  // Check if file is provided
  if (!file) {
    return {
      canUpload: false,
      actualResult: 'Upload blocked; error message displayed - No file selected',
      error: 'Please select an image file'
    };
  }

  // Get file extension
  const fileName = file.name || '';
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  // Check if file format is supported
  if (!supportedFormats.includes(fileExtension)) {
    return {
      canUpload: false,
      actualResult: 'Upload blocked; error message displayed - Unsupported file format',
      error: `File format ${fileExtension} is not supported. Please upload: ${supportedFormats.join(', ')}`,
      fileType: fileExtension
    };
  }

  // Check file size (max 10MB for images)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      canUpload: false,
      actualResult: 'Upload blocked; error message displayed - File size exceeds limit',
      error: 'File size exceeds 10MB limit',
      fileType: fileExtension
    };
  }

  // Valid image file
  return {
    canUpload: true,
    actualResult: 'Upload successful',
    fileType: fileExtension,
    fileName: fileName,
    fileSize: file.size
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-025 (Validate upload of unsupported file type)', () => {

  test('Upload PDF file - upload blocked', () => {
    const expectedResult = 'Upload blocked; error message displayed';
    const mockFile = { name: 'document.pdf', type: 'application/pdf', size: 1024 };
    const result = validateImageUpload(mockFile);

    console.log('Test Case ID: CASE-025');
    console.log('Test Case Description: Validate upload of unsupported file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Type: ${result.fileType}`);
    console.log(`Error: ${result.error}`);

    if (!result.canUpload && result.actualResult.includes('blocked')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canUpload).toBe(false);
    expect(result.actualResult).toContain('blocked');
    expect(result.actualResult).toContain('error');
    expect(result.fileType).toBe('.pdf');
  });

  test('Upload TXT file - upload blocked', () => {
    const expectedResult = 'Upload blocked; error message displayed';
    const mockFile = { name: 'document.txt', type: 'text/plain', size: 256 };
    const result = validateImageUpload(mockFile);

    console.log('Test Case ID: CASE-025');
    console.log('Test Case Description: Validate upload of unsupported file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.error}`);

    if (!result.canUpload) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canUpload).toBe(false);
    expect(result.actualResult).toContain('blocked');
  });

  test('Upload DOCX file - upload blocked', () => {
    const expectedResult = 'Upload blocked; error message displayed';
    const mockFile = { name: 'report.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 2048 };
    const result = validateImageUpload(mockFile);

    console.log('Test Case ID: CASE-025');
    console.log('Test Case Description: Validate upload of unsupported file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.canUpload) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canUpload).toBe(false);
    expect(result.actualResult).toContain('blocked');
  });

  test('Upload MP4 video - upload blocked', () => {
    const expectedResult = 'Upload blocked; error message displayed';
    const mockFile = { name: 'video.mp4', type: 'video/mp4', size: 5000000 };
    const result = validateImageUpload(mockFile);

    console.log('Test Case ID: CASE-025');
    console.log('Test Case Description: Validate upload of unsupported file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.canUpload) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canUpload).toBe(false);
    expect(result.actualResult).toContain('blocked');
  });

  test('Upload SVG file - upload blocked', () => {
    const expectedResult = 'Upload blocked; error message displayed';
    const mockFile = { name: 'image.svg', type: 'image/svg+xml', size: 1024 };
    const result = validateImageUpload(mockFile);

    console.log('Test Case ID: CASE-025');
    console.log('Test Case Description: Validate upload of unsupported file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.canUpload) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canUpload).toBe(false);
    expect(result.fileType).toBe('.svg');
  });

  test('Upload XLSX file - upload blocked', () => {
    const expectedResult = 'Upload blocked; error message displayed';
    const mockFile = { name: 'spreadsheet.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 1536 };
    const result = validateImageUpload(mockFile);

    console.log('Test Case ID: CASE-025');
    console.log('Test Case Description: Validate upload of unsupported file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.canUpload) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canUpload).toBe(false);
    expect(result.actualResult).toContain('blocked');
  });

  test('No file selected - upload blocked', () => {
    const expectedResult = 'Upload blocked; error message displayed';
    const result = validateImageUpload(null);

    console.log('Test Case ID: CASE-025');
    console.log('Test Case Description: Validate upload of unsupported file type');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.canUpload) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canUpload).toBe(false);
    expect(result.actualResult).toContain('blocked');
  });

  test('Upload supported JPG image - upload successful (negative test)', () => {
    const mockFile = { name: 'photo.jpg', type: 'image/jpeg', size: 1024000 };
    const result = validateImageUpload(mockFile);

    console.log('Test Case ID: CASE-025');
    console.log('Test Case Description: Validate upload of unsupported file type');
    console.log('Expected Result: Upload blocked; error message displayed (for unsupported files)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`File Type: ${result.fileType}`);

    if (result.canUpload && result.fileType === '.jpg') {
      console.log('Outcome: PASSED - Valid image uploaded successfully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canUpload).toBe(true);
    expect(result.fileType).toBe('.jpg');
    expect(result.actualResult).toContain('successful');
  });

  test('Upload supported PNG image - upload successful (negative test)', () => {
    const mockFile = { name: 'image.png', type: 'image/png', size: 2048000 };
    const result = validateImageUpload(mockFile);

    console.log('Test Case ID: CASE-025');
    console.log('Test Case Description: Validate upload of unsupported file type');
    console.log('Expected Result: Upload blocked; error message displayed (for unsupported files)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.canUpload) {
      console.log('Outcome: PASSED - Valid PNG image uploaded successfully');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.canUpload).toBe(true);
    expect(result.fileType).toBe('.png');
  });

});
