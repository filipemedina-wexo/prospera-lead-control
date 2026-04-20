import {
    ArrowLeft,
    MapPin,
    BedDouble,
    Car,
    Ruler,
    CheckCircle2,
    Building2,
    Armchair,
    Map
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { getEmpreendimento } from '../../data/mockData';

export function EmpreendimentoDetalhe() {
    const { setCurrentPage, selectedEmpreendimentoId } = useApp();
    const emp = selectedEmpreendimentoId ? getEmpreendimento(selectedEmpreendimentoId) : null;

    if (!emp) {
        return (
            <div className="text-center p-8">
                <p>Empreendimento não encontrado.</p>
                <Button onClick={() => setCurrentPage('meus-empreendimentos')}>Voltar</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header / Hero */}
            <div className="relative h-52 sm:h-64 md:h-80 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                {emp.imagemUrl ? (
                    <img src={emp.imagemUrl} alt={emp.nome} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Building2 size={64} className="text-white/20" />
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20 text-white">
                    <Button
                        variant="ghost"
                        className="text-white/80 hover:text-white hover:bg-white/10 p-0 h-auto mb-3 gap-2"
                        onClick={() => setCurrentPage('meus-empreendimentos')}
                    >
                        <ArrowLeft size={16} />
                        Voltar para lista
                    </Button>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1">{emp.nome}</h1>
                            <div className="flex items-center gap-2 text-white/80">
                                <MapPin size={16} />
                                <span>{emp.cidade}</span>
                                {emp.localizacao?.bairro && (
                                    <>
                                        <span>•</span>
                                        <span>{emp.localizacao.bairro}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {emp.statusObra && (
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 self-start sm:self-auto">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-sm font-medium capitalize">
                                    {emp.statusObra.replace('_', ' ')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar — em mobile aparece primeiro (cards compactos de info rápida) */}
                <div className="space-y-4 lg:order-last">
                    {/* Ficha Técnica Resumida */}
                    <Card className="p-5">
                        <h3 className="font-semibold mb-4 border-b border-border pb-2">Ficha Técnica</h3>
                        <div className="space-y-3 text-sm">
                            {emp.fichaTecnica && Object.entries(emp.fichaTecnica).map(([key, value]) => {
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return (
                                    <div key={key} className="flex justify-between py-1">
                                        <span className="text-text-muted">{label}</span>
                                        <span className="font-medium text-right text-text-primary max-w-[60%]">{value}</span>
                                    </div>
                                );
                            })}
                            {emp.entregaPrevista && (
                                <div className="flex justify-between py-1 pt-3 border-t border-border">
                                    <span className="text-text-muted">Entrega</span>
                                    <span className="font-medium text-brand">{emp.entregaPrevista}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Localização */}
                    <Card className="p-5">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Map size={16} />
                            Localização
                        </h3>
                        {emp.localizacao && (
                            <div className="space-y-4">
                                <p className="text-sm text-text-secondary">{emp.localizacao.endereco} — {emp.localizacao.bairro}</p>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Nos arredores</p>
                                    <ul className="space-y-2">
                                        {emp.localizacao.pontosInteresse.map((ponto, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                                <MapPin size={14} className="text-brand mt-0.5 shrink-0" />
                                                <span>{ponto}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button variant="secondary" className="w-full text-xs h-9">
                                    Abrir no Google Maps
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Sobre */}
                    <Card className="p-4 sm:p-6 space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Building2 size={20} className="text-brand" />
                            Sobre o Empreendimento
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                            {emp.descricao || 'Descrição não disponível.'}
                        </p>
                        {emp.diferenciais && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                {emp.diferenciais.map((dif, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-text-primary">
                                        <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                                        <span>{dif}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Plantas / Tipologias */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 px-1">
                            <Ruler size={20} className="text-brand" />
                            Plantas e Tipologias
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {emp.tipologias?.map((tipo, i) => (
                                <Card key={i} className="p-0 overflow-hidden flex flex-col sm:flex-row">
                                    <div className="w-full sm:w-48 h-40 sm:h-48 bg-gray-100 flex items-center justify-center shrink-0 sm:border-r border-b sm:border-b-0 border-border">
                                        {tipo.imagemUrl ? (
                                            <img src={tipo.imagemUrl} alt={tipo.nome} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <Ruler size={32} className="mx-auto text-text-muted mb-2" />
                                                <span className="text-xs text-text-muted">Planta indisponível</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{tipo.nome}</h3>
                                            <span className="text-brand font-bold bg-brand/10 px-2 py-1 rounded text-sm">
                                                {tipo.area}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 my-3">
                                            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                                                <BedDouble size={16} />
                                                <span>{tipo.dormitorios} Dorms ({tipo.suites} Suítes)</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                                                <Car size={16} />
                                                <span>{tipo.vagas} Vagas</span>
                                            </div>
                                        </div>
                                        {tipo.precoEstimado && (
                                            <div className="mt-auto pt-3 border-t border-border flex items-center gap-2">
                                                <span className="text-xs text-text-muted">A partir de</span>
                                                <span className="text-lg font-bold text-primary">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tipo.precoEstimado)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Lazer */}
                    {emp.itensLazer && (
                        <Card className="p-4 sm:p-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <Armchair size={20} className="text-brand" />
                                Infraestrutura e Lazer
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2">
                                {emp.itensLazer.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand/60 shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
