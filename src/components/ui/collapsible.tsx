'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CollapsibleContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsible() {
    const context = React.useContext(CollapsibleContext);
    if (!context) {
        throw new Error('Collapsible components must be used within a Collapsible');
    }
    return context;
}

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    asChild?: boolean;
}

export function Collapsible({
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    className,
    children,
    asChild,
    ...props
}: CollapsibleProps) {
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

    return (
        <CollapsibleContext.Provider value={{ open: isOpen, setOpen }}>
            <div className={cn('w-full', className)} {...props}>
                {children}
            </div>
        </CollapsibleContext.Provider>
    );
}

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export function CollapsibleTrigger({ children, className, onClick, asChild, ...props }: CollapsibleTriggerProps) {
    const { open, setOpen } = useCollapsible();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        setOpen(!open);
    };

    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<any>;
        return React.cloneElement(child, {
            ...props,
            'aria-expanded': open,
            'data-state': open ? 'open' : 'closed',
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
            aria-expanded={open}
            data-state={open ? 'open' : 'closed'}
            onClick={handleClick}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
}

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
}

export function CollapsibleContent({ children, className, asChild, ...props }: CollapsibleContentProps) {
    const { open } = useCollapsible();
    if (!open) return null;

    return (
        <div data-state={open ? 'open' : 'closed'} className={className} {...props}>
            {children}
        </div>
    );
}