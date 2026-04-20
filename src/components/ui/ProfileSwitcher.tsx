import { Building2, Store, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { type UserProfile } from '../../data/mockData';
import { cn } from '../../lib/utils';

const profiles: { id: UserProfile; label: string; icon: React.ReactNode }[] = [
    { id: 'incorporadora', label: 'Incorporadora', icon: <Building2 size={14} /> },
    { id: 'imobiliaria', label: 'Imobiliária', icon: <Store size={14} /> },
    { id: 'corretor', label: 'Corretor', icon: <User size={14} /> },
];

export function ProfileSwitcher() {
    const { profile, setProfile } = useApp();

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
