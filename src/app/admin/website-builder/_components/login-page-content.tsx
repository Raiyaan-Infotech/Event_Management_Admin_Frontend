'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Sparkles, PanelLeft, ImageIcon, ListChecks, Check, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { BuilderCountedInput, BuilderCountedTextarea } from './builder-field';

interface BulletRow {
    id: string;
    text: string;
}

export function LoginPageContent() {
    const [enabled, setEnabled] = useState(true);
    const [eyebrow, setEyebrow] = useState('Event workspace');
    const [title, setTitle] = useState('Everything for your event, in one place.');
    const [description, setDescription] = useState('Manage enquiries, bookings and event details from one secure account.');
    const [showBackgroundImage, setShowBackgroundImage] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('');
    const [bullets, setBullets] = useState<BulletRow[]>([
        { id: '1', text: 'Real-time RSVP & Guest Management' },
        { id: '2', text: 'Direct Messaging with Event Vendors' },
        { id: '3', text: 'Custom Website Builder & Gallery Settings' },
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const MAX_BULLETS = 5;
    const EYEBROW_MAX = 40;
    const TITLE_MAX = 60;
    const DESCRIPTION_MAX = 100;
    const BULLET_MAX = 40;

    const handleBackgroundSelect = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            setBackgroundImage(url);
            toast.success('Background image updated.');
        };
        reader.readAsDataURL(file);
    };

    const handleAddBullet = () => {
        if (bullets.length >= MAX_BULLETS) {
            toast.error('Maximum 5 highlight bullets allowed.');
            return;
        }
        const newBullet: BulletRow = { id: `bullet-${Date.now()}`, text: '' };
        setBullets([...bullets, newBullet]);
    };

    const handleRemoveBullet = (id: string) => {
        setBullets(bullets.filter((b) => b.id !== id));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Login Page settings saved successfully!');
        }, 500);
    };

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <div>
                    <h1 className="mt-1 text-xl font-bold tracking-tight">Login Page Settings</h1>
                    <p className="text-xs text-muted-foreground">Customize side panel copy, background image, and highlight bullets for client login.</p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 h-8 text-xs">
                    <Save className="h-3.5 w-3.5" /> {isSaving ? 'Saving...' : 'Save Login Page'}
                </Button>
            </div>

            {/* Split Screen: Left Controls | Right Live Branded Login Panel Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 items-start">
                {/* Left Column: Compact Form Controls */}
                <div className="space-y-3">
                    {/* Toggle: Show Side Panel */}
                    <Card className="shadow-xs">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-xs text-foreground">Show side panel</h4>
                                    <p className="text-[10px] text-muted-foreground">When off, the login / get started popup shows only the form (no branded side panel).</p>
                                </div>
                                <Switch checked={enabled} onCheckedChange={setEnabled} />
                            </div>
                        </CardContent>
                    </Card>

                    {enabled && (
                        <>
                            {/* Section: Side Panel Content */}
                            <Card className="shadow-xs">
                                <CardHeader className="p-3 pb-2 flex flex-row items-center gap-2 space-y-0">
                                    <PanelLeft className="h-4 w-4 text-primary" />
                                    <div>
                                        <CardTitle className="text-sm font-bold">Side Panel Content</CardTitle>
                                        <CardDescription className="text-[10px]">The marketing copy shown beside the login form.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 space-y-2.5">
                                    <BuilderCountedInput
                                        label="Eyebrow label"
                                        value={eyebrow}
                                        onChange={setEyebrow}
                                        maxLength={EYEBROW_MAX}
                                        placeholder="Event workspace"
                                    />

                                    <BuilderCountedInput
                                        label="Title"
                                        value={title}
                                        onChange={setTitle}
                                        maxLength={TITLE_MAX}
                                        placeholder="Everything for your event, in one place."
                                    />

                                    <BuilderCountedTextarea
                                        label="Description"
                                        value={description}
                                        onChange={setDescription}
                                        maxLength={DESCRIPTION_MAX}
                                        placeholder="Manage enquiries, bookings and event details..."
                                        rows={2}
                                    />
                                </CardContent>
                            </Card>

                            {/* Section: Background Image */}
                            <Card className="shadow-xs">
                                <CardHeader className="p-3 pb-2 flex flex-row items-center gap-2 space-y-0">
                                    <ImageIcon className="h-4 w-4 text-primary" />
                                    <div>
                                        <CardTitle className="text-sm font-bold">Background Image</CardTitle>
                                        <CardDescription className="text-[10px]">Optional image shown behind the panel, tinted by your brand color.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 space-y-2.5">
                                    <div className="flex items-center justify-between rounded-lg border p-2.5 bg-card">
                                        <div>
                                            <h4 className="font-semibold text-xs">Show Background Image</h4>
                                            <p className="text-[10px] text-muted-foreground">Enable image overlay on the left brand panel.</p>
                                        </div>
                                        <Switch checked={showBackgroundImage} onCheckedChange={setShowBackgroundImage} />
                                    </div>

                                    {showBackgroundImage && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Panel Background
                                            </label>
                                            {backgroundImage ? (
                                                <div className="relative rounded-md overflow-hidden border bg-card">
                                                    <img src={backgroundImage} alt="Panel Background" className="w-full h-24 object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setBackgroundImage('')}
                                                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative flex flex-col items-center justify-center rounded-lg border border-dashed p-4 bg-muted/20 hover:bg-muted/30 cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleBackgroundSelect(file);
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                    <ImageIcon className="h-5 w-5 text-muted-foreground mb-0.5" />
                                                    <p className="text-xs font-semibold text-foreground">Click to upload image</p>
                                                    <p className="text-[9px] text-muted-foreground">Recommended: 900x1200px (Max: 2MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Section: Highlights */}
                            <Card className="shadow-xs">
                                <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
                                    <div className="flex items-center gap-2">
                                        <ListChecks className="h-4 w-4 text-primary" />
                                        <div>
                                            <CardTitle className="text-sm font-bold">Highlights</CardTitle>
                                            <CardDescription className="text-[10px]">Up to 5 short bullet points with a check icon.</CardDescription>
                                        </div>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddBullet} disabled={bullets.length >= MAX_BULLETS} className="gap-1 text-[11px] h-7 px-2">
                                        <Plus className="h-3 w-3" /> Add highlight
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 space-y-2">
                                    {bullets.map((bullet, idx) => (
                                        <div key={bullet.id} className="flex items-center gap-2">
                                            <BuilderCountedInput
                                                value={bullet.text}
                                                onChange={(value) => {
                                                    const updated = [...bullets];
                                                    updated[idx].text = value;
                                                    setBullets(updated);
                                                }}
                                                maxLength={BULLET_MAX}
                                                placeholder={`Highlight ${idx + 1}`}
                                                showCount={false}
                                                className="flex-1 h-8 text-xs"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemoveBullet(bullet.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Right Column: Live Branded Login Panel Preview */}
                <div className="sticky top-4 space-y-2">
                    <Card className="border-primary/30 shadow-xs overflow-hidden">
                        <CardHeader className="bg-muted/30 p-3 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">Live Login Side Panel Preview</CardTitle>
                                </div>
                                <Badge variant="outline" className="text-[9px] gap-1 bg-background h-5 px-1.5">
                                    <Monitor className="h-2.5 w-2.5" /> Live Render
                                </Badge>
                            </div>
                            <CardDescription className="text-[10px]">Real-time interactive rendering of client login branded panel.</CardDescription>
                        </CardHeader>

                        <CardContent className="p-0">
                            {enabled ? (
                                <div className="relative min-h-[440px] flex flex-col justify-between p-5 bg-primary text-primary-foreground overflow-hidden">
                                    {/* Optional Background Image */}
                                    {showBackgroundImage && backgroundImage && (
                                        <>
                                            <img
                                                src={backgroundImage}
                                                alt="Login panel background"
                                                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                                            />
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                                        </>
                                    )}

                                    {/* Top Brand Header */}
                                    <div className="relative z-10 space-y-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/20 backdrop-blur-md text-white font-extrabold text-xs border border-white/30">
                                                RA
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-extrabold leading-none text-white">RA EVENTS</h3>
                                                <p className="text-[9px] font-semibold text-white/70 uppercase tracking-widest mt-0.5">Tirunelveli</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 space-y-1.5">
                                            {eyebrow && (
                                                <span className="text-[9px] font-extrabold text-white/75 uppercase tracking-widest block">
                                                    {eyebrow}
                                                </span>
                                            )}
                                            {title && (
                                                <h2 className="text-lg font-black leading-snug text-white">
                                                    {title}
                                                </h2>
                                            )}
                                            {description && (
                                                <p className="text-[11px] text-white/80 leading-normal pt-0.5">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Highlights List */}
                                    {bullets.filter((b) => b.text.trim()).length > 0 && (
                                        <div className="relative z-10 pt-4 space-y-1.5 border-t border-white/20 mt-4">
                                            {bullets.filter((b) => b.text.trim()).map((bullet) => (
                                                <div key={bullet.id} className="flex items-center gap-2 text-[11px] font-semibold text-white/95">
                                                    <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white/25 text-white">
                                                        <Check className="h-2 w-2" />
                                                    </div>
                                                    <span>{bullet.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
                                    <p className="font-semibold text-foreground">Side Panel is Turned Off</p>
                                    <p className="text-[10px]">When off, the client login modal displays only the authentication form.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
