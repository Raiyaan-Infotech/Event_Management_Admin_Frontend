'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
    value?: string;
    onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs container');
    }
    return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}

export function Tabs({ value: valueProp, defaultValue, onValueChange, className, children, ...props }: TabsProps) {
    const [valueState, setValueState] = React.useState(defaultValue || '');
    const isControlled = valueProp !== undefined;
    const activeValue = isControlled ? valueProp : valueState;

    const handleValueChange = React.useCallback(
        (val: string) => {
            if (!isControlled) {
                setValueState(val);
            }
            onValueChange?.(val);
        },
        [isControlled, onValueChange]
    );

    return (
        <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
            <div className={cn('w-full', className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}
            {...props}
        />
    );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

export function TabsTrigger({ value, className, children, onClick, ...props }: TabsTriggerProps) {
    const { value: activeValue, onValueChange } = useTabs();
    const isActive = activeValue === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            data-state={isActive ? 'active' : 'inactive'}
            onClick={(e) => {
                onClick?.(e);
                onValueChange?.(value);
            }}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
    const { value: activeValue } = useTabs();
    if (activeValue !== value) return null;

    return (
        <div
            role="tabpanel"
            tabIndex={0}
            className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
            {...props}
        >
            {children}
        </div>
    );
}
