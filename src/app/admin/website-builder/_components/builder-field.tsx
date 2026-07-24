'use client';

import * as React from 'react';
import { Lock, Upload, Crop, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface CountedInputProps {
    value: string;
    onChange: (value: string) => void;
    maxLength: number;
    label?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    inputPrefix?: React.ReactNode;
    showCount?: boolean;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    autoFocus?: boolean;
    lockInput?: boolean;
}

export function BuilderCountedInput({
    value,
    onChange,
    maxLength,
    label,
    required = false,
    placeholder,
    className,
    inputClassName,
    labelClassName,
    inputPrefix,
    showCount = true,
    onKeyDown,
    autoFocus = false,
    lockInput = false,
}: CountedInputProps) {
    return (
        <div className={cn('w-full space-y-1', className)}>
            {label ? (
                <div className="flex items-center justify-between">
                    <label className={cn('text-xs font-semibold text-muted-foreground', labelClassName)}>
                        {label}
                        {required ? <span className="ml-1 text-rose-500">*</span> : null}
                    </label>
                </div>
            ) : null}
            <div
                className={cn(
                    'relative w-full flex items-center',
                    inputPrefix
                        ? 'h-9 overflow-hidden rounded-md border border-input bg-card focus-within:ring-1 focus-within:ring-primary'
                        : ''
                )}
            >
                {inputPrefix ? inputPrefix : null}
                <Input
                    value={value}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={onKeyDown}
                    autoFocus={autoFocus}
                    className={cn(
                        'h-9 w-full text-xs font-medium',
                        lockInput ? (showCount ? '!pr-16' : '!pr-8') : showCount ? 'pr-12' : 'pr-3',
                        lockInput && 'cursor-not-allowed bg-muted text-muted-foreground',
                        inputPrefix && 'h-full rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
                        inputClassName
                    )}
                    disabled={lockInput}
                />
                {lockInput ? (
                    <Lock className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                ) : null}
                {showCount ? (
                    <span
                        className={cn(
                            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground tabular-nums',
                            lockInput ? 'right-7' : 'right-2.5'
                        )}
                    >
                        {value.length}/{maxLength}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export interface CountedTextareaProps {
    value: string;
    onChange: (value: string) => void;
    maxLength: number;
    label?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
    textareaClassName?: string;
    rows?: number;
}

export function BuilderCountedTextarea({
    value,
    onChange,
    maxLength,
    label,
    required = false,
    placeholder,
    className,
    textareaClassName,
    rows = 3,
}: CountedTextareaProps) {
    return (
        <div className={cn('w-full space-y-1', className)}>
            {label ? (
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                        {label}
                        {required ? <span className="ml-1 text-rose-500">*</span> : null}
                    </label>
                </div>
            ) : null}
            <div className="relative w-full">
                <Textarea
                    value={value}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    rows={rows}
                    className={cn('w-full text-xs font-medium pb-6 pr-3', textareaClassName)}
                />
                <span className="pointer-events-none absolute bottom-2 right-2.5 text-[10px] font-semibold text-muted-foreground tabular-nums">
                    {value.length}/{maxLength}
                </span>
            </div>
        </div>
    );
}

export interface SegmentedControlOption<T extends string = string> {
    label: string;
    value: T;
}

export interface SegmentedControlProps<T extends string = string> {
    options: SegmentedControlOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

export function BuilderSegmentedControl<T extends string = string>({
    options,
    value,
    onChange,
    className,
}: SegmentedControlProps<T>) {
    return (
        <div className={cn('grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100/80 border border-slate-200 text-xs', className)}>
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <Button
                        key={option.value}
                        type="button"
                        variant="ghost"
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'flex items-center justify-center gap-2 py-1.5 h-8 rounded-md font-semibold text-xs transition-all border shadow-none',
                            isSelected
                                ? 'bg-white text-blue-600 shadow-xs border-blue-600/30 hover:bg-white hover:text-blue-600'
                                : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200/50 hover:text-slate-900'
                        )}
                    >
                        <span
                            className={cn(
                                'h-2.5 w-2.5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                                isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-400 bg-transparent'
                            )}
                        />
                        {option.label}
                    </Button>
                );
            })}
        </div>
    );
}

