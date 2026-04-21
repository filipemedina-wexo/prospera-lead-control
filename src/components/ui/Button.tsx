import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={isLoading || disabled}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
                    {
                        'bg-gradient-to-b from-brand to-brand-accent text-white shadow-sm shadow-brand/20 hover:shadow-md hover:shadow-brand/25 hover:-translate-y-px active:translate-y-0 active:shadow-sm': variant === 'primary',
                        'bg-white border border-border text-text-primary hover:border-brand/30 hover:shadow-sm': variant === 'secondary',
                        'bg-transparent text-text-secondary hover:text-text-primary hover:bg-black/5': variant === 'ghost',
                    },
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
