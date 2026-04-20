// ============================
// TYPES
// ============================

export type UserProfile = 'incorporadora' | 'imobiliaria' | 'corretor';

export type LeadStatus = 'novo' | 'em_atendimento' | 'contatado' | 'visita_marcada' | 'proposta' | 'venda' | 'perdido';

export interface Incorporadora {
    id: string;
    nome: string;
}

export interface Empreendimento {
    id: string;
    nome: string;
    cidade: string;
    formIds: string[];
    imagemUrl?: string;

    // Ficha Técnica rica
    descricao?: string;
    fichaTecnica?: {
        areaTerreno: string;
        totalUnidades: number;
        torres: number;
        andares: number;
        vagas: string;
        arquitetura?: string;
        paisagismo?: string;
        decoracao?: string;
    };
    tipologias?: {
        nome: string;
        area: string;
        dormitorios: number;
        suites: number;
        vagas: number;
        imagemUrl?: string;
        precoEstimado?: number;
    }[];
    itensLazer?: string[];
    diferenciais?: string[];
    localizacao?: {
        bairro: string;
        endereco: string;
        pontosInteresse: string[];
    };
    imagens?: string[];
    statusObra?: 'lancamento' | 'em_obras' | 'pronto';
    entregaPrevista?: string;
}

export interface Imobiliaria {
    id: string;
    nome: string;
}

export interface Corretor {
    id: string;
    nome: string;
    imobiliariaId: string;
    ativo: boolean;
    avatarUrl?: string;
    tempoOnline?: number; // horas no período
    pontos: number; // Gamification points
    empreendimentoIds?: string[]; // Empreendimentos que este corretor atende
    telefone?: string;
    email?: string;
}

export interface MetaCorretor {
    corretorId: string;
    vendasMes: number;    // meta mensal de vendas
    slaMaxMin: number;    // SLA máximo em minutos
    conversaoPct: number; // meta de conversão %
}

export interface FilaRoleta {
    corretorId: string;
    empreendimentoId: string;
    leadsRecebidos: number;
    ativo: boolean; // participando da roleta para este empreendimento
    ultimoLead?: string; // ISO date
}

export interface RankingImobiliaria {
    posicao: number;
    nomeExibido: string; // pode ser anonimizado
    scoreTotal: number;
    variacao: number; // posições subidas(+) ou caídas(-) na semana
    ehSuaImob: boolean;
}

export interface Campanha {
    id: string;
    titulo: string;
    descricao: string;
    metaPontos: number;
    premio: string;
    premioImagemUrl?: string;
    dataInicio: string;
    dataFim: string;
    ativa: boolean;
    empreendimentoId: string;
}

export interface HistoricoEntry {
    id: string;
    data: string;
    tipo: 'status_alterado' | 'lead_criado' | 'lead_distribuido' | 'lead_reatribuido' | 'lead_transferido' | 'lead_reativado' | 'lead_perdido' | 'interacao';
    descricao: string;
    autor?: string;
    de?: string;
    para?: string;
}

export interface Lead {
    id: string;
    nome: string;
    telefone: string;
    email?: string;
    empreendimentoId: string;
    imobiliariaId: string;
    corretorId: string;
    status: LeadStatus;
    tentativasContato?: number; // Contagem de tentativas falhas
    ultimaTentativa?: string; // Data da última tentativa
    motivoPerdido?: string;
    criadoEm: string;
    firstResponseAt?: string;
    dataVisita?: string; // ISO string for scheduled visit
    historico: HistoricoEntry[];
    publicToken?: string;
}

export interface Suggestion {
    id: string;
    type: 'alert' | 'opportunity' | 'task';
    title: string;
    description: string;
    actionLabel: string;
    priority: 'high' | 'medium' | 'low';
    points?: number;
}

// ============================
// MOCK DATA
// ============================

export const incorporadora: Incorporadora = {
    id: 'inc-1',
    nome: 'Construtora Horizonte',
};

