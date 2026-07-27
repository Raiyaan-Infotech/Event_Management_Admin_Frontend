'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
    value?: number[];
    defaultValue?: number[];
    min?: number;
    max?: number;
    step?: number;
    onValueChange?: (value: number[]) => void;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, defaultValue, min = 0, max = 100, step = 1, onValueChange, disabled, ...props }, ref) => {
        const isControlled = value !== undefined;
        const currentVal = isControlled ? value[0] ?? min : (defaultValue ? defaultValue[0] : min);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const num = Number(e.target.value);
            onValueChange?.([num]);
        };

        const percentage = Math.min(Math.max(((currentVal - min) / (max - min)) * 100, 0), 100);

        return (
            <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
                <input
                    ref={ref}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={currentVal}
                    disabled={disabled}
                    onChange={handleChange}
                    className="w-full h-1.5 accent-primary bg-primary/20 rounded-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    {...props}
                />
            </div>
        );
    }
);

Slider.displayName = 'Slider';
