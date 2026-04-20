import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Sparkles, ThumbsDown, ThumbsUp, HelpCircle, MessageCircle } from 'lucide-react';

// ============================
// ASSUNTOS (o que o lead está falando sobre)
// ============================
const ASSUNTOS = [
    { tag: 'entrada', categoria: 'Financeiro' },
    { tag: 'parcela', categoria: 'Financeiro' },
    { tag: 'preço', categoria: 'Financeiro' },
    { tag: 'financiamento', categoria: 'Financeiro' },
    { tag: 'desconto', categoria: 'Financeiro' },
    { tag: 'orçamento', categoria: 'Financeiro' },
    { tag: 'valor', categoria: 'Financeiro' },
    { tag: 'condição', categoria: 'Financeiro' },
    { tag: 'pagamento', categoria: 'Financeiro' },

    { tag: 'infraestrutura', categoria: 'Produto' },
    { tag: 'localização', categoria: 'Produto' },
    { tag: 'planta', categoria: 'Produto' },
    { tag: 'tamanho', categoria: 'Produto' },
    { tag: 'acabamento', categoria: 'Produto' },
    { tag: 'lazer', categoria: 'Produto' },
    { tag: 'segurança', categoria: 'Produto' },
    { tag: 'vaga', categoria: 'Produto' },
    { tag: 'entrega', categoria: 'Produto' },
    { tag: 'varanda', categoria: 'Produto' },
    { tag: 'suite', categoria: 'Produto' },
    { tag: 'condomínio', categoria: 'Produto' },
    { tag: 'área', categoria: 'Produto' },

    { tag: 'atendimento', categoria: 'Serviço' },
    { tag: 'prazo', categoria: 'Serviço' },
    { tag: 'documentação', categoria: 'Serviço' },
];

// ============================
// SENTIMENTOS / MODIFICADORES
// ============================
type Sentimento = 'positivo' | 'negativo' | 'dúvida' | 'neutro';

interface ModificadorDef {
    frases: string[];
    sentimento: Sentimento;
    prioridade: number; // menor = maior prioridade
}

const MODIFICADORES: ModificadorDef[] = [
    // Negativos (prioridade 1 — checar PRIMEIRO)
    {
        frases: [
            'não gostou', 'nao gostou', 'não curtiu', 'nao curtiu',
            'não aprovou', 'nao aprovou',
            'reclamou', 'criticou', 'detestou', 'odiou',
            'achou cara', 'achou caro', 'achou ruim',
            'achou alto', 'achou alta',
            'achou pequeno', 'achou pequena',
            'achou longe', 'achou fraco', 'achou fraca',
            'achou apertado', 'achou apertada',
            'quer menor', 'quer mais barato', 'quer mais barata',
            'achei salgado', 'achei salgada', 'achou salgado', 'achou salgada',
            'muito caro', 'muito cara', 'muito alto', 'muito alta',
            'não tem condição', 'nao tem condição',
            'tá caro', 'tá cara', 'está caro', 'está cara',
            'pesa no bolso', 'fora do orçamento',
            'quer um valor menor', 'quer um valor mais baixo',
        ],
        sentimento: 'negativo',
        prioridade: 1,
    },
    // Positivos (prioridade 2 — só match se negativo não pegou)
    {
        frases: [
            'gostou', 'curtiu', 'elogiou', 'aprovou',
            'amou', 'adorou',
            'achou boa', 'achou bom',
            'achou ótimo', 'achou ótima',
            'achou bonito', 'achou bonita',
            'achou justo', 'achou justa',
            'achou barato', 'achou barata',
            'achou excelente', 'achou perfeito', 'achou perfeita',
            'ficou satisfeito', 'ficou satisfeita',
            'tá bom', 'está bom', 'tá ótimo', 'está ótimo',
        ],
        sentimento: 'positivo',
        prioridade: 2,
    },
    // Dúvidas (prioridade 3)
    {
        frases: [
            'perguntou sobre', 'perguntou da', 'perguntou do',
            'quer saber sobre', 'quer saber da', 'quer saber do',
            'tem dúvida sobre', 'tem duvida sobre',
            'tem dúvida da', 'tem dúvida do',
            'questionou', 'quer entender',
            'pediu mais informação', 'pediu informações',
            'quer conhecer', 'quer ver',
        ],
        sentimento: 'dúvida',
        prioridade: 3,
    },
    // Neutro (prioridade 4)
    {
        frases: [
            'mencionou', 'falou sobre', 'falou da', 'falou do',
            'comentou sobre', 'comentou da', 'comentou do',
            'citou',
        ],
        sentimento: 'neutro',
        prioridade: 4,
    },
];