export const empreendimentos: Empreendimento[] = [
    {
        id: 'emp-1',
        nome: 'Residencial Aurora',
        cidade: 'São Paulo, SP',
        formIds: ['form_001', 'form_002'],
        statusObra: 'em_obras',
        entregaPrevista: 'Dez/2026',
        descricao: 'O Residencial Aurora redefine o conceito de viver bem em São Paulo. Com arquitetura moderna e acabamentos de alto padrão, cada detalhe foi pensado para oferecer conforto e sofisticação para sua família.',
        fichaTecnica: {
            areaTerreno: '4.500 m²',
            totalUnidades: 120,
            torres: 2,
            andares: 15,
            vagas: '2 a 3 vagas determinadas',
            arquitetura: 'Jonas Birger',
            paisagismo: 'Benedito Abbud',
            decoracao: 'Fernanda Marques'
        },
        tipologias: [
            { nome: 'Apartamento Tipo A', area: '124m²', dormitorios: 3, suites: 3, vagas: 2, precoEstimado: 1250000 },
            { nome: 'Apartamento Tipo B', area: '158m²', dormitorios: 4, suites: 2, vagas: 3, precoEstimado: 1680000 },
            { nome: 'Cobertura Duplex', area: '260m²', dormitorios: 4, suites: 4, vagas: 4, precoEstimado: 3200000 }
        ],
        itensLazer: [
            'Piscina adulto e infantil com deck molhado',
            'Academia equipada (Technogym)',
            'Salão de Festas Gourmet',
            'Brinquedoteca',
            'Playground',
            'Quadra de Tênis',
            'Pet Place',
            'Coworking',
            'Sauna Seca e Úmida'
        ],
        diferenciais: [
            'Ponto para carro elétrico em todas as vagas',
            'Gerador full para todo o apartamento',
            'Persianas automatizadas nos dormitórios',
            'Fechadura biométrica na entrada social',
            'Tratamento acústico no contrapiso'
        ],
        localizacao: {
            bairro: 'Vila Mariana',
            endereco: 'Rua Vergueiro, 1234',
            pontosInteresse: [
                'Metrô Ana Rosa (5min)',
                'Parque da Aclimação (8min)',
                'Colégio Bandeirantes (10min)',
                'Shopping Pátio Paulista (12min)',
                'Pão de Açúcar (3min)',
                'Droga Raia (2min)',
                'Petz Vergueiro (5min)',
                'Hospital Santa Joana (7min)'
            ]
        }
    },
    {
        id: 'emp-2',
        nome: 'Edifício Solaris',
        cidade: 'Campinas, SP',
        formIds: ['form_003'],
        statusObra: 'lancamento',
        entregaPrevista: 'Jul/2027',
        descricao: 'Viva o sol de Campinas no Solaris. Localização privilegiada no Cambuí com todo o lazer que você merece.',
        fichaTecnica: {
            areaTerreno: '2.800 m²',
            totalUnidades: 80,
            torres: 1,
            andares: 20,
            vagas: '1 a 2 vagas',
        },
        tipologias: [
            { nome: 'Studio', area: '45m²', dormitorios: 1, suites: 0, vagas: 1, precoEstimado: 450000 },
            { nome: '2 Dorms', area: '72m²', dormitorios: 2, suites: 1, vagas: 1, precoEstimado: 720000 }
        ],
        itensLazer: ['Piscina no Rooftop', 'Academia', 'Salão de Festas', 'Lavanderia OMO'],
        localizacao: {
            bairro: 'Cambuí',
            endereco: 'Rua Maria Monteiro, 500',
            pontosInteresse: ['Centro de Convivência', 'Starbucks', 'Tênis Clube']
        }
    },
    {
        id: 'emp-3',
        nome: 'Parque das Flores',
        cidade: 'Ribeirão Preto, SP',
        formIds: ['form_004', 'form_005'],
        statusObra: 'pronto',
        descricao: 'Pronto para morar na zona sul de Ribeirão. O melhor custo-benefício da região.',
        tipologias: [
            { nome: '2 Dorms', area: '56m²', dormitorios: 2, suites: 1, vagas: 1, precoEstimado: 320000 }
        ]
    },
    { id: 'emp-4', nome: 'Vila Bela Vista', cidade: 'Santos, SP', formIds: ['form_006'] },
];

export const imobiliarias: Imobiliaria[] = [
    { id: 'imob-1', nome: 'Imobiliária Prime' },
    { id: 'imob-2', nome: 'Rede Lares' },
    { id: 'imob-3', nome: 'Casa & Cia' },
];

