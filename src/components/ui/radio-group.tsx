'use client';

import * as React from 'react';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RadioGroupContextValue {
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroup() {
    const context = React.useContext(RadioGroupContext);
    if (!context) {
        throw new Error('RadioGroupItem must be used within a RadioGroup');
    }
    return context;
}

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
}

export function RadioGroup({
    value: valueProp,
    defaultValue,
    onValueChange,
    disabled,
    className,
    children,
    ...props
}: RadioGroupProps) {
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
        <RadioGroupContext.Provider value={{ value: activeValue, onValueChange: handleValueChange, disabled }}>
            <div role="radiogroup" className={cn('grid gap-2', className)} {...props}>
                {children}
            </div>
        </RadioGroupContext.Provider>
    );
}

export interface RadioGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
    ({ value, className, disabled: disabledProp, onClick, ...props }, ref) => {
        const { value: activeValue, onValueChange, disabled: groupDisabled } = useRadioGroup();
        const isDisabled = disabledProp || groupDisabled;
        const isChecked = activeValue === value;

        return (
            <button
                ref={ref}
                type="button"
                role="radio"
                aria-checked={isChecked}
                data-state={isChecked ? 'checked' : 'unchecked'}
                disabled={isDisabled}
                onClick={(e) => {
                    onClick?.(e);
                    if (!isDisabled) {
                        onValueChange?.(value);
                    }
                }}
                className={cn(
                    'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center',
                    className
                )}
                {...props}
            >
                {isChecked ? <Circle className="h-2.5 w-2.5 fill-primary text-primary" /> : null}
            </button>
        );
    }
);

RadioGroupItem.displayName = 'RadioGroupItem';
