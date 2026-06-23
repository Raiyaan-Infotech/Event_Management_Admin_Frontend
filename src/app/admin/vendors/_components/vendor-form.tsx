'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useCreateVendor, useUpdateVendor, Vendor } from '@/hooks/use-vendors';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { isApprovalRequired } from '@/lib/api-client';
import { CommonForm, CommonFormSection } from '@/components/common/common-form';
import { Building2, User, Landmark } from 'lucide-react';
import { useCountries, useStates, useCities, useLocalities } from '@/hooks/use-locations';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/common/searchable-select';
import dynamic from 'next/dynamic';
import { resolveMediaUrl } from '@/lib/utils';

const MapPicker = dynamic(
    () => import('@/components/common/map-picker').then(m => m.MapPicker),
    { ssr: false }
);

// ─── Schemas ─────────────────────────────────────────────────────────────────

const baseSchema = z.object({
    company_name: z.string().trim().min(1, 'Company name is required'),
    company_logo: z.string().optional(),
    country_id: z.number({ required_error: 'Country is required', invalid_type_error: 'Country is required' }),
    state_id: z.number({ required_error: 'State is required', invalid_type_error: 'State is required' }),
    city_id: z.number({ required_error: 'District is required', invalid_type_error: 'District is required' }),
    pincode_id: z.number({ required_error: 'City is required', invalid_type_error: 'City is required' }),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    company_address: z.string().trim().optional(),
    about_us: z.string().trim().optional(),
    company_information: z.string().trim().optional(),
    short_description: z.string().trim().min(1, 'Short description is required'),
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
    website_enabled: z.boolean().optional().default(false),
    bank_name: z.string().trim().optional(),
    acc_no: z.string().trim().optional(),
    ifsc_code: z.string().trim().optional(),
    acc_type: z.enum(['savings', 'current', 'overdraft']).optional(),
    branch: z.string().trim().optional(),
});

const passwordPolicy = (v: string) => {
    if (/\s/.test(v))             return 'Password must not contain spaces';
    if (v.length < 8)             return 'Password must be at least 8 characters';
    if (v.length > 8)             return 'Password must not exceed 8 characters';
    if (!/[A-Z]/.test(v))        return 'Must include at least 1 uppercase letter';
    if (!/[a-z]/.test(v))        return 'Must include at least 1 lowercase letter';
    if (!/[0-9]/.test(v))        return 'Must include at least 1 number';
    if (!/[^A-Za-z0-9\s]/.test(v)) return 'Must include at least 1 special character';
    return true;
};

const createSchema = baseSchema.extend({
    membership: z.string().trim().min(1, 'Subscription plan is required'),
    password: z.string().min(1, 'Password is required').refine(passwordPolicy, { message: 'Invalid password' }),
    confirm_password: z.string().min(1, 'Please confirm password'),
})
.superRefine((d, ctx) => {
    if (d.password) {
        const result = passwordPolicy(d.password);
        if (typeof result === 'string') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: result, path: ['password'] });
        }
    }
})
.refine(d => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] });

const editSchema = baseSchema.extend({
    password: z.string().optional().or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
})
.superRefine((d, ctx) => {
    if (d.password) {
        const result = passwordPolicy(d.password);
        if (typeof result === 'string') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: result, path: ['password'] });
        }
    }
})
.refine(d => !d.password || d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] });

// ─── Component ───────────────────────────────────────────────────────────────

