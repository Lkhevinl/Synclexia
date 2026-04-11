import { supabase } from './supabase';
import { TABLES } from './constants';

/**
 * Fetch all enrollments for a teacher along with student profiles.
 * @param {string} teacherId - The teacher's profile ID
 * @returns {Promise<Array>} Array of enrollment records with nested student profiles
 */
export async function fetchEnrollmentsWithProfiles(teacherId) {
  if (!teacherId) return [];

  const { data, error } = await supabase
    .from(TABLES.ENROLLMENTS)
    .select(`
      id,
      created_at,
      student_id,
      teacher_id,
      profiles:student_id (
        id,
        full_name,
        email,
        role
      )
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[enrollmentHelper] fetchEnrollmentsWithProfiles:', error.message);
    return [];
  }

  return data || [];
}

/**
 * Check if a student is enrolled with a specific teacher.
 * @param {string} teacherId - The teacher's profile ID
 * @param {string} studentId - The student's profile ID
 * @returns {Promise<boolean>} True if enrolled, false otherwise
 */
export async function isStudentEnrolled(teacherId, studentId) {
  if (!teacherId || !studentId) return false;

  const { data, error } = await supabase
    .from(TABLES.ENROLLMENTS)
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId)
    .single();

  return !error && !!data;
}

/**
 * Enroll a student with a teacher.
 * @param {string} teacherId - The teacher's profile ID
 * @param {string} studentId - The student's profile ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function enrollStudent(teacherId, studentId) {
  if (!teacherId || !studentId) {
    return { success: false, error: 'Missing teacher or student ID' };
  }

  const { error } = await supabase
    .from(TABLES.ENROLLMENTS)
    .insert({ teacher_id: teacherId, student_id: studentId });

  if (error) {
    console.error('[enrollmentHelper] enrollStudent:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Remove a student enrollment.
 * @param {string} enrollmentId - The enrollment record ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function removeEnrollment(enrollmentId) {
  if (!enrollmentId) {
    return { success: false, error: 'Missing enrollment ID' };
  }

  const { error } = await supabase
    .from(TABLES.ENROLLMENTS)
    .delete()
    .eq('id', enrollmentId);

  if (error) {
    console.error('[enrollmentHelper] removeEnrollment:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
