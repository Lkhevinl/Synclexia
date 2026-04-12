// ─── Test Case CASE-099 ──────────────────────────────────────────────────────
// Test Case ID: CASE-099
// Test Case Description: Validate adding new content
// Expected Result: Content updated successfully

// Mock content data
let contentData = {
  content: [
    { contentId: 'CONTENT001', title: 'Letter A', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-01-15T10:30:00Z' },
    { contentId: 'CONTENT002', title: 'Letter B', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-02-20T09:15:00Z' }
  ],
  totalContent: 2
};

const VALID_CONTENT_TYPES = ['phonics', 'spelling', 'sound-match', 'tracing', 'reading'];
const VALID_CATEGORIES = ['alphabet', 'words', 'sentences', 'stories'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

function addContent(adminId, contentDataInput) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'Content not updated - Admin not authenticated',
      contentAdded: false,
      errorMessage: 'Please log in as admin to add content'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'Content not updated - Insufficient privileges',
      contentAdded: false,
      errorMessage: 'You do not have permission to add content'
    };
  }

  // Check for missing required fields
  const requiredFields = ['title', 'type', 'category', 'difficulty'];
  const missingFields = [];

  for (const field of requiredFields) {
    if (!contentDataInput[field] || contentDataInput[field].trim() === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      success: false,
      actualResult: 'Content not updated - Missing required fields',
      contentAdded: false,
      errorMessage: `Required field(s) missing: ${missingFields.join(', ')}`
    };
  }

  // Validate content type
  if (!VALID_CONTENT_TYPES.includes(contentDataInput.type)) {
    return {
      success: false,
      actualResult: 'Content not updated - Invalid content type',
      contentAdded: false,
      errorMessage: 'Invalid content type',
      validTypes: VALID_CONTENT_TYPES
    };
  }

  // Validate category
  if (!VALID_CATEGORIES.includes(contentDataInput.category)) {
    return {
      success: false,
      actualResult: 'Content not updated - Invalid category',
      contentAdded: false,
      errorMessage: 'Invalid category',
      validCategories: VALID_CATEGORIES
    };
  }

  // Validate difficulty
  if (!VALID_DIFFICULTIES.includes(contentDataInput.difficulty)) {
    return {
      success: false,
      actualResult: 'Content not updated - Invalid difficulty',
      contentAdded: false,
      errorMessage: 'Invalid difficulty level',
      validDifficulties: VALID_DIFFICULTIES
    };
  }

  // Generate new content ID
  const newContentId = `CONTENT${String(contentData.content.length + 1).padStart(3, '0')}`;
  const timestamp = new Date().toISOString();
  
  // Create new content
  const newContent = {
    contentId: newContentId,
    title: contentDataInput.title,
    type: contentDataInput.type,
    category: contentDataInput.category,
    difficulty: contentDataInput.difficulty,
    status: contentDataInput.status || 'active',
    createdAt: timestamp,
    createdBy: adminId
  };

  // Add content to database
  contentData.content.push(newContent);
  contentData.totalContent++;

  return {
    success: true,
    actualResult: 'Content updated successfully',
    contentAdded: true,
    contentId: newContentId,
    content: newContent,
    totalContent: contentData.totalContent,
    message: `Content "${contentDataInput.title}" has been added successfully with ID ${newContentId}`
  };
}

