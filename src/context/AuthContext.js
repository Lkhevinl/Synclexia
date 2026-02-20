import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardMode, setDashboardMode] = useState('auto'); // 'auto', 'student', 'teacher'

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    // 2. Listen for changes (Login OR Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null); // Clear profile on logout
        setDashboardMode('auto'); // Reset mode only on logout
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data);
    } catch (e) {
      // Profile fetch failed silently — session still valid
    }
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
        setSession, 
        fetchProfile,
        signOut, // <--- Expose this to the app
        dashboardMode,
        setDashboardMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);