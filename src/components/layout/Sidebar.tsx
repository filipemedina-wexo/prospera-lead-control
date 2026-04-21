import {
    LayoutDashboard,
    Users,
    Building2,
    Store,
    Settings,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    X,
    Shuffle,
} from 'lucide-react';
import { useApp, type PageId } from '../../context/AppContext';
import { type UserProfile } from '../../data/mockData';
import { cn } from '../../lib/utils';
import { type LucideIcon } from 'lucide-react';

interface NavItem {
    icon: LucideIcon;
    label: string;
    id: PageId;
}

const navByProfile: Record<UserProfile, NavItem[]> = {
    incorporadora: [
        { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
        { icon: ClipboardList, label: 'Leads', id: 'leads' },
        { icon: Building2, label: 'Empreendimentos', id: 'empreendimentos' },
        { icon: Store, label: 'Imobiliárias', id: 'imobiliarias' },
        { icon: Settings, label: 'Configurações', id: 'configuracoes' },
    ],
    imobiliaria: [
        { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
        { icon: ClipboardList, label: 'Leads', id: 'leads' },
        { icon: Building2, label: 'Empreendimentos', id: 'empreendimentos' },
        { icon: Users, label: 'Corretores', id: 'corretores' },
        { icon: Shuffle, label: 'Distribuição', id: 'distribuicao' },
    ],
    corretor: [
        { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
        { icon: ClipboardList, label: 'Meus Leads', id: 'meus-leads' },
        { icon: Building2, label: 'Empreendimentos', id: 'meus-empreendimentos' },
    ],
};

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
    const { profile, currentPage, setCurrentPage } = useApp();
    const items = navByProfile[profile];

    const handleNavClick = (id: PageId) => {
        setCurrentPage(id);
        onMobileClose(); // Close drawer on mobile after navigation
    };

    return (
        <>
            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-border bg-bg-surface/95 backdrop-blur-xl transition-all duration-300',
                    // Desktop behavior
                    'md:translate-x-0',
                    collapsed ? 'md:w-16' : 'md:w-56',
                    // Mobile behavior
                    mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 md:w-auto'
                )}
            >
                {/* Mobile close button */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border md:hidden">
                    <span className="font-semibold text-sm text-text-secondary uppercase tracking-wider">Menu</span>
                    <button
                        onClick={onMobileClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={cn(
                                    'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer overflow-hidden',
                                    isActive
                                        ? 'bg-brand/10 text-brand'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
                                )}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-brand rounded-r-full" />
                                )}
                                <Icon
                                    size={20}
                                    className={cn(
                                        'shrink-0 transition-colors',
                                        isActive ? 'text-brand' : 'text-text-muted group-hover:text-text-primary'
                                    )}
                                />
                                {/* On mobile always show label; on desktop respect collapsed state */}
                                <span className={cn('truncate', collapsed ? 'md:hidden' : '')}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* Desktop collapse toggle — hidden on mobile */}
                <div className="p-2 border-t border-border hidden md:block">
                    <button
                        onClick={onToggle}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors text-sm cursor-pointer"
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        {!collapsed && <span>Recolher</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
