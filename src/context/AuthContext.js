import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { registerForPushNotificationsAsync } from '../lib/pushNotificationHelper';
import { navigationRef } from '../navigation/navigationRef';

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
    supabase.auth.getSession().then(async ({ data: { session: s }, error }) => {
      if (error) {
        clearStaleSession();
        supabase.auth.signOut().catch(() => {});
        return;
      }
      setSession(s);
      if (s) await fetchProfile(s.user.id);
      else setProfileLoaded(true);
      setLoading(false);
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

  const fetchProfile = async (userId, retryCount = 0) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        console.warn('fetchProfile error:', error.message, '| code:', error.code, '| status:', error.status);
        const isInfiniteRecursion = error.code === '42P17' ||
          error.message?.toLowerCase().includes('infinite recursion');
        const isTransient500 = error.status === 500 && !isInfiniteRecursion;

        if (isInfiniteRecursion) {
          // True DB config error — show error screen immediately
          setProfileError('server_error');
          setProfileLoaded(true);
          return null;
        }
        if (isTransient500 && retryCount < 2) {
          // PostgREST schema cache may need a moment — retry up to 2×
          console.log(`fetchProfile: transient 500, retry ${retryCount + 1}/2…`);
          await new Promise(r => setTimeout(r, 1500 * (retryCount + 1)));
          return fetchProfile(userId, retryCount + 1);
        }
        if (isTransient500) {
          setProfileError('server_error');
          setProfileLoaded(true);
          return null;
        }
      }
      if (data) {
        // Enforce ban at the app level
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
        // Register for push notifications
        registerForPushNotificationsAsync(data.id).catch(() => {});
        setProfileLoaded(true);
        return data;
      } else if (retryCount < 3) {
        // Profile may not exist yet (signup race condition) — retry with delay.
        console.log(`fetchProfile: profile not found, retry ${retryCount + 1}/3...`);
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return fetchProfile(userId, retryCount + 1);
      }
      setProfileError('not_found');
      setProfileLoaded(true);
      return null;
    } catch (e) {
      console.warn('fetchProfile exception:', e.message);
      setProfileError('server_error');
      setProfileLoaded(true);
      return null;
    }
  };

  // LOGOUT: Clear React state first — this immediately changes the
  // NavigationContainer key (via !!session in App.js) which remounts it
  // cleanly on the Login screen. No manual navigation needed.
  const signOut = async () => {
    signingOutRef.current = true;
    setSession(null);
    setProfile(null);
    setProfileLoaded(false);
    setDashboardMode('auto');
    setLoading(false);
    // Background cleanup — don't await, UI is already on Login
    supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    try {
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(k => k.startsWith('sb-') || k.includes('supabase'));
      if (authKeys.length) await AsyncStorage.multiRemove(authKeys);
    } catch (_) {}
    setTimeout(() => { signingOutRef.current = false; }, 2000);
  };

  const resetSigningOut = () => {};

  return (
    <AuthContext.Provider value={{
        session,
        profile,
        loading,
        profileLoaded,
        profileError,
        setSession,
        fetchProfile,
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