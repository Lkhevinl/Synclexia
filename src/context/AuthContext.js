import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { registerForPushNotificationsAsync } from '../lib/pushNotificationHelper';
import { navigationRef } from '../navigation/navigationRef';
import { runDiagnostics } from '../lib/diagnostics';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [dashboardMode, setDashboardMode] = useState('auto');
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
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setProfileLoaded(false);
        setDashboardMode('auto');
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
    // Extended to 15-second timeout for better reliability on slow connections
    if (Date.now() - startTime > 15000) {
      console.warn('fetchProfile: timed out after 15s');
      setProfileError('server_error');
      setProfileLoaded(true);
      return null;
    }
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        console.warn('fetchProfile error:', error.message, '| code:', error.code, '| status:', error.status);
        const isInfiniteRecursion = error.code === '42P17' ||
          error.message?.toLowerCase().includes('infinite recursion');
        const isTransient500 = error.status === 500 && !isInfiniteRecursion;

        if (isInfiniteRecursion) {
          setProfileError('server_error');
          setProfileLoaded(true);
          return null;
        }
        if (isTransient500 && retryCount < 3) {
          console.log(`fetchProfile: transient 500, retrying… (attempt ${retryCount + 1})`);
          await new Promise(r => setTimeout(r, 1500));
          return fetchProfile(userId, retryCount + 1, startTime);
        }
        if (isTransient500) {
          setProfileError('server_error');
          setProfileLoaded(true);
          return null;
        }
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
      } else if (retryCount < 3) {
        // Profile may not exist yet (signup race) or network issue — retry up to 3 times
        console.log(`fetchProfile: profile not found, retrying… (attempt ${retryCount + 1})`);
        await new Promise(r => setTimeout(r, 1500));
        return fetchProfile(userId, retryCount + 1, startTime);
      }
      setProfileError('not_found');
      setProfileLoaded(true);
      return null;
    } catch (e) {
      console.warn('fetchProfile exception:', e.message);
      // Check for network-related errors
      if (e.message?.includes('Network') || e.message?.includes('connect') || e.message?.includes('timeout')) {
        console.warn('Network error detected, will retry on user request');
        setProfileError('network_error');
      } else {
        setProfileError('server_error');
      }
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
    // Clear error state and retry
    setProfileError(null);
    setProfileLoaded(false);

    // Run diagnostics first
    console.log('Running diagnostics before retry...');
    await runDiagnostics();

    return fetchProfile(userId);
  };

  // Called by LoginScreen after a successful explicit login so that future
  // autoRefreshToken SIGNED_IN events are processed normally.
  const resetSigningOut = () => {
    signingOutRef.current = false;
  };

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
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);