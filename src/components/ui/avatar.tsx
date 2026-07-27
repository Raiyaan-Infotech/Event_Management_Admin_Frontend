'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted', className)}
            {...props}
        />
    )
);
Avatar.displayName = 'Avatar';

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    onLoadingStatusChange?: (status: 'idle' | 'loading' | 'loaded' | 'error') => void;
}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
    ({ className, src, alt, onError, ...props }, ref) => {
        const [hasError, setHasError] = React.useState(false);

        if (!src || hasError) return null;

        return (
            <img
                ref={ref}
                src={src}
                alt={alt || 'Avatar'}
                onError={(e) => {
                    setHasError(true);
                    onError?.(e);
                }}
                className={cn('aspect-square h-full w-full object-cover', className)}
                {...props}
            />
        );
    }
);
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    ({ className, ...props }, ref) => (
        <span
            ref={ref}
            className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground uppercase', className)}
            {...props}
        />
    )
);
AvatarFallback.displayName = 'AvatarFallback';