interface Props { vendor?: Vendor; }

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
    // Subscription plan state
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
                { name: 'website_enabled', label: 'Vendor Website', type: 'switch', colSpan: 2 },
                { name: 'company_address', label: 'Company Address', type: 'textarea', placeholder: 'Enter your company address', rows: 2, colSpan: 2 },
                { name: 'short_description', label: 'Short Description', type: 'textarea', placeholder: 'Enter a short description of the company...', rows: 2, colSpan: 2, required: true },
                { name: 'company_information', label: 'Company Information', type: 'textarea', placeholder: 'Enter detailed company information...', rows: 4, colSpan: 2 },
                {
                    name: 'country_id', label: 'Country', type: 'custom', required: true,
                    render: ({ watch, setValue, errors }) => (
                        <div className="space-y-2">
                            <Label>Country <span className="text-destructive">*</span></Label>
                            <SearchableSelect
                                options={countries.map(c => ({ value: c.id.toString(), label: c.name }))}
                                value={watch('country_id')?.toString() || ''}
                                placeholder="Select country"
                                searchPlaceholder="Search country..."
                                className={errors?.country_id ? 'border-destructive' : ''}
                                onValueChange={(v) => {
                                    const id = parseInt(v);
                                    const name = countries.find(c => c.id === id)?.name || '';
                                    setValue('country_id', id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                    setValue('state_id', undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                    setValue('city_id', undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                    setValue('pincode_id', undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                    setSelCountryId(id); setSelCountryName(name);
                                    setSelStateId(undefined); setSelStateName('');
                                    setSelDistrictId(undefined); setSelDistrictName(''); setSelCityName('');
                                }}
                            />
                        </div>
                    ),
                },
                {
                    name: 'state_id', label: 'State', type: 'custom', required: true,
                    render: ({ watch, setValue, errors }) => (
                        <div className="space-y-2">
                            <Label>State <span className="text-destructive">*</span></Label>
                            <SearchableSelect
                                options={states.map(s => ({ value: s.id.toString(), label: s.name }))}
                                value={watch('state_id')?.toString() || ''}
                                placeholder="Select state"
                                searchPlaceholder="Search state..."
                                disabled={!selCountryId || states.length === 0}
                                className={errors?.state_id ? 'border-destructive' : ''}
                                onValueChange={(v) => {
                                    const id = parseInt(v);
                                    const name = states.find(s => s.id === id)?.name || '';
                                    setValue('state_id', id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                    setValue('city_id', undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                    setValue('pincode_id', undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                    setSelStateId(id); setSelStateName(name);
                                    setSelDistrictId(undefined); setSelDistrictName(''); setSelCityName('');
                                }}
                            />
                        </div>
                    ),
                },
                {
                    name: 'city_id', label: 'District', type: 'custom', required: true,
                    render: ({ watch, setValue, errors }) => (
                        <div className="space-y-2">
                            <Label>District <span className="text-destructive">*</span></Label>
                            <SearchableSelect
                                options={districts.map(d => ({ value: d.id.toString(), label: d.name }))}
                                value={watch('city_id')?.toString() || ''}
                                placeholder="Select district"
                                searchPlaceholder="Search district..."
                                disabled={!selStateId || districts.length === 0}
                                className={errors?.city_id ? 'border-destructive' : ''}
                                onValueChange={(v) => {
                                    const id = parseInt(v);
                                    const name = districts.find(d => d.id === id)?.name || '';
                                    setValue('city_id', id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                    setValue('pincode_id', undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                    setSelDistrictId(id); setSelDistrictName(name); setSelCityName('');
                                }}
                            />
                        </div>
                    ),
                },
                {
                    name: 'pincode_id', label: 'City', type: 'custom', required: true,
                    render: ({ watch, setValue, errors }) => (
                        <div className="space-y-2">
                            <Label>City <span className="text-destructive">*</span></Label>
                            <SearchableSelect
                                options={cityOptions.map(c => ({ value: c.id.toString(), label: c.name }))}
                                value={watch('pincode_id')?.toString() || ''}
                                placeholder="Select city"
                                searchPlaceholder="Search city..."
                                disabled={!selDistrictId || cityOptions.length === 0}
                                className={errors?.pincode_id ? 'border-destructive' : ''}
                                onValueChange={(v) => {
                                    const id = parseInt(v);
                                    const name = cityOptions.find(c => c.id === id)?.name || '';
                                    setValue('pincode_id', id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                    setSelCityName(name);
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
                            <p className="text-xs text-muted-foreground">Select the subscription plan for this vendor.</p>
                            <SearchableSelect
                                options={planOptions}
                                value={watch('membership') || ''}
                                placeholder="Select plan..."
                                searchPlaceholder="Search plan..."
                                className={errors?.membership ? 'border-destructive' : ''}
                                 onValueChange={(v) => {
                                     setValue('membership', v, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                     setSelectedPlanName(v);
                                 }}
                             />
                         </div>
                     ),
                 },
                { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter your address', rows: 2, colSpan: 2 },
                { name: 'about_us', label: 'About Us', type: 'textarea', placeholder: 'Write a brief description about the vendor...', rows: 4, colSpan: 2 },
                {
                    name: 'password', label: isEdit ? 'Password (leave blank to keep current)' : 'Password',
                    type: 'password', placeholder: 'Enter password', required: !isEdit, alwaysShowPasswordHint: true,
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
        website_enabled: Boolean((vendor as any).website_enabled),
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
    } : { membership: '', website_enabled: false };

    const handleSubmit = (data: any) => {
        const { confirm_password, map_location, ...payload } = data;
        if (!payload.password) delete payload.password;
        payload.website_enabled = payload.website_enabled ? 1 : 0;
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
            create.mutate(payload, {
                onSuccess: (res: any) => {
                    const newId = res?.data?.data?.id ?? res?.data?.id;
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
