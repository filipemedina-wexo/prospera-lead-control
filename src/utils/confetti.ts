import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
    const end = Date.now() + 1000;

    const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444']; // Brand, Success, Warning, Error/Love

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
};

export const triggerReward = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#10B981'] // Blue and Green
    });
};
