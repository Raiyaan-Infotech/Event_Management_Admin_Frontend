'use client';

import { useState, useRef } from 'react';
import {
    Save,
    RotateCcw,
    HelpCircle,
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    Upload,
    Image as ImageIcon,
    Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BuilderCountedInput } from '../_components/builder-field';
import { cn } from '@/lib/utils';

interface Sponsor {
    id: string;
    name: string;
    logoUrl: string;
}

function logoDataUrl(name: string, color: string, accent: string) {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240">
      <rect width="360" height="240" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
      <text x="180" y="105" text-anchor="middle" font-family="Georgia, serif" font-size="52" font-weight="700" fill="${accent}">${initials}</text>
      <text x="180" y="160" text-anchor="middle" font-family="Inter, Arial" font-size="24" font-weight="800" letter-spacing="3" fill="${color}">${name.split(' ')[0].toUpperCase()}</text>
      <text x="180" y="192" text-anchor="middle" font-family="Inter, Arial" font-size="16" font-weight="600" letter-spacing="6" fill="${color}">${name.split(' ').slice(1).join(' ').toUpperCase() || 'SPONSOR'}</text>
    </svg>
  `)}`;
}

const initialSponsors: Sponsor[] = [
    { id: '1', name: 'Platinum Events', logoUrl: logoDataUrl('Platinum Events', '#0f172a', '#b7791f') },
    { id: '2', name: 'Dream Decor', logoUrl: logoDataUrl('Dream Decor', '#be185d', '#be185d') },
    { id: '3', name: 'Elite Catering', logoUrl: logoDataUrl('Elite Catering', '#111827', '#c58a16') },
    { id: '4', name: 'Media Connect', logoUrl: logoDataUrl('Media Connect', '#1e3a8a', '#4f46e5') },
];

export default function PortfolioSponsorsPage() {
    const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [sponsorName, setSponsorName] = useState('');
    const [draftLogo, setDraftLogo] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setDraftLogo(url);
        toast.success('Sponsor logo uploaded.');
    };

    const handleSaveSponsor = () => {
        const name = sponsorName.trim();
        if (!name) {
            toast.error('Sponsor Name is required.');
            return;
        }

        if (editingId) {
            setSponsors((prev) =>
                prev.map((s) =>
                    s.id === editingId
                        ? {
                              ...s,
                              name,
                              logoUrl: draftLogo || s.logoUrl,
                          }
                        : s
                )
            );
            toast.success(`Sponsor "${name}" updated.`);
            setEditingId(null);
        } else {
            const newSponsor: Sponsor = {
                id: String(Date.now()),
                name,
                logoUrl: draftLogo || logoDataUrl(name, '#0f172a', '#2563eb'),
            };
            setSponsors((prev) => [...prev, newSponsor]);
            toast.success(`Sponsor "${name}" added.`);
        }

        setSponsorName('');
        setDraftLogo(null);
    };

    const handleEdit = (sponsor: Sponsor) => {
        setEditingId(sponsor.id);
        setSponsorName(sponsor.name);
        setDraftLogo(sponsor.logoUrl);
    };

    const handleDelete = (id: string) => {
        setSponsors((prev) => prev.filter((s) => s.id !== id));
        toast.success('Sponsor deleted.');
    };

    const handleSaveAll = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Sponsors saved successfully.');
        }, 600);
    };

    const handleReset = () => {
        setSponsors(initialSponsors);
        setSponsorName('');
        setDraftLogo(null);
        setEditingId(null);
        toast.info('Reset to default sponsors.');
    };

    return (
        <div className="space-y-4 p-4 md:p-6 bg-slate-50/50 min-h-screen">
            {/* Top Bar Navigation & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 bg-white p-4 rounded-xl shadow-2xs">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Website Builder</span>
                        <span>›</span>
                        <span>Portfolio</span>
                        <span>›</span>
                        <span className="font-semibold text-slate-800">Sponsors</span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Portfolio - Sponsors</h1>
                    <p className="text-xs text-slate-500">
                        Manage sponsor logos and display wall for your website portfolio.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewOpen(true)}
                        className="h-8 px-3 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                        <Eye className="h-3.5 w-3.5 text-emerald-600 mr-1" /> Live Preview
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 mr-1" /> How It Works
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset} className="h-8 px-3 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50">
                        <RotateCcw className="h-3.5 w-3.5 text-rose-500 mr-1" /> Reset
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    >
                        <Save className="h-3.5 w-3.5 mr-1" /> {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Main Workspace: Form & List */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Card 1: Add New Sponsor */}
                <div className="md:col-span-5">
                    <Card className="shadow-xs border-slate-200">
                        <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                {editingId ? 'Edit Sponsor' : 'Add New Sponsor'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <BuilderCountedInput
                                label="Sponsor Name"
                                required
                                value={sponsorName}
                                onChange={(val) => setSponsorName(val)}
                                maxLength={100}
                                placeholder="Enter sponsor brand name"
                            />

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                                    Sponsor Logo
                                </label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoSelect}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-100/60 cursor-pointer transition-all text-center group"
                                >
                                    {draftLogo ? (
                                        <div className="relative h-24 w-full flex items-center justify-center">
                                            <img
                                                src={draftLogo}
                                                alt="Preview"
                                                className="max-h-full max-w-full object-contain rounded-lg"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700">Click to upload logo</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">PNG, SVG, JPG (600x400px Max: 2MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleSaveSponsor}
                                className="w-full h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                            >
                                <Plus className="h-4 w-4 mr-1" /> {editingId ? 'Update Sponsor' : 'Add Sponsor'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Card 2: Added Sponsors List */}
                <div className="md:col-span-7">
                    <Card className="shadow-xs border-slate-200">
                        <CardHeader className="py-3 px-4 border-b bg-slate-50/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                Added Sponsors ({sponsors.length})
                            </CardTitle>
                            <span className="text-[11px] text-slate-400">Drag handle to reorder</span>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {sponsors.map((sponsor, index) => (
                                <div
                                    key={sponsor.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs group"
                                >
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 cursor-grab" />
                                        <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                                        <div className="h-10 w-16 border rounded bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                                            <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-800">{sponsor.name}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(sponsor)}
                                            className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(sponsor.id)}
                                            className="h-7 w-7 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <p className="text-[10px] text-slate-400 font-medium pt-2">
                                You can upload up to 30 sponsors.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Live Preview Modal Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl border-slate-200">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <DialogTitle className="text-sm font-bold text-slate-900">Sponsors — Live Preview</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-slate-500">
                            This is how the sponsor wall will appear on the live website.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {sponsors.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {sponsors.map((s) => (
                                    <div
                                        key={s.id}
                                        className="flex h-32 items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-all hover:shadow-md hover:border-blue-300 group"
                                    >
                                        <img
                                            src={s.logoUrl}
                                            alt={s.name}
                                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <ImageIcon className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                <p className="text-xs font-bold text-slate-600">No Sponsors Added</p>
                                <p className="text-[11px] text-slate-400 mt-1">Add sponsors to build your sponsor wall.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
