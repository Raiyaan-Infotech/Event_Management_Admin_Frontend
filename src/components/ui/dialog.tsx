'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog() {
    const context = React.useContext(DialogContext);
    if (!context) {
        throw new Error('Dialog components must be used within a Dialog');
    }
    return context;
}

export interface DialogProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open: openProp, defaultOpen = false, onOpenChange, children }: DialogProps) {
    const [openState, setOpenState] = React.useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const isOpen = isControlled ? openProp : openState;

    const setOpen = React.useCallback(
        (val: boolean) => {
            if (!isControlled) {
                setOpenState(val);
            }
            onOpenChange?.(val);
        },
        [isControlled, onOpenChange]
    );

    return <DialogContext.Provider value={{ open: isOpen, setOpen }}>{children}</DialogContext.Provider>;
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export function DialogTrigger({ children, className, asChild, onClick, ...props }: DialogTriggerProps) {
    const { setOpen } = useDialog();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        setOpen(true);
    };

    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<any>;
        return React.cloneElement(child, {
            ...props,
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                child.props.onClick?.(e);
                handleClick(e);
            },
            className: cn(className, child.props.className),
        });
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
}

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export function DialogClose({ children, className, asChild, onClick, ...props }: DialogCloseProps) {
    const { setOpen } = useDialog();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        setOpen(false);
    };

    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<any>;
        return React.cloneElement(child, {
            ...props,
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                child.props.onClick?.(e);
                handleClick(e);
            },
            className: cn(className, child.props.className),
        });
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
}

export function DialogPortal({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150', className)}
            {...props}
        />
    );
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    onOpenAutoFocus?: (e: any) => void;
    onKeyDown?: (e: any) => void;
}

export function DialogContent({ className, children, onOpenAutoFocus, onKeyDown, ...props }: DialogContentProps) {
    const { open, setOpen } = useDialog();
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, setOpen]);

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150"
                onClick={() => setOpen(false)}
            />

            <div
                ref={contentRef}
                onKeyDown={onKeyDown}
                className={cn(
                    'relative z-50 w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl text-card-foreground animate-in zoom-in-95 duration-150',
                    className
                )}
                {...props}
            >
                {children}
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="absolute right-4 top-4 rounded-sm p-1 text-muted-foreground hover:text-foreground hover:bg-accent opacity-70 hover:opacity-100 transition-all"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>,
        document.body
    );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
