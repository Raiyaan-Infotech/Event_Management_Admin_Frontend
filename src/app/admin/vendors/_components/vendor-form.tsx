'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useCreateVendor, useUpdateVendor, Vendor } from '@/hooks/use-vendors';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useThemes } from '@/hooks/use-themes';
import { isApprovalRequired, apiClient } from '@/lib/api-client';
import { CommonForm, CommonFormSection } from '@/components/common/common-form';
import { Building2, User, Landmark, Share2 } from 'lucide-react';
import { useCountries, useStates, useCities, useLocalities } from '@/hooks/use-locations';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/common/searchable-select';
import dynamic from 'next/dynamic';
import { resolveMediaUrl } from '@/lib/utils';
import { VendorSocialLinksManager, PendingSocialLink } from './vendor-social-links-manager';

const MapPicker = dynamic(
    () => import('@/components/common/map-picker').then(m => m.MapPicker),
    { ssr: false }
);

// ─── Schemas ─────────────────────────────────────────────────────────────────

const baseSchema = z.object({
    company_name: z.string().trim().min(1, 'Company name is required'),
    company_logo: z.string().optional(),
    country_id: z.number().optional(),
    state_id: z.number().optional(),
    city_id: z.number().optional(),
    pincode_id: z.number().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    company_address: z.string().trim().optional(),
    about_us: z.string().trim().optional(),
    company_information: z.string().trim().optional(),
    short_description: z.string().trim().optional(),
    reg_no: z.string().trim().optional(),
    gst_no: z.string().trim().optional(),
    company_contact: z.string().trim().optional(),
    landline: z.string().trim().optional(),
    company_email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
    name: z.string().trim().min(1, 'Vendor name is required'),
    address: z.string().trim().optional(),
    contact: z.string().trim().optional(),
    email: z.string().trim().email('Invalid email'),
    membership: z.string().optional().default('basic'),
    theme_id: z.number().optional().nullable(),
    bank_name: z.string().trim().optional(),
    acc_no: z.string().trim().optional(),
    ifsc_code: z.string().trim().optional(),
    acc_type: z.enum(['savings', 'current', 'overdraft']).optional(),
    branch: z.string().trim().optional(),
});

const createSchema = baseSchema.extend({
    membership: z.string().trim().min(1, 'Subscription plan is required'),
    password: z.string().trim().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(1, 'Please confirm password'),
})
.superRefine((d, ctx) => {
    if (d.membership && !d.theme_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Theme is required', path: ['theme_id'] });
    }
})
.refine(d => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] });

const editSchema = baseSchema.extend({
    password: z.string().trim().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
}).refine(d => !d.password || d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] });

// ─── Component ───────────────────────────────────────────────────────────────

interface Props { vendor?: Vendor; }

const normalizePlanName = (value?: string | null) => (value || '').trim().toLowerCase();

