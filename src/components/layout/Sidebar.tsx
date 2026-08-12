import { Building2, ChevronLeft, ChevronRight, ClipboardList, GraduationCap, Info, LayoutDashboard, Megaphone, Settings, Store, Trophy, Users, X, Shuffle, Network, Home } from 'lucide-react';
import { useApp, type PageId } from '../../context/AppContext';
import { type UserProfile } from '../../data/mockData';
import { cn } from '../../lib/utils';
import { type LucideIcon } from 'lucide-react';

interface NavItem { icon: LucideIcon; label: string; id: PageId; }
const navByProfile: Record<UserProfile, NavItem[]> = {
    admin: [{ icon: LayoutDashboard, label: 'Cockpit', id: 'admin-dashboard' }, { icon: Building2, label: 'Incorporadoras', id: 'admin-incorporadoras' }, { icon: Store, label: 'Imobiliárias', id: 'admin-imobiliarias' }, { icon: Users, label: 'Corretores', id: 'admin-corretores' }, { icon: Megaphone, label: 'Captação', id: 'captacao' }],
    incorporadora: [{ icon: LayoutDashboard, label: 'Cockpit', id: 'dashboard' }, { icon: ClipboardList, label: 'Leads', id: 'leads' }, { icon: Trophy, label: 'Campanhas', id: 'campanhas' }, { icon: Building2, label: 'Empreendimentos', id: 'empreendimentos' }, { icon: Store, label: 'Imobiliárias', id: 'imobiliarias' }, { icon: Megaphone, label: 'Avisos', id: 'avisos' }, { icon: GraduationCap, label: 'Academia', id: 'academia' as PageId }, { icon: Settings, label: 'Configurações', id: 'configuracoes' }, { icon: Info, label: 'Onboarding', id: 'onboarding' as PageId }],
    gestora_lancamentos: [{ icon: LayoutDashboard, label: 'Cockpit', id: 'dashboard' }, { icon: ClipboardList, label: 'Leads', id: 'leads' }, { icon: Building2, label: 'Lançamentos', id: 'empreendimentos' }, { icon: Home, label: 'Minha house', id: 'corretores' }, { icon: Network, label: 'Imobiliárias parceiras', id: 'imobiliarias' }, { icon: Shuffle, label: 'Distribuição', id: 'distribuicao' }, { icon: Trophy, label: 'Campanhas', id: 'campanhas' }, { icon: Settings, label: 'Configurações', id: 'configuracoes' }],
    imobiliaria: [{ icon: LayoutDashboard, label: 'Cockpit', id: 'dashboard' }, { icon: ClipboardList, label: 'Leads', id: 'leads' }, { icon: Building2, label: 'Empreendimentos', id: 'empreendimentos' }, { icon: Users, label: 'Corretores', id: 'corretores' }, { icon: Shuffle, label: 'Distribuição', id: 'distribuicao' }, { icon: GraduationCap, label: 'Academia', id: 'academia' as PageId }, { icon: Settings, label: 'Configurações', id: 'configuracoes' }],
    corretor: [{ icon: LayoutDashboard, label: 'Cockpit', id: 'dashboard' }, { icon: ClipboardList, label: 'Meus leads', id: 'meus-leads' }, { icon: Building2, label: 'Empreendimentos', id: 'meus-empreendimentos' }, { icon: GraduationCap, label: 'Academia', id: 'academia' as PageId }, { icon: Settings, label: 'Configurações', id: 'configuracoes' }],
};

interface SidebarProps { collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onMobileClose: () => void; }
export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
    const { profile, currentPage, setCurrentPage } = useApp();
    const isLiveMode = import.meta.env.PROD && import.meta.env.VITE_APP_MODE !== 'mock';
    const liveNav: Partial<Record<UserProfile, NavItem[]>> = {
        admin: navByProfile.admin,
        incorporadora: [{ icon: LayoutDashboard, label: 'Cockpit', id: 'dashboard' }, { icon: ClipboardList, label: 'Leads', id: 'leads' }, { icon: Building2, label: 'Empreendimentos', id: 'empreendimentos' }, { icon: Megaphone, label: 'Captação', id: 'captacao' }],
        gestora_lancamentos: [
            { icon: LayoutDashboard, label: 'Cockpit', id: 'dashboard' },
            { icon: ClipboardList, label: 'Leads', id: 'leads' },
            { icon: Shuffle, label: 'Distribuição', id: 'distribuicao' },
        ],
        imobiliaria: [
            { icon: LayoutDashboard, label: 'Cockpit', id: 'dashboard' },
            { icon: ClipboardList, label: 'Leads', id: 'leads' },
        ],
        corretor: [{ icon: ClipboardList, label: 'Meus leads', id: 'meus-leads' }],
    };
    const visibleNav = isLiveMode ? (liveNav[profile] || []) : navByProfile[profile];
    return <>
        {mobileOpen && <div className="fixed inset-0 z-30 bg-[#242129]/55 md:hidden" onClick={onMobileClose} />}
        <aside className={cn('fixed left-0 top-[68px] bottom-0 z-40 flex flex-col bg-[#242129] text-white transition-all duration-300', 'md:top-0 md:translate-x-0', collapsed ? 'md:w-16' : 'md:w-56', mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 md:w-auto')}>
            <div className="h-[68px] px-4 flex items-center justify-between border-b border-white/10">
                <div className={cn('flex items-center gap-3 min-w-0', collapsed ? 'md:justify-center md:w-full' : '')}><div className="w-9 h-9 shrink-0 rounded-xl bg-[#7869c9] flex items-center justify-center font-extrabold">L</div><div className={collapsed ? 'md:hidden' : ''}><p className="font-bold tracking-tight">Lead Control</p><p className="text-[9px] mono uppercase tracking-[.16em] text-white/45">CRM operacional</p></div></div>
                <button onClick={onMobileClose} className="md:hidden text-white/50 hover:text-white" aria-label="Fechar menu"><X size={18} /></button>
            </div>
            <div className={cn('px-3 pt-6 pb-2 text-[9px] mono uppercase tracking-[.2em] text-white/35', collapsed ? 'md:hidden' : '')}>Navegação</div>
            <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
                {visibleNav.map(({ icon: Icon, label, id }) => <button key={id} onClick={() => { setCurrentPage(id); onMobileClose(); }} className={cn('relative w-full min-h-10 flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors focus-ring', currentPage === id ? 'bg-[#40374d] text-white' : 'text-white/55 hover:text-white hover:bg-white/[.06]', collapsed ? 'md:justify-center' : '')} aria-label={collapsed ? label : undefined} aria-current={currentPage === id ? 'page' : undefined}><Icon size={17} strokeWidth={1.8} className="shrink-0" /><span className={collapsed ? 'md:hidden' : ''}>{label}</span>{currentPage === id && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#a69ae4]" />}</button>)}
            </nav>
            <div className="p-2 border-t border-white/10 hidden md:block"><button onClick={onToggle} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} className="w-full min-h-10 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/45 hover:text-white hover:bg-white/[.06] text-xs focus-ring">{collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Recolher menu</span></>}</button></div>
        </aside>
    </>;
}
