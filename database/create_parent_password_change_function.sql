-- Create function for parents to update their child's password
-- This requires the service_role key or admin access, which cannot be done directly from client-side
-- Alternative: Use Supabase Edge Function for secure password updates

-- NOTE: Direct password changes for other users require admin privileges.
-- This function will return an error indicating the feature needs backend setup.

CREATE OR REPLACE FUNCTION parent_update_child_password(
  p_student_id UUID,
  p_new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id UUID;
  v_is_linked BOOLEAN;
BEGIN
  -- Get current user ID
  v_parent_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_parent_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'Not authenticated',
      'message', 'You must be logged in to perform this action'
    );
  END IF;
  
  -- Check if parent is linked to this child
  SELECT EXISTS(
    SELECT 1 FROM parent_links 
    WHERE parent_id = v_parent_id 
    AND student_id = p_student_id
  ) INTO v_is_linked;
  
  IF NOT v_is_linked THEN
    RETURN jsonb_build_object(
      'error', 'Not authorized',
      'message', 'You do not have permission to change this student\'s password'
    );
  END IF;
  
  -- NOTE: Changing another user's password requires admin/service_role privileges
  -- This cannot be done from a database function for security reasons
  -- The actual password change must be done via:
  -- 1. Supabase Dashboard (Authentication > Users)
  -- 2. Supabase Auth Admin API with service_role key (Edge Function)
  -- 3. Password reset email flow
  
  RETURN jsonb_build_object(
    'error', 'Feature not implemented',
    'message', 'Direct password changes require a backend Edge Function. Please use the password reset email option instead, or contact support.'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION parent_update_child_password(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION parent_update_child_password(UUID, TEXT) IS 
'Allows parents to update their linked child\'s password. 
NOTE: Requires Edge Function setup for actual password changes due to security restrictions.';
