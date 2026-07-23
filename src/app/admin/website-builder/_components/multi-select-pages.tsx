'use client';

import * as React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
    label: string;
    value: string;
}

interface MultiSelectPagesProps {
    value: string[];
    options: MultiSelectOption[];
    onChange: (value: string[]) => void;
    label?: string;
    description?: string;
    placeholder?: string;
    allowCustomValues?: boolean;
    customPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    lockedValues?: string[];
}

export function MultiSelectPages({
    value,
    options,
    onChange,
    label,
    description,
    placeholder = 'Add page',
    allowCustomValues = false,
    disabled = false,
    className,
    lockedValues = [],
}: MultiSelectPagesProps) {
    const [inputValue, setInputValue] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOptions = value.map((val) => {
        return options.find((opt) => opt.value === val) ?? { label: val, value: val };
    });

    const availableOptions = options.filter((opt) => !value.includes(opt.value));
    const filteredOptions = availableOptions.filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    const addValue = (nextValue: string) => {
        const normalized = nextValue.trim();
        if (!normalized || value.includes(normalized)) return;
        onChange([...value, normalized]);
    };

    const lockedValueSet = React.useMemo(
        () => new Set(lockedValues.map((item) => item.toLowerCase())),
        [lockedValues]
    );

    const isLockedValue = (nextValue: string) => lockedValueSet.has(nextValue.toLowerCase());

    const removeValue = (nextValue: string) => {
        if (isLockedValue(nextValue)) return;
        onChange(value.filter((item) => item !== nextValue));
    };

    return (
        <div className={cn('w-full space-y-1', className)}>
            {label ? <label className="text-xs font-semibold text-muted-foreground">{label}</label> : null}

            <div className="relative" ref={containerRef}>
                <div
                    onClick={() => {
                        inputRef.current?.focus();
                        setIsOpen(true);
                    }}
                    className={cn(
                        'flex min-h-[38px] w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-card px-3 py-1.5 pr-8 text-xs transition cursor-pointer shadow-xs focus-within:ring-1 focus-within:ring-primary',
                        disabled && 'opacity-60 cursor-not-allowed'
                    )}
                >
                    {selectedOptions.map((opt) => {
                        const locked = isLockedValue(opt.value);
                        return (
                            <span
                                key={opt.value}
                                className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
                            >
                                {opt.label}
                                {!locked && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeValue(opt.value);
                                        }}
                                        className="hover:text-destructive focus:outline-none"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </span>
                        );
                    })}

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={value.length === 0 ? placeholder : ''}
                        className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground min-w-[80px]"
                        disabled={disabled}
                    />

                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                {isOpen && filteredOptions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                        {filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    addValue(opt.value);
                                    setInputValue('');
                                    setIsOpen(false);
                                }}
                                className="flex cursor-pointer items-center justify-between rounded px-2.5 py-1.5 text-xs text-popover-foreground hover:bg-muted font-medium"
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {description ? <p className="text-[10px] text-muted-foreground">{description}</p> : null}
        </div>
    );
}