export const campanhaAtiva: Campanha = {
    id: 'camp-1',
    titulo: 'Semana Turbo 🚀',
    descricao: 'Atinga a meta de Pontos esta semana e garanta seu lugar no jantar exclusivo de premiação.',
    metaPontos: 1000,
    premio: 'Jantar no Terraço Itália',
    premioImagemUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    dataInicio: '2023-10-01T00:00:00Z',
    dataFim: '2023-10-07T23:59:59Z',
    ativa: true,
    empreendimentoId: 'emp-1'
};

export const corretores: Corretor[] = [
    { id: 'cor-1', nome: 'João Mendes', imobiliariaId: 'imob-1', ativo: true, tempoOnline: 42, pontos: 850, telefone: '(11) 99123-4567', email: 'joao@prime.com', empreendimentoIds: ['emp-1', 'emp-2'], avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: 'cor-2', nome: 'Maria Souza', imobiliariaId: 'imob-1', ativo: true, tempoOnline: 35, pontos: 620, telefone: '(11) 98765-1234', email: 'maria@prime.com', empreendimentoIds: ['emp-1', 'emp-3'], avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: 'cor-3', nome: 'Carlos Lima', imobiliariaId: 'imob-1', ativo: false, tempoOnline: 0, pontos: 120, telefone: '(11) 97654-9876', email: 'carlos@prime.com', empreendimentoIds: [] },
    { id: 'cor-4', nome: 'Ana Oliveira', imobiliariaId: 'imob-2', ativo: true, tempoOnline: 28, pontos: 450 },
    { id: 'cor-5', nome: 'Pedro Santos', imobiliariaId: 'imob-2', ativo: true, tempoOnline: 31, pontos: 980 },
    { id: 'cor-6', nome: 'Lucia Ferreira', imobiliariaId: 'imob-3', ativo: true, tempoOnline: 15, pontos: 340 },
    { id: 'cor-7', nome: 'Rafael Costa', imobiliariaId: 'imob-3', ativo: true, tempoOnline: 12, pontos: 210 },
    { id: 'cor-8', nome: 'Beatriz Almeida', imobiliariaId: 'imob-3', ativo: true, tempoOnline: 45, pontos: 750 },
];

export const metasCorretores: MetaCorretor[] = [
    { corretorId: 'cor-1', vendasMes: 3, slaMaxMin: 5, conversaoPct: 15 },
    { corretorId: 'cor-2', vendasMes: 2, slaMaxMin: 8, conversaoPct: 12 },
    { corretorId: 'cor-3', vendasMes: 2, slaMaxMin: 10, conversaoPct: 10 },
];

export const filaRoleta: FilaRoleta[] = [
    // emp-1 (Residencial Aurora) — cor-1 e cor-2 ativas
    { corretorId: 'cor-1', empreendimentoId: 'emp-1', leadsRecebidos: 7, ativo: true, ultimoLead: new Date(Date.now() - 3600000 * 2).toISOString() },
    { corretorId: 'cor-2', empreendimentoId: 'emp-1', leadsRecebidos: 6, ativo: true, ultimoLead: new Date(Date.now() - 3600000 * 5).toISOString() },
    { corretorId: 'cor-3', empreendimentoId: 'emp-1', leadsRecebidos: 2, ativo: false },
    // emp-2 (Edifício Solaris) — só cor-1
    { corretorId: 'cor-1', empreendimentoId: 'emp-2', leadsRecebidos: 3, ativo: true, ultimoLead: new Date(Date.now() - 3600000 * 120).toISOString() },
    // emp-3 (Parque das Flores) — só cor-2
    { corretorId: 'cor-2', empreendimentoId: 'emp-3', leadsRecebidos: 4, ativo: true, ultimoLead: new Date(Date.now() - 3600000 * 24).toISOString() },
];

export const rankingImobiliarias: RankingImobiliaria[] = [
    { posicao: 1, nomeExibido: 'Imobiliária #1', scoreTotal: 4820, variacao: 0, ehSuaImob: false },
    { posicao: 2, nomeExibido: 'Imobiliária Prime', scoreTotal: 3910, variacao: 1, ehSuaImob: true },
    { posicao: 3, nomeExibido: 'Imobiliária #3', scoreTotal: 3450, variacao: -1, ehSuaImob: false },
    { posicao: 4, nomeExibido: 'Imobiliária #4', scoreTotal: 2980, variacao: 2, ehSuaImob: false },
    { posicao: 5, nomeExibido: 'Imobiliária #5', scoreTotal: 2100, variacao: 0, ehSuaImob: false },
];

