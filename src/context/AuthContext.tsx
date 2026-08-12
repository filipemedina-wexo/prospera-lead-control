import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  incorporadora_id: string | null;
  gestora_id: string | null;
  imobiliaria_id: string | null;
  corretor_id: string | null;
  role: 'incorporadora' | 'gestora_lancamentos' | 'imobiliaria' | 'corretor';
  is_superadmin: boolean;
  nome: string | null;
  email: string | null;
}

export interface OperatingOrganization {
  id: string;
  nome: string;
  incorporadora_id: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  /** Identidade autenticada. Nunca é trocada pela visualização operacional. */
  actualProfile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  startOperatingAs: (target: Profile) => Promise<void>;
  startOperatingOrganization: (target: OperatingOrganization) => Promise<void>;
  stopOperatingAs: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const isDemoMode = import.meta.env.VITE_APP_MODE === 'mock' || (import.meta.env.DEV && import.meta.env.VITE_APP_MODE !== 'live');
const demoUser = { id: 'dummy-user', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => isDemoMode ? demoUser : null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [actualProfile, setActualProfile] = useState<Profile | null>(null);
  const [operatingOrganization, setOperatingOrganization] = useState<OperatingOrganization | null>(null);
  const [loading, setLoading] = useState(() => !isDemoMode);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('[AuthContext] Failed to fetch profile:', error.message);
      setProfile(null);
      return;
    }
    const loaded = data as Profile;
    setActualProfile(loaded);
    setProfile(loaded);
    setOperatingOrganization(null);
  }

  useEffect(() => {
    if (isDemoMode) {
      return;
    }

    let active = true;
    const loadingFallback = window.setTimeout(() => {
      if (active) setLoading(false);
    }, 2500);

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      if (!active) return;
      setUser(sessionUser);
      if (sessionUser) void fetchProfile(sessionUser.id);
      setLoading(false);
    }).catch(() => {
      if (active) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) void fetchProfile(sessionUser.id);
      else { setProfile(null); setActualProfile(null); }
      setLoading(false);
    });

    return () => {
      active = false;
      window.clearTimeout(loadingFallback);
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    if (!isDemoMode) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setActualProfile(null);
    setOperatingOrganization(null);
  }

  async function startOperatingAs(target: Profile) {
    if (!actualProfile?.is_superadmin) return;
    const { error } = await supabase.rpc('registrar_operacao_assistida', { p_alvo_id: target.id, p_acao: 'iniciar' });
    if (error) throw error;
    setOperatingOrganization(null);
    setProfile(target);
  }
  async function startOperatingOrganization(target: OperatingOrganization) {
    if (!actualProfile?.is_superadmin) return;
    const { error } = await supabase.rpc('registrar_operacao_assistida_organizacao', { p_incorporadora_id: target.incorporadora_id, p_acao: 'iniciar' });
    if (error) throw error;
    setOperatingOrganization(target);
    setProfile({ id: `organizacao:${target.id}`, incorporadora_id: target.incorporadora_id, gestora_id: null, imobiliaria_id: null, corretor_id: null, role: 'incorporadora', is_superadmin: false, nome: target.nome, email: null });
  }
  async function stopOperatingAs() {
    if (!actualProfile?.is_superadmin) return;
    if (operatingOrganization) {
      const { error } = await supabase.rpc('registrar_operacao_assistida_organizacao', { p_incorporadora_id: operatingOrganization.incorporadora_id, p_acao: 'encerrar' });
      if (error) throw error;
      setOperatingOrganization(null);
      setProfile(actualProfile);
      return;
    }
    if (profile && profile.id !== actualProfile.id) {
      const { error } = await supabase.rpc('registrar_operacao_assistida', { p_alvo_id: profile.id, p_acao: 'encerrar' });
      if (error) throw error;
    }
    setProfile(actualProfile);
  }

  return <AuthContext.Provider value={{ user, profile, actualProfile, loading, signOut, startOperatingAs, startOperatingOrganization, stopOperatingAs }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
