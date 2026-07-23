'use client';

import { useState } from 'react';
import { Save, Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContactSettingsPage() {
    const [contactEmail, setContactEmail] = useState('events@domain.com');
    const [contactPhone, setContactPhone] = useState('+1 (888) 234-5678');
    const [contactAddress, setContactAddress] = useState('100 Celebration Way, Suite 400, New York, NY 10001');
    const [latitude, setLatitude] = useState('40.7128');
    const [longitude, setLongitude] = useState('-74.0060');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Contact Us settings and location map coordinates saved!');
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
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Contact Us Settings & Location</h1>
                    <p className="text-sm text-muted-foreground">Configure public contact information, address, and Google Maps latitude/longitude.</p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Contact Settings'}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Public Contact Information & Location Map</CardTitle>
                    <CardDescription>Address details and map pin coordinates displayed on the Contact Us page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Public Support Email</Label>
                            <Input id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Public Phone Number</Label>
                            <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactAddress">Physical Office Address</Label>
                        <Input id="contactAddress" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude Coordinate</Label>
                            <Input id="latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude Coordinate</Label>
                            <Input id="longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
