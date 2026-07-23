'use client';

import { useState } from 'react';
import { Save, Sparkles, FileText, Settings2, Info, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export function SeoContent() {
    const [metaTitle, setMetaTitle] = useState('Eventify - Best Event Management & Planning Services');
    const [metaDescription, setMetaDescription] = useState('Eventify offers top-notch event management and planning services for weddings, corporate events, birthdays, and more.');
    const [keywords, setKeywords] = useState('event management, event planning, wedding events, corporate events, birthday parties');
    const [ogImage, setOgImage] = useState('');
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
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
                            <Sparkles className="h-3 w-3" /> Website Builder
                        </Badge>
                        <Badge variant="secondary" className="text-xs">Super Admin Panel</Badge>
                    </div>
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
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="metaTitle" className="text-xs font-semibold text-muted-foreground">Meta Title</Label>
                                <span className="text-[10px] text-muted-foreground">{metaTitle.length}/{TITLE_MAX}</span>
                            </div>
                            <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={TITLE_MAX} className="h-9 text-sm" />
                        </div>

                        {/* Meta Description */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="metaDescription" className="text-xs font-semibold text-muted-foreground">Meta Description</Label>
                                <span className="text-[10px] text-muted-foreground">{metaDescription.length}/{DESC_MAX}</span>
                            </div>
                            <Textarea id="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={DESC_MAX} rows={3} className="text-sm" />
                        </div>

                        {/* Keywords */}
                        <div className="space-y-1.5">
                            <Label htmlFor="keywords" className="text-xs font-semibold text-muted-foreground">Keywords</Label>
                            <Input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="event management, wedding planning, corporate events" className="h-9 text-sm" />
                            <p className="text-[10px] text-muted-foreground">Add relevant keywords separated by commas.</p>
                        </div>

                        {/* OG Image Upload */}
                        <div className="space-y-2 pt-1">
                            <Label className="text-xs font-semibold text-muted-foreground">OG Image (Social Preview)</Label>
                            <div className="flex items-center gap-4 border border-dashed rounded-lg p-4 bg-card">
                                <div className="flex h-16 w-28 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                                    1200x630
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Upload className="h-4 w-4" /> Upload OG Image
                                </Button>
                            </div>
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
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="canonicalUrl" className="text-xs font-semibold text-muted-foreground">Canonical URL</Label>
                                <span className="text-[10px] text-muted-foreground">{canonicalUrl.length}/{CANONICAL_MAX}</span>
                            </div>
                            <Input id="canonicalUrl" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} maxLength={CANONICAL_MAX} className="h-9 text-sm font-mono" />
                        </div>

                        {/* Author */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="author" className="text-xs font-semibold text-muted-foreground">Author</Label>
                                <span className="text-[10px] text-muted-foreground">{author.length}/{AUTHOR_MAX}</span>
                            </div>
                            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={AUTHOR_MAX} className="h-9 text-sm" />
                        </div>

                        {/* Language */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English (en)</SelectItem>
                                    <SelectItem value="es">Spanish (es)</SelectItem>
                                    <SelectItem value="fr">French (fr)</SelectItem>
                                    <SelectItem value="de">German (de)</SelectItem>
                                    <SelectItem value="ta">Tamil (ta)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Site Name */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="siteName" className="text-xs font-semibold text-muted-foreground">Site Name</Label>
                                <span className="text-[10px] text-muted-foreground">{siteName.length}/{SITENAME_MAX}</span>
                            </div>
                            <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} maxLength={SITENAME_MAX} className="h-9 text-sm" />
                        </div>

                        {/* Sitemap Toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                            <div>
                                <h4 className="font-semibold text-sm">Enable Sitemap</h4>
                                <p className="text-xs text-muted-foreground">Automatically generate and submit sitemap.xml</p>
                            </div>
                            <Switch checked={sitemapEnabled} onCheckedChange={setSitemapEnabled} />
                        </div>

                        {/* Structured Data Toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                            <div>
                                <h4 className="font-semibold text-sm">Structured Data</h4>
                                <p className="text-xs text-muted-foreground">Add JSON-LD schema markup for rich search results</p>
                            </div>
                            <Switch checked={structuredData} onCheckedChange={setStructuredData} />
                        </div>

                        {/* Tip Box */}
                        <div className="flex items-start gap-2 rounded-lg border bg-primary/5 p-3 text-xs">
                            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                            <p className="text-muted-foreground leading-relaxed">
                                <span className="font-bold text-foreground">Tip:</span> Keep your meta title within 60 characters and description within 160 characters for the best search engine visibility.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
