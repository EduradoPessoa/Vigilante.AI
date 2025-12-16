'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signInWithMock: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signInWithMock: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      // Check for mock session in localStorage first (persistence for demo)
      const mockStored = localStorage.getItem('vigilante_mock_session');
      if (mockStored) {
        setSession(JSON.parse(mockStored));
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMock = () => {
    const mockSession = {
      user: {
        id: 'mock-user-id-123',
        email: 'demo@vigilante.ai',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
    } as unknown as Session;

    setSession(mockSession);
    localStorage.setItem('vigilante_mock_session', JSON.stringify(mockSession));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    localStorage.removeItem('vigilante_mock_session');
  };

  return (
    <AuthContext.Provider value={{ session, loading, signInWithMock, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