function makeHistory(leadId: string, status: LeadStatus, criadoEm: string, corretorNome: string, imobNome: string, firstResponseAt?: string): HistoricoEntry[] {
    const h: HistoricoEntry[] = [
        { id: `${leadId}-h1`, data: criadoEm, tipo: 'lead_criado', descricao: 'Lead recebido via Meta Lead Ads' },
        { id: `${leadId}-h2`, data: criadoEm, tipo: 'lead_distribuido', descricao: `Distribuído para ${corretorNome} (${imobNome}) via Round Robin` },
    ];

    if (firstResponseAt) {
        h.push({ id: `${leadId}-h3`, data: firstResponseAt, tipo: 'status_alterado', descricao: 'Status alterado', de: 'novo', para: 'contatado', autor: corretorNome });
    }

    const statusFlow: LeadStatus[] = ['contatado', 'visita_marcada', 'proposta', 'venda'];
    const idx = statusFlow.indexOf(status);

    if (idx >= 1 && firstResponseAt) {
        for (let i = 1; i <= idx; i++) {
            h.push({
                id: `${leadId}-h${3 + i}`,
                data: new Date(new Date(firstResponseAt).getTime() + i * 86400000).toISOString(),
                tipo: 'status_alterado',
                descricao: 'Status alterado',
                de: statusFlow[i - 1],
                para: statusFlow[i],
                autor: corretorNome,
            });
        }
    }

    if (status === 'perdido') {
        h.push({ id: `${leadId}-hp`, data: new Date().toISOString(), tipo: 'lead_perdido', descricao: 'Lead marcado como perdido' });
    }

    return h;
}

const now = new Date();
function daysAgo(d: number) { return new Date(now.getTime() - d * 86400000).toISOString(); }
function hoursAgo(h: number) { return new Date(now.getTime() - h * 3600000).toISOString(); }
function minutesAgo(m: number) { return new Date(now.getTime() - m * 60000).toISOString(); }

