'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
    ({ checked = false, onCheckedChange, disabled, className, onClick, ...props }, ref) => {
        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e);
            if (!disabled && onCheckedChange) {
                onCheckedChange(!checked);
            }
        };

        return (
            <button
                ref={ref}
                type="button"
                role="checkbox"
                aria-checked={checked}
                data-state={checked ? 'checked' : 'unchecked'}
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center',
                    checked ? 'bg-primary text-primary-foreground' : 'bg-card text-transparent hover:border-primary/80',
                    className
                )}
                {...props}
            >
                {checked ? <Check className="h-3.5 w-3.5 font-bold stroke-[3]" /> : null}
            </button>
        );
    }
);

Checkbox.displayName = 'Checkbox';
