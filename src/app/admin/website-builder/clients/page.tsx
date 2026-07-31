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

interface ClientLogo {
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
      <circle cx="95" cy="120" r="34" fill="${accent}" opacity=".95"/>
      <text x="182" y="132" text-anchor="middle" font-family="Inter, Arial" font-size="42" font-weight="800" fill="${color}">${name}</text>
      <text x="95" y="132" text-anchor="middle" font-family="Inter, Arial" font-size="24" font-weight="900" fill="#ffffff">${initials}</text>
    </svg>
  `)}`;
}

const initialClients: ClientLogo[] = [
    { id: '1', name: 'Google', logoUrl: logoDataUrl('Google', '#4285f4', '#34a853') },
    { id: '2', name: 'TATA', logoUrl: logoDataUrl('TATA', '#3158b7', '#3158b7') },
    { id: '3', name: 'Microsoft', logoUrl: logoDataUrl('Microsoft', '#737373', '#f25022') },
    { id: '4', name: 'amazon', logoUrl: logoDataUrl('amazon', '#111827', '#ff9900') },
    { id: '5', name: 'IBM', logoUrl: logoDataUrl('IBM', '#0062ff', '#0062ff') },
    { id: '6', name: 'Infosys', logoUrl: logoDataUrl('Infosys', '#007cc3', '#007cc3') },
];

export default function PortfolioClientsPage() {
    const [clients, setClients] = useState<ClientLogo[]>(initialClients);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [clientName, setClientName] = useState('');
    const [draftLogo, setDraftLogo] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setDraftLogo(url);
        toast.success('Client logo uploaded.');
    };

    const handleSaveClient = () => {
        const name = clientName.trim();
        if (!name) {
            toast.error('Client Name is required.');
            return;
        }

        if (editingId) {
            setClients((prev) =>
                prev.map((c) =>
                    c.id === editingId
                        ? {
                              ...c,
                              name,
                              logoUrl: draftLogo || c.logoUrl,
                          }
                        : c
                )
            );
            toast.success(`Client "${name}" updated.`);
            setEditingId(null);
        } else {
            const newClient: ClientLogo = {
                id: String(Date.now()),
                name,
                logoUrl: draftLogo || logoDataUrl(name, '#2563eb', '#7c3aed'),
            };
            setClients((prev) => [...prev, newClient]);
            toast.success(`Client "${name}" added.`);
        }

        setClientName('');
        setDraftLogo(null);
    };

    const handleEdit = (client: ClientLogo) => {
        setEditingId(client.id);
        setClientName(client.name);
        setDraftLogo(client.logoUrl);
    };

    const handleDelete = (id: string) => {
        setClients((prev) => prev.filter((c) => c.id !== id));
        toast.success('Client deleted.');
    };

    const handleReset = () => {
        setClients(initialClients);
        setEditingId(null);
        setClientName('');
        setDraftLogo(null);
        toast.info('Clients reset to default list.');
    };

    const handleSaveAll = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Clients logo wall saved successfully.');
        }, 600);
    };

    return (
        <div className="space-y-4 p-4 md:p-6 bg-slate-50/50 min-h-screen">
            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 bg-white p-4 rounded-xl shadow-2xs">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Website Builder</span>
                        <span>›</span>
                        <span>Portfolio</span>
                        <span>›</span>
                        <span className="font-semibold text-slate-800">Clients</span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Portfolio - Clients</h1>
                    <p className="text-xs text-slate-500">
                        Manage client brand logos and display logo wall for your website portfolio.
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

            {/* Main Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Card 1: Add New Client */}
                <div className="md:col-span-5">
                    <Card className="shadow-xs border-slate-200">
                        <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                {editingId ? 'Edit Client' : 'Add New Client'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <BuilderCountedInput
                                label="Client Name"
                                required
                                value={clientName}
                                onChange={(val) => setClientName(val)}
                                maxLength={100}
                                placeholder="Enter client company name"
                            />

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                                    Client Logo
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
                                onClick={handleSaveClient}
                                className="w-full h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                            >
                                <Plus className="h-4 w-4 mr-1" /> {editingId ? 'Update Client' : 'Add Client'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Card 2: Added Clients List */}
                <div className="md:col-span-7">
                    <Card className="shadow-xs border-slate-200">
                        <CardHeader className="py-3 px-4 border-b bg-slate-50/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                Added Clients ({clients.length})
                            </CardTitle>
                            <span className="text-[11px] text-slate-400">Drag handle to reorder</span>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {clients.map((client, index) => (
                                <div
                                    key={client.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs group"
                                >
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 cursor-grab" />
                                        <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                                        <div className="h-10 w-16 border rounded bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                                            <img src={client.logoUrl} alt={client.name} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-800">{client.name}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(client)}
                                            className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(client.id)}
                                            className="h-7 w-7 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <p className="text-[10px] text-slate-400 font-medium pt-2">
                                You can upload up to 30 clients.
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
                            <DialogTitle className="text-sm font-bold text-slate-900">Clients — Live Preview</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-slate-500">
                            This is how the client logo wall will appear on the live website.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {clients.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {clients.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex h-32 items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-all hover:shadow-md hover:border-blue-300 group"
                                    >
                                        <img
                                            src={c.logoUrl}
                                            alt={c.name}
                                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <ImageIcon className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                <p className="text-xs font-bold text-slate-600">No Clients Added</p>
                                <p className="text-[11px] text-slate-400 mt-1">Add clients to build your client logo wall.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