export function VendorForm({ vendor }: Props) {
    const router = useRouter();
    const isEdit = !!vendor;
    const create = useCreateVendor();
    const update = useUpdateVendor();

    const [selCountryId,   setSelCountryId]   = useState<number | undefined>(vendor?.country_id ?? undefined);
    const [selStateId,     setSelStateId]     = useState<number | undefined>(vendor?.state_id ?? undefined);
    const [selDistrictId,  setSelDistrictId]  = useState<number | undefined>(vendor?.city_id ?? undefined);
    const [selCountryName,  setSelCountryName]  = useState('');
    const [selStateName,    setSelStateName]    = useState('');
    const [selDistrictName, setSelDistrictName] = useState('');
    const [selCityName,     setSelCityName]     = useState('');
    const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(
        vendor?.latitude != null && vendor?.longitude != null
            ? { lat: vendor.latitude, lng: vendor.longitude }
            : null
    );

    // Pending social links collected in create mode
    const pendingSocialLinks = useRef<PendingSocialLink[]>([]);

    // Plan + theme cascading state
    const [selectedPlanName, setSelectedPlanName] = useState<string>(
        ((vendor as any)?.membership || '').trim()
    );

    const { data: countries   = [] } = useCountries();
    const { data: states      = [] } = useStates(selCountryId || 0);
    const { data: districts   = [] } = useCities(selStateId || 0);
    const { data: cityOptions = [] } = useLocalities(selDistrictId || 0);

    const { data: plansRes } = useSubscriptions({ page: 1, limit: 100, is_active: 1 });
    const plans = useMemo(() => (plansRes?.data ?? []).filter((p: any) => !p.is_custom), [plansRes]);
    const planOptions = useMemo(
        () => plans.map((p: any) => ({
            value: p.name,
            label: `${p.name} - Rs ${p.price}`,
            plan: p,
        })),
        [plans]
    );

    const selectedPlan = useMemo(
        () => planOptions.find((option) => normalizePlanName(option.value) === normalizePlanName(selectedPlanName))?.plan,
        [planOptions, selectedPlanName]
    );
    const { data: themesRes } = useThemes({ plan_id: selectedPlan?.id, limit: 100 });
    const themes = useMemo(() => themesRes?.data ?? [], [themesRes]);

    const mapFlyQuery = [selCityName, selDistrictName, selStateName, selCountryName].filter(Boolean).join(', ');

    // ─── Sections ──────────────────────────────────────────────────────────────

    const sections: CommonFormSection[] = [
        {
            title: 'Company Information',
            icon: Building2,
            fields: [
                {
                    name: 'company_logo', label: 'Company Logo', type: 'image', colSpan: 2,
                    imageTitle: 'Company Logo', imageDescription: 'Upload company logo (recommended: 300×100px)',
                    targetWidth: 300, targetHeight: 100, imageFolder: 'vendors', showMediaPicker: false,
                },
                { name: 'company_name', label: 'Company Name', type: 'text', placeholder: 'Enter your company name', required: true },
                { name: 'reg_no', label: 'Registration No.', type: 'text', placeholder: 'Enter your registration number' },
                { name: 'gst_no', label: 'GST No.', type: 'text', placeholder: 'Enter your GST number' },
                { name: 'company_contact', label: 'Company Contact', type: 'text', placeholder: 'Enter your company contact' },
                { name: 'landline', label: 'Landline', type: 'text', placeholder: 'Enter your landline number' },
                { name: 'company_email', label: 'Company Email', type: 'email', placeholder: 'Enter your company email' },
                { name: 'company_address', label: 'Company Address', type: 'textarea', placeholder: 'Enter your company address', rows: 2, colSpan: 2 },
                { name: 'short_description', label: 'Short Description', type: 'textarea', placeholder: 'Enter a short description of the company...', rows: 2, colSpan: 2 },
                { name: 'company_information', label: 'Company Information', type: 'textarea', placeholder: 'Enter detailed company information...', rows: 4, colSpan: 2 },
                {
                    name: 'country_id', label: 'Country', type: 'custom',
                    render: ({ watch, setValue }) => (
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <SearchableSelect
                                options={countries.map(c => ({ value: c.id.toString(), label: c.name }))}
                                value={watch('country_id')?.toString() || ''}
                                placeholder="Select country"
                                searchPlaceholder="Search country..."
                                onValueChange={(v) => {
                                    const id = parseInt(v);
                                    const name = countries.find(c => c.id === id)?.name || '';
                                    setValue('country_id', id);
                                    setValue('state_id', undefined); setValue('city_id', undefined); setValue('pincode_id', undefined);
                                    setSelCountryId(id); setSelCountryName(name);
                                    setSelStateId(undefined); setSelStateName('');
                                    setSelDistrictId(undefined); setSelDistrictName(''); setSelCityName('');
                                }}
                            />
                        </div>
                    ),
                },
                {
                    name: 'state_id', label: 'State', type: 'custom',
                    render: ({ watch, setValue }) => (
                        <div className="space-y-2">
                            <Label>State</Label>
                            <SearchableSelect
                                options={states.map(s => ({ value: s.id.toString(), label: s.name }))}
                                value={watch('state_id')?.toString() || ''}
                                placeholder="Select state"
                                searchPlaceholder="Search state..."
                                disabled={!selCountryId || states.length === 0}
                                onValueChange={(v) => {
                                    const id = parseInt(v);
                                    const name = states.find(s => s.id === id)?.name || '';
                                    setValue('state_id', id); setValue('city_id', undefined); setValue('pincode_id', undefined);
                                    setSelStateId(id); setSelStateName(name);
                                    setSelDistrictId(undefined); setSelDistrictName(''); setSelCityName('');
                                }}
                            />
                        </div>
                    ),
                },
                {
                    name: 'city_id', label: 'District', type: 'custom',
                    render: ({ watch, setValue }) => (
                        <div className="space-y-2">
                            <Label>District</Label>
                            <SearchableSelect
                                options={districts.map(d => ({ value: d.id.toString(), label: d.name }))}
                                value={watch('city_id')?.toString() || ''}
                                placeholder="Select district"
                                searchPlaceholder="Search district..."
                                disabled={!selStateId || districts.length === 0}
                                onValueChange={(v) => {
                                    const id = parseInt(v);
                                    const name = districts.find(d => d.id === id)?.name || '';
                                    setValue('city_id', id); setValue('pincode_id', undefined);
                                    setSelDistrictId(id); setSelDistrictName(name); setSelCityName('');
                                }}
                            />
                        </div>
                    ),
                },
                {
                    name: 'pincode_id', label: 'City', type: 'custom',
                    render: ({ watch, setValue }) => (
                        <div className="space-y-2">
                            <Label>City</Label>
                            <SearchableSelect
                                options={cityOptions.map(c => ({ value: c.id.toString(), label: c.name }))}
                                value={watch('pincode_id')?.toString() || ''}
                                placeholder="Select city"
                                searchPlaceholder="Search city..."
                                disabled={!selDistrictId || cityOptions.length === 0}
                                onValueChange={(v) => {
                                    const id = parseInt(v);
                                    const name = cityOptions.find(c => c.id === id)?.name || '';
                                    setValue('pincode_id', id); setSelCityName(name);
                                }}
                            />
                        </div>
                    ),
                },
                {
                    name: 'map_location', label: 'Office Location on Map', type: 'custom', colSpan: 2,
                    render: ({ setValue, watch }) => (
                        <MapPicker
                            label="Office Location on Map"
                            value={mapCoords}
                            flyToQuery={mapFlyQuery || undefined}
                            logo={watch('company_logo') ? resolveMediaUrl(watch('company_logo')!) : undefined}
                            companyName={watch('company_name') || undefined}
                            city={selCityName || selDistrictName || selStateName || undefined}
                            onChange={(coords) => {
                                setMapCoords(coords);
                                setValue('latitude', coords?.lat ?? null);
                                setValue('longitude', coords?.lng ?? null);
                            }}
                        />
                    ),
                },
            ],
        },
        {
            title: 'Vendor Information',
            icon: User,
            fields: [
                {
                    name: 'profile', label: 'Profile Photo', type: 'image', colSpan: 2,
                    imageTitle: 'Profile Photo', imageDescription: 'Upload vendor profile photo (square)',
                    targetWidth: 200, targetHeight: 200, rounded: true, imageFolder: 'vendors', showMediaPicker: false,
                },
                { name: 'name', label: 'Vendor Name', type: 'text', placeholder: 'Enter your vendor name', required: true },
                { name: 'contact', label: 'Contact', type: 'text', placeholder: 'Enter your contact number' },
                { name: 'email', label: 'Login Email', type: 'email', placeholder: 'Enter your login email', required: !isEdit, disabled: isEdit },
                // Subscription Plan
                {
                    name: 'membership', label: 'Subscription Plan', type: 'custom', required: true,
                    render: ({ watch, setValue, errors }) => (
                        <div className="space-y-2">
                            <Label>Subscription Plan <span className="text-destructive">*</span></Label>
                            <SearchableSelect
                                options={planOptions}
                                value={watch('membership') || ''}
                                placeholder="Select plan..."
                                searchPlaceholder="Search plan..."
                                className={errors?.membership ? 'border-destructive' : ''}
                                onValueChange={(v) => {
                                    setValue('membership', v);
                                    setSelectedPlanName(v);
                                    setValue('theme_id', null);
                                }}
                            />
                        </div>
                    ),
                },
                // Cascading Theme dropdown
                {
                    name: 'theme_id', label: 'Theme', type: 'custom', required: true,
                    render: ({ watch, setValue, errors }) => (
                        <div className="space-y-2">
                            <Label>
                                Theme {selectedPlan && <span className="text-destructive">*</span>}
                            </Label>
                            {selectedPlan ? (
                                <SearchableSelect
                                    options={themes.map((t: any) => ({ value: t.id.toString(), label: t.name }))}
                                    value={watch('theme_id')?.toString() || ''}
                                    placeholder="Select theme for this plan..."
                                    searchPlaceholder="Search theme..."
                                    className={errors?.theme_id ? 'border-destructive' : ''}
                                    onValueChange={(v) => setValue('theme_id', parseInt(v))}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground h-9 flex items-center px-3 border rounded-md bg-muted/30">Select a plan first</p>
                            )}
                        </div>
                    ),
                },
                { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter your address', rows: 2, colSpan: 2 },
                { name: 'about_us', label: 'About Us', type: 'textarea', placeholder: 'Write a brief description about the vendor...', rows: 4, colSpan: 2 },
                {
                    name: 'password', label: isEdit ? 'Password (leave blank to keep current)' : 'Password',
                    type: 'password', placeholder: '••••••••', required: !isEdit,
                },
                { name: 'confirm_password', label: 'Confirm Password', type: 'password', placeholder: '••••••••', required: !isEdit },
            ],
        },
        {
            title: 'Bank Information',
            icon: Landmark,
            fields: [
                {
                    name: 'bank_logo', label: 'Bank Logo', type: 'image', colSpan: 2,
                    imageTitle: 'Bank Logo', imageDescription: 'Upload bank logo image',
                    targetWidth: 300, targetHeight: 100, imageFolder: 'vendors', showMediaPicker: false,
                },
                { name: 'bank_name', label: 'Bank Name', type: 'text', placeholder: 'Enter your bank name' },
                { name: 'acc_no', label: 'Account Number', type: 'text', placeholder: 'Enter your account number' },
                { name: 'ifsc_code', label: 'IFSC Code', type: 'text', placeholder: 'Enter your IFSC code' },
                {
                    name: 'acc_type', label: 'Account Type', type: 'select',
                    options: [
                        { value: 'savings', label: 'Savings' },
                        { value: 'current', label: 'Current' },
                        { value: 'overdraft', label: 'Overdraft' },
                    ],
                },
                { name: 'branch', label: 'Branch', type: 'text', placeholder: 'Enter your branch name' },
            ],
        },
        {
            title: 'Social Links',
            icon: Share2,
            fields: [
                {
                    name: 'social_links_manager', label: '', type: 'custom' as const, colSpan: 2 as const,
                    render: () => <VendorSocialLinksManager
                        vendorId={isEdit && vendor ? vendor.id : null}
                        onLocalChange={links => { pendingSocialLinks.current = links; }}
                    />,
                },
            ],
        },
    ];

    const defaultValues = vendor ? {
        company_name: vendor.company_name,
        company_logo: vendor.company_logo || '',
        country_id: vendor.country_id ?? undefined,
        state_id: vendor.state_id ?? undefined,
        city_id: vendor.city_id ?? undefined,
        pincode_id: vendor.pincode_id ?? undefined,
        latitude: vendor.latitude ?? null,
        longitude: vendor.longitude ?? null,
        reg_no: vendor.reg_no || '',
        gst_no: vendor.gst_no || '',
        company_address: vendor.company_address || '',
        company_contact: vendor.company_contact || '',
        landline: vendor.landline || '',
        company_email: vendor.company_email || '',
        name: vendor.name,
        address: vendor.address || '',
        contact: vendor.contact || '',
        email: vendor.email,
        membership: ((vendor as any).membership || '').trim(),
        theme_id: (vendor as any).theme_id ?? null,
        about_us: vendor.about_us || '',
        company_information: vendor.company_information || '',
        short_description: vendor.short_description || '',
        profile: vendor.profile || '',
        bank_logo: vendor.bank_logo || '',
        password: '',
        confirm_password: '',
        bank_name: vendor.bank_name || '',
        acc_no: vendor.acc_no || '',
        ifsc_code: vendor.ifsc_code || '',
        acc_type: vendor.acc_type || undefined,
        branch: vendor.branch || '',
    } : { membership: '' };

    const handleSubmit = (data: any) => {
        const { confirm_password, map_location, social_links_manager, ...payload } = data;
        if (!payload.password) delete payload.password;
        payload.latitude  = mapCoords?.lat ?? null;
        payload.longitude = mapCoords?.lng ?? null;

        const onError = (e: any) => { if (isApprovalRequired(e)) router.push('/admin/vendors'); };
        if (isEdit && vendor) {
            update.mutate(
                { id: vendor.id, data: payload },
                {
                    onSuccess: () => router.push('/admin/vendors'),
                    onError,
                }
            );
        } else {
            // Create: save vendor → batch-POST social links → go to edit page
            create.mutate(payload, {
                onSuccess: async (res: any) => {
                    const newId = res?.data?.data?.id ?? res?.data?.id;
                    // batch create pending social links
                    if (newId && pendingSocialLinks.current.length > 0) {
                        for (const link of pendingSocialLinks.current) {
                            try {
                                await apiClient.post(`/vendors/${newId}/social-links`, link);
                            } catch { /* non-fatal */ }
                        }
                    }
                    router.push(newId ? `/admin/vendors/${newId}/edit` : '/admin/vendors');
                },
                onError,
            });
        }
    };

    return (
        <CommonForm
            schema={isEdit ? editSchema : createSchema}
            sections={sections}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isPending={create.isPending || update.isPending}
            isEdit={isEdit}
            title={isEdit ? 'Edit Vendor' : 'Add New Vendor'}
            description={isEdit ? 'Update vendor details' : 'Fill in the details to create a new vendor account'}
            backPath="/admin/vendors"
        />
    );
}
