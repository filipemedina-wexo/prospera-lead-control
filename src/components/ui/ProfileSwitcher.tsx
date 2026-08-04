import { Building2, ChevronDown, LogOut, Network, Shield, Store, User, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { type UserProfile } from '../../data/mockData';

const profiles: { id: UserProfile; label: string; icon: React.ReactNode }[] = [
  { id: 'admin', label: 'Central Prospera', icon: <Shield size={15} /> },
  { id: 'incorporadora', label: 'Incorporadora', icon: <Building2 size={15} /> },
  { id: 'gestora_lancamentos', label: 'Gestora de Lançamentos', icon: <Network size={15} /> },
  { id: 'imobiliaria', label: 'Imobiliária', icon: <Store size={15} /> },
  { id: 'corretor', label: 'Corretor', icon: <User size={15} /> },
];

export function ProfileSwitcher() {
  const { profile: view, setProfile, setCurrentPage } = useApp();
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const live = import.meta.env.PROD && import.meta.env.VITE_APP_MODE !== 'mock';
  const active = profiles.find(item => item.id === view) || profiles[1];
  const options = profile?.is_superadmin ? profiles : profiles.filter(item => item.id === view);

  if (!live) return <div className="flex items-center bg-black/5 rounded-lg p-0.5 gap-0.5">{profiles.map(item => <button key={item.id} onClick={() => setProfile(item.id)} className={`px-2 py-1.5 text-xs rounded-md ${view === item.id ? 'bg-white shadow-sm text-brand' : 'text-text-muted'}`}>{item.label}</button>)}</div>;

  return <div className="relative flex items-center gap-1">
    <button onClick={() => setOpen(value => !value)} className="h-9 flex items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-text-secondary hover:bg-black/5 focus-ring" aria-expanded={open}>
      {profile?.is_superadmin ? <Shield size={16} className="text-brand" /> : <UserRound size={16} />}<span className="hidden sm:inline max-w-32 truncate">{profile?.is_superadmin ? active.label : profile?.nome || 'Minha conta'}</span><ChevronDown size={14} />
    </button>
    {open && <div className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-border bg-bg-surface p-2 shadow-xl">
      <div className="px-3 py-2 border-b border-border mb-1"><p className="text-xs font-bold truncate">{profile?.nome || 'Minha conta'}</p><p className="text-[11px] text-text-muted truncate">{profile?.email || ''}</p></div>
      {profile?.is_superadmin && <><p className="px-3 pt-1 pb-1.5 text-[10px] mono uppercase tracking-wider text-brand">Modo de visualização</p>{options.map(item => <button key={item.id} onClick={() => { setProfile(item.id); setOpen(false); }} className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left ${view === item.id ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-bg text-text-secondary'}`}>{item.icon}{item.label}</button>)}</>}
      <div className="border-t border-border mt-2 pt-2"><button onClick={() => { setCurrentPage('configuracoes'); setOpen(false); }} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left text-text-secondary hover:bg-bg"><UserRound size={15} />Meu perfil e conta</button><button onClick={() => void signOut()} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50"><LogOut size={15} />Sair</button></div>
    </div>}
  </div>;
}
