import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'hover';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'relative rounded-xl border border-white/50 bg-white/70 backdrop-blur-md p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-300',
                    {
                        'hover:bg-white/90 hover:border-white/80 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]': variant === 'hover',
                    },
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export { Card };
