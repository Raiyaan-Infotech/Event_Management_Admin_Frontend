'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet() {
    const context = React.useContext(SheetContext);
    if (!context) {
        throw new Error('Sheet components must be used within a Sheet');
    }
    return context;
}

export interface SheetProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Sheet({ open: openProp, defaultOpen = false, onOpenChange, children }: SheetProps) {
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

    return <SheetContext.Provider value={{ open: isOpen, setOpen }}>{children}</SheetContext.Provider>;
}

export interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export function SheetTrigger({ children, className, asChild, onClick, ...props }: SheetTriggerProps) {
    const { setOpen } = useSheet();

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

export interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export function SheetClose({ children, className, asChild, onClick, ...props }: SheetCloseProps) {
    const { setOpen } = useSheet();

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

export function SheetPortal({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function SheetOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('fixed inset-0 z-50 bg-black/80 animate-in fade-in-0 duration-150', className)}
            {...props}
        />
    );
}

const sheetVariants = cva(
    'fixed z-50 gap-4 bg-background p-4 shadow-lg transition ease-in-out duration-300 border-border',
    {
        variants: {
            side: {
                top: 'inset-x-0 top-0 border-b animate-in slide-in-from-top',
                bottom: 'inset-x-0 bottom-0 border-t animate-in slide-in-from-bottom',
                left: 'inset-y-0 left-0 h-full w-3/4 border-r animate-in slide-in-from-left sm:w-[440px]',
                right: 'inset-y-0 right-0 h-full w-3/4 border-l animate-in slide-in-from-right sm:w-[440px]',
            },
        },
        defaultVariants: {
            side: 'right',
        },
    }
);

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sheetVariants> {
    children: React.ReactNode;
}

export function SheetContent({ side = 'right', className, children, ...props }: SheetContentProps) {
    const { open, setOpen } = useSheet();

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150"
                onClick={() => setOpen(false)}
            />
            <div className={cn(sheetVariants({ side }), className)} {...props}>
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

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn('text-lg font-semibold text-foreground', className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
