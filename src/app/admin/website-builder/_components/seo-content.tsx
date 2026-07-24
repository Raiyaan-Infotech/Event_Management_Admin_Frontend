'use client';

import { useState } from 'react';
import { Save, Sparkles, FileText, Settings2, Upload, Crop, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BuilderCountedInput, BuilderCountedTextarea } from './builder-field';
import { MediaCropDialog } from '@/components/common/media-crop-dialog';

export function SeoContent() {
    const [metaTitle, setMetaTitle] = useState('Eventify - Best Event Management & Planning Services');
    const [metaDescription, setMetaDescription] = useState('Eventify offers top-notch event management and planning services for weddings, corporate events, birthdays, and more.');
    const [keywords, setKeywords] = useState('event management, event planning, wedding events, corporate events, birthday parties');
    const [ogImageUrl, setOgImageUrl] = useState('');
    const [cropOpen, setCropOpen] = useState(false);
    const [cropImageRaw, setCropImageRaw] = useState('');
    const [cropFileName, setCropFileName] = useState('og-image.jpg');
    const [cropMimeType, setCropMimeType] = useState('image/jpeg');

    const [robotsMeta, setRobotsMeta] = useState('index-follow');
    const [canonicalUrl, setCanonicalUrl] = useState('https://www.eventify.com');
    const [author, setAuthor] = useState('Eventify Team');
    const [language, setLanguage] = useState('en');
    const [siteName, setSiteName] = useState('Eventify');
    const [sitemapEnabled, setSitemapEnabled] = useState(true);
    const [structuredData, setStructuredData] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const TITLE_MAX = 60;
    const DESC_MAX = 160;
    const CANONICAL_MAX = 200;
    const AUTHOR_MAX = 80;
    const SITENAME_MAX = 60;

    const handleFileSelect = (file: File) => {
        setCropFileName(file.name);
        setCropMimeType(file.type || 'image/jpeg');
        const reader = new FileReader();
        reader.onload = (e) => {
            setCropImageRaw(e.target?.result as string);
            setCropOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropped = (_file: File, dataUrl: string) => {
        setOgImageUrl(dataUrl);
        setCropOpen(false);
        toast.success('OG Image cropped and updated successfully.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('SEO Settings saved successfully!');
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">SEO Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage metadata, OpenGraph images, robots indexing, canonical URLs, and structured data.</p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save SEO Settings'}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Section 1: Metadata Information */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                            <CardTitle className="text-lg">Metadata Information</CardTitle>
                            <CardDescription>Optimize how your website appears in search engine results.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Meta Title */}
                        <BuilderCountedInput
                            label="Meta Title"
                            value={metaTitle}
                            onChange={setMetaTitle}
                            maxLength={TITLE_MAX}
                        />

                        {/* Meta Description */}
                        <BuilderCountedTextarea
                            label="Meta Description"
                            value={metaDescription}
                            onChange={setMetaDescription}
                            maxLength={DESC_MAX}
                            rows={3}
                        />

                        {/* Keywords */}
                        <div className="space-y-1.5">
                            <Label htmlFor="keywords" className="text-xs font-semibold text-muted-foreground">Keywords</Label>
                            <Input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="event management, wedding planning, corporate events" className="h-9 text-sm" />
                            <p className="text-[10px] text-muted-foreground">Add relevant keywords separated by commas.</p>
                        </div>

                        {/* OG Image Upload & Image Cropper */}
                        <div className="space-y-2 pt-1">
                            <Label className="text-xs font-semibold text-muted-foreground">OG Image (Social Preview)</Label>
                            {ogImageUrl ? (
                                <div className="relative rounded-lg overflow-hidden border bg-card p-2 flex items-center gap-4">
                                    <img src={ogImageUrl} alt="OG Preview" className="h-20 w-36 object-cover rounded border" />
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-semibold text-foreground">OG Image Selected</p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setCropImageRaw(ogImageUrl);
                                                    setCropOpen(true);
                                                }}
                                                className="h-7 text-xs gap-1"
                                            >
                                                <Crop className="h-3.5 w-3.5" /> Re-crop Image
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setOgImageUrl('')}
                                                className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative flex items-center justify-between gap-4 border border-dashed rounded-lg p-4 bg-muted/20 hover:bg-muted/30 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileSelect(file);
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground border">
                                        1200x630
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-foreground">Upload & Crop OG Image</p>
                                        <p className="text-[10px] text-muted-foreground">Click to upload social media preview image.</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="gap-2 pointer-events-none text-xs">
                                        <Upload className="h-4 w-4" /> Upload
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Additional Settings */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                        <Settings2 className="h-4 w-4 text-primary" />
                        <div>
                            <CardTitle className="text-lg">Additional Settings</CardTitle>
                            <CardDescription>Configure indexing, authorship, language, and technical SEO options.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Robots Meta */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Robots Meta Tag</Label>
                            <Select value={robotsMeta} onValueChange={setRobotsMeta}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="index-follow">Index, Follow</SelectItem>
                                    <SelectItem value="noindex-nofollow">NoIndex, NoFollow</SelectItem>
                                    <SelectItem value="index-nofollow">Index, NoFollow</SelectItem>
                                    <SelectItem value="noindex-follow">NoIndex, Follow</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Canonical URL */}
                        <BuilderCountedInput
                            label="Canonical URL"
                            value={canonicalUrl}
                            onChange={setCanonicalUrl}
                            maxLength={CANONICAL_MAX}
                        />

                        {/* Author */}
                        <BuilderCountedInput
                            label="Author"
                            value={author}
                            onChange={setAuthor}
                            maxLength={AUTHOR_MAX}
                        />

                        {/* Language & Site Name */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Language</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English (en)</SelectItem>
                                        <SelectItem value="es">Spanish (es)</SelectItem>
                                        <SelectItem value="fr">French (fr)</SelectItem>
                                        <SelectItem value="de">German (de)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <BuilderCountedInput
                                label="Site Name"
                                value={siteName}
                                onChange={setSiteName}
                                maxLength={SITENAME_MAX}
                            />
                        </div>

                        {/* Sitemap & Structured Data Toggles */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                                <div>
                                    <h4 className="font-semibold text-xs text-foreground">Enable Sitemap</h4>
                                    <p className="text-[10px] text-muted-foreground">Auto-generate XML sitemap for search engines.</p>
                                </div>
                                <Switch checked={sitemapEnabled} onCheckedChange={setSitemapEnabled} />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                                <div>
                                    <h4 className="font-semibold text-xs text-foreground">Structured Data (JSON-LD)</h4>
                                    <p className="text-[10px] text-muted-foreground">Inject rich snippet schema markup into page head.</p>
                                </div>
                                <Switch checked={structuredData} onCheckedChange={setStructuredData} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Media Crop Dialog */}
            <MediaCropDialog
                open={cropOpen}
                imageUrl={cropImageRaw}
                fileName={cropFileName}
                mimeType={cropMimeType}
                onClose={() => setCropOpen(false)}
                onCropped={handleCropped}
            />
        </div>
    );
}
