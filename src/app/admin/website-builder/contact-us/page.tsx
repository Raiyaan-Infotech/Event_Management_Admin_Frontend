'use client';

import { useState } from 'react';
import {
    Save,
    RotateCcw,
    Sparkles,
    Share2,
    Code2,
    Mail,
    Phone,
    MapPin,
    Lock,
    Monitor,
    Smartphone,
    Send,
    Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BuilderCountedInput, BuilderCountedTextarea } from '../_components/builder-field';
import { cn } from '@/lib/utils';

type EditorMode = 'static' | 'dynamic';
type PreviewDevice = 'desktop' | 'mobile';

interface SocialLinkItem {
    id: string;
    num: number;
    name: string;
    url: string;
    show: boolean;
    iconColor: string;
}

export default function ContactUsPage() {
    const [editorMode, setEditorMode] = useState<EditorMode>('static');
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

    // Component Toggles
    const [enableContactDetails, setEnableContactDetails] = useState(true);
    const [enableSocialLinks, setEnableSocialLinks] = useState(true);
    const [enableGoogleMap, setEnableGoogleMap] = useState(true);

    // Contact Information
    const [email, setEmail] = useState('jamal@gmail.com');
    const [mobile, setMobile] = useState('9884699435');
    const [address, setAddress] = useState('company address f...');

    // Social Links List
    const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([
        { id: '1', num: 1, name: 'YouTube', url: 'https://youtube.com/eventinvite', show: true, iconColor: 'bg-rose-500 text-white' },
        { id: '2', num: 2, name: 'Instagram', url: 'https://insta.com', show: true, iconColor: 'bg-pink-500 text-white' },
    ]);

    // Google Map Coordinates
    const [latitude, setLatitude] = useState('17.385044');
    const [longitude, setLongitude] = useState('78.486671');

    const [isSaving, setIsSaving] = useState(false);

    const handleToggleSocial = (id: string, show: boolean) => {
        setSocialLinks((prev) =>
            prev.map((item) => (item.id === id ? { ...item, show } : item))
        );
    };

    const handleReset = () => {
        setEmail('jamal@gmail.com');
        setMobile('9884699435');
        setAddress('company address f...');
        setEditorMode('static');
        toast.info('Contact Us settings reset to defaults.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Contact Us settings saved successfully!');
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Contact Us</h1>
                    <p className="text-sm text-muted-foreground">
                        Create and manage your contact form. Choose a method to build your form.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 h-9 text-xs">
                        <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs">
                        <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Main Layout: Left Form (7 cols) + Right Preview (5 cols) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left Side Form (7 Cols) */}
                <div className="xl:col-span-7 space-y-4">
                    {/* Section 1: Choose Your Editor */}
                    <Card className="shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold">Choose Your Editor</CardTitle>
                            <CardDescription className="text-xs">Select how you want to build your contact section.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditorMode('static')}
                                    className={cn(
                                        'flex items-center justify-center gap-2.5 rounded-xl border p-3.5 text-xs font-bold transition-all',
                                        editorMode === 'static'
                                            ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-xs ring-1 ring-blue-600/30'
                                            : 'border-slate-200 bg-background text-slate-600 hover:bg-slate-50'
                                    )}
                                >
                                    <Share2 className="h-4 w-4" /> Static (Information)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEditorMode('dynamic')}
                                    className={cn(
                                        'flex items-center justify-center gap-2.5 rounded-xl border p-3.5 text-xs font-bold transition-all',
                                        editorMode === 'dynamic'
                                            ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-xs ring-1 ring-blue-600/30'
                                            : 'border-slate-200 bg-background text-slate-600 hover:bg-slate-50'
                                    )}
                                >
                                    <Code2 className="h-4 w-4" /> Dynamic (Form)
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Enable / Disable Components */}
                    <Card className="shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold">Enable / Disable Components</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Component 1: Contact Details */}
                            <div className="flex items-center justify-between rounded-lg border p-3 bg-slate-50/40">
                                <div>
                                    <h4 className="font-bold text-xs text-foreground">Contact Details</h4>
                                    <p className="text-[11px] text-muted-foreground">Contact information is required and always visible.</p>
                                </div>
                                <Switch checked={enableContactDetails} onCheckedChange={setEnableContactDetails} />
                            </div>

                            {/* Component 2: Social Links */}
                            <div className="flex items-center justify-between rounded-lg border p-3 bg-slate-50/40">
                                <div>
                                    <h4 className="font-bold text-xs text-foreground">Social Links</h4>
                                    <p className="text-[11px] text-muted-foreground">Show selected social links.</p>
                                </div>
                                <Switch checked={enableSocialLinks} onCheckedChange={setEnableSocialLinks} />
                            </div>

                            {/* Component 3: Google Map */}
                            <div className="flex items-center justify-between rounded-lg border p-3 bg-slate-50/40">
                                <div>
                                    <h4 className="font-bold text-xs text-foreground">Google Map</h4>
                                    <p className="text-[11px] text-muted-foreground">Show map from vendor location.</p>
                                </div>
                                <Switch checked={enableGoogleMap} onCheckedChange={setEnableGoogleMap} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Contact Information */}
                    {enableContactDetails && (
                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <BuilderCountedInput
                                    label="Email"
                                    value={email}
                                    onChange={setEmail}
                                    maxLength={200}
                                />

                                <BuilderCountedInput
                                    label="Mobile"
                                    value={mobile}
                                    onChange={setMobile}
                                    maxLength={20}
                                />

                                <BuilderCountedTextarea
                                    label="Address"
                                    value={address}
                                    onChange={setAddress}
                                    maxLength={120}
                                    rows={2}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Section 4: Social Links Table */}
                    {enableSocialLinks && (
                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold">Social Links</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="w-[50px] font-bold text-[11px]">#</TableHead>
                                            <TableHead className="font-bold text-[11px]">Social Network</TableHead>
                                            <TableHead className="font-bold text-[11px]">Link</TableHead>
                                            <TableHead className="w-[80px] font-bold text-[11px] text-right">Show</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {socialLinks.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-bold text-xs text-slate-500">{item.num}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold", item.iconColor)}>
                                                            {item.name.charAt(0)}
                                                        </div>
                                                        <span className="font-semibold text-xs text-slate-800">New Link</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        value={item.url}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setSocialLinks((prev) =>
                                                                prev.map((s) => (s.id === item.id ? { ...s, url: val } : s))
                                                            );
                                                        }}
                                                        className="h-8 text-xs font-mono"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Switch
                                                        checked={item.show}
                                                        onCheckedChange={(val) => handleToggleSocial(item.id, val)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {/* Section 5: Google Map Coordinates */}
                    {enableGoogleMap && (
                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                                    Google Map
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <BuilderCountedInput
                                        label="Latitude"
                                        value={latitude}
                                        onChange={setLatitude}
                                        maxLength={30}
                                        lockInput
                                    />

                                    <BuilderCountedInput
                                        label="Longitude"
                                        value={longitude}
                                        onChange={setLongitude}
                                        maxLength={30}
                                        lockInput
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Side Live Preview (5 Cols) */}
                <div className="xl:col-span-5 space-y-4">
                    <Card className="sticky top-6 shadow-sm border-slate-200">
                        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <CardTitle className="text-sm font-bold">
                                        Preview ({editorMode === 'static' ? 'Static' : 'Dynamic'})
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px]">This is how your contact information will appear on the website.</CardDescription>
                            </div>

                            <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/40">
                                <button
                                    type="button"
                                    onClick={() => setPreviewDevice('desktop')}
                                    className={cn(
                                        'flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold',
                                        previewDevice === 'desktop' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                                    )}
                                >
                                    <Monitor className="h-3.5 w-3.5" /> Desktop
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewDevice('mobile')}
                                    className={cn(
                                        'flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold',
                                        previewDevice === 'mobile' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                                    )}
                                >
                                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                                </button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 bg-slate-50/50">
                            <div className={cn(
                                'mx-auto rounded-xl border bg-background p-6 shadow-sm space-y-6 transition-all duration-300',
                                previewDevice === 'mobile' ? 'max-w-[320px]' : 'w-full'
                            )}>
                                {/* Preview Heading */}
                                <div className="text-center space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">GET IN TOUCH</span>
                                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">CONTACT US</h3>
                                    <p className="text-xs text-slate-500">
                                        {editorMode === 'static'
                                            ? 'We are here to help and answer any question you might have.'
                                            : "We'd love to hear from you! Send us a message and we'll respond as soon as possible."}
                                    </p>
                                </div>

                                {/* Mode 1: Static Information Preview */}
                                {editorMode === 'static' ? (
                                    <div className="space-y-6">
                                        {/* 3 Info Cards Grid */}
                                        {enableContactDetails && (
                                            <div className={cn('gap-3', previewDevice === 'mobile' ? 'flex flex-col' : 'grid grid-cols-3')}>
                                                {/* Email Card */}
                                                <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border bg-slate-50/60 text-center space-y-2">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                        <Mail className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black tracking-wider text-slate-700">EMAIL</span>
                                                    <span className="text-[11px] font-medium text-slate-600 truncate max-w-full">{email}</span>
                                                </div>

                                                {/* Mobile Card */}
                                                <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border bg-slate-50/60 text-center space-y-2">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                        <Phone className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black tracking-wider text-slate-700">MOBILE</span>
                                                    <span className="text-[11px] font-medium text-slate-600 truncate max-w-full">{mobile}</span>
                                                </div>

                                                {/* Address Card */}
                                                <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border bg-slate-50/60 text-center space-y-2">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black tracking-wider text-slate-700">ADDRESS</span>
                                                    <span className="text-[11px] font-medium text-slate-600 truncate max-w-full">{address}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Social Links */}
                                        {enableSocialLinks && (
                                            <div className="text-center space-y-2 pt-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">FOLLOW US</span>
                                                <div className="flex items-center justify-center gap-2">
                                                    {socialLinks.filter(s => s.show).map((item) => (
                                                        <div key={item.id} className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-xs cursor-pointer", item.iconColor)}>
                                                            {item.name.charAt(0)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Google Map Box */}
                                        {enableGoogleMap && (
                                            <div className="relative h-44 w-full rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                                                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-white shadow-xs text-xs font-bold text-slate-700 cursor-pointer">+</div>
                                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-white shadow-xs text-xs font-bold text-slate-700 cursor-pointer">-</div>
                                                </div>

                                                <div className="absolute top-2 left-10 rounded bg-white px-2 py-0.5 text-[10px] font-bold text-blue-600 shadow-xs border">
                                                    Leaflet Map
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <div className="h-4 w-4 rounded-full bg-rose-500 ring-4 ring-rose-200 animate-pulse" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Mode 2: Dynamic Form Preview */
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-slate-700">Name *</Label>
                                                <Input readOnly placeholder="Enter your name" className="h-8 text-xs bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-slate-700">Email *</Label>
                                                <Input readOnly placeholder="Enter your email" className="h-8 text-xs bg-slate-50" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold text-slate-700">Category *</Label>
                                            <Select disabled>
                                                <SelectTrigger className="h-8 text-xs bg-slate-50"><SelectValue placeholder="Select a Category" /></SelectTrigger>
                                            </Select>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold text-slate-700">Message *</Label>
                                            <textarea readOnly rows={3} placeholder="Type your message here..." className="w-full rounded-md border border-input bg-slate-50 p-2 text-xs outline-none" />
                                        </div>

                                        <div className="flex justify-center pt-1">
                                            <Button size="sm" className="gap-2 bg-blue-600 text-white text-xs px-6">
                                                <Send className="h-3.5 w-3.5" /> Send Message
                                            </Button>
                                        </div>

                                        <p className="text-[9px] text-center text-slate-400">
                                            🔒 Your information is safe with us. We don't share your details with anyone.
                                        </p>

                                        {/* Social Links */}
                                        {enableSocialLinks && (
                                            <div className="text-center space-y-2 pt-2 border-t">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">FOLLOW US</span>
                                                <div className="flex items-center justify-center gap-2">
                                                    {socialLinks.filter(s => s.show).map((item) => (
                                                        <div key={item.id} className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-xs cursor-pointer", item.iconColor)}>
                                                            {item.name.charAt(0)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Map Box */}
                                        {enableGoogleMap && (
                                            <div className="relative h-36 w-full rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                                                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded bg-white shadow-xs text-[10px] font-bold text-slate-700 cursor-pointer">+</div>
                                                    <div className="flex h-5 w-5 items-center justify-center rounded bg-white shadow-xs text-[10px] font-bold text-slate-700 cursor-pointer">-</div>
                                                </div>
                                                <div className="absolute top-2 left-8 rounded bg-white px-1.5 py-0.5 text-[9px] font-bold text-blue-600 shadow-xs border">
                                                    Leaflet Map
                                                </div>
                                                <div className="h-3.5 w-3.5 rounded-full bg-rose-500 ring-4 ring-rose-200 animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
