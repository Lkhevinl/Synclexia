// lib/enrollmentHelper.js
// Two-step fetch that avoids PostgREST FK-hint ambiguity when
// enrollments has multiple foreign keys to profiles.
import { supabase } from './supabase';

/**
 * Fetch enrollments for a teacher and attach student profile data.
 * Step 1: get enrollment rows
 * Step 2: batch-fetch profiles by student IDs
 * Returns array of enrollment objects with a `profiles` property.
 *
 * @param {string} teacherId
 * @param {string[]} profileFields - columns to select from profiles (default: id, full_name, email, xp, created_at, role)
 * @returns {Promise<Array>}
 */
export const fetchEnrollmentsWithProfiles = async (teacherId, profileFields) => {
  if (!teacherId) return [];

  const fields = profileFields || ['id', 'full_name', 'email', 'xp', 'created_at', 'role'];

  // Step 1: Get enrollment rows
  const { data: enrollments, error: enrollErr } = await supabase
    .from('enrollments')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (enrollErr || !enrollments || enrollments.length === 0) {
    return [];
  }

  // Step 2: Collect unique student IDs and fetch their profiles
  const studentIds = [...new Set(enrollments.map(e => e.student_id))];

  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select(fields.join(', '))
    .in('id', studentIds);

  // Build a lookup map: id -> profile
  const profileMap = {};
  if (profiles) {
    profiles.forEach(p => { profileMap[p.id] = p; });
  }

  // Merge profiles onto enrollment rows (same shape as the old join)
  return enrollments.map(e => ({
    ...e,
    profiles: profileMap[e.student_id] || null,
  }));
};
