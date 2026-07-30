import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TourProvider } from './context/TourContext';
import { Layout } from './components/layout/Layout';
import { Sidebar } from './components/layout/Sidebar';
import { TourOverlay } from './components/layout/TourOverlay';

// Admin SaaS pages
import { DashboardAdmin } from './pages/admin/DashboardAdmin';
import { GestaoIncorporadoras } from './pages/admin/GestaoIncorporadoras';
import { GestaoImobiliarias } from './pages/admin/GestaoImobiliarias';
import { GestaoCorretores } from './pages/admin/GestaoCorretores';

// Incorporadora pages
import { DashboardIncorporadora } from './pages/incorporadora/DashboardIncorporadora';
import { LeadsIncorporadora } from './pages/incorporadora/LeadsIncorporadora';
import { GestaoEmpreendimentos } from './pages/incorporadora/GestaoEmpreendimentos';
import { NovoEmpreendimento } from './pages/incorporadora/NovoEmpreendimento';
import { Imobiliarias } from './pages/incorporadora/Imobiliarias';
import { CampanhasIncorporadora } from './pages/incorporadora/CampanhasIncorporadora';
import { CampanhaDetalhe } from './pages/incorporadora/CampanhaDetalhe';
import { AvisosIncorporadora } from './pages/incorporadora/AvisosIncorporadora';
import { SalaSorteio } from './pages/incorporadora/SalaSorteio';
import { ConfiguracoesIncorporadora } from './pages/incorporadora/ConfiguracoesIncorporadora';

// Imobiliária pages
import { DashboardImobiliaria } from './pages/imobiliaria/DashboardImobiliaria';
import { LeadsImobiliaria } from './pages/imobiliaria/LeadsImobiliaria';
import { Corretores } from './pages/imobiliaria/Corretores';
import { RoletaLeads } from './pages/imobiliaria/RoletaLeads';
import { ConfiguracoesImobiliaria } from './pages/imobiliaria/ConfiguracoesImobiliaria';

// Corretor pages
import { DashboardCorretor } from './pages/corretor/DashboardCorretor';
import { MeusLeads } from './pages/corretor/MeusLeads';
import { LeadDetalhe } from './pages/corretor/LeadDetalhe';
import { ConfiguracoesCorretor } from './pages/corretor/ConfiguracoesCorretor';

// Auth pages
import Login from './pages/auth/Login';
import Cadastro from './pages/auth/Cadastro';
import AceitarConvite from './pages/auth/AceitarConvite';
import { Onboarding } from './pages/onboarding/Onboarding';
import { Academia } from './pages/shared/Academia';
import { CatalogoEmpreendimentos } from './pages/shared/CatalogoEmpreendimentos';
import { EmpreendimentoDetalhe } from './pages/shared/EmpreendimentoDetalhe';

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

    if (currentPage === 'onboarding') {
        return <Onboarding />;
    }
    
    if (currentPage === 'academia') {
        return <Academia />;
    }

    if (currentPage === 'empreendimento-detalhe') {
        return <EmpreendimentoDetalhe />;
    }

    if (profile === 'admin') {
        switch (currentPage) {
            case 'admin-dashboard': return <DashboardAdmin />;
            case 'admin-incorporadoras': return <GestaoIncorporadoras />;
            case 'admin-imobiliarias': return <GestaoImobiliarias />;
            case 'admin-corretores': return <GestaoCorretores />;
            default: return <DashboardAdmin />;
        }
    }

    if (profile === 'incorporadora') {
        switch (currentPage) {
            case 'dashboard': return <DashboardIncorporadora />;
            case 'leads': return <LeadsIncorporadora />;
            case 'campanhas': return <CampanhasIncorporadora />;
            case 'campanha-detalhe': return <CampanhaDetalhe />;
            case 'avisos': return <AvisosIncorporadora />;
            case 'sorteio': return <SalaSorteio />;
            case 'empreendimentos': return <GestaoEmpreendimentos />;
            case 'novo-empreendimento': return <NovoEmpreendimento />;
            case 'imobiliarias': return <Imobiliarias />;
            case 'configuracoes': return <ConfiguracoesIncorporadora />;
            default: return <DashboardIncorporadora />;
        }
    }

    if (profile === 'imobiliaria') {
        switch (currentPage) {
            case 'dashboard': return <DashboardImobiliaria />;
            case 'leads': return <LeadsImobiliaria />;
            case 'empreendimentos': return <CatalogoEmpreendimentos />;
            case 'corretores': return <Corretores />;
            case 'distribuicao': return <RoletaLeads />;
            case 'configuracoes': return <ConfiguracoesImobiliaria />;
            default: return <DashboardImobiliaria />;
        }
    }

    if (profile === 'corretor') {
        switch (currentPage) {
            case 'dashboard': return <DashboardCorretor />;
            case 'meus-leads': return <MeusLeads />;
            case 'meus-empreendimentos': return <CatalogoEmpreendimentos />;
            case 'lead-detalhe': return <LeadDetalhe />;
            case 'empreendimento-detalhe': return <EmpreendimentoDetalhe />;
            case 'configuracoes': return <ConfiguracoesCorretor />;
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
            <TourOverlay />
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
            <TourProvider>
                <AppContent />
            </TourProvider>
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
