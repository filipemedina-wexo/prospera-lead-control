import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';

export default function Cadastro() {
  const [empresaNome, setEmpresaNome] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'incorporadora',
          empresa_nome: empresaNome,
          nome: nome,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-screen bg-bg flex items-center justify-center px-4 py-12"
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
          {success ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Cadastro realizado!</h2>
              <p className="text-sm text-text-secondary">
                Verifique seu email para confirmar o cadastro e acessar a plataforma.
              </p>
              <a
                href="#/login"
                className="inline-block mt-6 text-sm text-brand font-medium hover:underline"
              >
                Voltar ao login
              </a>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-text-primary mb-6">
                Cadastre sua Construtora
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Nome da empresa
                  </label>
                  <input
                    type="text"
                    required
                    value={empresaNome}
                    onChange={e => setEmpresaNome(e.target.value)}
                    placeholder="Construtora Exemplo Ltda."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-text-primary placeholder:text-text-muted transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Seu nome
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
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
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
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium bg-brand text-white hover:bg-brand-accent shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading && (
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  Criar conta
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer link */}
        {!success && (
          <p className="text-center text-sm text-text-muted mt-6">
            Já tem uma conta?{' '}
            <a href="#/login" className="text-brand font-medium hover:underline">
              Entrar
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