export const leads: Lead[] = [
    // Recent — novos (sem first_response)
    { id: 'lead-1', nome: 'Fernanda Alves', telefone: '(11) 99876-5432', email: 'fernanda@email.com', empreendimentoId: 'emp-1', imobiliariaId: 'imob-1', corretorId: 'cor-1', status: 'novo', criadoEm: minutesAgo(3), historico: makeHistory('lead-1', 'novo', minutesAgo(3), 'João Mendes', 'Imobiliária Prime'), publicToken: 'H7k2La' },
    { id: 'lead-2', nome: 'Ricardo Barros', telefone: '(11) 98765-4321', empreendimentoId: 'emp-2', imobiliariaId: 'imob-2', corretorId: 'cor-4', status: 'novo', criadoEm: minutesAgo(8), historico: makeHistory('lead-2', 'novo', minutesAgo(8), 'Ana Oliveira', 'Rede Lares'), publicToken: 'x9P2mQ' },
    { id: 'lead-3', nome: 'Camila Torres', telefone: '(19) 99654-3210', empreendimentoId: 'emp-3', imobiliariaId: 'imob-3', corretorId: 'cor-6', status: 'novo', criadoEm: minutesAgo(15), historico: makeHistory('lead-3', 'novo', minutesAgo(15), 'Lucia Ferreira', 'Casa & Cia'), publicToken: 'j8L1nZ' },

    // Contatados
    { id: 'lead-4', nome: 'Bruno Nascimento', telefone: '(11) 97654-3210', empreendimentoId: 'emp-1', imobiliariaId: 'imob-1', corretorId: 'cor-2', status: 'contatado', criadoEm: hoursAgo(2), firstResponseAt: hoursAgo(1.8), historico: makeHistory('lead-4', 'contatado', hoursAgo(2), 'Maria Souza', 'Imobiliária Prime', hoursAgo(1.8)) },
    { id: 'lead-5', nome: 'Juliana Pires', telefone: '(16) 98543-2109', empreendimentoId: 'emp-3', imobiliariaId: 'imob-2', corretorId: 'cor-5', status: 'contatado', criadoEm: hoursAgo(5), firstResponseAt: hoursAgo(4.5), historico: makeHistory('lead-5', 'contatado', hoursAgo(5), 'Pedro Santos', 'Rede Lares', hoursAgo(4.5)) },
    { id: 'lead-6', nome: 'Marcos Vieira', telefone: '(13) 97432-1098', empreendimentoId: 'emp-4', imobiliariaId: 'imob-3', corretorId: 'cor-7', status: 'contatado', criadoEm: hoursAgo(6), firstResponseAt: hoursAgo(5.9), historico: makeHistory('lead-6', 'contatado', hoursAgo(6), 'Rafael Costa', 'Casa & Cia', hoursAgo(5.9)) },

    // Visita marcada
    { id: 'lead-7', nome: 'Patrícia Rocha', telefone: '(11) 96321-0987', empreendimentoId: 'emp-1', imobiliariaId: 'imob-1', corretorId: 'cor-1', status: 'visita_marcada', criadoEm: daysAgo(3), firstResponseAt: daysAgo(2.9), historico: makeHistory('lead-7', 'visita_marcada', daysAgo(3), 'João Mendes', 'Imobiliária Prime', daysAgo(2.9)) },
    { id: 'lead-8', nome: 'Thiago Martins', telefone: '(19) 95210-9876', empreendimentoId: 'emp-2', imobiliariaId: 'imob-2', corretorId: 'cor-4', status: 'visita_marcada', criadoEm: daysAgo(4), firstResponseAt: daysAgo(3.8), historico: makeHistory('lead-8', 'visita_marcada', daysAgo(4), 'Ana Oliveira', 'Rede Lares', daysAgo(3.8)) },

    // Proposta
    { id: 'lead-9', nome: 'Daniela Freitas', telefone: '(11) 94109-8765', empreendimentoId: 'emp-1', imobiliariaId: 'imob-3', corretorId: 'cor-8', status: 'proposta', criadoEm: daysAgo(7), firstResponseAt: daysAgo(6.9), historico: makeHistory('lead-9', 'proposta', daysAgo(7), 'Beatriz Almeida', 'Casa & Cia', daysAgo(6.9)) },
    { id: 'lead-10', nome: 'Eduardo Campos', telefone: '(16) 93098-7654', empreendimentoId: 'emp-3', imobiliariaId: 'imob-1', corretorId: 'cor-2', status: 'proposta', criadoEm: daysAgo(10), firstResponseAt: daysAgo(9.8), historico: makeHistory('lead-10', 'proposta', daysAgo(10), 'Maria Souza', 'Imobiliária Prime', daysAgo(9.8)) },

    // Venda
    { id: 'lead-11', nome: 'Larissa Campos', telefone: '(11) 92987-6543', empreendimentoId: 'emp-1', imobiliariaId: 'imob-2', corretorId: 'cor-5', status: 'venda', criadoEm: daysAgo(20), firstResponseAt: daysAgo(19.9), historico: makeHistory('lead-11', 'venda', daysAgo(20), 'Pedro Santos', 'Rede Lares', daysAgo(19.9)) },
    { id: 'lead-12', nome: 'Roberto Silva', telefone: '(13) 91876-5432', empreendimentoId: 'emp-4', imobiliariaId: 'imob-1', corretorId: 'cor-1', status: 'venda', criadoEm: daysAgo(25), firstResponseAt: daysAgo(24.8), historico: makeHistory('lead-12', 'venda', daysAgo(25), 'João Mendes', 'Imobiliária Prime', daysAgo(24.8)) },

    // Perdidos
    { id: 'lead-13', nome: 'Vanessa Lopes', telefone: '(11) 90765-4321', empreendimentoId: 'emp-2', imobiliariaId: 'imob-3', corretorId: 'cor-6', status: 'perdido', motivoPerdido: 'Sem interesse no momento, vai viajar', criadoEm: daysAgo(12), firstResponseAt: daysAgo(11.5), historico: makeHistory('lead-13', 'perdido', daysAgo(12), 'Lucia Ferreira', 'Casa & Cia', daysAgo(11.5)) },
    { id: 'lead-14', nome: 'Alexandre Nunes', telefone: '(19) 89654-3210', empreendimentoId: 'emp-3', imobiliariaId: 'imob-2', corretorId: 'cor-4', status: 'perdido', motivoPerdido: 'Comprou em outro empreendimento', criadoEm: daysAgo(15), firstResponseAt: daysAgo(14.8), historico: makeHistory('lead-14', 'perdido', daysAgo(15), 'Ana Oliveira', 'Rede Lares', daysAgo(14.8)) },
    { id: 'lead-15', nome: 'Simone Cardoso', telefone: '(11) 88543-2109', empreendimentoId: 'emp-1', imobiliariaId: 'imob-1', corretorId: 'cor-2', status: 'perdido', motivoPerdido: 'Não atende telefone há 2 semanas', criadoEm: daysAgo(18), firstResponseAt: daysAgo(17), historico: makeHistory('lead-15', 'perdido', daysAgo(18), 'Maria Souza', 'Imobiliária Prime', daysAgo(17)) },

    // Extra leads for volume
    { id: 'lead-16', nome: 'Gustavo Ribeiro', telefone: '(11) 87432-1098', empreendimentoId: 'emp-4', imobiliariaId: 'imob-3', corretorId: 'cor-7', status: 'contatado', criadoEm: daysAgo(1), firstResponseAt: daysAgo(0.9), historico: makeHistory('lead-16', 'contatado', daysAgo(1), 'Rafael Costa', 'Casa & Cia', daysAgo(0.9)) },
    { id: 'lead-17', nome: 'Isabela Dias', telefone: '(16) 86321-0987', empreendimentoId: 'emp-2', imobiliariaId: 'imob-1', corretorId: 'cor-1', status: 'visita_marcada', criadoEm: daysAgo(5), firstResponseAt: daysAgo(4.8), historico: makeHistory('lead-17', 'visita_marcada', daysAgo(5), 'João Mendes', 'Imobiliária Prime', daysAgo(4.8)) },
    { id: 'lead-18', nome: 'Felipe Moura', telefone: '(13) 85210-9876', empreendimentoId: 'emp-4', imobiliariaId: 'imob-2', corretorId: 'cor-5', status: 'novo', criadoEm: minutesAgo(25), historico: makeHistory('lead-18', 'novo', minutesAgo(25), 'Pedro Santos', 'Rede Lares') },
    { id: 'lead-19', nome: 'Renata Gomes', telefone: '(11) 84109-8765', empreendimentoId: 'emp-1', imobiliariaId: 'imob-3', corretorId: 'cor-8', status: 'contatado', criadoEm: hoursAgo(8), firstResponseAt: hoursAgo(7.5), historico: makeHistory('lead-19', 'contatado', hoursAgo(8), 'Beatriz Almeida', 'Casa & Cia', hoursAgo(7.5)) },
    { id: 'lead-20', nome: 'Lucas Teixeira', telefone: '(19) 83098-7654', empreendimentoId: 'emp-3', imobiliariaId: 'imob-1', corretorId: 'cor-2', status: 'novo', criadoEm: minutesAgo(45), historico: makeHistory('lead-20', 'novo', minutesAgo(45), 'Maria Souza', 'Imobiliária Prime') },
];

