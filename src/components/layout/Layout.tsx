import { Bell, Search, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { ProfileSwitcher } from '../ui/ProfileSwitcher';
import { useApp } from '../../context/AppContext';
import { leads, getEmpreendimento, corretores, performanceMetas } from '../../data/mockData';

interface LayoutProps {
    children: React.ReactNode;
    onMenuToggle?: () => void;
}

// Simula corretor João Mendes
const CORRETOR_ID = 'cor-1';

function getTimeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function NotificationDropdown({ onClose }: { onClose: () => void }) {
    const { profile, setCurrentPage, setSelectedLeadId } = useApp();
    const ref = useRef<HTMLDivElement>(null);

    // Only show notifications for corretor (for now)
    const notifications = profile === 'corretor'
        ? leads
            .filter(l => l.corretorId === CORRETOR_ID && l.status === 'novo')
            .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
            .map(l => ({
                id: l.id,
                title: l.nome,
                subtitle: getEmpreendimento(l.empreendimentoId)?.nome || '',
                time: getTimeAgo(new Date(l.criadoEm)),
                phone: l.telefone,
            }))
        : [];

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const handleOpenLead = (id: string) => {
        setSelectedLeadId(id);
        setCurrentPage('lead-detalhe');
        onClose();
    };

    return (
        <div ref={ref} className="absolute right-0 top-full mt-2 w-80 bg-bg-surface border border-border rounded-xl shadow-xl z-[100] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Notificações</h3>
                {notifications.length > 0 && (
                    <span className="text-xs text-brand font-medium">
                        {notifications.length} novo{notifications.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                        <Bell size={24} className="mx-auto text-text-muted mb-2 opacity-40" />
                        <p className="text-sm text-text-muted">Nenhuma notificação</p>
                    </div>
                ) : (
                    notifications.map((notif, i) => (
                        <button
                            key={notif.id}
                            onClick={() => handleOpenLead(notif.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-brand/5 transition-colors cursor-pointer flex items-start gap-3 ${i < notifications.length - 1 ? 'border-b border-border/50' : ''
                                }`}
                        >
                            {/* Pulse dot */}
                            <div className="mt-1.5 shrink-0">
                                <span className="block w-2 h-2 rounded-full bg-brand shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold truncate">🔔 Novo lead!</p>
                                    <span className="text-xs text-text-muted shrink-0">{notif.time}</span>
                                </div>
                                <p className="text-sm text-text-primary mt-0.5">{notif.title}</p>
                                <p className="text-xs text-text-muted mt-0.5">{notif.subtitle} · {notif.phone}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

export function Layout({ children, onMenuToggle }: LayoutProps) {
    const { profile } = useApp();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAvatarInfo, setShowAvatarInfo] = useState(false);

    // Count for badge
    const newLeadCount = profile === 'corretor'
        ? leads.filter(l => l.corretorId === CORRETOR_ID && l.status === 'novo').length
        : 0;

    const currentCorretor = corretores.find(c => c.id === CORRETOR_ID) || corretores[0];

    return (
        <div className="min-h-screen bg-bg text-text-primary relative selection:bg-brand/20 selection:text-brand">
            {/* Background decorations */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 glass">
                <div className="max-w-[1440px] mx-auto h-full px-3 sm:px-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        {/* Hamburger button — mobile only */}
                        <button
                            onClick={onMenuToggle}
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
                            aria-label="Abrir menu"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-bold text-white">
                                P
                            </div>
                            <span className="font-semibold text-lg tracking-tight hidden sm:inline">Prospera</span>
                        </div>
                        <ProfileSwitcher />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-border text-sm text-text-muted">
                            <Search size={14} />
                            <span>Buscar...</span>
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                className="w-9 h-9 p-0 rounded-full relative"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={18} />
                                {newLeadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1 shadow-sm animate-pulse">
                                        {newLeadCount}
                                    </span>
                                )}
                            </Button>
                            {showNotifications && (
                                <NotificationDropdown onClose={() => setShowNotifications(false)} />
                            )}
                        </div>

                        {/* Avatar with Performance Ring */}
                        <div className="relative ml-1">
                            <div
                                className="relative w-11 h-11 cursor-pointer transition-transform hover:scale-105 duration-200"
                                onClick={() => setShowAvatarInfo(v => !v)}
                                onMouseEnter={() => setShowAvatarInfo(true)}
                                onMouseLeave={() => setShowAvatarInfo(false)}
                            >
                                <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 44 44">
                                    <circle cx="22" cy="22" r="20" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                                    <circle
                                        cx="22" cy="22" r="20"
                                        fill="none"
                                        stroke="#22c55e"
                                        strokeWidth="3"
                                        strokeDasharray={`${2 * Math.PI * 20}`}
                                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - performanceMetas.weeklyGoal / 100)}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center p-[5px]">
                                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-brand to-brand-accent flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-inner relative z-10 border border-white">
                                        {currentCorretor.avatarUrl ? (
                                            <img src={currentCorretor.avatarUrl} alt={currentCorretor.nome} className="w-full h-full object-cover" />
                                        ) : (
                                            currentCorretor.nome.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Popover — visible on hover (desktop) or tap (mobile) */}
                            {showAvatarInfo && (
                                <div className="absolute right-0 top-full mt-3 w-56 bg-white text-slate-800 text-xs rounded-xl p-4 z-50 shadow-2xl border border-slate-100">
                                    <div className="text-center space-y-3">
                                        <div className="flex flex-col items-center">
                                            <p className="font-bold text-sm text-slate-900">{currentCorretor.nome}</p>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Top Performance</p>
                                        </div>
                                        <div className="w-12 h-0.5 bg-brand/20 mx-auto rounded-full" />
                                        <div className="grid grid-cols-2 gap-2 text-left">
                                            <div>
                                                <p className="text-xs text-slate-400">Meta Semanal</p>
                                                <p className="font-bold text-brand">{performanceMetas.weeklyGoal}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400">Pontos XP</p>
                                                <p className="font-bold text-brand">{currentCorretor.pontos}</p>
                                            </div>
                                            <div className="col-span-2 pt-1 border-t border-slate-50 mt-1">
                                                <p className="flex justify-between items-center">
                                                    <span className="text-xs text-slate-400">Ranking Geral</span>
                                                    <span className="font-bold text-amber-500 text-xs">#1 Ouro 🏆</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-full right-4 -mb-1 w-4 h-4 bg-white transform rotate-45 border-t border-l border-slate-100" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 pt-16">
                {children}
            </main>
        </div>
    );
}
