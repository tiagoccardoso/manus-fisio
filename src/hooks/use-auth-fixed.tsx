'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isMockMode, mockUser as mockUserData } from '@/lib/auth';
import { Database } from '@/types/database.types';

type AppUser = Database['public']['Tables']['users']['Row'];

type AuthActionResult = { error: Error | null };

export interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string, metadata?: Partial<AppUser>) => Promise<AuthActionResult>;
  resetPassword: (email: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const isUsingMock = isMockMode();

  const createUserProfile = (authUser: Session['user'], metadata?: Partial<AppUser>): AppUser => ({
    id: authUser.id,
    email: authUser.email ?? metadata?.email ?? '',
    full_name:
      metadata?.full_name ??
      (typeof authUser.user_metadata?.full_name === 'string' ? authUser.user_metadata.full_name : null) ??
      authUser.email?.split('@')[0] ??
      'Usuário',
    avatar_url: metadata?.avatar_url ?? null,
    role: metadata?.role ?? 'guest',
    crefito: metadata?.crefito ?? null,
    specialty: metadata?.specialty ?? null,
    university: metadata?.university ?? null,
    semester: metadata?.semester ?? null,
    created_at: metadata?.created_at ?? new Date().toISOString(),
    updated_at: metadata?.updated_at ?? new Date().toISOString(),
  });

  const loadUserProfile = async (authUser: Session['user'] | null, metadata?: Partial<AppUser>) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    setUser((userProfile as AppUser | null) ?? createUserProfile(authUser, metadata));
  };

  const signIn = async (email: string, password: string): Promise<AuthActionResult> => {
    if (isUsingMock) {
      setUser({ ...mockUserData, email } as AppUser);
      setLoading(false);
      return { error: null };
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      return { error };
    }

    setSession(data.session);
    await loadUserProfile(data.user);
    setLoading(false);
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: Partial<AppUser> = {}
  ): Promise<AuthActionResult> => {
    if (isUsingMock) {
      setUser({ ...mockUserData, email, ...metadata } as AppUser);
      setLoading(false);
      return { error: null };
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name,
          role: metadata.role ?? 'guest',
        },
      },
    });

    if (error) {
      setLoading(false);
      return { error };
    }

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: metadata.full_name ?? email.split('@')[0],
        role: metadata.role ?? 'guest',
        avatar_url: metadata.avatar_url ?? null,
        crefito: metadata.crefito ?? null,
        specialty: metadata.specialty ?? null,
        university: metadata.university ?? null,
        semester: metadata.semester ?? null,
      } as any);
      setSession(data.session);
      await loadUserProfile(data.user, { ...metadata, email });
    }

    setLoading(false);
    return { error: null };
  };

  const resetPassword = async (email: string): Promise<AuthActionResult> => {
    if (isUsingMock) {
      return { error: null };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
    });

    return { error };
  };

  const signOut = async (): Promise<AuthActionResult> => {
    if (isUsingMock) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();

    if (!error) {
      setUser(null);
      setSession(null);
    }

    return { error };
  };

  useEffect(() => {
    if (isUsingMock) {
      setUser(mockUserData as AppUser);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Initial load
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession?.user) {
        await loadUserProfile(initialSession.user);
      }
      setLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [isUsingMock]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 