import { Bell, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProfileSwitcher } from '../ui/ProfileSwitcher';

interface LayoutProps { children: React.ReactNode; onMenuToggle?: () => void; sidebarCollapsed?: boolean; }

export function Layout({ children, onMenuToggle, sidebarCollapsed = false }: LayoutProps) {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const { profile } = useAuth();
    const isLiveMode = import.meta.env.PROD && import.meta.env.VITE_APP_MODE !== 'mock';
    const workspaceName = profile?.nome || 'Minha operação';

    return (
        <div className="min-h-screen bg-bg text-text-primary">
            <header className="fixed top-0 left-0 right-0 z-50 h-[68px] border-b border-border bg-bg-surface/95 backdrop-blur-xl">
                <div className={`h-full px-4 md:px-8 flex items-center justify-between gap-4 transition-[margin] duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-56'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={onMenuToggle} className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:bg-bg focus-ring" aria-label="Abrir menu"><Menu size={20} /></button>
                        <div className="hidden sm:block"><p className="text-[10px] mono uppercase tracking-[.18em] text-text-muted">Workspace</p><p className="text-sm font-semibold">{workspaceName}</p></div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <label className="hidden lg:flex items-center gap-2 w-64 px-3 py-2 rounded-lg bg-bg border border-border text-text-muted"><Search size={15} /><input className="bg-transparent outline-none text-xs w-full" placeholder="Buscar lead, conversa..." aria-label="Buscar" /></label>
                        {!isLiveMode && <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:bg-bg focus-ring" aria-label="Notificações"><Bell size={18} /></button>}
                        <div className="h-7 w-px bg-border hidden sm:block" />
                        <ProfileSwitcher />
                    </div>
                </div>
                {!isLiveMode && notificationsOpen && <div className="absolute right-4 top-[60px] w-72 soft-panel p-4"><p className="text-xs font-bold">Atenção operacional</p><p className="text-xs text-text-secondary mt-1">Notificações estão disponíveis no ambiente de demonstração.</p></div>}
            </header>
            <main className="relative z-10 pt-[68px]">{children}</main>
        </div>
    );
}