export interface RadioOption<T extends string = string> {
    label: string;
    value: T;
}

export interface BuilderRadioGroupProps<T extends string = string> {
    label?: string;
    description?: string;
    options: RadioOption<T>[];
    value: T;
    onChange: (value: T) => void;
    name: string;
    className?: string;
}

export function BuilderRadioGroup<T extends string = string>({
    label,
    description,
    options,
    value,
    onChange,
    name,
    className,
}: BuilderRadioGroupProps<T>) {
    return (
        <div className={cn('space-y-1.5', className)}>
            {label ? <Label className="text-xs font-semibold text-slate-700">{label}</Label> : null}
            {description ? <p className="text-[11px] text-muted-foreground">{description}</p> : null}
            <div className="space-y-1.5 pt-1">
                {options.map((opt) => (
                    <label
                        key={opt.value}
                        className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer select-none"
                    >
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)}
                            className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span>{opt.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export interface BuilderImageUploadDropzoneProps {
    label?: string;
    imageUrl?: string;
    onFileSelect: (file: File) => void;
    onReCrop?: () => void;
    onRemove?: () => void;
    recommendedText?: string;
    className?: string;
}

export function BuilderImageUploadDropzone({
    label = 'SLIDE IMAGE',
    imageUrl,
    onFileSelect,
    onReCrop,
    onRemove,
    recommendedText = 'Recommended: 1920x800px (Max: 2MB)',
    className,
}: BuilderImageUploadDropzoneProps) {
    return (
        <div className={cn('space-y-1.5', className)}>
            {label ? (
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {label}
                </Label>
            ) : null}
            {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border bg-card p-2 flex items-center gap-3">
                    <img
                        src={imageUrl}
                        alt="Uploaded Preview"
                        className="h-16 w-24 object-cover rounded-lg border"
                    />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">Uploaded Image</p>
                        <div className="flex items-center gap-1.5">
                            {onReCrop ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={onReCrop}
                                    className="h-6 text-[10px] px-2 gap-1"
                                >
                                    <Crop className="h-3 w-3" /> Re-crop
                                </Button>
                            ) : null}
                            {onRemove ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={onRemove}
                                    className="h-6 text-[10px] px-2 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-3 w-3" /> Remove
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative flex flex-col items-center justify-center h-28 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100/70 cursor-pointer p-3 text-center transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onFileSelect(file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-1.5">
                        <Upload className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                        Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                        {recommendedText}
                    </span>
                </div>
            )}
        </div>
    );
}

export interface BuilderStatusSwitchProps {
    label?: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
}

export function BuilderStatusSwitch({
    label = 'STATUS',
    description = 'Enable or disable this slide on the website.',
    checked,
    onCheckedChange,
    className,
}: BuilderStatusSwitchProps) {
    return (
        <div className={cn('rounded-lg border p-3 flex items-center justify-between bg-card', className)}>
            <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-slate-800">{label}</Label>
                {description ? <p className="text-[11px] text-muted-foreground">{description}</p> : null}
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
            />
        </div>
    );
}



export interface BuilderEffectSliderProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    className?: string;
}

export function BuilderEffectSlider({
    label,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    unit = '%',
    className,
}: BuilderEffectSliderProps) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <div className="flex items-center justify-between text-xs">
                <Label className="text-xs font-semibold text-slate-700">{label}</Label>
                <span className="font-bold text-xs text-slate-700 tabular-nums">
                    {value}{unit}
                </span>
            </div>
            <Slider
                value={[value]}
                onValueChange={(vals) => onChange(vals[0])}
                min={min}
                max={max}
                step={step}
                className="py-1"
            />
        </div>
    );
}
