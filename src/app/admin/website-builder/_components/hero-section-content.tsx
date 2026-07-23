'use client';

import { useState } from 'react';
import { Save, Sparkles, Upload, Image as ImageIcon, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export function HeroSectionContent() {
    const [badgeText, setBadgeText] = useState('Best Event Management');
    const [title, setTitle] = useState('We Create Unforgettable Moments');
    const [description, setDescription] = useState('From elegant weddings to corporate events, we handle every detail with creativity and perfection. Let us bring your dream event to life.');
    
    // Button 1
    const [btn1Enabled, setBtn1Enabled] = useState(true);
    const [btn1Label, setBtn1Label] = useState('Explore Events');
    const [btn1Url, setBtn1Url] = useState('/events');
    const [btn1Style, setBtn1Style] = useState('Primary');
    const [btn1Color, setBtn1Color] = useState('#6C47FF');

    // Button 2
    const [btn2Enabled, setBtn2Enabled] = useState(true);
    const [btn2Label, setBtn2Label] = useState('Contact Us');
    const [btn2Url, setBtn2Url] = useState('/contact-us');
    const [btn2Style, setBtn2Style] = useState('Outline');
    const [btn2Color, setBtn2Color] = useState('#FFFFFF');

    // Layout & Overlay
    const [buttonLayout, setButtonLayout] = useState('left');
    const [overlayEnabled, setOverlayEnabled] = useState(true);
    const [overlayColor, setOverlayColor] = useState('#0B0D17');
    const [overlayOpacity, setOverlayOpacity] = useState(60);
    const [isSaving, setIsSaving] = useState(false);

    const BADGE_MAX = 40;
    const TITLE_MAX = 80;
    const DESC_MAX = 200;
    const BTN_LABEL_MAX = 30;

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Hero Section saved successfully!');
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
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Hero Section</h1>
                    <p className="text-sm text-muted-foreground">Customize main headline, badge text, description, CTA buttons, and background overlay.</p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Hero Section'}
                </Button>
            </div>

            {/* Section 1: Hero Banner Content */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Hero Banner Content</CardTitle>
                    <CardDescription>Badge text, hero image frame, main title, and description copy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Badge Text */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="badgeText" className="text-xs font-semibold text-muted-foreground">Badge Text</Label>
                            <span className="text-[10px] text-muted-foreground">{badgeText.length}/{BADGE_MAX}</span>
                        </div>
                        <Input id="badgeText" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} maxLength={BADGE_MAX} className="h-9 text-sm" />
                    </div>

                    {/* Hero Image Upload */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">Hero Image Frame</Label>
                        <div className="flex items-center gap-4 border border-dashed rounded-lg p-4 bg-card">
                            <div className="flex h-16 w-28 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                                16:9 FRAME
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Upload className="h-4 w-4" /> Upload Hero Image
                            </Button>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground">Title</Label>
                            <span className="text-[10px] text-muted-foreground">{title.length}/{TITLE_MAX}</span>
                        </div>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={TITLE_MAX} className="h-9 text-sm font-semibold" />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">Description</Label>
                            <span className="text-[10px] text-muted-foreground">{description.length}/{DESC_MAX}</span>
                        </div>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={DESC_MAX} rows={3} className="text-sm" />
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Call to Action Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Call to Action Buttons</CardTitle>
                    <CardDescription>Configure labels, target links, button styles, colors, and layout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Button 1 */}
                        <div className="space-y-4 rounded-lg border p-4 bg-card">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h4 className="font-semibold text-sm">Button 1 (Primary)</h4>
                                <Switch checked={btn1Enabled} onCheckedChange={setBtn1Enabled} />
                            </div>
                            {btn1Enabled && (
                                <>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">Button Label</Label>
                                            <span className="text-[10px] text-muted-foreground">{btn1Label.length}/{BTN_LABEL_MAX}</span>
                                        </div>
                                        <Input value={btn1Label} onChange={(e) => setBtn1Label(e.target.value)} maxLength={BTN_LABEL_MAX} className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Destination Link URL</Label>
                                        <Input value={btn1Url} onChange={(e) => setBtn1Url(e.target.value)} className="h-8 text-xs font-mono" />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Button Style</Label>
                                            <Select value={btn1Style} onValueChange={setBtn1Style}>
                                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Primary">Primary</SelectItem>
                                                    <SelectItem value="Outline">Outline</SelectItem>
                                                    <SelectItem value="Ghost">Ghost</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Button Color</Label>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={btn1Color} onChange={(e) => setBtn1Color(e.target.value)} className="h-8 w-8 cursor-pointer rounded border p-0.5" />
                                                <Input value={btn1Color} onChange={(e) => setBtn1Color(e.target.value)} className="h-8 font-mono text-xs uppercase" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Button 2 */}
                        <div className="space-y-4 rounded-lg border p-4 bg-card">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h4 className="font-semibold text-sm">Button 2 (Secondary)</h4>
                                <Switch checked={btn2Enabled} onCheckedChange={setBtn2Enabled} />
                            </div>
                            {btn2Enabled && (
                                <>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">Button Label</Label>
                                            <span className="text-[10px] text-muted-foreground">{btn2Label.length}/{BTN_LABEL_MAX}</span>
                                        </div>
                                        <Input value={btn2Label} onChange={(e) => setBtn2Label(e.target.value)} maxLength={BTN_LABEL_MAX} className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Destination Link URL</Label>
                                        <Input value={btn2Url} onChange={(e) => setBtn2Url(e.target.value)} className="h-8 text-xs font-mono" />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Button Style</Label>
                                            <Select value={btn2Style} onValueChange={setBtn2Style}>
                                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Primary">Primary</SelectItem>
                                                    <SelectItem value="Outline">Outline</SelectItem>
                                                    <SelectItem value="Ghost">Ghost</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Button Color</Label>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={btn2Color} onChange={(e) => setBtn2Color(e.target.value)} className="h-8 w-8 cursor-pointer rounded border p-0.5" />
                                                <Input value={btn2Color} onChange={(e) => setBtn2Color(e.target.value)} className="h-8 font-mono text-xs uppercase" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Button Layout */}
                    <div className="space-y-1.5 max-w-md pt-2">
                        <Label className="text-xs font-semibold text-muted-foreground">Button Alignment Layout</Label>
                        <Select value={buttonLayout} onValueChange={setButtonLayout}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Left Aligned</SelectItem>
                                <SelectItem value="center">Center Aligned</SelectItem>
                                <SelectItem value="right">Right Aligned</SelectItem>
                                <SelectItem value="space-between">Space Between</SelectItem>
                                <SelectItem value="stack">Stack Vertical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Background Overlay */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Background Overlay</CardTitle>
                    <CardDescription>Dark contrast overlay settings for hero background image.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                        <div>
                            <h4 className="font-semibold text-sm">Enable Dark Overlay</h4>
                            <p className="text-xs text-muted-foreground">Improve text contrast against background image.</p>
                        </div>
                        <Switch checked={overlayEnabled} onCheckedChange={setOverlayEnabled} />
                    </div>

                    {overlayEnabled && (
                        <div className="grid gap-4 md:grid-cols-2 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Overlay Color</Label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={overlayColor} onChange={(e) => setOverlayColor(e.target.value)} className="h-9 w-9 cursor-pointer rounded border p-0.5" />
                                    <Input value={overlayColor} onChange={(e) => setOverlayColor(e.target.value)} className="h-9 font-mono text-xs uppercase" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-muted-foreground">Overlay Opacity (%)</Label>
                                    <span className="text-xs font-bold text-primary">{overlayOpacity}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={overlayOpacity}
                                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
