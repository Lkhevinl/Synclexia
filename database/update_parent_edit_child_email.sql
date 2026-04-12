-- Update parent_update_child_profile to support email changes
-- This allows parents to update their child's email with verification

DROP FUNCTION IF EXISTS public.parent_update_child_profile(uuid, text, text);
DROP FUNCTION IF EXISTS public.parent_update_child_profile(uuid, text, text, text);

CREATE OR REPLACE FUNCTION public.parent_update_child_profile(
  p_student_id uuid,
  p_full_name  text,
  p_email      text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
BEGIN
  -- Verify caller is a parent and has a link to this student.
  v_parent_id := auth.uid();
  IF NOT EXISTS (
    SELECT 1 FROM public.parent_links
    WHERE parent_id = v_parent_id AND student_id = p_student_id
  ) THEN
    RETURN jsonb_build_object('error', 'Unauthorized: not linked to this child.');
  END IF;

  -- Update the student's profile (only safe fields)
  UPDATE public.profiles
  SET
    full_name  = COALESCE(NULLIF(TRIM(p_full_name), ''), full_name),
    email      = CASE
                   WHEN p_email IS NOT NULL AND TRIM(p_email) != ''
                   THEN TRIM(p_email)
                   ELSE email
                 END,
    avatar_url = COALESCE(NULLIF(TRIM(p_avatar_url), ''), avatar_url)
  WHERE id = p_student_id AND role = 'student';

  -- If email was changed, trigger Supabase auth email change
  -- Note: This needs to be handled on the app side via supabase.auth.updateUser
  -- for proper email verification flow

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.parent_update_child_profile(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.parent_update_child_profile(uuid, text, text, text) TO authenticated;
