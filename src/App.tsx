import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Sidebar } from './components/layout/Sidebar';

// Incorporadora pages
import { DashboardIncorporadora } from './pages/incorporadora/DashboardIncorporadora';
import { LeadsIncorporadora } from './pages/incorporadora/LeadsIncorporadora';
import { Empreendimentos } from './pages/incorporadora/Empreendimentos';
import { Imobiliarias } from './pages/incorporadora/Imobiliarias';

// Imobiliária pages
import { DashboardImobiliaria } from './pages/imobiliaria/DashboardImobiliaria';
import { LeadsImobiliaria } from './pages/imobiliaria/LeadsImobiliaria';
import { Corretores } from './pages/imobiliaria/Corretores';
import { EmpreendimentosImobiliaria } from './pages/imobiliaria/EmpreendimentosImobiliaria';
import { RoletaLeads } from './pages/imobiliaria/RoletaLeads';

// Corretor pages
import { DashboardCorretor } from './pages/corretor/DashboardCorretor';
import { MeusLeads } from './pages/corretor/MeusLeads';
import { MeusEmpreendimentos } from './pages/corretor/MeusEmpreendimentos';
import { LeadDetalhe } from './pages/corretor/LeadDetalhe';
import { EmpreendimentoDetalhe } from './pages/corretor/EmpreendimentoDetalhe';

import { ConfiguracoesPage } from './pages/Configuracoes';

// Auth pages
import Login from './pages/auth/Login';
import Cadastro from './pages/auth/Cadastro';
import AceitarConvite from './pages/auth/AceitarConvite';

// Public pages
import { ApresentacaoImovel } from './pages/cliente/ApresentacaoImovel';

// ─── Loading spinner ────────────────────────────────────────────────────────

function FullPageSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg">
            <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>
    );
}

// ─── Page router ────────────────────────────────────────────────────────────

function PageRouter() {
    const { profile, currentPage } = useApp();

    if (profile === 'incorporadora') {
        switch (currentPage) {
            case 'dashboard': return <DashboardIncorporadora />;
            case 'leads': return <LeadsIncorporadora />;
            case 'empreendimentos': return <Empreendimentos />;
            case 'imobiliarias': return <Imobiliarias />;
            case 'configuracoes': return <ConfiguracoesPage />;
            default: return <DashboardIncorporadora />;
        }
    }

    if (profile === 'imobiliaria') {
        switch (currentPage) {
            case 'dashboard': return <DashboardImobiliaria />;
            case 'leads': return <LeadsImobiliaria />;
            case 'empreendimentos': return <EmpreendimentosImobiliaria />;
            case 'corretores': return <Corretores />;
            case 'distribuicao': return <RoletaLeads />;
            case 'configuracoes': return <ConfiguracoesPage />;
            default: return <DashboardImobiliaria />;
        }
    }

    if (profile === 'corretor') {
        switch (currentPage) {
            case 'dashboard': return <DashboardCorretor />;
            case 'meus-leads': return <MeusLeads />;
            case 'meus-empreendimentos': return <MeusEmpreendimentos />;
            case 'lead-detalhe': return <LeadDetalhe />;
            case 'empreendimento-detalhe': return <EmpreendimentoDetalhe />;
            case 'configuracoes': return <ConfiguracoesPage />;
            default: return <DashboardCorretor />;
        }
    }

    return <DashboardIncorporadora />;
}

function AppContent() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    return (
        <Layout onMenuToggle={() => setSidebarMobileOpen(true)}>
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={sidebarMobileOpen}
                onMobileClose={() => setSidebarMobileOpen(false)}
            />
            <div className={sidebarCollapsed ? 'md:ml-16 transition-all duration-300' : 'md:ml-56 transition-all duration-300'}>
                <div className="max-w-[1280px] mx-auto p-4 md:p-6">
                    <PageRouter />
                </div>
            </div>
        </Layout>
    );
}

// ─── Auth gate — decides what to render after auth loads ────────────────────

function AppWithAuth() {
    const { user, profile: authProfile, loading } = useAuth();
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const update = () => setHash(window.location.hash);
        window.addEventListener('hashchange', update);
        return () => window.removeEventListener('hashchange', update);
    }, []);

    // Public property presentation (no auth required)
    if (hash.startsWith('#/apresentacao/')) {
        const token = hash.replace('#/apresentacao/', '');
        return <ApresentacaoImovel token={token} />;
    }

    // Auth pages (always accessible regardless of login state)
    if (hash === '#/cadastro') return <Cadastro />;
    if (hash === '#/aceitar-convite') return <AceitarConvite />;

    // Waiting for Supabase session to load
    if (loading) return <FullPageSpinner />;

    // Not authenticated → show login
    if (!user) return <Login />;

    // Authenticated → show main app, initialize profile from auth data
    const defaultProfile = (authProfile?.role ?? 'incorporadora') as 'incorporadora' | 'imobiliaria' | 'corretor';

    return (
        <AppProvider defaultProfile={defaultProfile}>
            <AppContent />
        </AppProvider>
    );
}

// ─── Root ───────────────────────────────────────────────────────────────────

export default function App() {
    return (
        <AuthProvider>
            <AppWithAuth />
        </AuthProvider>
    );
}
