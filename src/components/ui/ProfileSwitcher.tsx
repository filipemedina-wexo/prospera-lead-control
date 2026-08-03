import { Building2, Store, User, Shield, Network, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { type UserProfile } from '../../data/mockData';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const profiles: { id: UserProfile; label: string; icon: React.ReactNode }[] = [
    { id: 'admin', label: 'Prospera (SaaS)', icon: <Shield size={14} /> },
    { id: 'incorporadora', label: 'Incorporadora', icon: <Building2 size={14} /> },
    { id: 'gestora_lancamentos', label: 'Gestora de Lançamentos', icon: <Network size={14} /> },
    { id: 'imobiliaria', label: 'Imobiliária', icon: <Store size={14} /> },
    { id: 'corretor', label: 'Corretor', icon: <User size={14} /> },
];

export function ProfileSwitcher() {
    const { profile, setProfile } = useApp();
    const { signOut } = useAuth();
    const isLiveMode = import.meta.env.VITE_APP_MODE === 'live';
    const activeProfile = profiles.find((item) => item.id === profile);

    if (isLiveMode) {
        return <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 text-xs font-medium text-text-secondary">{activeProfile?.icon}<span>{activeProfile?.label}</span></span>
            <button onClick={() => void signOut()} className="w-9 h-9 rounded-lg text-text-secondary hover:bg-black/5 focus-ring flex items-center justify-center" title="Sair" aria-label="Sair"><LogOut size={16} /></button>
        </div>;
    }

    return (
        <div className="flex items-center bg-black/5 rounded-lg p-0.5 gap-0.5">
            {profiles.map((p) => (
                <button
                    key={p.id}
                    onClick={() => setProfile(p.id)}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer',
                        profile === p.id
                            ? 'bg-bg-surface text-brand shadow-sm'
                            : 'text-text-muted hover:text-text-secondary'
                    )}
                >
                    {p.icon}
                    <span className="hidden sm:inline">{p.label}</span>
                </button>
            ))}
        </div>
    );
}
