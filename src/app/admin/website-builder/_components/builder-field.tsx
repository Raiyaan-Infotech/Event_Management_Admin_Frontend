'use client';

import * as React from 'react';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface CountedInputProps {
    value: string;
    onChange: (value: string) => void;
    maxLength: number;
    label?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    inputPrefix?: React.ReactNode;
    showCount?: boolean;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    autoFocus?: boolean;
    lockInput?: boolean;
}

export function BuilderCountedInput({
    value,
    onChange,
    maxLength,
    label,
    required = false,
    placeholder,
    className,
    inputClassName,
    labelClassName,
    inputPrefix,
    showCount = true,
    onKeyDown,
    autoFocus = false,
    lockInput = false,
}: CountedInputProps) {
    return (
        <div className={cn('w-full space-y-1', className)}>
            {label ? (
                <div className="flex items-center justify-between">
                    <label className={cn('text-xs font-semibold text-muted-foreground', labelClassName)}>
                        {label}
                        {required ? <span className="ml-1 text-rose-500">*</span> : null}
                    </label>
                </div>
            ) : null}
            <div
                className={cn(
                    'relative w-full flex items-center',
                    inputPrefix
                        ? 'h-9 overflow-hidden rounded-md border border-input bg-card focus-within:ring-1 focus-within:ring-primary'
                        : ''
                )}
            >
                {inputPrefix ? inputPrefix : null}
                <Input
                    value={value}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={onKeyDown}
                    autoFocus={autoFocus}
                    className={cn(
                        'h-9 w-full text-xs font-medium',
                        lockInput ? (showCount ? '!pr-16' : '!pr-8') : showCount ? 'pr-12' : 'pr-3',
                        lockInput && 'cursor-not-allowed bg-muted text-muted-foreground',
                        inputPrefix && 'h-full rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
                        inputClassName
                    )}
                    disabled={lockInput}
                />
                {lockInput ? (
                    <Lock className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                ) : null}
                {showCount ? (
                    <span
                        className={cn(
                            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground tabular-nums',
                            lockInput ? 'right-7' : 'right-2.5'
                        )}
                    >
                        {value.length}/{maxLength}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export interface CountedTextareaProps {
    value: string;
    onChange: (value: string) => void;
    maxLength: number;
    label?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
    textareaClassName?: string;
    rows?: number;
}

export function BuilderCountedTextarea({
    value,
    onChange,
    maxLength,
    label,
    required = false,
    placeholder,
    className,
    textareaClassName,
    rows = 3,
}: CountedTextareaProps) {
    return (
        <div className={cn('w-full space-y-1', className)}>
            {label ? (
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                        {label}
                        {required ? <span className="ml-1 text-rose-500">*</span> : null}
                    </label>
                </div>
            ) : null}
            <div className="relative w-full">
                <Textarea
                    value={value}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    rows={rows}
                    className={cn('w-full text-xs font-medium pb-6 pr-3', textareaClassName)}
                />
                <span className="pointer-events-none absolute bottom-2 right-2.5 text-[10px] font-semibold text-muted-foreground tabular-nums">
                    {value.length}/{maxLength}
                </span>
            </div>
        </div>
    );
}
