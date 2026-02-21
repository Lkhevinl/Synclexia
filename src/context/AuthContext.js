import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [dashboardMode, setDashboardMode] = useState('auto'); // 'auto', 'student', 'teacher'

  const clearStaleSession = async () => {
    try {
      // Remove all supabase auth keys from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(k => k.startsWith('sb-') || k.includes('supabase'));
      if (authKeys.length) await AsyncStorage.multiRemove(authKeys);
    } catch (_) {}
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  useEffect(() => {
    // 1. Check active session — await profile before clearing loading flag
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        // Invalid / expired refresh token — wipe stored token and sign out
        clearStaleSession();
        supabase.auth.signOut().catch(() => {});
        return;
      }
      setSession(session);
      if (session) await fetchProfile(session.user.id);
      else setProfileLoaded(true);
      setLoading(false);
    });

    // 2. Listen for changes (Login OR Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        // Covers both manual sign-out and failed token refresh
        setSession(null);
        setProfile(null);
        setProfileLoaded(false);
        setDashboardMode('auto');
        setLoading(false);
        return;
      }
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);  // await so profile is set before loading clears
      } else {
        setProfile(null);
        setProfileLoaded(true);
        setDashboardMode('auto');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        console.warn('fetchProfile error:', error.message, '| code:', error.code);
      }
      if (data) setProfile(data);
      return data ?? null;
    } catch (e) {
      console.warn('fetchProfile exception:', e.message);
    } finally {
      setProfileLoaded(true);
    }
    return null;
  };

  // 3. THE NEW LOGOUT FUNCTION
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setProfile(null);
      return true;
    } catch (e) {
      // Still clear state locally even if Supabase logout fails
      setSession(null);
      setProfile(null);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
        session, 
        profile, 
        loading,
        profileLoaded,
        setSession, 
        fetchProfile,
        signOut,
        dashboardMode,
        setDashboardMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);