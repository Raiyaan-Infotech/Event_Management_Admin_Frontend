'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Sparkles, PanelLeft, ImageIcon, Upload, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

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

    const handleAddBullet = () => {
        if (bullets.length >= MAX_BULLETS) {
            toast.error('Maximum 5 highlight bullets allowed.');
            return;
        }
        const newBullet: BulletRow = { id: `bullet-${Date.now()}`, text: 'New highlight' };
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
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
                            <Sparkles className="h-3 w-3" /> Website Builder
                        </Badge>
                        <Badge variant="secondary" className="text-xs">Super Admin Panel</Badge>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Login Page Settings</h1>
                    <p className="text-sm text-muted-foreground">Customize side panel copy, background image, and highlight bullets for client login.</p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Login Page'}
                </Button>
            </div>

            {/* Toggle: Show Side Panel */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-sm">Show side panel</h4>
                            <p className="text-xs text-muted-foreground">When off, the login / get started popup shows only the form (no branded side panel).</p>
                        </div>
                        <Switch checked={enabled} onCheckedChange={setEnabled} />
                    </div>
                </CardContent>
            </Card>

            {enabled && (
                <>
                    {/* Section: Side Panel Content */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                            <PanelLeft className="h-4 w-4 text-primary" />
                            <div>
                                <CardTitle className="text-lg">Side Panel Content</CardTitle>
                                <CardDescription>The marketing copy shown beside the login form.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Eyebrow Label */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="eyebrow" className="text-xs font-semibold text-muted-foreground">Eyebrow label</Label>
                                    <span className="text-[10px] text-muted-foreground">{eyebrow.length}/{EYEBROW_MAX}</span>
                                </div>
                                <Input id="eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} maxLength={EYEBROW_MAX} placeholder="Event workspace" className="h-9 text-sm" />
                            </div>

                            {/* Title */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground">Title</Label>
                                    <span className="text-[10px] text-muted-foreground">{title.length}/{TITLE_MAX}</span>
                                </div>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={TITLE_MAX} placeholder="Everything for your event, in one place." className="h-9 text-sm font-semibold" />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">Description</Label>
                                    <span className="text-[10px] text-muted-foreground">{description.length}/{DESCRIPTION_MAX}</span>
                                </div>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={DESCRIPTION_MAX} rows={3} placeholder="Manage enquiries, bookings and event details..." className="text-sm" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section: Background Image */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                            <ImageIcon className="h-4 w-4 text-primary" />
                            <div>
                                <CardTitle className="text-lg">Background Image</CardTitle>
                                <CardDescription>Optional image shown behind the panel, tinted by your brand color.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                                <div>
                                    <h4 className="font-semibold text-sm">Show Background Image</h4>
                                    <p className="text-xs text-muted-foreground">Enable image overlay on the left brand panel.</p>
                                </div>
                                <Switch checked={showBackgroundImage} onCheckedChange={setShowBackgroundImage} />
                            </div>

                            {showBackgroundImage && (
                                <div className="flex items-center gap-4 border border-dashed rounded-lg p-4">
                                    <div className="flex h-20 w-16 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                                        3:4 FRAME
                                    </div>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Upload className="h-4 w-4" /> Upload Panel Image
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section: Highlights */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2">
                                <ListChecks className="h-4 w-4 text-primary" />
                                <div>
                                    <CardTitle className="text-lg">Highlights</CardTitle>
                                    <CardDescription>Bullet points listed inside the side panel.</CardDescription>
                                </div>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddBullet} disabled={bullets.length >= MAX_BULLETS} className="gap-1 text-xs">
                                <Plus className="h-3.5 w-3.5" /> Add highlight
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {bullets.map((bullet, idx) => (
                                <div key={bullet.id} className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            value={bullet.text}
                                            onChange={(e) => {
                                                const updated = [...bullets];
                                                updated[idx].text = e.target.value;
                                                setBullets(updated);
                                            }}
                                            maxLength={BULLET_MAX}
                                            className="h-9 text-sm pr-12"
                                        />
                                        <span className="absolute right-2.5 top-2.5 text-[10px] text-muted-foreground">{bullet.text.length}/{BULLET_MAX}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveBullet(bullet.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
