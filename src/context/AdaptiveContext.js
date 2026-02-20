// context/AdaptiveContext.js
// Provides adaptive difficulty levels to any screen without prop drilling.
// Usage:
//   const { getLevel, refreshLevel, finishSession } = useAdaptive();
//   const level = getLevel('spelling');  // cached, instant
//   await finishSession('spelling', accuracy);  // persists + updates cache

import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getAdaptiveLevel,
  updateAdaptiveState,
} from '../lib/adaptiveEngine';

const AdaptiveContext = createContext({});

export const AdaptiveProvider = ({ children }) => {
  const { profile } = useAuth();
  // Cache: { activityType: level }
  const [levelCache, setLevelCache] = useState({});

  /**
   * Get the cached adaptive level for an activity.
   * Falls back to 1 if not yet loaded — call refreshLevel() first.
   */
  const getLevel = useCallback((activityType) => {
    return levelCache[activityType] ?? 1;
  }, [levelCache]);

  /**
   * Load (or reload) the adaptive level for an activity from Supabase.
   * Call this in the screen's useEffect before the session starts.
   */
  const refreshLevel = useCallback(async (activityType) => {
    if (!profile?.id) return 1;
    const level = await getAdaptiveLevel(profile.id, activityType);
    setLevelCache(prev => ({ ...prev, [activityType]: level }));
    return level;
  }, [profile?.id]);

  /**
   * Call after a session ends with the session accuracy.
   * Updates adaptive_state in Supabase and refreshes the local cache.
   * Returns { newLevel, promoted, demoted }.
   */
  const finishSession = useCallback(async (activityType, accuracy) => {
    if (!profile?.id) return { newLevel: 1, promoted: false, demoted: false };
    const result = await updateAdaptiveState(profile.id, activityType, accuracy);
    setLevelCache(prev => ({ ...prev, [activityType]: result.newLevel }));
    return result;
  }, [profile?.id]);

  return (
    <AdaptiveContext.Provider value={{ getLevel, refreshLevel, finishSession, levelCache }}>
      {children}
    </AdaptiveContext.Provider>
  );
};

export const useAdaptive = () => useContext(AdaptiveContext);
