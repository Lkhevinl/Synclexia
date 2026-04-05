// lib/userUtils.js
// Shared utility helpers used across multiple screens.

/**
 * Check if a user has a specific role.
 * @param {object} profile - User profile object with role property
 * @param {string} role - Role to check (e.g., 'admin', 'teacher', 'parent', 'student')
 * @returns {boolean}
 */
export const isUserRole = (profile, role) => profile?.role === role;

/**
 * Check if user is an admin.
 * @param {object} profile - User profile object
 * @returns {boolean}
 */
export const isUserAdmin = (profile) => isUserRole(profile, 'admin');

/**
 * Check if user is a teacher.
 * @param {object} profile - User profile object
 * @returns {boolean}
 */
export const isUserTeacher = (profile) => isUserRole(profile, 'teacher');

/**
 * Check if user is a parent.
 * @param {object} profile - User profile object
 * @returns {boolean}
 */
export const isUserParent = (profile) => isUserRole(profile, 'parent');

/**
 * Check if user is a student.
 * @param {object} profile - User profile object
 * @returns {boolean}
 */
export const isUserStudent = (profile) => isUserRole(profile, 'student');

/**
 * Check if user can access teacher features (teacher OR admin).
 * @param {object} profile - User profile object
 * @returns {boolean}
 */
export const canAccessTeacherFeatures = (profile) =>
  isUserTeacher(profile) || isUserAdmin(profile);