// Palavras-ponte que podem aparecer entre modificador e assunto
const PALAVRAS_PONTE = new Set([
    'da', 'do', 'de', 'sobre', 'a', 'o', 'as', 'os',
    'na', 'no', 'nas', 'nos', 'com', 'pelo', 'pela',
    'ao', 'à', 'um', 'uma', 'uns', 'umas',
    'que', 'muito', 'muita', 'bem', 'mais',
    'valor', 'preço', 'parte', 'questão',
]);

// ============================
// AÇÕES SIMPLES (sem relação a assunto)
// ============================
const ACOES_SIMPLES = [
    { tag: 'não atendeu', aliases: ['nao atendeu', 'não atende', 'nao atende', 'sem resposta', 'não respondeu', 'nao respondeu'], cor: 'bg-red-100 text-red-600', icon: '📵' },
    { tag: 'caixa postal', aliases: ['caixa postal'], cor: 'bg-red-50 text-red-500', icon: '📭' },
    { tag: 'retornar', aliases: ['retornar', 'vai retornar', 'ligar depois', 'retorno', 'vai pensar'], cor: 'bg-violet-100 text-violet-700', icon: '🔄' },
    { tag: 'ocupado', aliases: ['tá ocupado', 'está ocupado', 'ocupado'], cor: 'bg-amber-100 text-amber-700', icon: '⏳' },
    { tag: 'interessado', aliases: ['interessado', 'interessada', 'muito interessado', 'muito interessada', 'demonstrou interesse'], cor: 'bg-emerald-100 text-emerald-700', icon: '🔥' },
    { tag: 'urgente', aliases: ['urgente', 'urgência', 'precisa rápido', 'quer pra ontem'], cor: 'bg-rose-100 text-rose-700', icon: '🚨' },
    { tag: 'visita marcada', aliases: ['visita marcada', 'marcou visita', 'agendou visita', 'quer visitar', 'quer conhecer o empreendimento'], cor: 'bg-green-100 text-green-700', icon: '📅' },
    { tag: 'investimento', aliases: ['investimento', 'para investir', 'investir', 'como investimento'], cor: 'bg-emerald-100 text-emerald-700', icon: '💰' },
    { tag: 'moradia', aliases: ['moradia', 'morar', 'para morar', 'primeiro imóvel'], cor: 'bg-blue-100 text-blue-700', icon: '🏠' },
    { tag: 'concorrência', aliases: ['concorrência', 'concorrencia', 'comparando', 'outro empreendimento', 'vendo outros'], cor: 'bg-sky-100 text-sky-700', icon: '⚖️' },
];

// ============================
// TYPES EXPORTADOS
// ============================
export interface DetectedCompoundTag {
    sentimento: Sentimento;
    assunto: string;
    categoria: string;
    frase: string;
}

export interface DetectedSimpleTag {
    tag: string;
    icon: string;
    cor: string;
}

// ============================
// DETECÇÃO — Algoritmo por sentença com prioridade
// ============================

/**
 * Divide o texto em sentenças (por ".", "!", "?" ou quebra de linha)
 * Cada sentença é analisada independentemente para evitar que
 * "não gostou da infraestrutura. Gostou da localização"
 * gere conflitos entre sentenças.
 */
