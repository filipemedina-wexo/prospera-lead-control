import { useState, useMemo } from 'react';
import {
    Shuffle, Settings, CheckCircle2, XCircle, Clock,
    ChevronDown, ChevronRight, Users, Building2, Info,
    X, RefreshCw, PauseCircle, PlayCircle, ArrowUp, ArrowDown, Zap
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    corretores, empreendimentos, imobiliarias, leads, filaRoleta,
    type Corretor, type FilaRoleta
} from '../../data/mockData';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';

const IMOB_ID = 'imob-1';

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
}

// ---------- Tipos locais ----------
interface FilaItem extends FilaRoleta {
    corretor: Corretor;
}

interface GerenciarFilaModalProps {
    empId: string;
    empNome: string;
    fila: FilaItem[];
    todosCorretores: Corretor[];
    onClose: () => void;
}

// ---------- Modal de Gerenciar Fila ----------
function GerenciarFilaModal({ empId, empNome, fila: filaInicial, todosCorretores, onClose }: GerenciarFilaModalProps) {
    // Estado local — array de itens da fila (editável)
    const [filaLocal, setFilaLocal] = useState<FilaItem[]>(() => {
        // Corretores já na fila
        const naFila = filaInicial.map(f => ({ ...f }));
        // Corretores da imob que ainda não estão na fila → adiciona como inativos
        const idsNaFila = new Set(naFila.map(f => f.corretorId));
        const faltando = todosCorretores
            .filter(c => !idsNaFila.has(c.id))
            .map(c => ({
                corretorId: c.id,
                empreendimentoId: empId,
                leadsRecebidos: 0,
                ativo: false,
                corretor: c,
            } as FilaItem));
        return [...naFila, ...faltando];
    });

    const [hasChanges, setHasChanges] = useState(false);

    function toggle(id: string) {
        setFilaLocal(prev => prev.map(f => f.corretorId === id ? { ...f, ativo: !f.ativo } : f));
        setHasChanges(true);
    }

    function equalizar() {
        const media = Math.floor(
            filaLocal.filter(f => f.ativo).reduce((s, f) => s + f.leadsRecebidos, 0) /
            Math.max(filaLocal.filter(f => f.ativo).length, 1)
        );
        setFilaLocal(prev => prev.map(f => f.ativo ? { ...f, leadsRecebidos: media } : f));
        setHasChanges(true);
    }

    function mover(id: string, dir: 'up' | 'down') {
        setFilaLocal(prev => {
            const idx = prev.findIndex(f => f.corretorId === id);
            if (idx < 0) return prev;
            const next = [...prev];
            const swap = dir === 'up' ? idx - 1 : idx + 1;
            if (swap < 0 || swap >= next.length) return prev;
            [next[idx], next[swap]] = [next[swap], next[idx]];
            return next;
        });
        setHasChanges(true);
    }

    const ativos = filaLocal.filter(f => f.ativo);
    const inativos = filaLocal.filter(f => !f.ativo);
    const maxLeads = Math.max(...filaLocal.map(f => f.leadsRecebidos), 1);

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-x-4 top-8 bottom-8 sm:inset-auto sm:right-0 sm:top-0 sm:bottom-0 sm:w-[480px] bg-bg z-50 flex flex-col shadow-2xl sm:rounded-none rounded-2xl overflow-hidden border border-border">
                {/* Header */}
                <div className="p-5 border-b border-border shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Gerenciar Fila</p>
                            <h2 className="font-bold text-lg leading-tight">{empNome}</h2>
                            <p className="text-sm text-text-muted mt-0.5">
                                {ativos.length} ativo{ativos.length !== 1 ? 's' : ''} na roleta
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 text-text-muted transition-colors ml-4">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Ação: Equalizar */}
                    <div className="mt-3 flex items-center gap-2">
                        <Button
                            variant="secondary"
                            className="text-xs h-8 gap-2 flex-1"
                            onClick={equalizar}
                        >
                            <RefreshCw size={13} />
                            Equalizar contagem
                        </Button>
                        <p className="text-[10px] text-text-muted leading-tight max-w-[140px]">
                            Nivela o número de leads recebidos entre os ativos
                        </p>
                    </div>
                </div>

                {/* Lista — scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Corretores ATIVOS na fila */}
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-green-500" />
                            Na fila ({ativos.length})
                        </p>
                        <div className="space-y-2">
                            {filaLocal.map((f) => {
                                if (!f.ativo) return null;
                                const posAtivos = ativos.findIndex(a => a.corretorId === f.corretorId);
                                return (
                                    <FilaRowItem
                                        key={f.corretorId}
                                        item={f}
                                        posicao={posAtivos + 1}
                                        isProximo={posAtivos === 0}
                                        maxLeads={maxLeads}
                                        onToggle={() => toggle(f.corretorId)}
                                        onMoverUp={() => mover(f.corretorId, 'up')}
                                        onMoverDown={() => mover(f.corretorId, 'down')}
                                        canMoveUp={posAtivos > 0}
                                        canMoveDown={posAtivos < ativos.length - 1}
                                    />
                                );
                            })}
                            {ativos.length === 0 && (
                                <div className="text-center py-8 text-text-muted">
                                    <PauseCircle size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Nenhum corretor ativo na fila</p>
                                    <p className="text-xs mt-1">Ative corretores abaixo para iniciar a roleta</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Corretores PAUSADOS / fora da fila */}
                    {inativos.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                                <PauseCircle size={12} className="text-slate-400" />
                                Pausados / fora da fila ({inativos.length})
                            </p>
                            <div className="space-y-2">
                                {filaLocal.map((f) => {
                                    if (f.ativo) return null;
                                    return (
                                        <FilaRowItem
                                            key={f.corretorId}
                                            item={f}
                                            posicao={0}
                                            isProximo={false}
                                            maxLeads={maxLeads}
                                            onToggle={() => toggle(f.corretorId)}
                                            onMoverUp={() => { }}
                                            onMoverDown={() => { }}
                                            canMoveUp={false}
                                            canMoveDown={false}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-bg shrink-0 flex gap-2">
                    <Button variant="secondary" className="flex-1 h-10" onClick={onClose}>Cancelar</Button>
                    <Button
                        className={cn('flex-1 h-10', !hasChanges && 'opacity-60')}
                        onClick={() => {
                            // Em produção: persistiria no estado global/API
                            onClose();
                        }}
                    >
                        Salvar fila
                    </Button>
                </div>
            </div>
        </>
    );
}

// ---------- Linha de item da fila no modal ----------
interface FilaRowItemProps {
    item: FilaItem;
    posicao: number;
    isProximo: boolean;
    maxLeads: number;
    onToggle: () => void;
    onMoverUp: () => void;
    onMoverDown: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
}

function FilaRowItem({ item, posicao, isProximo, maxLeads, onToggle, onMoverUp, onMoverDown, canMoveUp, canMoveDown }: FilaRowItemProps) {
    return (
        <div className={cn(
            'flex items-center gap-3 py-3 px-3 rounded-xl border transition-all',
            item.ativo
                ? isProximo
                    ? 'border-brand/30 bg-brand/5'
                    : 'border-border bg-transparent'
                : 'border-border/40 bg-black/[0.02] opacity-70'
        )}>
            {/* Reordenar (só ativos) */}
            {item.ativo ? (
                <div className="flex flex-col gap-0.5">
                    <button
                        onClick={onMoverUp}
                        disabled={!canMoveUp}
                        className={cn('p-0.5 rounded text-text-muted transition-colors', canMoveUp ? 'hover:text-text-primary hover:bg-black/10' : 'opacity-20 cursor-not-allowed')}
                    >
                        <ArrowUp size={11} />
                    </button>
                    <button
                        onClick={onMoverDown}
                        disabled={!canMoveDown}
                        className={cn('p-0.5 rounded text-text-muted transition-colors', canMoveDown ? 'hover:text-text-primary hover:bg-black/10' : 'opacity-20 cursor-not-allowed')}
                    >
                        <ArrowDown size={11} />
                    </button>
                </div>
            ) : (
                <div className="w-4" />
            )}

            {/* Posição */}
            <span className={cn('text-sm font-bold w-5 text-center shrink-0', isProximo ? 'text-brand' : 'text-text-muted')}>
                {item.ativo ? posicao : '—'}
            </span>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand text-sm font-bold shrink-0 overflow-hidden">
                {item.corretor.avatarUrl
                    ? <img src={item.corretor.avatarUrl} className="w-full h-full object-cover" alt="" />
                    : item.corretor.nome.charAt(0)
                }
            </div>

            {/* Info + barra */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{item.corretor.nome}</span>
                    {isProximo && (
                        <span className="text-[9px] bg-brand text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 flex items-center gap-1">
                            <Zap size={8} fill="currentColor" />
                            Próximo
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
                        <div
                            className={cn('h-full rounded-full', item.ativo ? 'bg-brand/60' : 'bg-slate-300')}
                            style={{ width: `${(item.leadsRecebidos / maxLeads) * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-text-muted shrink-0">{item.leadsRecebidos} leads</span>
                    {item.ultimoLead && (
                        <span className="text-[10px] text-text-muted shrink-0">· {timeAgo(item.ultimoLead)}</span>
                    )}
                </div>
            </div>

            {/* Toggle ativo/pausado */}
            <button
                onClick={onToggle}
                className={cn(
                    'shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium',
                    item.ativo
                        ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                )}
            >
                {item.ativo
                    ? <><PauseCircle size={13} />Pausar</>
                    : <><PlayCircle size={13} />Ativar</>
                }
            </button>
        </div>
    );
}

// ---------- Item de fila na lista principal (accordeon) ----------
function FilaItemRow({ fila, posicao, isProximo }: {
    fila: { corretorId: string; empreendimentoId: string; leadsRecebidos: number; ativo: boolean; ultimoLead?: string; corretor: Corretor };
    posicao: number;
    isProximo: boolean;
}) {
    return (
        <div className={cn(
            'flex items-center gap-3 px-4 py-3 transition-colors',
            isProximo ? 'bg-brand/5' : 'hover:bg-black/[0.01]',
            !fila.ativo && 'opacity-60'
        )}>
            <span className={cn('w-5 text-center text-xs font-bold', isProximo ? 'text-brand' : 'text-text-muted')}>
                {posicao}
            </span>
            <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-bold shrink-0 overflow-hidden">
                {fila.corretor.avatarUrl
                    ? <img src={fila.corretor.avatarUrl} className="w-full h-full object-cover" alt="" />
                    : fila.corretor.nome.charAt(0)
                }
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{fila.corretor.nome}</span>
                    {isProximo && (
                        <span className="text-[9px] bg-brand text-white px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">Próximo</span>
                    )}
                </div>
                <p className="text-[10px] text-text-muted">
                    {fila.leadsRecebidos} recebidos
                    {fila.ultimoLead ? ` · último ${timeAgo(fila.ultimoLead)}` : ''}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {fila.ativo
                    ? <CheckCircle2 size={15} className="text-green-500" />
                    : <XCircle size={15} className="text-slate-400" />
                }
            </div>
        </div>
    );
}

// ---------- Página principal ----------
type GestoraFilaEntry = {
    id: string;
    tipo: 'house' | 'imobiliaria';
    corretorId?: string;
    imobiliariaId?: string;
    ativo: boolean;
};

function GestoraFilaModal({
    empNome,
    entries: entriesInicial,
    houseCorretores,
    imobiliarias: imobiliariasDisponiveis,
    onClose,
    onSave,
}: {
    empNome: string;
    entries: GestoraFilaEntry[];
    houseCorretores: Corretor[];
    imobiliarias: typeof imobiliarias;
    onClose: () => void;
    onSave: (entries: GestoraFilaEntry[]) => void;
}) {
    const [entries, setEntries] = useState(entriesInicial.map(entry => ({ ...entry })));
    const [novoTipo, setNovoTipo] = useState<'house' | 'imobiliaria'>('house');
    const [novoId, setNovoId] = useState('');
    const ativos = entries.filter(entry => entry.ativo);
    const inativos = entries.filter(entry => !entry.ativo);

    const getLabel = (entry: GestoraFilaEntry) => entry.tipo === 'house'
        ? houseCorretores.find(corretor => corretor.id === entry.corretorId)?.nome || 'Corretor da House'
        : imobiliariasDisponiveis.find(imob => imob.id === entry.imobiliariaId)?.nome || 'Imobiliária parceira';

    const toggle = (id: string) => setEntries(current => current.map(entry => entry.id === id ? { ...entry, ativo: !entry.ativo } : entry));

    const move = (id: string, direction: -1 | 1) => setEntries(current => {
        const active = current.filter(entry => entry.ativo);
        const index = active.findIndex(entry => entry.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= active.length) return current;
        [active[index], active[target]] = [active[target], active[index]];
        return [...active, ...current.filter(entry => !entry.ativo)];
    });

    const add = () => {
        if (!novoId) return;
        const duplicate = entries.some(entry => entry.tipo === novoTipo && (novoTipo === 'house' ? entry.corretorId === novoId : entry.imobiliariaId === novoId));
        if (duplicate) return;
        setEntries(current => [...current, { id: `${novoTipo}-${novoId}`, tipo: novoTipo, ativo: true, ...(novoTipo === 'house' ? { corretorId: novoId } : { imobiliariaId: novoId }) }]);
        setNovoId('');
    };

    const EntryRow = ({ entry, index, paused = false }: { entry: GestoraFilaEntry; index: number; paused?: boolean }) => (
        <div className={cn('flex items-center gap-3 py-3 px-3 rounded-xl border', entry.ativo ? 'border-border bg-transparent' : 'border-border/40 bg-black/[0.02] opacity-70')}>
            <div className="flex flex-col gap-0.5 w-4">
                {!paused && <><button onClick={() => move(entry.id, -1)} disabled={index === 0} className={cn('p-0.5 rounded text-text-muted', index === 0 ? 'opacity-20' : 'hover:bg-black/10')}><ArrowUp size={11} /></button><button onClick={() => move(entry.id, 1)} disabled={index === ativos.length - 1} className={cn('p-0.5 rounded text-text-muted', index === ativos.length - 1 ? 'opacity-20' : 'hover:bg-black/10')}><ArrowDown size={11} /></button></>}
            </div>
            <span className={cn('text-sm font-bold w-5 text-center', paused ? 'text-text-muted' : 'text-brand')}>{paused ? '—' : index + 1}</span>
            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0', entry.tipo === 'house' ? 'bg-brand/10 text-brand' : 'bg-amber-50 text-amber-700')}>{entry.tipo === 'house' ? <Users size={16} /> : <Building2 size={16} />}</div>
            <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-sm font-medium truncate">{getLabel(entry)}</span><span className={cn('text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0', entry.tipo === 'house' ? 'bg-brand/10 text-brand' : 'bg-amber-50 text-amber-700')}>{entry.tipo === 'house' ? 'House' : 'Parceira'}</span></div><p className="text-[10px] text-text-muted mt-1">{entry.tipo === 'house' ? 'Ordem controlada pela Gestora' : 'Bloco; ordem dos corretores fica na imobiliária'}</p></div>
            <button onClick={() => toggle(entry.id)} className={cn('shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium', entry.ativo ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-green-200 bg-green-50 text-green-700')}>{entry.ativo ? <><PauseCircle size={13} />Remover</> : <><PlayCircle size={13} />Adicionar</>}</button>
        </div>
    );

    return <><div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} /><div className="fixed inset-x-4 top-8 bottom-8 sm:inset-auto sm:right-0 sm:top-0 sm:bottom-0 sm:w-[480px] bg-bg z-50 flex flex-col shadow-2xl sm:rounded-none rounded-2xl overflow-hidden border border-border">
        <div className="p-5 border-b border-border shrink-0"><div className="flex items-start justify-between"><div><p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Gerenciar distribuição</p><h2 className="font-bold text-lg leading-tight">{empNome}</h2><p className="text-sm text-text-muted mt-0.5">A Gestora ordena a House e os blocos parceiros</p></div><button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 text-text-muted"><X size={20} /></button></div><div className="mt-4 flex items-end gap-2"><div className="flex-1"><label className="text-[10px] text-text-muted uppercase">Adicionar na fila</label><div className="flex gap-2 mt-1"><select className="input text-xs h-9" value={novoTipo} onChange={event => { setNovoTipo(event.target.value as 'house' | 'imobiliaria'); setNovoId(''); }}><option value="house">House</option><option value="imobiliaria">Imobiliária parceira</option></select><select className="input text-xs h-9 flex-1" value={novoId} onChange={event => setNovoId(event.target.value)}><option value="">Selecionar...</option>{(novoTipo === 'house' ? houseCorretores : imobiliariasDisponiveis).map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div></div><Button variant="secondary" className="h-9 text-xs" onClick={add}>Adicionar</Button></div></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6"><div><p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" />Fila ativa ({ativos.length})</p><div className="space-y-2">{ativos.map((entry, index) => <EntryRow key={entry.id} entry={entry} index={index} />)}{ativos.length === 0 && <p className="text-sm text-text-muted text-center py-6">Nenhuma House ou parceira na fila</p>}</div></div>{inativos.length > 0 && <div><p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><PauseCircle size={12} className="text-slate-400" />Fora da fila ({inativos.length})</p><div className="space-y-2">{inativos.map((entry, index) => <EntryRow key={entry.id} entry={entry} index={index} paused />)}</div></div>}</div>
        <div className="p-4 border-t border-border bg-bg shrink-0 flex gap-2"><Button variant="secondary" className="flex-1 h-10" onClick={onClose}>Cancelar</Button><Button className="flex-1 h-10" onClick={() => { onSave(entries); onClose(); }}>Salvar fila</Button></div>
    </div></>;
}

function GestoraDistribuicao() {
    const [expandedEmp, setExpandedEmp] = useState<string | null>('emp-1');
    const [gerenciarEmpId, setGerenciarEmpId] = useState<string | null>(null);
    const houseCorretores = corretores.filter(corretor => corretor.imobiliariaId === null);
    const [filas, setFilas] = useState<Record<string, GestoraFilaEntry[]>>(() => Object.fromEntries(
        empreendimentos.map((emp, index) => [emp.id, [
            { id: `house-house-cor-1-${emp.id}`, tipo: 'house', corretorId: 'house-cor-1', ativo: index !== 3 },
            { id: `imob-imob-1-${emp.id}`, tipo: 'imobiliaria', imobiliariaId: 'imob-1', ativo: index !== 3 },
            { id: `house-house-cor-2-${emp.id}`, tipo: 'house', corretorId: 'house-cor-2', ativo: index === 0 || index === 2 },
            { id: `imob-imob-2-${emp.id}`, tipo: 'imobiliaria', imobiliariaId: 'imob-2', ativo: index === 0 },
            { id: `imob-imob-3-${emp.id}`, tipo: 'imobiliaria', imobiliariaId: 'imob-3', ativo: false },
        ] as GestoraFilaEntry[]])
    ));

    const filaAtiva = (empId: string) => filas[empId]?.filter(entry => entry.ativo) || [];
    const getEntryLabel = (entry: GestoraFilaEntry) => entry.tipo === 'house'
        ? houseCorretores.find(corretor => corretor.id === entry.corretorId)?.nome
        : imobiliarias.find(imob => imob.id === entry.imobiliariaId)?.nome;
    const balanceamento = corretores.map(corretor => ({ corretor, totalLeads: leads.filter(lead => lead.corretorId === corretor.id).length })).sort((a, b) => b.totalLeads - a.totalLeads);
    const maxLeads = Math.max(...balanceamento.map(item => item.totalLeads), 1);
    const historico = leads.slice().sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()).slice(0, 8);
    const gerenciarEmp = gerenciarEmpId ? empreendimentos.find(emp => emp.id === gerenciarEmpId) : null;

    return <>
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight">Distribuição de Leads</h1><p className="text-text-secondary text-sm mt-1">Configuração da fila — Gestora de Lançamentos</p></div>
            <Card className="p-4 bg-brand/5 border-brand/20"><div className="flex items-start gap-3"><Info size={16} className="text-brand shrink-0 mt-0.5" /><p className="text-sm text-text-secondary">A Gestora define a ordem dos corretores da <strong className="text-text-primary">House</strong> e a posição das <strong className="text-text-primary">imobiliárias parceiras</strong>. Cada parceira mantém a ordem dos próprios corretores.</p></div></Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4"><h2 className="text-base font-semibold flex items-center gap-2"><Shuffle size={18} className="text-brand" />Fila por Empreendimento</h2>{empreendimentos.map(emp => {
                    const isOpen = expandedEmp === emp.id;
                    const fila = filaAtiva(emp.id);
                    const proximo = fila[0];
                    return <Card key={emp.id} className="overflow-hidden"><button className="w-full flex items-center justify-between p-4 text-left hover:bg-black/[0.02]" onClick={() => setExpandedEmp(isOpen ? null : emp.id)}><div className="flex items-center gap-3 min-w-0"><Building2 size={16} className="text-brand shrink-0" /><div className="min-w-0"><p className="font-medium text-sm truncate">{emp.nome}</p>{proximo && <p className="text-xs text-text-muted">Próximo: <span className="text-brand font-medium">{getEntryLabel(proximo)}</span></p>}</div></div><div className="flex items-center gap-3 shrink-0"><span className="text-xs text-text-muted bg-black/5 px-2 py-0.5 rounded-full">{fila.length} ativo{fila.length !== 1 ? 's' : ''}</span>{isOpen ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}</div></button>{isOpen && <div className="border-t border-border"><div className="divide-y divide-border/60">{fila.map((entry, index) => <div key={entry.id} className="flex items-center gap-3 px-4 py-3"><span className="w-5 text-center text-xs font-bold text-brand">{index + 1}</span>{entry.tipo === 'house' ? <Users size={15} className="text-brand" /> : <Building2 size={15} className="text-amber-600" />}<div className="flex-1"><span className="text-sm font-medium">{getEntryLabel(entry)}</span><p className="text-[10px] text-text-muted">{entry.tipo === 'house' ? 'House' : 'Imobiliária parceira'}</p></div></div>)}</div><div className="p-3 bg-black/[0.02] flex justify-end"><Button variant="secondary" className="text-xs h-8 gap-2" onClick={() => setGerenciarEmpId(emp.id)}><Settings size={13} />Gerenciar fila</Button></div></div>}</Card>;
                })}</div>
                <div className="space-y-6"><Card className="p-5"><h2 className="text-base font-semibold flex items-center gap-2 mb-4"><Users size={17} className="text-brand" />Balanceamento Geral</h2><p className="text-xs text-text-muted mb-4">Distribuição total de leads por corretor no período</p><div className="space-y-3">{balanceamento.map(({ corretor, totalLeads }) => <div key={corretor.id} className="flex items-center gap-3"><div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-bold shrink-0">{corretor.nome.charAt(0)}</div><div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium truncate">{corretor.nome}</span><span className="text-xs ml-2 shrink-0 font-semibold">{totalLeads}</span></div><div className="h-1.5 bg-black/5 rounded-full overflow-hidden"><div className={cn('h-full rounded-full', corretor.imobiliariaId === null ? 'bg-brand' : 'bg-slate-400')} style={{ width: `${(totalLeads / maxLeads) * 100}%` }} /></div></div><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">{corretor.imobiliariaId === null ? 'House' : 'Parceira'}</span></div>)}</div></Card><Card className="p-5"><h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Clock size={15} className="text-brand" />Últimas Atribuições</h2><div className="space-y-2">{historico.map(lead => { const corretor = corretores.find(item => item.id === lead.corretorId); const emp = empreendimentos.find(item => item.id === lead.empreendimentoId); return <div key={lead.id} className="flex items-start gap-2 py-1.5 border-b border-border/40 last:border-0"><div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-brand text-[10px] font-bold shrink-0">{corretor?.nome.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{lead.nome}</p><p className="text-[10px] text-text-muted truncate">→ {corretor?.nome || 'Aguardando'} · {emp?.nome}</p></div><span className="text-[10px] text-text-muted shrink-0">{timeAgo(lead.criadoEm)}</span></div>; })}</div></Card></div>
            </div>
        </div>
        {gerenciarEmpId && gerenciarEmp && <GestoraFilaModal empNome={gerenciarEmp.nome} entries={filas[gerenciarEmpId] || []} houseCorretores={houseCorretores} imobiliarias={imobiliarias} onClose={() => setGerenciarEmpId(null)} onSave={entries => setFilas(current => ({ ...current, [gerenciarEmpId]: entries }))} />}
    </>;
}

export function RoletaLeads() {
    const { profile } = useApp();
    if (profile === 'gestora_lancamentos') return <GestoraDistribuicao />;
    const [expandedEmp, setExpandedEmp] = useState<string | null>('emp-1');
    const [gerenciarEmpId, setGerenciarEmpId] = useState<string | null>(null);

    const imobCorretores = corretores.filter(c => c.imobiliariaId === IMOB_ID);

    const imobLeads = leads.filter(l => l.imobiliariaId === IMOB_ID);
    const empIds = [...new Set(imobLeads.map(l => l.empreendimentoId))];
    const listaEmps = empIds
        .map(id => empreendimentos.find(e => e.id === id))
        .filter(Boolean) as typeof empreendimentos;

    const historicoAtribuicoes = useMemo(() => {
        return imobLeads
            .map(l => ({
                lead: l,
                corretor: imobCorretores.find(c => c.id === l.corretorId),
                emp: empreendimentos.find(e => e.id === l.empreendimentoId),
            }))
            .filter(h => h.corretor && h.emp)
            .sort((a, b) => new Date(b.lead.criadoEm).getTime() - new Date(a.lead.criadoEm).getTime())
            .slice(0, 8);
    }, [imobLeads, imobCorretores]);

    const balanceamento = imobCorretores.map(c => {
        const total = imobLeads.filter(l => l.corretorId === c.id).length;
        return { corretor: c, totalLeads: total };
    }).sort((a, b) => b.totalLeads - a.totalLeads);

    const maxLeads = Math.max(...balanceamento.map(b => b.totalLeads), 1);

    // Preparar fila do empreendimento que está sendo gerenciado
    const gerenciarEmp = gerenciarEmpId ? empreendimentos.find(e => e.id === gerenciarEmpId) : null;
    const gerenciarFila: FilaItem[] = gerenciarEmpId
        ? filaRoleta
            .filter(f => f.empreendimentoId === gerenciarEmpId)
            .map(f => ({
                ...f,
                corretor: imobCorretores.find(c => c.id === f.corretorId)!,
            }))
            .filter(f => f.corretor)
            .sort((a, b) => {
                if (a.ativo !== b.ativo) return a.ativo ? -1 : 1;
                return a.leadsRecebidos - b.leadsRecebidos;
            })
        : [];

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Distribuição de Leads</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Roleta e balanceamento — Imobiliária Prime
                    </p>
                </div>

                <Card className="p-4 bg-brand/5 border-brand/20">
                    <div className="flex items-start gap-3">
                        <Info size={16} className="text-brand shrink-0 mt-0.5" />
                        <p className="text-sm text-text-secondary">
                            O sistema distribui leads automaticamente por <strong className="text-text-primary">Round Robin</strong>: o próximo lead vai para o corretor ativo com menos leads recebidos no empreendimento. Clique em <strong className="text-text-primary">Gerenciar fila</strong> para ativar, pausar ou reordenar corretores por empreendimento.
                        </p>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Fila por Empreendimento */}
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <Shuffle size={18} className="text-brand" />
                            Fila por Empreendimento
                        </h2>

                        {listaEmps.map(emp => {
                            const isOpen = expandedEmp === emp.id;
                            const filaEmp = filaRoleta
                                .filter(f => f.empreendimentoId === emp.id)
                                .map(f => ({
                                    ...f,
                                    corretor: imobCorretores.find(c => c.id === f.corretorId)!,
                                }))
                                .filter(f => f.corretor)
                                .sort((a, b) => {
                                    if (a.ativo !== b.ativo) return a.ativo ? -1 : 1;
                                    return a.leadsRecebidos - b.leadsRecebidos;
                                });
                            const proximo = filaEmp.find(f => f.ativo);

                            return (
                                <Card key={emp.id} className="overflow-hidden">
                                    <button
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-black/[0.02] transition-colors"
                                        onClick={() => setExpandedEmp(isOpen ? null : emp.id)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Building2 size={16} className="text-brand shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">{emp.nome}</p>
                                                {proximo && (
                                                    <p className="text-xs text-text-muted">
                                                        Próximo: <span className="text-brand font-medium">{proximo.corretor.nome}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs text-text-muted bg-black/5 px-2 py-0.5 rounded-full">
                                                {filaEmp.filter(f => f.ativo).length} ativo{filaEmp.filter(f => f.ativo).length !== 1 ? 's' : ''}
                                            </span>
                                            {isOpen
                                                ? <ChevronDown size={16} className="text-text-muted" />
                                                : <ChevronRight size={16} className="text-text-muted" />
                                            }
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-border">
                                            {filaEmp.length === 0 ? (
                                                <p className="text-sm text-text-muted p-4 text-center">Nenhum corretor na fila</p>
                                            ) : (
                                                <div className="divide-y divide-border/60">
                                                    {filaEmp.map((f, i) => (
                                                        <FilaItemRow key={f.corretorId} fila={f} posicao={i + 1} isProximo={i === 0 && f.ativo} />
                                                    ))}
                                                </div>
                                            )}
                                            <div className="p-3 bg-black/[0.02] flex justify-end">
                                                <Button
                                                    variant="secondary"
                                                    className="text-xs h-8 gap-2"
                                                    onClick={() => setGerenciarEmpId(emp.id)}
                                                >
                                                    <Settings size={13} />
                                                    Gerenciar fila
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>

                    {/* Balanceamento geral + Histórico */}
                    <div className="space-y-6">
                        <Card className="p-5">
                            <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                                <Users size={17} className="text-brand" />
                                Balanceamento Geral
                            </h2>
                            <p className="text-xs text-text-muted mb-4">Distribuição total de leads por corretor no período</p>
                            <div className="space-y-3">
                                {balanceamento.map(({ corretor, totalLeads }) => (
                                    <div key={corretor.id} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-bold shrink-0 overflow-hidden">
                                            {corretor.avatarUrl
                                                ? <img src={corretor.avatarUrl} className="w-full h-full rounded-full object-cover" alt={corretor.nome} />
                                                : corretor.nome.charAt(0)
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium truncate">{corretor.nome}</span>
                                                <span className={cn('text-xs ml-2 shrink-0 font-semibold', corretor.ativo ? 'text-text-primary' : 'text-text-muted')}>
                                                    {totalLeads}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                                                <div
                                                    className={cn('h-full rounded-full transition-all duration-500', corretor.ativo ? 'bg-brand' : 'bg-slate-300')}
                                                    style={{ width: `${(totalLeads / maxLeads) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full shrink-0', corretor.ativo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500')}>
                                            {corretor.ativo ? 'Ativo' : 'Pausado'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-5">
                            <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                                <Clock size={15} className="text-brand" />
                                Últimas Atribuições
                            </h2>
                            <div className="space-y-2">
                                {historicoAtribuicoes.map(({ lead, corretor, emp }) => (
                                    <div key={lead.id} className="flex items-start gap-2 py-1.5 border-b border-border/40 last:border-0">
                                        <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-brand text-[10px] font-bold shrink-0 mt-0.5">
                                            {corretor!.nome.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-text-primary truncate">{lead.nome}</p>
                                            <p className="text-[10px] text-text-muted truncate">→ {corretor!.nome} · {emp!.nome}</p>
                                        </div>
                                        <span className="text-[10px] text-text-muted shrink-0">{timeAgo(lead.criadoEm)}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal de Gerenciar Fila */}
            {gerenciarEmpId && gerenciarEmp && (
                <GerenciarFilaModal
                    empId={gerenciarEmpId}
                    empNome={gerenciarEmp.nome}
                    fila={gerenciarFila}
                    todosCorretores={imobCorretores}
                    onClose={() => setGerenciarEmpId(null)}
                />
            )}
        </>
    );
}
