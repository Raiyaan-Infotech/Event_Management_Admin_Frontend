'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectContextValue {
    disabled?: boolean;
    value?: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    onValueChange?: (value: any) => void;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelect() {
    const context = React.useContext(SelectContext);
    if (!context) {
        throw new Error('Select components must be used inside Select');
    }
    return context;
}

export interface SelectProps {
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    onValueChange?: (value: any) => void;
    children: React.ReactNode;
}

export function Select({ value: valueProp, defaultValue, disabled, onValueChange, children }: SelectProps) {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const isControlled = valueProp !== undefined;
    const activeValue = isControlled ? valueProp : internalValue;

    const triggerRef = React.useRef<HTMLButtonElement | null>(null);

    const handleValueChange = React.useCallback(
        (val: any) => {
            if (!isControlled) {
                setInternalValue(val);
            }
            onValueChange?.(val);
        },
        [isControlled, onValueChange]
    );

    return (
        <SelectContext.Provider value={{ value: activeValue, disabled, open, setOpen, onValueChange: handleValueChange, triggerRef }}>
            <div className="relative flex w-full">{children}</div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({
    className,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { disabled, open, setOpen, triggerRef } = useSelect();

    return (
        <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className={cn(
                'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-2 text-xs font-medium text-foreground shadow-xs outline-none transition focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </button>
    );
}

export function SelectValue({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) {
    const { value } = useSelect();

    if (children !== undefined && children !== null) {
        return <span className="line-clamp-1 font-medium">{children}</span>;
    }

    return <span className="line-clamp-1 font-medium">{value || placeholder}</span>;
}

export function SelectContent({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    const { open, setOpen, triggerRef } = useSelect();
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const [rect, setRect] = React.useState<DOMRect | null>(null);

    React.useLayoutEffect(() => {
        if (!open) return;
        const update = () => {
            if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
        };
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [open, triggerRef]);

    React.useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (triggerRef.current?.contains(target)) return;
            if (contentRef.current?.contains(target)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [open, setOpen, triggerRef]);

    if (!open || !rect || typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={contentRef}
            style={{
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                minWidth: rect.width,
                zIndex: 1000,
            }}
            className={cn(
                'max-h-[260px] overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 duration-100',
                className
            )}
        >
            {children}
        </div>,
        document.body
    );
}

export function SelectItem({
    value,
    disabled,
    className,
    children,
}: {
    value: string;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    const { setOpen, onValueChange, value: selectedValue } = useSelect();
    const isSelected = selectedValue === value;

    return (
        <button
            type="button"
            disabled={disabled}
            className={cn(
                'relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground font-medium disabled:cursor-not-allowed disabled:opacity-50',
                isSelected ? 'bg-accent/80 font-bold text-primary' : '',
                className
            )}
            onClick={() => {
                if (!disabled) {
                    onValueChange?.(value);
                    setOpen(false);
                }
            }}
        >
            <span className="line-clamp-1">{children}</span>
            {isSelected ? <Check className="h-3.5 w-3.5 text-primary shrink-0 font-bold" /> : null}
        </button>
    );
}

export function SelectGroup({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}

export function SelectLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground', className)}
            {...props}
        />
    );
}

export function SelectSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />;
}

export function SelectScrollUpButton() {
    return null;
}

export function SelectScrollDownButton() {
    return null;
}
