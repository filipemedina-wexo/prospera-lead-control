import { Building2, ChevronDown, LogOut, Shield, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth, type Profile } from '../../context/AuthContext';
import { type UserProfile } from '../../data/mockData';
import { supabase } from '../../lib/supabase';

type ProfileTarget = Profile;

const labels: Record<UserProfile, string> = {
  admin: 'Central Prospera', incorporadora: 'Incorporadora', gestora_lancamentos: 'Gestora de Lançamentos', imobiliaria: 'Imobiliária', corretor: 'Corretor',
};

export function ProfileSwitcher() {
  const { profile: view, setProfile, setCurrentPage } = useApp();
  const { profile, actualProfile, signOut, startOperatingAs, stopOperatingAs } = useAuth();
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<ProfileTarget[]>([]);
  const live = import.meta.env.PROD && import.meta.env.VITE_APP_MODE !== 'mock';

  useEffect(() => {
    if (!live || !actualProfile?.is_superadmin) return;
    supabase.from('profiles').select('id, incorporadora_id, gestora_id, imobiliaria_id, corretor_id, role, is_superadmin, nome, email').order('nome')
      .then(({ data }) => setTargets((data || []) as ProfileTarget[]));
  }, [live, actualProfile?.is_superadmin]);

  if (!live) return <div className="flex items-center bg-black/5 rounded-lg p-0.5 gap-0.5">{Object.entries(labels).map(([id, label]) => <button key={id} onClick={() => setProfile(id as UserProfile)} className={`px-2 py-1.5 text-xs rounded-md ${view === id ? 'bg-white shadow-sm text-brand' : 'text-text-muted'}`}>{label}</button>)}</div>;

  const assume = async (target: ProfileTarget) => {
    try {
      await startOperatingAs(target);
      setProfile(target.is_superadmin ? 'admin' : target.role as UserProfile);
      setOpen(false);
    } catch (error) {
      console.error('[ProfileSwitcher] Não foi possível registrar operação assistida', error);
    }
  };
  const operatingSomeoneElse = Boolean(actualProfile?.is_superadmin && profile?.id !== actualProfile.id);

  return <div className="relative flex items-center gap-1">
    <button onClick={() => setOpen(value => !value)} className="h-9 flex items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-text-secondary hover:bg-black/5 focus-ring" aria-expanded={open}>
      {actualProfile?.is_superadmin ? <Shield size={16} className="text-brand" /> : <UserRound size={16} />}<span className="hidden sm:inline max-w-44 truncate">{operatingSomeoneElse ? `Operando como ${profile?.nome || profile?.email}` : profile?.nome || 'Minha conta'}</span><ChevronDown size={14} />
    </button>
    {open && <div className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-border bg-bg-surface p-2 shadow-xl">
      <div className="px-3 py-2 border-b border-border mb-1"><p className="text-xs font-bold truncate">{actualProfile?.nome || 'Minha conta'}</p><p className="text-[11px] text-text-muted truncate">{actualProfile?.email || ''}</p></div>
      {actualProfile?.is_superadmin && <>
        <p className="px-3 pt-1 pb-1.5 text-[10px] mono uppercase tracking-wider text-brand">Operação assistida</p>
        <button onClick={() => { void stopOperatingAs().then(() => { setProfile('admin'); setOpen(false); }).catch(error => console.error('[ProfileSwitcher] Não foi possível encerrar operação assistida', error)); }} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left hover:bg-bg text-text-secondary"><Shield size={15} />Voltar à Central Prospera</button>
        <div className="max-h-52 overflow-y-auto mt-1 border-t border-border pt-1">{targets.filter(target => !target.is_superadmin).map(target => <button key={target.id} onClick={() => void assume(target)} className={`w-full flex flex-col rounded-lg px-3 py-2 text-left hover:bg-bg ${profile?.id === target.id ? 'bg-brand/10 text-brand' : 'text-text-secondary'}`}><span className="text-xs font-semibold truncate w-full">{target.nome || target.email || 'Usuário sem nome'}</span><span className="text-[10px] text-text-muted truncate w-full">{labels[target.role as UserProfile]} · {target.email || ''}</span></button>)}</div>
      </>}
      <div className="border-t border-border mt-2 pt-2"><button onClick={() => { setCurrentPage('configuracoes'); setOpen(false); }} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left text-text-secondary hover:bg-bg"><Building2 size={15} />Meu perfil e conta</button><button onClick={() => void signOut()} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50"><LogOut size={15} />Sair</button></div>
    </div>}
  </div>;
}
