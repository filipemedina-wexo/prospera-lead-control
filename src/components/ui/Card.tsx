import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'hover';
    size?: 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'relative rounded-xl border border-white/50 bg-white/70 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-300',
                    {
                        'p-4': size === 'sm',
                        'p-6': size === 'md',
                        'p-8': size === 'lg',
                    },
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
