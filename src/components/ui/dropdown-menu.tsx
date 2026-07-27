'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownMenuContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu() {
    const context = React.useContext(DropdownMenuContext);
    if (!context) {
        throw new Error('DropdownMenu components must be used within a DropdownMenu');
    }
    return context;
}

export interface DropdownMenuProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function DropdownMenu({ open: openProp, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
    const [openState, setOpenState] = React.useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const isOpen = isControlled ? openProp : openState;
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);

    const setOpen = React.useCallback(
        (val: boolean) => {
            if (!isControlled) {
                setOpenState(val);
            }
            onOpenChange?.(val);
        },
        [isControlled, onOpenChange]
    );

    return (
        <DropdownMenuContext.Provider value={{ open: isOpen, setOpen, triggerRef }}>
            <div className="relative inline-block text-left">{children}</div>
        </DropdownMenuContext.Provider>
    );
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export function DropdownMenuTrigger({ children, className, onClick, asChild, ...props }: DropdownMenuTriggerProps) {
    const { open, setOpen, triggerRef } = useDropdownMenu();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        setOpen(!open);
    };

    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<any>;
        return React.cloneElement(child, {
            ...props,
            ref: triggerRef,
            'aria-expanded': open,
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                child.props.onClick?.(e);
                handleClick(e);
            },
            className: cn(className, child.props.className),
        });
    }

    return (
        <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            onClick={handleClick}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
}

export function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function DropdownMenuGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={className} {...props}>{children}</div>;
}

export function DropdownMenuSub({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}

export function DropdownMenuRadioGroup({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
}

export function DropdownMenuContent({ className, align = 'end', sideOffset = 4, children, ...props }: DropdownMenuContentProps) {
    const { open, setOpen, triggerRef } = useDropdownMenu();
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

    let leftPos = rect.left;
    if (align === 'end') {
        leftPos = rect.right - 192;
    } else if (align === 'center') {
        leftPos = rect.left + rect.width / 2 - 96;
    }

    return createPortal(
        <div
            ref={contentRef}
            style={{
                position: 'fixed',
                top: rect.bottom + sideOffset,
                left: Math.max(8, leftPos),
                zIndex: 1000,
            }}
            className={cn(
                'min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 duration-100',
                className
            )}
            {...props}
        >
            {children}
        </div>,
        document.body
    );
}

export type DropdownMenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    inset?: boolean;
    asChild?: boolean;
};

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
    ({ className, inset, onClick, asChild, children, ...props }, ref) => {
        const { setOpen } = useDropdownMenu();

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e);
            setOpen(false);
        };

        if (asChild && React.isValidElement(children)) {
            const child = children as React.ReactElement<any>;
            return React.cloneElement(child, {
                ...props,
                ref,
                onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                    child.props.onClick?.(e);
                    handleClick(e);
                },
                className: cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground font-medium disabled:pointer-events-none disabled:opacity-50',
                    inset && 'pl-8',
                    className,
                    child.props.className
                ),
            });
        }

        return (
            <button
                ref={ref}
                type="button"
                className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground font-medium disabled:pointer-events-none disabled:opacity-50',
                    inset && 'pl-8',
                    className
                )}
                onClick={handleClick}
                {...props}
            >
                {children}
            </button>
        );
    }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export function DropdownMenuSubTrigger({ className, inset, children, asChild, ...props }: DropdownMenuItemProps) {
    return (
        <button
            type="button"
            className={cn(
                'flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent',
                inset && 'pl-8',
                className
            )}
            {...props}
        >
            {children}
            <ChevronRight className="ml-auto h-4 w-4" />
        </button>
    );
}

export function DropdownMenuSubContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('p-1 border border-border bg-popover rounded-md shadow-md', className)} {...props} />;
}

export function DropdownMenuCheckboxItem({
    className,
    children,
    checked,
    asChild,
    onClick,
    ...props
}: DropdownMenuItemProps & { checked?: boolean }) {
    const { setOpen } = useDropdownMenu();

    return (
        <button
            type="button"
            className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground font-medium',
                className
            )}
            onClick={(e) => {
                onClick?.(e);
                setOpen(false);
            }}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {checked ? <Check className="h-4 w-4 text-primary" /> : null}
            </span>
            {children}
        </button>
    );
}

export function DropdownMenuRadioItem({ className, children, asChild, ...props }: DropdownMenuItemProps) {
    const { setOpen } = useDropdownMenu();

    return (
        <button
            type="button"
            className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground font-medium',
                className
            )}
            onClick={(e) => {
                props.onClick?.(e);
                setOpen(false);
            }}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Circle className="h-2 w-2 fill-primary text-primary" />
            </span>
            {children}
        </button>
    );
}

export function DropdownMenuLabel({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
    return <div className={cn('px-2 py-1.5 text-xs font-semibold text-foreground', inset && 'pl-8', className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
}

export function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />;
}
