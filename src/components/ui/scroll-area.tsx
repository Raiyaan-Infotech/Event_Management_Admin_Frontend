'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('relative overflow-auto custom-scrollbar', className)}
            {...props}
        >
            {children}
        </div>
    )
);

ScrollArea.displayName = 'ScrollArea';

export interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: 'vertical' | 'horizontal';
}

export const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
    ({ className, orientation = 'vertical', ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'flex touch-none select-none transition-colors',
                orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-[1px]',
                orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent p-[1px]',
                className
            )}
            {...props}
        >
            <div className="relative flex-1 rounded-full bg-border" />
        </div>
    )
);

ScrollBar.displayName = 'ScrollBar';
