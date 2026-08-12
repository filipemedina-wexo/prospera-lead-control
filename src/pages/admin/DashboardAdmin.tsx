import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Building2, LoaderCircle, Store, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';

type Metrics = { leadsMes: number; organizacoes: number; imobiliarias: number; corretoresAtivos: number; semPrimeiroAtendimento: number };
const emptyMetrics: Metrics = { leadsMes: 0, organizacoes: 0, imobiliarias: 0, corretoresAtivos: 0, semPrimeiroAtendimento: 0 };

export function DashboardAdmin() {
    const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const inicioMes = new Date();
        inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);
        async function load() {
            setLoading(true); setError(null);
            const [leadsMes, organizacoes, imobiliarias, corretoresAtivos, semPrimeiroAtendimento] = await Promise.all([
                supabase.from('leads').select('id', { count: 'exact', head: true }).gte('criado_em', inicioMes.toISOString()),
                supabase.from('organizacoes').select('id', { count: 'exact', head: true }),
                supabase.from('imobiliarias').select('id', { count: 'exact', head: true }),
                supabase.from('corretores').select('id', { count: 'exact', head: true }).eq('ativo', true),
                supabase.from('leads').select('id', { count: 'exact', head: true }).is('first_response_at', null).in('status', ['novo', 'em_atendimento']),
            ]);
            const firstError = [leadsMes, organizacoes, imobiliarias, corretoresAtivos, semPrimeiroAtendimento].find(result => result.error)?.error;
            if (!active) return;
            if (firstError) setError(firstError.message);
            else setMetrics({
                leadsMes: leadsMes.count || 0, organizacoes: organizacoes.count || 0,
                imobiliarias: imobiliarias.count || 0, corretoresAtivos: corretoresAtivos.count || 0,
                semPrimeiroAtendimento: semPrimeiroAtendimento.count || 0,
            });
            setLoading(false);
        }
        void load();
        return () => { active = false; };
    }, []);

    const cards = [
        { label: 'Leads captados no mês', value: metrics.leadsMes, icon: Activity, color: 'text-brand', bg: 'bg-brand/10' },
        { label: 'Organizações atendidas', value: metrics.organizacoes, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Imobiliárias ativas', value: metrics.imobiliarias, icon: Store, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Corretores ativos', value: metrics.corretoresAtivos, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    return <div className="space-y-6 animate-fade-in pb-12">
        <div><h1 className="text-3xl font-bold tracking-tight">Painel SaaS</h1><p className="text-text-secondary mt-1">Visão operacional em tempo real da Prospera.</p></div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Não foi possível carregar os indicadores: {error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(({ label, value, icon: Icon, color, bg }) => <Card key={label} className="p-6"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}><Icon className={color} size={24} /></div><div><p className="text-sm font-medium text-text-muted">{label}</p><p className="text-2xl font-bold">{loading ? <LoaderCircle size={20} className="animate-spin" /> : value.toLocaleString('pt-BR')}</p></div></div></Card>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6"><h2 className="text-xl font-bold">Atenção operacional</h2><p className="text-sm text-text-secondary mt-1">Leads que ainda não registraram o primeiro atendimento.</p><div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-5 flex items-center gap-4"><div className="rounded-xl bg-amber-100 text-amber-700 p-3"><AlertTriangle size={22} /></div><div><p className="text-3xl font-bold text-amber-800">{loading ? '—' : metrics.semPrimeiroAtendimento.toLocaleString('pt-BR')}</p><p className="text-sm text-amber-800/80">em novo ou em atendimento sem resposta registrada</p></div></div></Card>
            <Card className="p-6 bg-gradient-to-br from-black/5 to-transparent"><h2 className="text-xl font-bold">Gestão SAS</h2><p className="text-sm text-text-secondary mt-1">Entre em uma organização, convide usuários e acompanhe a operação com rastreabilidade.</p><div className="mt-6 space-y-3 text-sm"><p className="flex justify-between border-b border-border pb-3"><span>Convites e organizações</span><span className="font-semibold">Disponíveis</span></p><p className="flex justify-between border-b border-border pb-3"><span>Operação assistida</span><span className="font-semibold">Auditada</span></p><p className="flex justify-between"><span>Dados do cockpit</span><span className="font-semibold">Base real</span></p></div></Card>
        </div>
    </div>;
}
