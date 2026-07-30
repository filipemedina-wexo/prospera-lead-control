import { useTour } from '../../context/TourContext';
import { Button } from '../ui/Button';
import { X, ChevronRight, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

export function TourOverlay() {
    const { activeTour, currentStepIndex, tourSteps, targetRect, nextStep, endTour } = useTour();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (activeTour) {
            setMounted(true);
            document.body.style.overflow = 'hidden'; // Prevent scrolling manually while in tour
        } else {
            setTimeout(() => setMounted(false), 300);
            document.body.style.overflow = '';
        }
    }, [activeTour]);

    if (!mounted && !activeTour) return null;

    const step = tourSteps[currentStepIndex];
    const isLast = currentStepIndex === tourSteps.length - 1;

    // Default target coords if rect is null
    const r = targetRect || { top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0, right: window.innerWidth / 2, bottom: window.innerHeight / 2 };
    const padding = 16;

    // Cutout coordinates
    const tTop = Math.max(0, r.top - padding);
    const tLeft = Math.max(0, r.left - padding);
    const tRight = Math.min(window.innerWidth, r.right + padding);
    const tBottom = Math.min(window.innerHeight, r.bottom + padding);
    const tWidth = tRight - tLeft;
    const tHeight = tBottom - tTop;

    // Popover placement calculation
    let popTop = tBottom + 16;
    let popLeft = tLeft;
    
    // Simple collision detection for window boundaries
    if (popTop + 200 > window.innerHeight) {
        popTop = tTop - 200 - 16; // Put above
    }
    if (popLeft + 320 > window.innerWidth) {
        popLeft = window.innerWidth - 320 - 16; // Align right
    }

    return (
        <div className={cn(
            "fixed inset-0 z-[100] transition-opacity duration-500",
            activeTour ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            {/* Overlay Panels (Glassmorphism effect) */}
            <div className="absolute inset-x-0 top-0 backdrop-blur-md bg-slate-900/60 transition-all duration-500 will-change-[height]" style={{ height: tTop }} />
            <div className="absolute inset-x-0 bottom-0 backdrop-blur-md bg-slate-900/60 transition-all duration-500 will-change-[top]" style={{ top: tBottom }} />
            <div className="absolute left-0 backdrop-blur-md bg-slate-900/60 transition-all duration-500 will-change-[width,top]" style={{ top: tTop, height: tHeight, width: tLeft }} />
            <div className="absolute right-0 backdrop-blur-md bg-slate-900/60 transition-all duration-500 will-change-[width,top]" style={{ top: tTop, height: tHeight, left: tRight }} />
            
            {/* The Cutout Ring */}
            <div 
                className="absolute border-2 border-brand/50 rounded-xl transition-all duration-500 pointer-events-none shadow-[0_0_0_1px_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                style={{ top: tTop, left: tLeft, width: tWidth, height: tHeight }}
            />

            {/* Popover Card */}
            {targetRect && (
                <div 
                    className="absolute w-[320px] bg-bg border border-border shadow-2xl rounded-2xl p-5 transition-all duration-500 ease-out"
                    style={{ top: popTop, left: Math.max(16, popLeft) }}
                >
                    <button 
                        onClick={endTour}
                        className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                    >
                        <X size={16} />
                    </button>
                    
                    <p className="text-[10px] font-bold tracking-widest uppercase text-brand mb-2">
                        Passo {currentStepIndex + 1} de {tourSteps.length}
                    </p>
                    <h3 className="text-lg font-bold mb-2">{step?.title}</h3>
                    <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                        {step?.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {tourSteps.map((_, i) => (
                                <div key={i} className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    i === currentStepIndex ? "bg-brand" : "bg-black/10"
                                )} />
                            ))}
                        </div>
                        <Button onClick={nextStep} variant="primary" className="py-2 ml-auto gap-1">
                            {isLast ? (
                                <>Terminar <Check size={16} /></>
                            ) : (
                                <>Avançar <ChevronRight size={16} /></>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
