'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Share2, X } from 'lucide-react';
import { IconPickerDialog } from '@/components/common/icon-picker-dialog';

// ─── Dynamic icon renderer (same as vendor portal) ────────────────────────────
const lucideMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> =
    Object.fromEntries(
        Object.entries(LucideIcons)
            .filter(([k]) => /^[A-Z]/.test(k))
            .map(([k, v]) => [k.toLowerCase(), v as React.ComponentType<{ className?: string; style?: React.CSSProperties }>])
    );

function DynamicIcon({ name, color, size = 'h-6 w-6' }: { name?: string; color?: string; size?: string }) {
    if (!name) return <Share2 className={`${size} text-gray-400`} />;
    const style = color ? { color } : undefined;
    if (name.includes(':')) return <Icon icon={name} className={size} style={style} />;
    const LucideIcon = lucideMap[name.toLowerCase()];
    if (!LucideIcon) return <Share2 className={`${size} text-gray-400`} />;
    return <LucideIcon className={size} style={style} />;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PendingSocialLink {
    icon: string;
    icon_color: string;
    label: string;
    url: string;
    is_active: number;
    sort_order?: number;
}

interface SocialLink extends PendingSocialLink { id: number; }

const EMPTY: PendingSocialLink = { icon: '', icon_color: '#3b82f6', label: '', url: '', is_active: 1, sort_order: 0 };

// ─── Add / Edit Dialog — same fields as vendor portal form ────────────────────
function LinkDialog({ open, onClose, initial, onSave, saving }: {
    open: boolean; onClose: () => void;
    initial: PendingSocialLink; onSave: (f: PendingSocialLink) => void; saving: boolean;
}) {
    const [form, setForm] = useState<PendingSocialLink>(initial);
    const [pickerOpen, setPickerOpen] = useState(false);

    // Reset form when dialog opens with new data
    const [lastOpen, setLastOpen] = useState(false);
    if (open && !lastOpen) { setForm(initial); setLastOpen(true); }
    if (!open && lastOpen) { setLastOpen(false); }

    const isEdit = !!initial.url;

    return (
        <>
            <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Share2 className="size-4 text-primary" />
                            {isEdit ? 'Edit Social Link' : 'Add Social Link'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-1">
                        {/* Icon field — same as vendor portal */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Icon</Label>
                            <div className="flex items-start gap-3">
                                {/* Preview square / browse trigger */}
                                <button
                                    type="button"
                                    onClick={() => setPickerOpen(true)}
                                    className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 hover:border-primary/50 transition-colors"
                                    title="Browse icons"
                                >
                                    <DynamicIcon name={form.icon} color={form.icon_color} />
                                    {!form.icon && <span className="text-[9px] text-gray-400 leading-none">Browse</span>}
                                </button>
                                {/* Text field + clear */}
                                <div className="flex-1 relative">
                                    <Input
                                        value={form.icon}
                                        onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                                        placeholder="e.g. Share2, mdi:instagram, lucide:facebook"
                                        className="pr-8 h-11"
                                    />
                                    {form.icon && (
                                        <button type="button" onClick={() => setForm(p => ({ ...p, icon: '' }))}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Icon color — same as vendor portal */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Icon Color</Label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={form.icon_color}
                                    onChange={e => setForm(p => ({ ...p, icon_color: e.target.value }))}
                                    className="h-11 w-11 cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent p-0.5" />
                                <Input value={form.icon_color} placeholder="#3b82f6"
                                    onChange={e => setForm(p => ({ ...p, icon_color: e.target.value }))}
                                    className="flex-1 h-11" />
                                {/* live preview */}
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-800 flex-shrink-0"
                                    style={{ background: `${form.icon_color}18` }}>
                                    <DynamicIcon name={form.icon || 'Share2'} color={form.icon_color} size="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        {/* Label */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Label <span className="text-destructive">*</span></Label>
                            <Input value={form.label} placeholder="e.g. Instagram, WhatsApp, LinkedIn"
                                onChange={e => setForm(p => ({ ...p, label: e.target.value }))} className="h-11" />
                        </div>

                        {/* URL */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">URL <span className="text-destructive">*</span></Label>
                            <Input value={form.url} placeholder="https://..."
                                onChange={e => setForm(p => ({ ...p, url: e.target.value }))} className="h-11" />
                        </div>

                        {/* Sort order + Active */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Sort Order</Label>
                                <Input type="number" min={0} value={form.sort_order ?? 0}
                                    onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                                    className="h-11 w-28" />
                                <p className="text-[11px] text-gray-400">Lower = shown first</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Active</Label>
                                <div className="flex items-center gap-3 h-11">
                                    <Switch checked={(form.is_active ?? 1) === 1}
                                        onCheckedChange={v => setForm(p => ({ ...p, is_active: v ? 1 : 0 }))} />
                                    <span className={`text-sm font-semibold ${form.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                        {form.is_active ? 'Visible' : 'Hidden'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button disabled={saving} onClick={() => {
                            if (!form.label.trim() || !form.url.trim()) { toast.error('Label and URL are required'); return; }
                            onSave(form);
                        }}>
                            {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Link')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <IconPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={icon => setForm(p => ({ ...p, icon }))} />
        </>
    );
}

// ─── Link row ──────────────────────────────────────────────────────────────────
function LinkRow({ link, onEdit, onDelete, onToggle }: {
    link: Partial<SocialLink> & PendingSocialLink;
    onEdit: () => void; onDelete: () => void; onToggle?: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-3 border rounded-lg px-3 py-2.5 bg-muted/10">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${link.icon_color}20`, border: `1.5px solid ${link.icon_color}` }}>
                <DynamicIcon name={link.icon} color={link.icon_color} size="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{link.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{link.url}</p>
            </div>
            <Badge variant="outline" className="text-[10px] hidden sm:flex shrink-0">{link.icon || '—'}</Badge>
            {onToggle && (
                <Switch checked={(link.is_active ?? 1) === 1} onCheckedChange={onToggle} className="scale-75 shrink-0" />
            )}
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onEdit}><Pencil className="size-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-destructive" onClick={onDelete}><Trash2 className="size-3.5" /></Button>
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────
interface Props {
    vendorId: number | null;
    onLocalChange?: (links: PendingSocialLink[]) => void;
}

export function VendorSocialLinksManager({ vendorId, onLocalChange }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<(Partial<SocialLink> & PendingSocialLink & { _idx?: number }) | null>(null);

    // LOCAL state for create mode
    const [local, setLocal] = useState<(PendingSocialLink & { _idx: number })[]>([]);
    const [counter, setCounter] = useState(0);

    const pushLocal = (next: (PendingSocialLink & { _idx: number })[]) => {
        setLocal(next);
        onLocalChange?.(next.map(({ _idx, ...rest }) => rest));
    };

    // API state for edit mode
    const qc = useQueryClient();
    const KEY = ['vendor-admin-social-links', vendorId];
    const { data: apiLinks = [], isLoading } = useQuery<SocialLink[]>({
        queryKey: KEY,
        queryFn: async () => (await apiClient.get(`/vendors/${vendorId}/social-links`)).data.data ?? [],
        enabled: !!vendorId,
    });
    const createMut = useMutation({
        mutationFn: (d: PendingSocialLink) => apiClient.post(`/vendors/${vendorId}/social-links`, d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Link added'); close(); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });
    const updateMut = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<SocialLink> }) =>
            apiClient.put(`/vendors/${vendorId}/social-links/${id}`, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Updated'); close(); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });
    const deleteMut = useMutation({
        mutationFn: (id: number) => apiClient.delete(`/vendors/${vendorId}/social-links/${id}`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Deleted'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });

    const close = () => { setDialogOpen(false); setEditTarget(null); };
    const openAdd = () => { setEditTarget(null); setDialogOpen(true); };
    const saving = createMut.isPending || updateMut.isPending;

    // CREATE MODE
    if (!vendorId) {
        return (
            <div className="space-y-3">
                {local.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No social links yet. Links will be saved after the vendor is created.</p>
                )}
                <div className="space-y-2">
                    {local.map(link => (
                        <LinkRow key={link._idx} link={link}
                            onEdit={() => { setEditTarget(link); setDialogOpen(true); }}
                            onDelete={() => pushLocal(local.filter(l => l._idx !== link._idx))} />
                    ))}
                </div>
                <Button type="button" size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={openAdd}>
                    <Plus className="size-3.5" /> Add Social Link
                </Button>
                <LinkDialog open={dialogOpen} onClose={close} saving={false}
                    initial={editTarget ?? EMPTY}
                    onSave={form => {
                        if (editTarget?._idx !== undefined) {
                            pushLocal(local.map(l => l._idx === editTarget._idx ? { ...l, ...form } : l));
                        } else {
                            const idx = counter;
                            setCounter(c => c + 1);
                            pushLocal([...local, { ...form, _idx: idx }]);
                        }
                        close();
                    }} />
            </div>
        );
    }

    // EDIT MODE
    if (isLoading) return <p className="text-xs text-muted-foreground">Loading…</p>;

    return (
        <div className="space-y-3">
            {apiLinks.length === 0 && <p className="text-xs text-muted-foreground italic">No social links yet.</p>}
            <div className="space-y-2">
                {apiLinks.map(link => (
                    <LinkRow key={link.id} link={link}
                        onEdit={() => { setEditTarget(link); setDialogOpen(true); }}
                        onDelete={() => deleteMut.mutate(link.id)}
                        onToggle={v => updateMut.mutate({ id: link.id, data: { is_active: v ? 1 : 0 } })} />
                ))}
            </div>
            <Button type="button" size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={openAdd}>
                <Plus className="size-3.5" /> Add Social Link
            </Button>
            <LinkDialog open={dialogOpen} onClose={close} saving={saving}
                initial={editTarget ?? EMPTY}
                onSave={form => {
                    if (editTarget && 'id' in editTarget && editTarget.id) {
                        updateMut.mutate({ id: editTarget.id, data: form });
                    } else {
                        createMut.mutate(form);
                    }
                }} />
        </div>
    );
}