// Reset state before each test
function resetContentData() {
  contentData = {
    content: [
      { contentId: 'CONTENT001', title: 'Letter A', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-01-15T10:30:00Z' },
      { contentId: 'CONTENT002', title: 'Letter B', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-02-20T09:15:00Z' }
    ],
    totalContent: 2
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-099 (Validate adding new content)', () => {

  beforeEach(() => {
    resetContentData();
  });

  test('Add phonics content - content updated successfully', () => {
    const expectedResult = 'Content updated successfully';
    const adminId = 'ADMIN001';
    const contentDataInput = {
      title: 'Letter C',
      type: 'phonics',
      category: 'alphabet',
      difficulty: 'easy',
      status: 'active'
    };
    
    const result = addContent(adminId, contentDataInput);

    console.log('Test Case ID: CASE-099');
    console.log('Test Case Description: Validate adding new content');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Content Added: ${result.contentAdded}`);
    console.log(`Content ID: ${result.contentId}`);
    console.log(`Title: ${result.content.title}`);
    console.log(`Type: ${result.content.type}`);
    console.log(`Category: ${result.content.category}`);
    console.log(`Difficulty: ${result.content.difficulty}`);
    console.log(`Total Content: ${result.totalContent}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.contentAdded && result.contentId) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentAdded).toBe(true);
    expect(result.actualResult).toContain('updated successfully');
    expect(result.contentId).toBe('CONTENT003');
    expect(result.content.title).toBe('Letter C');
    expect(result.content.type).toBe('phonics');
    expect(result.content.category).toBe('alphabet');
    expect(result.content.difficulty).toBe('easy');
    expect(result.totalContent).toBe(3);
    expect(contentData.totalContent).toBe(3);
  });

  test('Add spelling content - content updated successfully', () => {
    const adminId = 'ADMIN001';
    const contentDataInput = {
      title: 'Simple Words',
      type: 'spelling',
      category: 'words',
      difficulty: 'medium',
      status: 'active'
    };
    
    const result = addContent(adminId, contentDataInput);

    console.log('Test Case ID: CASE-099');
    console.log(`Title: ${result.content.title}`);
    console.log(`Type: ${result.content.type}`);
    console.log(`Category: ${result.content.category}`);

    if (result.success && result.contentAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentAdded).toBe(true);
    expect(result.content.type).toBe('spelling');
    expect(result.content.category).toBe('words');
    expect(result.content.difficulty).toBe('medium');
  });

  test('Add sound-match content - content updated successfully', () => {
    const adminId = 'ADMIN001';
    const contentDataInput = {
      title: 'Match the Sounds',
      type: 'sound-match',
      category: 'words',
      difficulty: 'easy',
      status: 'active'
    };
    
    const result = addContent(adminId, contentDataInput);

    console.log('Test Case ID: CASE-099');
    console.log(`Type: ${result.content.type}`);
    console.log(`Content ID: ${result.contentId}`);

    if (result.success && result.contentAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentAdded).toBe(true);
    expect(result.content.type).toBe('sound-match');
  });

  test('Add tracing content - content updated successfully', () => {
    const adminId = 'ADMIN001';
    const contentDataInput = {
      title: 'Trace Letters',
      type: 'tracing',
      category: 'alphabet',
      difficulty: 'easy',
      status: 'active'
    };
    
    const result = addContent(adminId, contentDataInput);

    console.log('Test Case ID: CASE-099');
    console.log(`Type: ${result.content.type}`);

    if (result.success && result.contentAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentAdded).toBe(true);
    expect(result.content.type).toBe('tracing');
  });

  test('Add reading content - content updated successfully', () => {
    const adminId = 'ADMIN001';
    const contentDataInput = {
      title: 'Short Story',
      type: 'reading',
      category: 'stories',
      difficulty: 'hard',
      status: 'active'
    };
    
    const result = addContent(adminId, contentDataInput);

    console.log('Test Case ID: CASE-099');
    console.log(`Type: ${result.content.type}`);
    console.log(`Category: ${result.content.category}`);
    console.log(`Difficulty: ${result.content.difficulty}`);

    if (result.success && result.contentAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentAdded).toBe(true);
    expect(result.content.type).toBe('reading');
    expect(result.content.category).toBe('stories');
    expect(result.content.difficulty).toBe('hard');
  });

  test('Multiple content added - content IDs increment correctly', () => {
    const adminId = 'ADMIN001';
    
    // First content
    const result1 = addContent(adminId, {
      title: 'Content 1',
      type: 'phonics',
      category: 'alphabet',
      difficulty: 'easy'
    });
    expect(result1.contentId).toBe('CONTENT003');
    
    // Second content
    const result2 = addContent(adminId, {
      title: 'Content 2',
      type: 'spelling',
      category: 'words',
      difficulty: 'medium'
    });

    console.log('Test Case ID: CASE-099');
    console.log('Test: Multiple content added');
    console.log(`First Content ID: ${result1.contentId}`);
    console.log(`Second Content ID: ${result2.contentId}`);
    console.log(`Total Content: ${contentData.totalContent}`);

    if (result2.success && result2.contentId === 'CONTENT004' && contentData.totalContent === 4) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.contentId).toBe('CONTENT004');
    expect(contentData.totalContent).toBe(4);
  });

  test('Content data persisted correctly after creation', () => {
    const adminId = 'ADMIN001';
    const contentDataInput = {
      title: 'Persisted Content',
      type: 'phonics',
      category: 'alphabet',
      difficulty: 'easy'
    };
    
    const result = addContent(adminId, contentDataInput);

    console.log('Test Case ID: CASE-099');
    console.log('Verifying content data persisted:');
    
    const persistedContent = contentData.content.find(c => c.contentId === result.contentId);
    
    console.log(`  Content ID: ${persistedContent.contentId}`);
    console.log(`  Title: ${persistedContent.title}`);
    console.log(`  Type: ${persistedContent.type}`);
    console.log(`  Category: ${persistedContent.category}`);
    console.log(`  Created By: ${persistedContent.createdBy}`);
    console.log(`  Created At: ${persistedContent.createdAt}`);

    if (persistedContent && persistedContent.title === 'Persisted Content' && persistedContent.createdBy === 'ADMIN001') {
      console.log('Outcome: PASSED - Content data persisted correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(persistedContent).toBeDefined();
    expect(persistedContent.title).toBe('Persisted Content');
    expect(persistedContent.type).toBe('phonics');
    expect(persistedContent.createdBy).toBe('ADMIN001');
    expect(persistedContent.createdAt).toBeDefined();
  });

  test('Missing title - content not added (negative test)', () => {
    const adminId = 'ADMIN001';
    const contentDataInput = {
      title: '',
      type: 'phonics',
      category: 'alphabet',
      difficulty: 'easy'
    };
    
    const result = addContent(adminId, contentDataInput);

    console.log('Test Case ID: CASE-099');
    console.log('Test Case Description: Validate adding new content');
    console.log('Expected Result: Content updated successfully (for valid content)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.contentAdded) {
      console.log('Outcome: PASSED - Correctly rejected missing title');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.contentAdded).toBe(false);
    expect(result.errorMessage).toContain('title');
  });

  test('Invalid content type - content not added (negative test)', () => {
    const adminId = 'ADMIN001';
    const contentDataInput = {
      title: 'Invalid Type Content',
      type: 'invalid-type',
      category: 'alphabet',
      difficulty: 'easy'
    };
    
    const result = addContent(adminId, contentDataInput);

    console.log('Test Case ID: CASE-099');
    console.log(`Type: "${contentDataInput.type}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Valid Types: ${result.validTypes ? result.validTypes.join(', ') : 'none'}`);

    if (!result.success && !result.contentAdded) {
      console.log('Outcome: PASSED - Correctly rejected invalid type');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.contentAdded).toBe(false);
    expect(result.errorMessage).toContain('Invalid content type');
    expect(result.validTypes).toContain('phonics');
    expect(result.validTypes).toContain('spelling');
  });

  test('Without admin authentication - content not added (negative test)', () => {
    const adminId = '';
    const contentDataInput = {
      title: 'No Auth Content',
      type: 'phonics',
      category: 'alphabet',
      difficulty: 'easy'
    };
    
    const result = addContent(adminId, contentDataInput);

    console.log('Test Case ID: CASE-099');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.contentAdded) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated admin');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.contentAdded).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

});