function splitIntoSentences(text: string): string[] {
    return text
        .split(/[.!?\n]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

/**
 * Procura um assunto dentro de uma janela de até MAX_GAP palavras
 * depois do modificador. Permite textos como:
 * "achou o valor da parcela alta" (5 palavras entre "achou" e — assunto "parcela")
 */
function findSubjectAfterModifier(
    sentenceLower: string,
    modifierEnd: number
): { assunto: typeof ASSUNTOS[0]; matchEnd: number } | null {
    const MAX_GAP = 6;
    const remaining = sentenceLower.slice(modifierEnd).trim();
    if (!remaining) return null;

    const words = remaining.split(/\s+/);

    for (let i = 0; i < Math.min(words.length, MAX_GAP); i++) {
        const word = words[i].replace(/[.,!?;:()]/g, '');

        // Checa se a palavra é um assunto
        for (const assunto of ASSUNTOS) {
            if (word === assunto.tag) {
                const wordIdx = remaining.indexOf(words[i]);
                return {
                    assunto,
                    matchEnd: modifierEnd + (remaining.length > 0 ? wordIdx + words[i].length : 0),
                };
            }
        }

        // Se a palavra não é uma palavra-ponte conhecida, para (exceto se a próxima é assunto)
        if (!PALAVRAS_PONTE.has(word)) {
            const nextWord = words[i + 1]?.replace(/[.,!?;:()]/g, '');
            if (nextWord && ASSUNTOS.some(a => a.tag === nextWord)) {
                continue; // permite passar por uma palavra desconhecida se o próximo é assunto
            }
            break;
        }
    }

    return null;
}

export function detectCompoundTags(text: string): DetectedCompoundTag[] {
    const sentences = splitIntoSentences(text);
    const results: DetectedCompoundTag[] = [];
    const found = new Set<string>();

    // Modificadores ordenados por prioridade (negativos primeiro)  
    const sortedMods = [...MODIFICADORES].sort((a, b) => a.prioridade - b.prioridade);

    for (const sentence of sentences) {
        const lower = sentence.toLowerCase();
        // Regiões já consumidas nesta sentença (evita "não gostou" e "gostou" no mesmo trecho)
        const usedRegions: Array<[number, number]> = [];

        for (const mod of sortedMods) {
            // Frases mais longas primeiro (match mais específico)
            const sortedFrases = [...mod.frases].sort((a, b) => b.length - a.length);

            for (const frase of sortedFrases) {
                let searchFrom = 0;
                let idx: number;

                while ((idx = lower.indexOf(frase, searchFrom)) !== -1) {
                    searchFrom = idx + frase.length;

                    // Check: essa região já foi consumida por match de prioridade maior?
                    const overlaps = usedRegions.some(
                        ([start, end]) => idx < end && (idx + frase.length) > start
                    );
                    if (overlaps) continue;

                    // Procura assunto depois do modificador
                    const subjectMatch = findSubjectAfterModifier(lower, idx + frase.length);
                    if (subjectMatch) {
                        const key = `${mod.sentimento}-${subjectMatch.assunto.tag}`;
                        if (!found.has(key)) {
                            found.add(key);
                            results.push({
                                sentimento: mod.sentimento,
                                assunto: subjectMatch.assunto.tag,
                                categoria: subjectMatch.assunto.categoria,
                                frase: lower.slice(idx, subjectMatch.matchEnd).trim(),
                            });
                        }
                        // Marca a região toda como consumida
                        usedRegions.push([idx, subjectMatch.matchEnd]);
                    }
                }
            }
        }
    }

    return results;
}

export function detectSimpleTags(text: string): DetectedSimpleTag[] {
    const lower = text.toLowerCase();
    const results: DetectedSimpleTag[] = [];
    const found = new Set<string>();

    for (const acao of ACOES_SIMPLES) {
        const allAliases = [acao.tag, ...acao.aliases];
        for (const alias of allAliases) {
            if (lower.includes(alias) && !found.has(acao.tag)) {
                found.add(acao.tag);
                results.push({ tag: acao.tag, icon: acao.icon, cor: acao.cor });
                break;
            }
        }
    }

    return results;
}

// ============================
// COMPONENTES VISUAIS
// ============================
const sentimentoConfig: Record<Sentimento, { icon: React.ReactNode; label: string; bg: string; text: string; border: string }> = {
    negativo: { icon: <ThumbsDown size={12} />, label: 'Negativo', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    positivo: { icon: <ThumbsUp size={12} />, label: 'Positivo', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    dúvida: { icon: <HelpCircle size={12} />, label: 'Dúvida', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    neutro: { icon: <MessageCircle size={12} />, label: 'Menção', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

interface TagTextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function TagTextarea({ value, onChange, placeholder, className }: TagTextareaProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionFilter, setSuggestionFilter] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Detect tags
    const compoundTags = detectCompoundTags(value);
    const simpleTags = detectSimpleTags(value);
    const hasDetections = compoundTags.length > 0 || simpleTags.length > 0;

    // # autocomplete
    const allSuggestions = [
        ...ASSUNTOS.map(a => ({ tag: a.tag, categoria: a.categoria, cor: 'bg-blue-100 text-blue-700' })),
        ...ACOES_SIMPLES.map(a => ({ tag: a.tag, categoria: 'Ação', cor: a.cor })),
    ];

    const filteredSuggestions = allSuggestions.filter(s =>
        s.tag.toLowerCase().startsWith(suggestionFilter.toLowerCase())
    );

    const grouped = filteredSuggestions.reduce<Record<string, typeof allSuggestions>>((acc, s) => {
        if (!acc[s.categoria]) acc[s.categoria] = [];
        acc[s.categoria].push(s);
        return acc;
    }, {});

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursor = e.target.selectionStart || 0;
        onChange(newValue);
        setCursorPosition(cursor);

        const before = newValue.slice(0, cursor);
        const match = before.match(/#([\w\u00C0-\u024F]*)$/);
        if (match) {
            setSuggestionFilter(match[1]);
            setShowSuggestions(true);
            setSelectedIndex(0);
        } else {
            setShowSuggestions(false);
        }
    };

    const insertTag = (tag: string) => {
        const before = value.slice(0, cursorPosition);
        const after = value.slice(cursorPosition);
        const hashStart = before.lastIndexOf('#');
        const newValue = before.slice(0, hashStart) + tag + ' ' + after;
        onChange(newValue);
        setShowSuggestions(false);

        setTimeout(() => {
            if (textareaRef.current) {
                const newCursor = hashStart + tag.length + 1;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursor, newCursor);
            }
        }, 0);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions || filteredSuggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => (i + 1) % filteredSuggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => (i - 1 + filteredSuggestions.length) % filteredSuggestions.length);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            insertTag(filteredSuggestions[selectedIndex].tag);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
                textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        if (showSuggestions && suggestionsRef.current) {
            const el = suggestionsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            el?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex, showSuggestions]);

    return (
        <div className={`relative ${className || ''}`}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onClick={(e) => {
                    const cursor = (e.target as HTMLTextAreaElement).selectionStart || 0;
                    setCursorPosition(cursor);
                }}
                placeholder={placeholder}
                className="w-full text-sm rounded-xl border border-border bg-bg p-3 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none text-text-primary placeholder:text-text-muted"
                rows={3}
            />

            {/* Detected insights */}
            {hasDetections && (
                <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Sparkles size={12} className="text-brand" />
                        <span className="text-xs font-medium text-text-secondary">Insights detectados:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {compoundTags.map((ct, i) => {
                            const config = sentimentoConfig[ct.sentimento];
                            return (
                                <span
                                    key={`c-${i}`}
                                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium ${config.bg} ${config.text} ${config.border}`}
                                >
                                    {config.icon}
                                    <span>{ct.assunto}</span>
                                    <span className="opacity-50 text-[10px]">({ct.categoria})</span>
                                </span>
                            );
                        })}

                        {simpleTags.map((st, i) => (
                            <span
                                key={`s-${i}`}
                                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium ${st.cor}`}
                            >
                                <span>{st.icon}</span>
                                <span>{st.tag}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}



            {/* # autocomplete */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute left-0 right-0 mt-1 bg-bg-surface border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto z-50"
                >
                    {Object.entries(grouped).map(([categoria, tags]) => (
                        <div key={categoria}>
                            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted bg-black/[0.02] sticky top-0">
                                {categoria}
                            </div>
                            {tags.map(s => {
                                const globalIdx = filteredSuggestions.indexOf(s);
                                return (
                                    <button
                                        key={s.tag}
                                        data-index={globalIdx}
                                        onClick={() => insertTag(s.tag)}
                                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors ${globalIdx === selectedIndex ? 'bg-brand/5 text-brand' : 'hover:bg-black/[0.02]'
                                            }`}
                                    >
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${s.cor}`}>{s.tag}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Re-exports
export { ASSUNTOS, ACOES_SIMPLES, MODIFICADORES, sentimentoConfig };
