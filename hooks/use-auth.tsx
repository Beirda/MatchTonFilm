import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type AuthState = {
  userId: string | null;
  email: string;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ userId: null, email: '', loading: true });

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth.getClaims().then(({ data }) => {
      if (data?.claims) {
        setUserId(data.claims.sub ?? null);
        setEmail(data.claims.email ?? '');
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUserId(null);
        setEmail('');
        return;
      }
      const { data } = await supabase.auth.getClaims();
      if (data?.claims) {
        setUserId(data.claims.sub ?? null);
        setEmail(data.claims.email ?? '');
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ userId, email, loading }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
