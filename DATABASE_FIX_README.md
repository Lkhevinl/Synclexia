# Database Migration Required

## Issue Fixed

The **New Story** and **Phonics Manager** screens were not working because:

1. ❌ **Missing Navigation Routes** - AdminAddStoryScreen and AdminPhonicsScreen were not registered in the navigation stack
2. ❌ **Incorrect Route Mapping** - AdminManageContentsScreen was pointing to Teacher screens instead of Admin screens
3. ❌ **Missing Database Table** - AdminPhonicsScreen expects a `phonics_items` table that didn't exist

## Fixes Applied

✅ **Added missing navigation routes** in `src/navigation/AppNavigator.js`
✅ **Fixed route mapping** in `src/screens/admin/AdminManageContentsScreen.js`
✅ **Created phonics_items table schema** in `database/create_phonics_items_table.sql`

## Database Migration Required

To complete the fix, you need to run the SQL migration to create the missing `phonics_items` table:

### Option 1: Using Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `database/create_phonics_items_table.sql`

### Option 2: Using Supabase CLI (if linked)
```bash
npx supabase db reset --linked
```

### Option 3: Manual SQL Execution
Execute the following SQL in your database:

```sql
-- Run the contents of database/create_phonics_items_table.sql
-- This creates the phonics_items table with proper RLS policies
```

## Testing the Fix

After running the migration:

1. **Navigate to Admin Dashboard**: Admin users should see the "Manage Contents" option
2. **Test New Story**: Click "Writing Practice" → Should open AdminAddStoryScreen with story creation form
3. **Test Phonics Manager**: Click "Phonics Audio" → Should open AdminPhonicsScreen with phonics editing interface

Both screens should now be fully functional with proper database connectivity and navigation.