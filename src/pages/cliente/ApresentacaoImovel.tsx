import { useState, useEffect, useRef } from 'react';
import {
    MapPin,
    MessageCircle,
    Check,
    Star,
    ChevronLeft,
    ChevronRight,
    Building2,
    LayoutDashboard,
    Quote,
    Store, // Mercado/Shopping
    GraduationCap, // Escola
    Trees, // Parque
    Train, // Metrô
    Stethoscope, // Hospital
    ShoppingBag, // Shopping
    X, // Close modal
    ZoomIn
} from 'lucide-react';
import { getLeadByToken, getEmpreendimento, getCorretor, trackLeadEvent } from '../../data/mockData';

interface Props {
    token: string;
}

export function ApresentacaoImovel({ token }: Props) {
    const lead = getLeadByToken(token);
    const [activeImage, setActiveImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const startTimeRef = useRef<number>(Date.now());

    // Safety check
    if (!lead) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
                <p>Apresentação não encontrada ou expirada.</p>
            </div>
        );
    }

    const empreendimento = getEmpreendimento(lead.empreendimentoId);
    const corretor = getCorretor(lead.corretorId);

    // Default images if none properly defined
    const images = empreendimento?.imagens && empreendimento.imagens.length > 0
        ? empreendimento.imagens
        : [
            empreendimento?.imagemUrl || 'https://images.unsplash.com/photo-1600596542815-2a4d9f6facb8?auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80', // Living room placeholder
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1920&q=80', // Kitchen placeholder
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=80'  // Pool placeholder
        ];

    // Tracking: Page View
    useEffect(() => {
        trackLeadEvent(token, 'Visualizou a apresentação');

        // Track time on first image
        startTimeRef.current = Date.now();

        return () => {
            // Track exit? Maybe too complex for now.
        };
    }, [token]);

    // Tracking: Image Gallery
    const handleImageChange = (newIndex: number) => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        if (duration > 0.5) { // Only log if viewed for > 0.5s
            trackLeadEvent(token, 'Visualizou Imagem', `Img ${activeImage + 1} por ${duration.toFixed(1)}s`);
        }

        setActiveImage(newIndex);
        startTimeRef.current = Date.now();
    };

    const nextImage = () => handleImageChange((activeImage + 1) % images.length);
    const prevImage = () => handleImageChange((activeImage - 1 + images.length) % images.length);

    const handleWhatsAppClick = () => {
        trackLeadEvent(token, 'Clicou no WhatsApp');
        window.open(`https://wa.me/55${corretor?.id === 'cor-1' ? '11999999999' : '11988888888'}?text=Olá ${corretor?.nome}, vi a apresentação do ${empreendimento?.nome}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-brand/20 selection:text-brand">

            {/* Top Bar - Personalized */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-bold text-white text-sm">P</div>
                    <span className="font-semibold text-sm tracking-tight hidden sm:inline">Prospera</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Exclusivo para</span>
                    <span className="text-sm font-bold text-slate-900">{lead.nome.split(' ')[0]}</span>
                </div>
            </div>

            {/* Hero Section - Immersive */}
            <div className="relative h-[60vh] md:h-[70vh] bg-slate-900 overflow-hidden group">
                <img
                    src={images[0]}
                    alt={empreendimento?.nome}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 mb-8 animate-in slide-in-from-bottom-10 duration-700">
                    <div className="max-w-4xl mx-auto">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-4">
                            Oportunidade Selecionada
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                            {empreendimento?.nome}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-200 max-w-2xl font-light leading-relaxed">
                            {empreendimento?.descricao || 'Um empreendimento único com tudo o que você e sua família merecem.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-24">
                {/* Broker Message Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 mb-12 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
                                {corretor?.avatarUrl ? (
                                    <img src={corretor.avatarUrl} alt={corretor.nome} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xl font-bold">
                                        {corretor?.nome.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center">
                                <MessageCircle size={10} className="text-white fill-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Quote size={20} className="text-brand/40" />
                                <h2 className="text-lg font-bold text-slate-800">Olá, {lead.nome.split(' ')[0]}!</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed italic">
                                "Lembrei de você assim que vi este projeto. Acredito que a localização e a área de lazer são exatamente o que sua família busca para viver com qualidade."
                            </p>
                            <div className="mt-4 flex flex-wrap gap-4 items-center">
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">{corretor?.nome}</p>
                                    <p className="text-xs text-slate-500">Seu Consultor Especialista</p>
                                </div>
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="ml-auto bg-brand text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-brand/20 hover:bg-brand-dark hover:shadow-brand/30 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <MessageCircle size={18} />
                                    Falar no WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                        <Building2 size={24} className="text-brand mb-2" />
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Unidades</span>
                        <span className="font-bold text-slate-900">{empreendimento?.fichaTecnica?.totalUnidades || '120'} aptos</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                        <LayoutDashboard size={24} className="text-brand mb-2" />
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Área</span>
                        <span className="font-bold text-slate-900">{empreendimento?.tipologias?.[0]?.area || '120m²'}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                        <MapPin size={24} className="text-brand mb-2" />
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Bairro</span>
                        <span className="font-bold text-slate-900">{empreendimento?.localizacao?.bairro || 'Zona Sul'}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                        <Star size={24} className="text-brand mb-2" />
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</span>
                        <span className="font-bold text-slate-900 capitalize">{empreendimento?.statusObra?.replace('_', ' ') || 'Lançamento'}</span>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Galeria de Fotos</h2>
                        <div className="flex gap-2">
                            <button onClick={prevImage} className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={nextImage} className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden shadow-sm relative group">
                        <img
                            src={images[activeImage]}
                            alt={`Galeria ${activeImage + 1}`}
                            className="w-full h-full object-cover transition-all duration-500 cursor-zoom-in"
                            onClick={() => setIsZoomed(true)}
                        />
                        <button
                            onClick={() => setIsZoomed(true)}
                            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ZoomIn size={20} />
                        </button>
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                            {activeImage + 1} / {images.length}
                        </div>

                        {/* Interactive overlay instructions if needed */}
                        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                                <ChevronLeft size={24} className="text-white" />
                            </div>
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                                <ChevronRight size={24} className="text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleImageChange(idx)}
                                className={`w-20 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plans / Details Section */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Ficha Técnica e Plantas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {empreendimento?.tipologias?.map((tipo, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{tipo.nome}</h3>
                                <p className="text-3xl font-bold text-brand mb-6">{tipo.area}<span className="text-lg text-slate-500 font-normal">m²</span></p>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500 text-sm">Dormitórios</span>
                                        <span className="font-bold text-slate-900">{tipo.dormitorios} ({tipo.suites} suítes)</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500 text-sm">Vagas</span>
                                        <span className="font-bold text-slate-900">{tipo.vagas}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Location Section */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Localização e Entorno</h2>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{empreendimento?.localizacao?.bairro || 'Localização Privilegiada'}</h3>
                                <p className="text-sm text-slate-500">{empreendimento?.localizacao?.endereco || 'Endereço sob consulta'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                            {empreendimento?.localizacao?.pontosInteresse?.map((point, idx) => {
                                let Icon = MapPin;
                                const p = point.toLowerCase();
                                if (p.includes('metrô') || p.includes('trem')) Icon = Train;
                                else if (p.includes('parque') || p.includes('praça')) Icon = Trees;
                                else if (p.includes('colégio') || p.includes('escola') || p.includes('faculdade')) Icon = GraduationCap;
                                else if (p.includes('shopping')) Icon = ShoppingBag;
                                else if (p.includes('mercado') || p.includes('pão') || p.includes('pet')) Icon = Store; // Fallback for pet/market
                                else if (p.includes('hospital') || p.includes('droga')) Icon = Stethoscope;

                                return (
                                    <div key={idx} className="flex items-center gap-3">
                                        <Icon size={16} className="text-slate-400 shrink-0" />
                                        <span className="text-slate-600">{point}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Map Embed */}
                    <div className="mt-6 rounded-xl overflow-hidden shadow-sm h-64 w-full">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.065692994933!2d-46.65345718502206!3d-23.564611184681436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1614187000000!5m2!1spt-BR!2sbr"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* Highlights */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Lazer e Condomínio</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(empreendimento?.itensLazer || []).slice(0, 6).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-brand/20 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                                    <Check size={16} strokeWidth={3} />
                                </div>
                                <span className="font-medium text-slate-700">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Image Zoom Modal */}
            {isZoomed && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setIsZoomed(false)}>
                    <button
                        onClick={() => setIsZoomed(false)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={32} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronRight size={32} />
                    </button>
                    <img
                        src={images[activeImage]}
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-300"
                        alt="Zoom"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm">
                        {activeImage + 1} / {images.length}
                    </div>
                </div>
            )}

            {/* CTA Footer - Sticky Mobile/Desktop */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Interessado?</p>
                        <p className="font-bold text-slate-900">Agende sua visita hoje mesmo.</p>
                    </div>
                    <button
                        onClick={handleWhatsAppClick}
                        className="w-full md:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={20} className="fill-white" />
                        <span className="text-lg">Quero agendar visita</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