// ============================
// HELPERS
// ============================

export const statusLabels: Record<LeadStatus, string> = {
    novo: 'Novo',
    em_atendimento: 'Em Atendimento',
    contatado: 'Contatado',
    visita_marcada: 'Visita Marcada',
    proposta: 'Proposta',
    venda: 'Venda',
    perdido: 'Perdido',
};

export const statusColors: Record<LeadStatus, string> = {
    novo: 'bg-blue-50 text-blue-700',
    em_atendimento: 'bg-teal-50 text-teal-700',
    contatado: 'bg-sky-50 text-sky-700',
    visita_marcada: 'bg-violet-50 text-violet-700',
    proposta: 'bg-amber-50 text-amber-700',
    venda: 'bg-green-50 text-green-700',
    perdido: 'bg-red-50 text-red-600',
};

export function getEmpreendimento(id: string) { return empreendimentos.find(e => e.id === id); }
export function getImobiliaria(id: string) { return imobiliarias.find(i => i.id === id); }
export function getCorretor(id: string) { return corretores.find(c => c.id === id); }

export function getSlaMinutes(lead: Lead): number | null {
    if (!lead.firstResponseAt) return null;
    return Math.round((new Date(lead.firstResponseAt).getTime() - new Date(lead.criadoEm).getTime()) / 60000);
}

