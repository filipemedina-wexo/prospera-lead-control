import { useState } from 'react';
import { PlayCircle, Award, CheckCircle2, Lock } from 'lucide-react';
import { useTour } from '../../context/TourContext';

const COURSES = [
    {
        id: 'onboarding-101',
        title: 'Domine a Prospera',
        description: 'Aprenda os conceitos básicos da plataforma e ganhe seus primeiros XP.',
        xp: 100,
        progress: 100,
        unlocked: true,
        modules: [
            { id: 'm1', title: 'Dashboard Mágico', duration: '2 min' },
            { id: 'm2', title: 'A Roleta de Leads', duration: '5 min' },
        ]
    },
    {
        id: 'fechamento-ninja',
        title: 'Mestre do Fechamento',
        description: 'Técnicas de follow-up que dobram a conversão em menos de 15 minutos.',
        xp: 250,
        progress: 0,
        unlocked: true,
        modules: [
            { id: 'm3', title: 'A Regra dos 2 Minutos', duration: '10 min' },
            { id: 'm4', title: 'Script Infalível', duration: '15 min' },
        ]
    },
    {
        id: 'gestao-avancada',
        title: 'Gestor de Alta Performance',
        description: 'Como configurar SLA, campanhas e recompensas corretas.',
        xp: 500,
        progress: 0,
        unlocked: false,
        modules: [
            { id: 'm5', title: 'Matemática do SLA', duration: '20 min' },
        ]
    }
];

export function Academia() {
    const { progress } = useTour();

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Módulo */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand opacity-20 blur-[100px] rounded-full mix-blend-screen" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Academia <span className="text-brand font-black">PRO</span></h1>
                        </div>
                        <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
                            Aprenda, aplique e suba no ranking. Conclua os módulos oficiais, ganhe XP e domine a ferramenta.
                        </p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col items-center min-w-[140px]">
                        <p className="text-xs text-slate-300 font-bold tracking-wider uppercase mb-1">Seu Nível</p>
                        <div className="flex items-center gap-2">
                            <Award className="text-brand" size={28} />
                            <span className="text-4xl font-black">{progress.level}</span>
                        </div>
                        <p className="text-sm font-semibold mt-2 text-amber-500">{progress.xp} XP acumulados</p>
                    </div>
                </div>
            </div>

            {/* Cursos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {COURSES.map(course => (
                    <div key={course.id} className="bg-bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand/40 transition-colors flex flex-col group">
                        <div className="h-40 bg-slate-100 flex items-center justify-center relative">
                            {course.unlocked ? (
                                <PlayCircle size={48} className="text-slate-300 group-hover:text-brand transition-colors z-10" />
                            ) : (
                                <Lock size={48} className="text-slate-300 z-10" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent mix-blend-multiply" />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider">
                                <span className={course.unlocked ? "text-brand" : "text-slate-400"}>
                                    {course.modules.length} Aulas
                                </span>
                                <span className="flex items-center gap-1 text-amber-500">
                                    <Award size={14} /> +{course.xp} XP
                                </span>
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${!course.unlocked && "text-slate-400"}`}>{course.title}</h3>
                            <p className="text-text-muted text-sm flex-1 leading-relaxed">{course.description}</p>
                            
                            <div className="mt-6">
                                <div className="flex justify-between text-xs font-semibold mb-1.5">
                                    <span className={course.progress === 100 ? "text-green-500" : ""}>
                                        {course.progress === 100 ? 'Concluído' : `${course.progress}%`}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                     <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? 'bg-green-500' : 'bg-brand'}`} 
                                        style={{ width: `${course.progress}%` }} 
                                     />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
