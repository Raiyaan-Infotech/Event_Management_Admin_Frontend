'use client';

import * as LucideIcons from 'lucide-react';
import { Icon as IconifyIcon } from '@iconify/react';
import { HelpCircle } from 'lucide-react';

/**
 * Renders whatever `IconPickerDialog` stores.
 *
 * That picker emits two shapes — a bare PascalCase Lucide component name
 * ("ArrowRight") for the lucide collection, and a full Iconify id
 * ("mdi:star") for every other collection — so anything rendering a picked
 * icon has to handle both.
 *
 * Lifted out of app/admin/menus/_components/menus-content.tsx, which is where
 * it originally lived, so Menu Management and Menus share one implementation.
 */

// Case-insensitive map: 'airvent' → AirVent component, built once at module load.
// Icons are forwardRef objects (typeof === 'object'), so filter by uppercase
// first letter rather than by type.
const lucideIconMap: Record<string, any> = Object.fromEntries(
    Object.entries(LucideIcons)
        .filter(([k]) => /^[A-Z]/.test(k))
        .map(([k, v]) => [k.toLowerCase(), v])
);

export function resolveLucideIcon(name: string) {
    if (!name) return null;
    // 1. Exact match (fastest path)
    if ((LucideIcons as any)[name]) return (LucideIcons as any)[name];
    // 2. Case-insensitive match (handles 'Airvent' → 'AirVent', 'wifi' → 'Wifi')
    if (lucideIconMap[name.toLowerCase()]) return lucideIconMap[name.toLowerCase()];
    // 3. Auto-convert hyphen/underscore input: 'arrow-right' → 'ArrowRight'
    const converted = name
        .trim()
        .split(/[-_ ]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
    return lucideIconMap[converted.toLowerCase()] || null;
}

interface DynamicIconProps {
    name?: string | null;
    color?: string | null;
    /** Tailwind size classes. Named `size` for backwards compatibility. */
    size?: string;
    className?: string;
}

export function DynamicIcon({ name, color, size = 'h-5 w-5', className }: DynamicIconProps) {
    const classes = className ? `${size} ${className}` : size;
    if (!name) return <HelpCircle className={`${classes} text-muted-foreground`} />;

    const style = color ? { color } : undefined;

    if (name.includes(':')) {
        return <IconifyIcon icon={name} className={classes} style={style} />;
    }

    const LucideIcon = resolveLucideIcon(name);
    if (!LucideIcon) return <HelpCircle className={`${classes} text-muted-foreground`} />;
    return <LucideIcon className={classes} style={style} />;
}
