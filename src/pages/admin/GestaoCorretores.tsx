import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Search, Store, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

type Broker = { id: string; nome: string; email: string | null; ativo: boolean; criado_em: string; imobiliarias: { nome: string } | null; gestoras_lancamentos: { nome: string } | null };

export function GestaoCorretores() {
    const { setCurrentPage } = useApp();
    const [items, setItems] = useState<Broker[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        async function load() {
            const { data, error: queryError } = await supabase.from('corretores')
                .select('id,nome,email,ativo,criado_em,imobiliarias(nome),gestoras_lancamentos(nome)').order('nome');
            if (!active) return;
            if (queryError) setError(queryError.message); else setItems((data || []) as Broker[]);
            setLoading(false);
        }
        void load(); return () => { active = false; };
    }, []);

    const filtered = useMemo(() => items.filter(item => `${item.nome} ${item.email || ''}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
    return <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"><div><h1 className="text-3xl font-bold tracking-tight">Diretório: Corretores</h1><p className="text-text-secondary mt-1">Acessos e responsáveis operacionais reais da plataforma.</p></div><Button className="w-full sm:w-auto" onClick={() => setCurrentPage('admin-incorporadoras')}><Users size={18} className="mr-2" /> Convidar corretor</Button></div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Não foi possível carregar o diretório: {error}</div>}
        <Card className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} /><input type="search" placeholder="Buscar corretor por nome ou e-mail..." value={search} onChange={event => setSearch(event.target.value)} className="w-full bg-black/5 border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-brand/50" /></div></Card>
        <div className="bg-bg-surface border border-border rounded-xl overflow-hidden min-h-[240px]"><div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-black/5 border-b border-border text-sm"><th className="px-6 py-4 font-semibold text-text-secondary">Corretor</th><th className="px-6 py-4 font-semibold text-text-secondary">E-mail</th><th className="px-6 py-4 font-semibold text-text-secondary">Operação</th><th className="px-6 py-4 font-semibold text-text-secondary">Status</th></tr></thead><tbody className="divide-y divide-border">{loading ? <tr><td colSpan={4} className="py-10 text-center"><LoaderCircle className="animate-spin inline text-text-muted" /></td></tr> : filtered.length ? filtered.map(item => <tr key={item.id} className="hover:bg-black/5"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center"><Users size={16} className="text-purple-500" /></div><span className="font-semibold">{item.nome}</span></div></td><td className="px-6 py-4 text-sm text-text-muted">{item.email || 'Não informado'}</td><td className="px-6 py-4 text-sm"><span className="inline-flex gap-2 items-center text-text-secondary"><Store size={14} className="text-indigo-500" />{item.imobiliarias?.nome || item.gestoras_lancamentos?.nome || 'Sem vínculo'}</span></td><td className="px-6 py-4"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${item.ativo ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'}`}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td></tr>) : <tr><td colSpan={4} className="py-10 text-center text-sm text-text-muted">Nenhum corretor encontrado.</td></tr>}</tbody></table></div></div>
    </div>;
}
