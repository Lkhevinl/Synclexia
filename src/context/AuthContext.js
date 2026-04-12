import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { registerForPushNotificationsAsync } from '../lib/pushNotificationHelper';
import { navigationRef } from '../navigation/navigationRef';
import { TIMEOUTS, TABLES, ROLES } from '../lib/constants';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [dashboardMode, setDashboardMode] = useState('auto');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const signingOutRef = useRef(false);

  const clearStaleSession = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(k => k.startsWith('sb-') || k.includes('supabase'));
      if (authKeys.length) await AsyncStorage.multiRemove(authKeys);
    } catch (_) {}
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  useEffect(() => {
    // 1. Restore session on mount
    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (error) {
        clearStaleSession();
        supabase.auth.signOut().catch(() => {});
        return;
      }
      setSession(s);
      // Unblock the navigator immediately — profile loads in the background
      setLoading(false);
      if (s) fetchProfile(s.user.id);
      else setProfileLoaded(true);
    });

    // 2. Auth state listener — only react to explicit sign-in/sign-out events.
    //    TOKEN_REFRESHED is intentionally ignored: Supabase updates its internal
    //    token automatically; we don't need to update React state for that.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
        setLoading(false);
        return;
      }
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setProfileLoaded(false);
        setDashboardMode('auto');
        setRecoveryMode(false);
        setLoading(false);
        return;
      }
      if (event === 'SIGNED_IN') {
        // Ignore spurious SIGNED_IN events that fire during/after an intentional logout
        // (e.g. a pending autoRefreshToken call that resolves after signOut)
        if (signingOutRef.current) return;
        if (!s) { setLoading(false); return; }
        setSession(s);
        await fetchProfile(s.user.id);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, retryCount = 0, startTime = Date.now()) => {
    if (Date.now() - startTime > TIMEOUTS.PROFILE_TOTAL_MS) {
      console.warn(`fetchProfile: total time exceeded ${TIMEOUTS.PROFILE_TOTAL_MS / 1000}s`);
      setProfileError('server_error');
      setProfileLoaded(true);
      return null;
    }
    try {
      // Race the Supabase query against a hard timeout so a hanging
      // network request can never block the app indefinitely.
      const queryPromise = supabase.from(TABLES.PROFILES).select('*').eq('id', userId).single();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), TIMEOUTS.PROFILE_QUERY_MS)
      );
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      if (error) {
        console.warn('fetchProfile error:', error.message, '| code:', error.code, '| status:', error.status);
        const isInfiniteRecursion = error.code === '42P17' ||
          error.message?.toLowerCase().includes('infinite recursion');
        // PGRST116 = .single() returned 0 rows — profile may not exist yet (signup race)
        const isNotFound = error.code === 'PGRST116';
        const isTransient500 = error.status === 500 && !isInfiniteRecursion;

        if (isInfiniteRecursion) {
          setProfileError('server_error');
          setProfileLoaded(true);
          return null;
        }
        if ((isTransient500 || isNotFound) && retryCount < 3) {
          console.log(`fetchProfile: ${isNotFound ? 'profile not found' : 'transient 500'}, retrying… (attempt ${retryCount + 1})`);
          await new Promise(r => setTimeout(r, TIMEOUTS.RETRY_DELAY_MS));
          return fetchProfile(userId, retryCount + 1, startTime);
        }
        // All other errors (RLS denial, bad request, exhausted retries, etc.)
        // — surface immediately rather than falling through to the not-found retry path.
        setProfileError(isNotFound ? 'not_found' : 'server_error');
        setProfileLoaded(true);
        return null;
      }
      if (data) {
        if (data.is_banned) {
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
          setProfileLoaded(true);
          setProfileError(null);
          setDashboardMode('auto');
          Alert.alert('Access Denied', 'Your account has been suspended. Please contact support.');
          return null;
        }

        setProfile(data);
        setProfileError(null);
        registerForPushNotificationsAsync(data.id).catch(() => {});
        setProfileLoaded(true);
        return data;
      }
      // data is null with no error — shouldn't happen with .single(), but guard it
      setProfileError('not_found');
      setProfileLoaded(true);
      return null;
    } catch (e) {
      console.warn('fetchProfile exception:', e.message);
      const isTimeout = e.message === 'timeout';
      const isNetwork = e.message?.includes('Network') || e.message?.includes('connect') || e.message?.includes('fetch');

      // Retry on timeout or network errors (up to 3 times total)
      if ((isTimeout || isNetwork) && retryCount < 3) {
        console.log(`fetchProfile: ${isTimeout ? 'request timed out' : 'network error'}, retrying… (attempt ${retryCount + 1})`);
        await new Promise(r => setTimeout(r, TIMEOUTS.RETRY_DELAY_MS));
        return fetchProfile(userId, retryCount + 1, startTime);
      }

      setProfileError(isTimeout || isNetwork ? 'network_error' : 'server_error');
      setProfileLoaded(true);
      return null;
    }
  };

  // LOGOUT: Immediately clear session so App.js switches to AuthNavigator (Login).
  // Never set loading=true here — that would show LoadingScreen and block the transition
  // if the background cleanup hangs. UI must respond instantly.
  // signingOutRef stays TRUE until the user explicitly logs in (via resetSigningOut),
  // blocking any spurious SIGNED_IN events from Supabase autoRefreshToken.
  const signOut = () => {
    signingOutRef.current = true;
    // 1. Immediately clear all state — App.js sees !session → mounts AuthNavigator
    setSession(null);
    setProfile(null);
    setProfileLoaded(false);
    setDashboardMode('auto');
    setRecoveryMode(false);
    setLoading(false);
    // 2. Background cleanup — fire-and-forget, UI is already on Login
    supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    AsyncStorage.getAllKeys()
      .then(keys => {
        const authKeys = keys.filter(k => k.startsWith('sb-') || k.includes('supabase'));
        if (authKeys.length) AsyncStorage.multiRemove(authKeys).catch(() => {});
      })
      .catch(() => {});
    // signingOutRef.current remains true — reset only via resetSigningOut() on next login
  };

  const retryFetchProfile = async (userId) => {
    setProfileError(null);
    setProfileLoaded(false);
    return fetchProfile(userId);
  };

  // Called by LoginScreen after a successful explicit login so that future
  // autoRefreshToken SIGNED_IN events are processed normally.
  const resetSigningOut = () => {
    signingOutRef.current = false;
  };

  const clearRecoveryMode = () => setRecoveryMode(false);

  return (
    <AuthContext.Provider value={{
        session,
        profile,
        loading,
        profileLoaded,
        profileError,
        setSession,
        fetchProfile,
        retryFetchProfile,
        signOut,
        dashboardMode,
        setDashboardMode,
        setProfileError,
        setLoading,
        resetSigningOut,
        recoveryMode,
        clearRecoveryMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);