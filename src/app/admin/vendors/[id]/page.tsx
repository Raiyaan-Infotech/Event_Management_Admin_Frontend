'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Landmark, Pencil, User } from 'lucide-react';
import { useVendor } from '@/hooks/use-vendors';
import { resolveMediaUrl } from '@/lib/utils';
import { PageLoader } from '@/components/common/page-loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function displayValue(value: unknown) {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
}

function displayDate(value?: string | null) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function DetailItem({ label, value }: { label: string; value: unknown }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
            <p className="break-words text-sm text-foreground">{displayValue(value)}</p>
        </div>
    );
}

export default function VendorViewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const vendorId = Number(id);
    const { data: vendor, isLoading } = useVendor(vendorId);

    if (isLoading) return <PageLoader open />;

    if (!vendor) {
        return (
            <div className="space-y-4">
                <Button type="button" variant="ghost" className="gap-2" onClick={() => router.push('/admin/vendors')}>
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Card>
                    <CardContent className="py-8 text-sm text-muted-foreground">Vendor not found.</CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => router.push('/admin/vendors')}>
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Vendor Details</h1>
                        <p className="text-sm text-muted-foreground">View vendor account, company, and bank information.</p>
                    </div>
                </div>
                <Button type="button" className="gap-2" onClick={() => router.push(`/admin/vendors/${vendor.id}/edit`)}>
                    <Pencil className="h-4 w-4" /> Edit Vendor
                </Button>
            </div>

            <Card>
                <CardContent className="flex flex-wrap items-center gap-4 py-5">
                    <Avatar className="h-16 w-16 border">
                        <AvatarImage src={resolveMediaUrl(vendor.profile || '')} />
                        <AvatarFallback className="bg-primary/10 text-lg text-primary">
                            {vendor.name?.charAt(0) || 'V'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-semibold">{vendor.name}</h2>
                            <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                {vendor.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                                {vendor.membership}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{vendor.email}</p>
                        <p className="text-sm text-muted-foreground">{displayValue(vendor.company_name)}</p>
                    </div>
                    {vendor.company_logo ? (
                        <img
                            src={resolveMediaUrl(vendor.company_logo)}
                            alt={vendor.company_name || 'Company logo'}
                            className="h-12 max-w-32 rounded border bg-muted/30 object-contain"
                        />
                    ) : null}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Building2 className="h-4 w-4 text-primary" /> Company Information
                        </CardTitle>
                        <CardDescription>Registered company details for this vendor.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <DetailItem label="Company Name" value={vendor.company_name} />
                        <DetailItem label="Company Email" value={vendor.company_email} />
                        <DetailItem label="Company Contact" value={vendor.company_contact} />
                        <DetailItem label="Landline" value={vendor.landline} />
                        <DetailItem label="Registration No." value={vendor.reg_no} />
                        <DetailItem label="GST No." value={vendor.gst_no} />
                        <DetailItem label="Theme ID" value={(vendor as any).theme_id} />
                        <DetailItem label="Created" value={displayDate(vendor.created_at)} />
                        <div className="sm:col-span-2">
                            <DetailItem label="Company Address" value={vendor.company_address} />
                        </div>
                        <div className="sm:col-span-2">
                            <DetailItem label="Short Description" value={vendor.short_description} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="h-4 w-4 text-primary" /> Vendor Information
                        </CardTitle>
                        <CardDescription>Login and contact details.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <DetailItem label="Vendor Name" value={vendor.name} />
                        <DetailItem label="Login Email" value={vendor.email} />
                        <DetailItem label="Contact" value={vendor.contact} />
                        <DetailItem label="Alternate Contact" value={vendor.alt_contact} />
                        <DetailItem label="Alternate Email" value={vendor.alt_email} />
                        <DetailItem label="Status" value={vendor.status} />
                        <div className="sm:col-span-2">
                            <DetailItem label="Address" value={vendor.address} />
                        </div>
                        <div className="sm:col-span-2">
                            <DetailItem label="About Us" value={vendor.about_us} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Landmark className="h-4 w-4 text-primary" /> Bank Information
                        </CardTitle>
                        <CardDescription>Saved bank account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <DetailItem label="Bank Name" value={vendor.bank_name} />
                        <DetailItem label="Account Number" value={vendor.acc_no} />
                        <DetailItem label="IFSC Code" value={vendor.ifsc_code} />
                        <DetailItem label="Account Type" value={vendor.acc_type} />
                        <DetailItem label="Branch" value={vendor.branch} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Location</CardTitle>
                        <CardDescription>Saved location identifiers and coordinates.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <DetailItem label="Country ID" value={vendor.country_id} />
                        <DetailItem label="State ID" value={vendor.state_id} />
                        <DetailItem label="District ID" value={vendor.city_id} />
                        <DetailItem label="City ID" value={vendor.pincode_id} />
                        <DetailItem label="Latitude" value={vendor.latitude} />
                        <DetailItem label="Longitude" value={vendor.longitude} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
