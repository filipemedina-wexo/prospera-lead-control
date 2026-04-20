import { useState, useEffect, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';

type Stage = 'loading' | 'form' | 'success' | 'error';

export default function AceitarConvite() {
  const [stage, setStage] = useState<Stage>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Supabase automatically picks up the session from the invite link
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        setStage('form');
      } else {
        // Listen for auth state change — Supabase may fire this after parsing the URL fragment
        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
          if (newSession) {
            setSession(newSession);
            setStage('form');
            listener.subscription.unsubscribe();
          }
        });

        // After a short delay, if still no session, show error
        const timer = setTimeout(() => {
          setStage(prev => prev === 'loading' ? 'error' : prev);
          listener.subscription.unsubscribe();
        }, 4000);

        return () => {
          clearTimeout(timer);
          listener.subscription.unsubscribe();
        };
      }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);

    try {
      // Update the password for the already-authenticated user
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;

      // Update the profile nome
      if (session?.user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ nome })
          .eq('id', session.user.id);
        if (profileError) throw profileError;
      }

      setStage('success');
      // Redirect to the app after a brief moment
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-bg flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f0fdf4 100%)',
      }}
    >
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand shadow-sm mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Prospera</h1>
          <p className="text-sm text-text-muted mt-1">Lead Control</p>
        </div>

        {/* Card */}
        <div className="relative rounded-xl border border-white/50 bg-white/70 backdrop-blur-md p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)]">

          {stage === 'loading' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <svg className="h-8 w-8 animate-spin text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-text-secondary">Verificando convite…</p>
            </div>
          )}

          {stage === 'error' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Link inválido ou expirado</h2>
              <p className="text-sm text-text-secondary">
                O link de convite não é mais válido. Solicite um novo convite ao administrador.
              </p>
              <a
                href="#/login"
                className="inline-block mt-6 text-sm text-brand font-medium hover:underline"
              >
                Voltar ao login
              </a>
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Cadastro concluído!</h2>
              <p className="text-sm text-text-secondary">
                Bem-vindo(a) à plataforma. Redirecionando…
              </p>
            </div>
          )}

          {stage === 'form' && (
            <>
              <h2 className="text-lg font-semibold text-text-primary mb-1">Aceitar convite</h2>
              <p className="text-sm text-text-muted mb-6">
                Complete seu cadastro para acessar a plataforma.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="João Silva"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-text-primary placeholder:text-text-muted transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-text-primary placeholder:text-text-muted transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Confirmar senha
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-text-primary placeholder:text-text-muted transition-shadow"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium bg-brand text-white hover:bg-brand-accent shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {submitting && (
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  Concluir cadastro
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
