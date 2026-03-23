# Database Migration Guide

## Overview
These SQL migration files fix all content management tables to work properly with Row Level Security (RLS) policies.

## 🔴 Fixed Tables

### 1. **stories** table (fix_stories_table.sql)
- Manages reading comprehension stories for Writing Practice
- Columns: id, title, content, level (1-5), is_active, created_by, created_at, updated_at
- RLS Policies:
  - Everyone can read active stories
  - Only admins can manage all stories
  - Teachers can manage stories they created

### 2. **phonics_items** table (fix_phonics_items_table.sql)
- Stores phonetic patterns/sounds for phonics learning
- Columns: id, label, icon, bg_color, is_active, created_by, created_at, updated_at
- Has default phonics items pre-populated
- RLS Policies:
  - Everyone can read active items
  - Only admins can manage

### 3. **spelling_words** table (fix_spelling_words_table.sql)
- Manages words for Spelling challenges
- Columns: id, word, emoji, hint, difficulty_level (1-3), is_active, created_by, created_at, updated_at
- RLS Policies:
  - Everyone can read active words
  - Only admins can manage

### 4. **phonics_activity_content** table (fix_phonics_activity_content_table.sql)
- Content for Phonics Activity games (blend, rhyme, segment)
- Columns: id, game_type, difficulty_level, data (JSONB), is_active, created_by, created_at, updated_at
- RLS Policies:
  - Everyone can read active content
  - Only admins can manage

### 5. **phonological_content** table (fix_phonological_content_table.sql)
- Content for Phonological Awareness tasks (syllable, rime, phoneme)
- Columns: id, task_type, difficulty_level, data (JSONB), is_active, created_by, created_at, updated_at
- RLS Policies:
  - Everyone can read active content
  - Only admins can manage

## ✅ How to Apply Migrations

### Via Supabase Dashboard:
1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy and paste the content of each SQL file (in order):
   - fix_stories_table.sql
   - fix_phonics_items_table.sql
   - fix_spelling_words_table.sql
   - fix_phonics_activity_content_table.sql
   - fix_phonological_content_table.sql
4. Click **Run** for each query
5. Verify the tables are created in the **Table Editor**

### What These Migrations Do:
- ✅ Drop and recreate tables with correct schema
- ✅ Enable Row Level Security (RLS)
- ✅ Create proper RLS policies for admin-only content creation
- ✅ Add `created_by` field for tracking content creators
- ✅ Create indexes for query performance
- ✅ Set up automatic `updated_at` timestamps
- ✅ Add default data where needed (phonics_items)

## 🔧 Why These Were Failing

### 400 Bad Request Errors Occurred Because:
1. **Missing `created_by` field** - RLS policies require content to have a creator
2. **Missing `updated_at` column** - Some code tries to update it automatically
3. **Incorrect column types** - VARCHAR vs TEXT mismatches
4. **RLS policies not aligned** - Policies required admin role verification
5. **Missing indexes** - Caused slow queries for count operations

## ✨ What Now Works After Applying Migrations:
- ✅ **Writing Practice** - Add new stories
- ✅ **Phonics Audio** - Add new phonics items
- ✅ **Spelling Words** - Add new spelling words
- ✅ **Phonics Activity** - Add game content (blend, rhyme, segment)
- ✅ **Phonological Awareness** - Add awareness tasks (syllable, rime, phoneme)

## 📝 Important Notes:
- All tables require admin authentication to create/edit content
- All content gets `is_active = TRUE` by default
- `created_by` field automatically links to the authenticated user
- `updated_at` automatically updates on record modifications
- All tables enable Row Level Security for data protection
