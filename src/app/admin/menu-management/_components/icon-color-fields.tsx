'use client';

import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconPickerDialog } from '@/components/common/icon-picker-dialog';
import { DynamicIcon } from '@/components/common/dynamic-icon';
import { cn } from '@/lib/utils';

/**
 * The "Choose Icon" control from the mockup — icon preview square, a picker
 * button, and the field's helper text. Wraps the shared IconPickerDialog so all
 * four Menu Management forms open the same picker.
 */
export function IconField({
    label,
    value,
    onChange,
    color,
    error,
    helper = 'Select an icon to represent this.',
    required,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    color?: string;
    error?: boolean;
    helper?: string;
    required?: boolean;
}) {
    const [pickerOpen, setPickerOpen] = useState(false);

    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    title="Browse icons"
                    onClick={() => setPickerOpen(true)}
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-dashed bg-muted/40 transition-colors hover:border-primary hover:bg-muted',
                        error ? 'border-destructive' : 'border-border'
                    )}
                >
                    <DynamicIcon name={value} color={color} size="h-5 w-5" />
                </button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2 text-xs"
                    onClick={() => setPickerOpen(true)}
                >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Choose Icon
                </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">{helper}</p>

            <IconPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={onChange} />
        </div>
    );
}

/**
 * Swatch + hex input, matching the mockup's "Category Color / Icon Color"
 * control. Kept as one component because the two inputs must stay in sync —
 * `<input type="color">` only emits valid hex, while the text field can hold a
 * partially typed value.
 */
export function ColorField({
    label,
    value,
    onChange,
    error,
    helper = 'Choose a color for this.',
    required,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: boolean;
    helper?: string;
    required?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value || '#6E22FE'}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        'h-10 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-1',
                        error ? 'border-destructive' : 'border-border'
                    )}
                />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#6E22FE"
                    className={cn('h-10 font-mono text-xs', error && 'border-destructive')}
                />
            </div>
            <p className="text-[11px] text-muted-foreground">{helper}</p>
        </div>
    );
}
