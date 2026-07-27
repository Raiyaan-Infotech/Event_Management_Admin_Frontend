'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextMenuContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
    position: { x: number; y: number };
    setPosition: (pos: { x: number; y: number }) => void;
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null);

function useContextMenu() {
    const context = React.useContext(ContextMenuContext);
    if (!context) {
        throw new Error('ContextMenu components must be used within a ContextMenu');
    }
    return context;
}

export interface ContextMenuProps {
    children: React.ReactNode;
}

export function ContextMenu({ children }: ContextMenuProps) {
    const [open, setOpen] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });

    return (
        <ContextMenuContext.Provider value={{ open, setOpen, position, setPosition }}>
            <div className="relative">{children}</div>
        </ContextMenuContext.Provider>
    );
}

export interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
}

export function ContextMenuTrigger({ children, className, onContextMenu, asChild, ...props }: ContextMenuTriggerProps) {
    const { setOpen, setPosition } = useContextMenu();

    return (
        <div
            className={className}
            onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu?.(e);
                setPosition({ x: e.clientX, y: e.clientY });
                setOpen(true);
            }}
            {...props}
        >
            {children}
        </div>
    );
}

export function ContextMenuPortal({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function ContextMenuGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={className} {...props}>{children}</div>;
}

export function ContextMenuSub({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}

export function ContextMenuRadioGroup({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}

export function ContextMenuContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const { open, setOpen, position } = useContextMenu();
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [open, setOpen]);

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={contentRef}
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
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

export interface ContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    inset?: boolean;
    asChild?: boolean;
}

export function ContextMenuItem({ className, inset, onClick, asChild, children, ...props }: ContextMenuItemProps) {
    const { setOpen } = useContextMenu();

    return (
        <button
            type="button"
            className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground font-medium disabled:pointer-events-none disabled:opacity-50',
                inset && 'pl-8',
                className
            )}
            onClick={(e) => {
                onClick?.(e);
                setOpen(false);
            }}
            {...props}
        >
            {children}
        </button>
    );
}

export function ContextMenuSubTrigger({ className, inset, children, asChild, ...props }: ContextMenuItemProps) {
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

export function ContextMenuSubContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('p-1 border border-border bg-popover rounded-md shadow-md', className)} {...props} />;
}

export function ContextMenuCheckboxItem({
    className,
    children,
    checked,
    asChild,
    onClick,
    ...props
}: ContextMenuItemProps & { checked?: boolean }) {
    const { setOpen } = useContextMenu();

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

export function ContextMenuRadioItem({ className, children, asChild, ...props }: ContextMenuItemProps) {
    const { setOpen } = useContextMenu();

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

export function ContextMenuLabel({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
    return <div className={cn('px-2 py-1.5 text-xs font-semibold text-foreground', inset && 'pl-8', className)} {...props} />;
}

export function ContextMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
}

export function ContextMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />;
}
