'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    pending?: boolean;
    onText?: string;
    offText?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    (
        {
            checked = false,
            onCheckedChange,
            pending,
            disabled,
            className,
            onText = 'ON',
            offText = 'OFF',
            onClick,
            ...props
        },
        ref
    ) => {
        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (onClick) onClick(e);
            if (!disabled && !pending && onCheckedChange) {
                onCheckedChange(!checked);
            }
        };

        if (pending) {
            return (
                <div
                    className={cn(
                        'inline-flex h-7 w-16 shrink-0 items-center rounded-full border border-amber-200 bg-amber-100 px-1 text-amber-700 relative cursor-not-allowed opacity-90 shadow-xs',
                        className
                    )}
                >
                    <span className="absolute right-2 text-[9px] font-extrabold tracking-wider select-none">
                        PENDING
                    </span>
                    <span className="block h-5 w-5 rounded-full bg-amber-500 shadow-xs animate-pulse" />
                </div>
            );
        }

        return (
            <button
                ref={ref}
                type="button"
                role="switch"
                aria-checked={checked}
                data-state={checked ? 'checked' : 'unchecked'}
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    'relative inline-flex h-7 w-16 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 px-0.5 shadow-xs',
                    checked ? 'bg-emerald-100' : 'bg-red-100',
                    className
                )}
                {...props}
            >
                {/* On Text */}
                <span
                    aria-hidden
                    className={cn(
                        'absolute left-2 text-[10px] font-extrabold text-emerald-700 select-none pointer-events-none transition-opacity tracking-wider',
                        checked ? 'opacity-100' : 'opacity-0'
                    )}
                >
                    {onText}
                </span>

                {/* Off Text */}
                <span
                    aria-hidden
                    className={cn(
                        'absolute right-2 text-[10px] font-extrabold text-red-600 select-none pointer-events-none transition-opacity tracking-wider',
                        checked ? 'opacity-0' : 'opacity-100'
                    )}
                >
                    {offText}
                </span>

                {/* Thumb Handle */}
                <span
                    data-state={checked ? 'checked' : 'unchecked'}
                    className={cn(
                        'pointer-events-none block h-5 w-5 rounded-full shadow-xs ring-0 transition-transform duration-150 ease-in-out z-10',
                        checked ? 'translate-x-[2.25rem] bg-emerald-500' : 'translate-x-0.5 bg-red-500'
                    )}
                />
            </button>
        );
    }
);

Switch.displayName = 'Switch';
