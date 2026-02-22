// lib/userUtils.js
// Shared utility helpers used across multiple screens.

/**
 * Calculate a user's display level from their total XP.
 * Every 100 XP = 1 level, starting at level 1.
 * @param {number} xp
 * @returns {number}
 */
export const xpToLevel = (xp) => Math.floor((xp || 0) / 100) + 1;
