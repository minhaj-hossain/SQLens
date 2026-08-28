'use client';
/**
 * AuthProvider — the single owner of the Better Auth session on the client.
 * Extracted verbatim from AppShell (Phase 0). Knows: user, session pending
 * state, role/status fields, signOut(). It never touches learning progress.
 */
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { authClient } from '@/lib/auth-client';

export interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthPending: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Live Better Auth session (cookies → server at /api/auth/*).
  const { data: sessionData, isPending } = authClient.useSession();
  // `useSession()` is not type-inferred without server type generation; cast to
  // the minimal user shape we consume.
  const user: AuthUser | null =
    (sessionData as { user?: AuthUser | null } | null)?.user ?? null;

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const value = useMemo(
    () => ({ user, isAuthPending: isPending, signOut }),
    [user, isPending, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
