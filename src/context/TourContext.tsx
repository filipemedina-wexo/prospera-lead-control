import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface TourStep {
    targetId: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface UserProgress {
    xp: number;
    level: number;
    completedTours: string[];
}

interface TourContextValue {
    // Gamification
    progress: UserProgress;
    addXp: (amount: number, _reason: string) => void;
    
    // Tour
    activeTour: string | null;
    currentStepIndex: number;
    startTour: (tourId: string, steps: TourStep[]) => void;
    nextStep: () => void;
    endTour: () => void;
    
    tourSteps: TourStep[];
    targetRect: DOMRect | null;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
    const [progress, setProgress] = useState<UserProgress>({
        xp: 0,
        level: 1,
        completedTours: []
    });

    // XP Logic
    const addXp = (amount: number, _reason: string) => {
        setProgress(prev => {
            const nextXp = prev.xp + amount;
            const nextLevel = Math.floor(nextXp / 100) + 1; // 100 XP per level dummy math
            return {
                ...prev,
                xp: nextXp,
                level: nextLevel
            };
        });
        // Feedback visual poderia ir aqui
    };

    // Tour Logic
    const [activeTour, setActiveTour] = useState<string | null>(null);
    const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const startTour = (tourId: string, steps: TourStep[]) => {
        if (progress.completedTours.includes(tourId)) return; // Already passed
        setActiveTour(tourId);
        setTourSteps(steps);
        setCurrentStepIndex(0);
    };

    const nextStep = () => {
        if (currentStepIndex < tourSteps.length - 1) {
            setCurrentStepIndex(i => i + 1);
        } else {
            endTour();
        }
    };

    const endTour = () => {
        if (activeTour && !progress.completedTours.includes(activeTour)) {
            // Reward completion
            setProgress(prev => ({
                ...prev,
                completedTours: [...prev.completedTours, activeTour]
            }));
            addXp(50, 'Tour de Configuração concluído!');
        }
        setActiveTour(null);
        setTourSteps([]);
        setCurrentStepIndex(0);
        setTargetRect(null);
    };

    // Update target rect when step changes or window resizes
    useEffect(() => {
        if (!activeTour) return;

        const updateRect = () => {
            const step = tourSteps[currentStepIndex];
            if (!step) return;
            const el = document.getElementById(step.targetId);
            if (el) {
                // Scroll into view if needed
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Need a tiny timeout to allow scroll to settle before measuring
                setTimeout(() => {
                    setTargetRect(el.getBoundingClientRect());
                }, 300);
            } else {
                setTargetRect(null);
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, { passive: true });
        
        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, [activeTour, currentStepIndex, tourSteps]);

    return (
        <TourContext.Provider value={{
            progress, addXp,
            activeTour, currentStepIndex, startTour, nextStep, endTour,
            tourSteps, targetRect
        }}>
            {children}
        </TourContext.Provider>
    );
}

export function useTour() {
    const ctx = useContext(TourContext);
    if (!ctx) throw new Error('useTour must be used inside TourProvider');
    return ctx;
}