export function isSlaEstourado(lead: Lead): boolean {
    if (lead.firstResponseAt) {
        return getSlaMinutes(lead)! > 10;
    }
    // Still waiting
    return (Date.now() - new Date(lead.criadoEm).getTime()) > 10 * 60000;
}

export function getLeadByToken(token: string) { return leads.find(l => l.publicToken === token); }

export function trackLeadEvent(token: string, event: string, details?: string) {
    const lead = getLeadByToken(token);
    if (!lead) return;
    lead.historico.unshift({
        id: `evt-${Date.now()}-${Math.random()}`,
        data: new Date().toISOString(),
        tipo: 'interacao',
        descricao: `${event} ${details ? `(${details})` : ''}`,
        autor: 'Cliente (Site)'
    });
}

export const statsCards = [
    { id: 1, label: 'Tempo de Resposta', value: '8 min', change: '-2m', trend: 'up', description: 'Média de atendimento (Meta: <10min)', icon: 'Clock', color: 'blue' },
    { id: 2, label: 'Cadência', value: '98%', change: '+2%', trend: 'up', description: 'Leads com follow-up em dia', icon: 'CheckCircle2', color: 'green' },
    { id: 3, label: 'Novas Visitas', value: '12', change: '+4', trend: 'up', description: 'Agendadas esta semana', icon: 'Calendar', color: 'violet' },
    { id: 4, label: 'Leads Ativos', value: '45', change: '+5', trend: 'neutral', description: 'Em atendimento agora', icon: 'Users', color: 'amber' },
];

export const smartSuggestions: Suggestion[] = [
    { id: 's1', type: 'opportunity', title: 'Lead Quente 🔥', description: 'Ricardo Barros visualizou o tour virtual 3x hoje. Ligue agora!', actionLabel: 'Ligar', priority: 'high', points: 50 },
    { id: 's2', type: 'alert', title: 'Atenção Necessária', description: '3 leads novos ainda não foram contatados. Evite perder o SLA.', actionLabel: 'Contatar', priority: 'high' },
    { id: 's3', type: 'task', title: 'Enriqueça os Dados', description: 'Preencha o perfil de 5 leads para melhorar suas recomendações.', actionLabel: 'Preencher', priority: 'medium', points: 20 },
];

export const pipelineStages = [
    { name: 'Novo', count: 45, value: 'R$ 22M', color: '#3B82F6' },
    { name: 'Em Atendimento', count: 12, value: 'R$ 5M', color: '#14B8A6' },
    { name: 'Contatado', count: 32, value: 'R$ 15M', color: '#0EA5E9' },
    { name: 'Visita', count: 18, value: 'R$ 9M', color: '#8B5CF6' },
    { name: 'Proposta', count: 8, value: 'R$ 4M', color: '#F59E0B' },
    { name: 'Venda', count: 5, value: 'R$ 2.5M', color: '#10B981' },
    { name: 'Perdido', count: 20, value: '-', color: '#EF4444' },
];

export const recentLeads = leads.slice(0, 5);

export const activityLog = [
    { id: 1, icon: 'user-plus', action: 'Novo lead', target: 'Pedro Silva', time: '10 min atrás' },
    { id: 2, icon: 'check-circle', action: 'Status alterado', target: 'Maria Souza (Visita)', time: '1h atrás' },
    { id: 3, icon: 'edit', action: 'Nota adicionada', target: 'João Mendes', time: '2h atrás' },
];

export const performanceMetas = {
    weeklyGoal: 75,
    monthlyTarget: 'R$ 5.0M',
    monthlyAchieved: 'R$ 2.4M',
    tasksCompleted: 45,
    tasksPending: 12,
};

export const performanceData = [
    { name: 'Seg', leads: 4, vendas: 0 },
    { name: 'Ter', leads: 7, vendas: 1 },
    { name: 'Qua', leads: 5, vendas: 0 },
    { name: 'Qui', leads: 9, vendas: 2 },
    { name: 'Sex', leads: 6, vendas: 1 },
    { name: 'Sab', leads: 3, vendas: 0 },
    { name: 'Dom', leads: 2, vendas: 0 },
];
