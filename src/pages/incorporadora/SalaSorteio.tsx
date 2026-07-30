import { useState, useEffect } from 'react';
import { Trophy, Users, CheckCircle2, Ticket, Sparkles, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function SalaSorteio() {
    const { setCurrentPage } = useApp();
    const [soundOn, setSoundOn] = useState(true);
    const [status, setStatus] = useState<'espera' | 'sorteando' | 'resultado'>('espera');
    const [countdown, setCountdown] = useState(5);
    const [winner, setWinner] = useState<{nome: string, imob: string, ticket: string} | null>(null);
    const [ticketDigit, setTicketDigit] = useState('');

    const PIN_CODE = "A7X9P2"; // Mocked unique code

    // Mock participants pool
    const mockTickets = [
        { nome: 'João Mendes', imob: 'Imobiliária Prime', ticket: '7829-AZ' },
        { nome: 'Ana Oliveira', imob: 'Rede Lares', ticket: '4412-BQ' },
        { nome: 'Beatriz Almeida', imob: 'Casa & Cia', ticket: '9921-CX' },
        { nome: 'Pedro Santos', imob: 'Rede Lares', ticket: '1102-DX' },
        { nome: 'Maria Souza', imob: 'Imobiliária Prime', ticket: '5561-EW' }
    ];

    const generateRandomTicketDisplay = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let res = '';
        for (let i = 0; i < 7; i++) {
            if (i === 4) res += '-';
            else res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return res;
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'sorteando') {
            // Roleta visual
            interval = setInterval(() => {
                setTicketDigit(generateRandomTicketDisplay());
            }, 80); // Rapid flicker effect

            // After 5s of drama, stop on a winner
            setTimeout(() => {
                clearInterval(interval);
                const winningProfile = mockTickets[Math.floor(Math.random() * mockTickets.length)];
                setTicketDigit(winningProfile.ticket);
                setWinner(winningProfile);
                setStatus('resultado');
            }, 6000);
        }
        return () => clearInterval(interval);
    }, [status]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'espera' && countdown > 0) {
            // Just for visual effect in this prototype: countdown loop or manual trigger
            // We'll leave it manual with the "Iniciar" button for better UX demonstration
        }
        return () => clearInterval(interval);
    }, [status, countdown]);

    const handleStart = () => {
        setStatus('sorteando');
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden animate-fade-in font-sans">
            
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lvl-gold/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 w-full h-[50vh] bg-gradient-to-t from-black via-slate-900/80 to-transparent" />
            </div>

            {/* Header / Nav */}
            <header className="relative z-10 p-6 flex items-center justify-between">
                <button 
                    onClick={() => setCurrentPage('campanhas')}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                    <span>Voltar ao Painel</span>
                </button>
                <div className="flex items-center gap-4">
                    <button onClick={() => setSoundOn(!soundOn)} className="text-white/50 hover:text-white transition-colors">
                        {soundOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                    <div className="px-4 py-1.5 rounded-full bg-red-600 animate-pulse text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        AO VIVO
                    </div>
                </div>
            </header>

            {/* Main Stage */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                
                {status === 'espera' && (
                    <div className="max-w-2xl mx-auto space-y-12 animate-slide-up">
                        <div className="space-y-4">
                            <Trophy size={48} className="mx-auto text-lvl-gold" />
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-lvl-gold to-yellow-600">
                                Sorteio Fim de Ano
                            </h1>
                            <p className="text-xl text-white/60">Aguardando início do sorteio oficial...</p>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center shadow-2xl">
                            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">Código de Acesso à Sala</h3>
                            <div className="text-6xl md:text-8xl font-mono font-bold tracking-widest mb-6">
                                {PIN_CODE}
                            </div>
                            <div className="flex items-center gap-2 text-white/50">
                                <Users size={18} />
                                <span>24 imobiliárias e 156 corretores conectados assistindo.</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleStart}
                            className="mt-10 px-12 py-4 bg-gradient-to-r from-lvl-gold to-yellow-600 text-black text-xl font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(198,168,124,0.4)]"
                        >
                            INICIAR SORTEIO AGORA
                        </button>
                    </div>
                )}

                {status === 'sorteando' && (
                    <div className="max-w-4xl mx-auto space-y-12 w-full animate-fade-in">
                        <h2 className="text-2xl font-semibold text-white/60 mb-20 uppercase tracking-[0.2em] animate-pulse">
                            Sorteando Bilhete Vencedor...
                        </h2>
                        
                        <div className="h-40 flex items-center justify-center">
                            <div className="text-7xl md:text-[120px] font-mono font-bold tracking-[0.1em] text-white tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                                {ticketDigit}
                            </div>
                        </div>
                    </div>
                )}

                {status === 'resultado' && winner && (
                    <div className="max-w-3xl mx-auto w-full animate-slide-up relative">
                        {/* Confetti simulation elements could go here */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 animate-bounce">
                            <Sparkles size={48} className="text-lvl-gold" />
                        </div>

                        <div className="text-center space-y-6 pt-10">
                            <div className="text-lvl-gold text-2xl font-bold tracking-[0.2em] uppercase mb-10">
                                🎉 Vencedor Sorteado 🎉
                            </div>
                            
                            <div className="bg-gradient-to-b from-lvl-gold/20 to-transparent border border-lvl-gold/40 rounded-3xl p-10 md:p-14 shadow-[0_0_100px_rgba(198,168,124,0.2)] backdrop-blur-lg">
                                <div className="inline-flex items-center justify-center bg-lvl-gold/20 p-4 rounded-full mb-6">
                                    <Ticket size={40} className="text-lvl-gold" />
                                </div>
                                <div className="text-4xl md:text-5xl font-mono font-bold text-white mb-8 tracking-widest drop-shadow-md">
                                    {winner.ticket}
                                </div>
                                <div className="w-24 h-1 bg-lvl-gold/30 mx-auto rounded-full mb-8" />
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{winner.nome}</h1>
                                <h3 className="text-2xl text-lvl-gold font-medium">{winner.imob}</h3>
                            </div>

                            <button 
                                onClick={() => setStatus('espera')}
                                className="mt-8 px-6 py-2 text-white/50 hover:text-white font-medium transition-colors"
                            >
                                Fazer novo sorteio
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-6 flex justify-between items-end border-t border-white/5">
                <div className="text-white/30 text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} /> Sistema com RNG Auditável Prospéra
                </div>
                <div className="text-lvl-gold/50 font-bold tracking-widest text-xl opacity-50">
                    <span className="text-white">PROS</span>PÉRA
                </div>
            </footer>

        </div>
    );
}
