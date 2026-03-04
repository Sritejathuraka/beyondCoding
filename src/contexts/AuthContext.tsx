import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type UserRole = 'user' | 'admin' | 'author';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  isAdmin: boolean;
  canWrite: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data as UserProfile;
  };

  useEffect(() => {
    // If Supabase isn't configured, just mark as not loading
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;
    
    // Safety timeout - if nothing responds in 3 seconds, stop loading
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timeout - proceeding without session');
        setLoading(false);
      }
    }, 3000);

    // Set up auth state listener FIRST (this is the reliable source)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        
        clearTimeout(timeout);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile (track loading state)
          setProfileLoading(true);
          fetchProfile(session.user.id).then((userProfile) => {
            if (mounted) {
              setProfile(userProfile);
              setProfileLoading(false);
            }
          }).catch(() => {
            if (mounted) setProfileLoading(false);
          });
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
        
        setLoading(false);
      }
    );

    // Try to get initial session (but don't block on it)
    // The onAuthStateChange callback will fire with the session
    supabase.auth.getSession().catch((err) => {
      console.warn('getSession error (using onAuthStateChange instead):', err);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please set environment variables.') };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please set environment variables.') };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    // Clear demo user or Supabase session
    setUser(null);
    setSession(null);
    setProfile(null);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please set environment variables.') };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  // Check role from profile
  // Only admin users can write/publish articles
  const isAdmin = profile?.role === 'admin';
  const canWrite = isAdmin;

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
    canWrite,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
