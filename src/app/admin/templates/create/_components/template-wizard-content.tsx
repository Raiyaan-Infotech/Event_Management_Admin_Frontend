'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    FileText,
    Palette,
    LayoutList,
    ShieldCheck,
    Globe,
    ClipboardCheck,
    Save,
    Upload,
    X,
    Info,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PageLoader } from '@/components/common/page-loader';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { cn } from '@/lib/utils';
import { mediaApi } from '@/hooks/use-media';
import { useTemplateCategories } from '@/hooks/use-template-categories';
import { useFrameStyles } from '@/hooks/use-frame-styles';
import { useDecorations } from '@/hooks/use-decorations';
import { ArtworkPicker } from './artwork-picker';
import { useEventCategories, useEventTypes, useReligions } from '@/hooks/use-menu-management';
import { useSubscriptionPlans } from '@/hooks/use-subscription-plans';
import {
    useEventTemplate,
    useCreateEventTemplate,
    useUpdateEventTemplate,
    defaultComponents,
    defaultPermissions,
    normaliseOrder,
    COMPONENT_KEYS,
    COMPONENT_LABELS,
    PERMISSION_KEYS,
    PERMISSION_LABELS,
    PERMISSION_HINTS,
    TEMPLATE_STYLES,
    LAYOUT_STYLES,
    BACKGROUND_TYPES,
    GRADIENT_TYPES,
    GRADIENT_DIRECTIONS,
    GRADIENT_PRESETS,
    IMAGE_SHAPES,
    type GradientType,
    type GradientDirection,
    type ImageShape,
    DIMENSIONS,
    FONT_OPTIONS,
    BORDER_STYLES,
    DECORATION_OPTIONS,
    type ComponentKey,
    type PermissionKey,
    type BackgroundType,
    type Orientation,
    type PlanAvailability,
    type Audience,
    type EventTemplatePayload,
} from '@/hooks/use-event-templates';
import { TemplatePreview } from '../../_components/template-preview';
import { ComponentOrderList } from './component-order-list';

const STEPS = [
    { title: 'Basic Information', subtitle: 'Set template details', icon: FileText },
    { title: 'Design & Background', subtitle: 'Choose look & feel', icon: Palette },
    { title: 'Content & Components', subtitle: 'Select what to show', icon: LayoutList },
    { title: 'Customization Permissions', subtitle: 'Client edit options', icon: ShieldCheck },
    { title: 'Publishing & Availability', subtitle: 'Publish & make available', icon: Globe },
    { title: 'Review & Save', subtitle: 'Final review & save', icon: ClipboardCheck },
] as const;

interface FormState {
    // step 1
    name: string;
    code: string;
    event_category_id: string;
    event_type_id: string;
    religion_id: string;
    template_category_id: string;
    style: string;
    tags: string[];
    description: string;
    // step 2
    layout_style: string;
    background_type: BackgroundType;
    background_color: string;
    secondary_color: string;
    background_image: string;
    gradient_from: string;
    gradient_to: string;
    gradient_type: GradientType;
    gradient_direction: GradientDirection;
    image_shape: ImageShape;
    corner_radius: number;
    custom_css: string;
    overlay_opacity: number;
    orientation: Orientation;
    dimension: string;
    primary_font: string;
    secondary_font: string;
    border_style: string;
    frame_style_id: number | null;
    decorations: string[];
    decoration_ids: number[];
    // step 3
    components: Record<ComponentKey, number>;
    component_order: ComponentKey[];
    // step 4
    permissions: Record<PermissionKey, number>;
    // step 5 — no pricing. "Template Pricing" was removed from this form.
    is_active: boolean;
    is_featured: boolean;
    available_for: Audience[];
    plan_availability: PlanAvailability;
    plan_ids: number[];
    sort_order: string;
    show_on_homepage: boolean;
    thumbnail: string;
}

const emptyForm = (): FormState => ({
    name: '',
    code: '',
    event_category_id: '',
    event_type_id: '',
    religion_id: '',
    template_category_id: '',
    style: 'classic',
    tags: [],
    description: '',
    layout_style: 'classic',
    background_type: 'color',
    background_color: '#FFF7F0',
    secondary_color: '#88860B',
    background_image: '',
    gradient_from: '#FFF7F0',
    gradient_to: '#F3E8DA',
    // 'bottom' matches how every gradient template saved before the Direction
    // control existed already renders.
    gradient_type: 'linear',
    gradient_direction: 'bottom',
    image_shape: 'rectangle',
    corner_radius: 0,
    custom_css: '',
    overlay_opacity: 25,
    orientation: 'portrait',
    dimension: '1080x1920',
    primary_font: 'Playfair Display',
    secondary_font: 'Poppins',
    border_style: 'ornate',
    frame_style_id: null,
    decorations: [],
    decoration_ids: [],
    components: defaultComponents(),
    component_order: [...COMPONENT_KEYS],
    permissions: defaultPermissions(),
    is_active: true,
    is_featured: false,
    available_for: ['individual', 'company'],
    plan_availability: 'all',
    plan_ids: [],
    sort_order: '0',
    show_on_homepage: false,
    thumbnail: '',
});

export function TemplateWizardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const isEdit = !!id;

    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [tagDraft, setTagDraft] = useState('');
    const [loadedId, setLoadedId] = useState<string | null>(null);
    const [uploading, setUploading] = useState<'background' | 'thumbnail' | null>(null);

    const backgroundInput = useRef<HTMLInputElement>(null);
    const thumbnailInput = useRef<HTMLInputElement>(null);

    const { data: existing, isLoading: loadingTemplate } = useEventTemplate(id ?? undefined);
    const { data: categories } = useEventCategories({ limit: 200, is_active: true });
    const { data: eventTypes } = useEventTypes({
        limit: 200,
        is_active: true,
        event_category_id: form.event_category_id || undefined,
    });
    const { data: religions } = useReligions({
        limit: 200,
        is_active: true,
        event_category_id: form.event_category_id || undefined,
        event_type_id: form.event_type_id || undefined,
    });
    const { data: plansData } = useSubscriptionPlans({ limit: 200 });

    /**
     * The three catalogues step 1 and step 2 now read from.
     *
     * Only usable rows: offering a deactivated category or an unpublished frame
     * would let someone pick something the backend then refuses on save.
     */
    const { data: categoriesData, isLoading: categoriesLoading } = useTemplateCategories({
        limit: 200,
        is_active: 1,
    });
    const { data: framesData, isLoading: framesLoading } = useFrameStyles({
        limit: 200,
        status: 'active',
        publish_status: 'published',
    });
    const { data: decorationsData, isLoading: decorationsLoading } = useDecorations({
        limit: 200,
        is_active: 1,
    });

    const styleOptions = useMemo(
        () =>
            (categoriesData?.data ?? []).map((c) => ({
                // `value` is the id, because that is what saves; `slug` keeps the
                // legacy `style` column truthful alongside it.
                value: String(c.id),
                slug: c.slug,
                label: c.name,
            })),
        [categoriesData]
    );
    const plans = plansData?.data ?? [];

    // Both land back on the list. The wizard is a task, and the list is where you
    // see the thing you just made sitting among the others — the detail page
    // only repeats what step 6 already showed you.
    const createTemplate = useCreateEventTemplate(() => router.push('/admin/templates'));
    const updateTemplate = useUpdateEventTemplate(() => router.push('/admin/templates'));

    /**
     * Populated ONCE per id. Re-running on every `existing` reference would wipe
     * whatever is being typed the moment a background refetch resolves — the
     * §Form Reset trap.
     */
    useEffect(() => {
        if (!existing || !id || loadedId === id) return;

        setForm({
            name: existing.name ?? '',
            code: existing.code ?? '',
            event_category_id: existing.event_category_id ? String(existing.event_category_id) : '',
            event_type_id: existing.event_type_id ? String(existing.event_type_id) : '',
            religion_id: existing.religion_id ? String(existing.religion_id) : '',
            template_category_id: existing.template_category_id
                ? String(existing.template_category_id)
                : '',
            style: existing.style ?? 'classic',
            tags: existing.tags ?? [],
            description: existing.description ?? '',
            layout_style: existing.layout_style ?? 'classic',
            background_type: existing.background_type ?? 'color',
            background_color: existing.background_color ?? '#FFF7F0',
            secondary_color: existing.secondary_color ?? '#88860B',
            background_image: existing.background_image ?? '',
            gradient_from: existing.gradient_from ?? '#FFF7F0',
            gradient_to: existing.gradient_to ?? '#F3E8DA',
            gradient_type: existing.gradient_type ?? 'linear',
            gradient_direction: existing.gradient_direction ?? 'bottom',
            image_shape: existing.image_shape ?? 'rectangle',
            corner_radius: existing.corner_radius ?? 0,
            custom_css: existing.custom_css ?? '',
            overlay_opacity: Number(existing.overlay_opacity ?? 0),
            orientation: existing.orientation ?? 'portrait',
            dimension: existing.dimension ?? '1080x1920',
            primary_font: existing.primary_font ?? 'Playfair Display',
            secondary_font: existing.secondary_font ?? 'Poppins',
            border_style: existing.border_style ?? 'ornate',
            frame_style_id: existing.frame_style_id ?? null,
            decorations: existing.decorations ?? [],
            decoration_ids: existing.decoration_ids ?? [],
            components: { ...defaultComponents(), ...(existing.components ?? {}) },
            component_order: normaliseOrder(existing.component_order),
            permissions: { ...defaultPermissions(), ...(existing.permissions ?? {}) },
            is_active: !!Number(existing.is_active),
            is_featured: !!Number(existing.is_featured),
            available_for: existing.available_for?.length
                ? existing.available_for
                : ['individual', 'company'],
            plan_availability: existing.plan_availability ?? 'all',
            plan_ids: existing.plan_ids ?? [],
            sort_order: String(existing.sort_order ?? 0),
            show_on_homepage: !!Number(existing.show_on_homepage),
            thumbnail: existing.thumbnail ?? '',
        });
        setLoadedId(id);
    }, [existing, id, loadedId]);

    /**
     * Functional updaters throughout. A `{ ...form }` spread inside an async
     * upload handler captures a stale form and silently wipes whatever was
     * typed while the file was uploading.
     */
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key as string] ? { ...prev, [key as string]: false } : prev));
    };

    const toggleComponent = (key: ComponentKey, on: boolean) =>
        setForm((prev) => ({ ...prev, components: { ...prev.components, [key]: on ? 1 : 0 } }));

    const togglePermission = (key: PermissionKey, on: boolean) =>
        setForm((prev) => ({ ...prev, permissions: { ...prev.permissions, [key]: on ? 1 : 0 } }));

    const addTag = () => {
        const value = tagDraft.trim();
        if (!value) return;
        setForm((prev) =>
            prev.tags.includes(value) || prev.tags.length >= 20
                ? prev
                : { ...prev, tags: [...prev.tags, value] }
        );
        setTagDraft('');
    };

    const uploadImage = async (file: File, target: 'background' | 'thumbnail') => {
        setUploading(target);
        try {
            const result = await mediaApi.upload(file, 'templates');

            if (target === 'thumbnail') {
                setField('thumbnail', result.url);
                toast.success('Thumbnail uploaded');
            } else {
                /**
                 * Uploading a background image also SWITCHES Background Type to
                 * Image.
                 *
                 * Without this the upload succeeds, the file reaches S3, and
                 * absolutely nothing changes on screen — the preview only paints
                 * `background_image` when the type is `image`, so the picture sits
                 * in the row unused and the uploader reads as broken. That is
                 * exactly what happened to the first template created here: both
                 * images uploaded fine and `background_type` was still `color`.
                 *
                 * Nobody uploads a background in order not to use it. The type
                 * control is right above and still flips back freely, so this is
                 * a default, not a decision taken away.
                 */
                setForm((prev) => ({
                    ...prev,
                    background_image: result.url,
                    background_type: 'image',
                }));
                toast.success(
                    form.background_type === 'image'
                        ? 'Background image uploaded'
                        : 'Background image uploaded — background type switched to Image'
                );
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message || e?.message || 'Upload failed');
        } finally {
            setUploading(null);
            // Reset the input, or picking the SAME file again fires no change event.
            if (target === 'background' && backgroundInput.current) backgroundInput.current.value = '';
            if (target === 'thumbnail' && thumbnailInput.current) thumbnailInput.current.value = '';
        }
    };

    /**
     * Only step 1 has required fields. One common toast, never a field-specific
     * one — the red rings on the fields say WHICH, the toast says THAT.
     */
    const validateStep = (target: number): boolean => {
        if (target !== 1) return true;

        const next: Record<string, boolean> = {
            name: !form.name.trim(),
            code: !form.code.trim(),
            event_category_id: !form.event_category_id,
            event_type_id: !form.event_type_id,
        };
        setErrors(next);

        if (Object.values(next).some(Boolean)) {
            toast.error('Please fill all mandatory fields.');
            return false;
        }
        return true;
    };

    const goToStep = (target: number) => {
        // Moving BACKWARD never validates — you must be able to return and fix
        // the very field that is failing.
        if (target > step && !validateStep(1)) return;
        setStep(Math.min(Math.max(target, 1), STEPS.length));
    };

    const buildPayload = (status: 'draft' | 'published'): EventTemplatePayload => ({
        name: form.name.trim(),
        code: form.code.trim(),
        event_category_id: form.event_category_id ? Number(form.event_category_id) : null,
        event_type_id: form.event_type_id ? Number(form.event_type_id) : null,
        religion_id: form.religion_id ? Number(form.religion_id) : null,
        // Sending the id is what sets the Style; the backend rewrites `style`
        // from the category's slug, so the two can never drift apart.
        template_category_id: form.template_category_id ? Number(form.template_category_id) : null,
        style: form.style,
        tags: form.tags,
        description: form.description.trim() || null,

        layout_style: form.layout_style,
        background_type: form.background_type,
        background_color: form.background_color || null,
        secondary_color: form.secondary_color || null,
        background_image: form.background_image || null,
        gradient_from: form.gradient_from || null,
        gradient_to: form.gradient_to || null,
        gradient_type: form.gradient_type,
        gradient_direction: form.gradient_direction,
        image_shape: form.image_shape,
        corner_radius: form.corner_radius,
        custom_css: form.custom_css.trim() || null,
        overlay_opacity: form.overlay_opacity,
        orientation: form.orientation,
        dimension: form.dimension || null,
        primary_font: form.primary_font || null,
        secondary_font: form.secondary_font || null,
        border_style: form.border_style || null,
        frame_style_id: form.frame_style_id,
        decorations: form.decorations,
        decoration_ids: form.decoration_ids,

        components: form.components,
        component_order: form.component_order,
        permissions: form.permissions,

        status,
        is_active: form.is_active,
        is_featured: form.is_featured,
        available_for: form.available_for,
        plan_availability: form.plan_availability,
        plan_ids: form.plan_ids,
        sort_order: Number(form.sort_order) || 0,
        show_on_homepage: form.show_on_homepage,
        thumbnail: form.thumbnail || null,
    });

    const submit = (status: 'draft' | 'published') => {
        // Save as Draft is available from every step, so it validates step 1
        // itself rather than trusting that the user walked through it.
        if (!validateStep(1)) {
            setStep(1);
            return;
        }
        const payload = buildPayload(status);
        if (isEdit && id) updateTemplate.mutate({ id: Number(id), data: payload });
        else createTemplate.mutate(payload);
    };

    const isSaving = createTemplate.isPending || updateTemplate.isPending;
    const isBusy = isSaving || (isEdit && loadingTemplate && loadedId !== id);

    const previewTemplate = useMemo(
        () => ({
            name: form.name,
            style: form.style,
            layout_style: form.layout_style,
            background_type: form.background_type,
            background_color: form.background_color,
            secondary_color: form.secondary_color,
            background_image: form.background_image,
            gradient_from: form.gradient_from,
            gradient_to: form.gradient_to,
            gradient_type: form.gradient_type,
            gradient_direction: form.gradient_direction,
            image_shape: form.image_shape,
            corner_radius: form.corner_radius,
            overlay_opacity: form.overlay_opacity,
            orientation: form.orientation,
            primary_font: form.primary_font,
            secondary_font: form.secondary_font,
            border_style: form.border_style,
            // Resolved from the live catalogues, not from the saved row: the
            // preview has to move the moment a tile is clicked, and the row does
            // not exist yet on create.
            frameUrl:
                (framesData?.data ?? []).find((f) => f.id === form.frame_style_id)?.file_url ??
                null,
            decorationItems: form.decoration_ids
                .map((id) => (decorationsData?.data ?? []).find((d) => d.id === id))
                .filter(Boolean)
                .map((d) => ({
                    id: d!.id,
                    name: d!.name,
                    type: d!.type,
                    file_url: d!.file_url,
                })),
            components: form.components,
            component_order: form.component_order,
        }),
        // The catalogues belong in here too: without them the preview keeps the
        // frame it resolved on first render and never picks one up once the
        // frame/decoration queries settle.
        [form, framesData, decorationsData]
    );

    const activeCategory = (categories?.data ?? []).find(
        (c) => String(c.id) === form.event_category_id
    );
    const activeType = (eventTypes?.data ?? []).find((t) => String(t.id) === form.event_type_id);
    const activeReligion = (religions?.data ?? []).find((r) => String(r.id) === form.religion_id);

    const componentsOn = COMPONENT_KEYS.filter((k) => Number(form.components[k]));
    const permissionsOn = PERMISSION_KEYS.filter((k) => Number(form.permissions[k]));

    return (
        <PermissionGuard permission={isEdit ? 'event_templates.edit' : 'event_templates.create'}>
            <div className="space-y-4">
                <PageLoader open={isBusy} text={isSaving ? 'Saving template...' : 'Loading template...'} />

                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                            {isEdit ? 'Edit Template' : 'Create Template'}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Dashboard &nbsp;›&nbsp; Templates &nbsp;›&nbsp;{' '}
                            <span className="font-semibold text-primary">
                                {isEdit ? 'Edit Template' : 'Create Template'}
                            </span>
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => submit('draft')}
                            disabled={isSaving}
                            className="h-9 gap-2"
                        >
                            <Save className="h-4 w-4" /> Save as Draft
                        </Button>
                        {step < STEPS.length ? (
                            <Button onClick={() => goToStep(step + 1)} className="h-9 gap-2">
                                Next <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => submit('published')}
                                disabled={isSaving}
                                className="h-9 gap-2"
                            >
                                <Check className="h-4 w-4" /> Save &amp; Publish
                            </Button>
                        )}
                    </div>
                </div>

                <StepBar step={step} onStepClick={goToStep} />

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                    {/* ── The form ─────────────────────────────────────────── */}
                    <div className="min-w-0 space-y-4">
                        {step === 1 && (
                            <WizardCard
                                index={1}
                                title="Basic Information"
                                subtitle="Add basic details to help clients find and use this template."
                            >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Field label="Template Name" required error={errors.name}>
                                        <Input
                                            value={form.name}
                                            onChange={(e) => setField('name', e.target.value)}
                                            placeholder="Enter template name"
                                            className={cn('h-10', errors.name && 'border-destructive')}
                                        />
                                    </Field>

                                    <Field
                                        label="Template Code (Slug)"
                                        required
                                        error={errors.code}
                                        hint="Use lowercase letters, numbers and hyphens only."
                                    >
                                        <Input
                                            value={form.code}
                                            // Normalised as you type, so the hint under the
                                            // field is a description rather than a rule that
                                            // is only enforced on save.
                                            onChange={(e) =>
                                                setField(
                                                    'code',
                                                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                                                )
                                            }
                                            placeholder="Enter template code"
                                            className={cn('h-10 font-mono', errors.code && 'border-destructive')}
                                        />
                                    </Field>

                                    <Field label="Event Category" required error={errors.event_category_id}>
                                        <Select
                                            value={form.event_category_id}
                                            onValueChange={(v) => {
                                                setField('event_category_id', v);
                                                // The chosen type and religion may not belong
                                                // to the new category — the API rejects that
                                                // pairing, so clear rather than send it.
                                                setField('event_type_id', '');
                                                setField('religion_id', '');
                                            }}
                                        >
                                            <SelectTrigger
                                                className={cn('h-10', errors.event_category_id && 'border-destructive')}
                                            >
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(categories?.data ?? []).map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field label="Event Type" required error={errors.event_type_id}>
                                        <Select
                                            value={form.event_type_id}
                                            onValueChange={(v) => {
                                                setField('event_type_id', v);
                                                setField('religion_id', '');
                                            }}
                                            disabled={!form.event_category_id}
                                        >
                                            <SelectTrigger
                                                className={cn('h-10', errors.event_type_id && 'border-destructive')}
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        form.event_category_id
                                                            ? 'Select event type'
                                                            : 'Choose a category first'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(eventTypes?.data ?? []).map((t) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field label="Religion" hint="Optional — not every event is religious.">
                                        <Select
                                            value={form.religion_id || 'none'}
                                            onValueChange={(v) => setField('religion_id', v === 'none' ? '' : v)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select religion" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No religion</SelectItem>
                                                {(religions?.data ?? []).map((r) => (
                                                    <SelectItem key={r.id} value={String(r.id)}>
                                                        {r.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>

                                {/*
                                  Template Style / Theme — the reason
                                  `template_categories` exists.

                                  This was a hardcoded list of six adjectives that
                                  referenced nothing. It is now the real category
                                  table, which is also what a frame style is filed
                                  under — so picking a style here is what makes
                                  step 2 offer the frames that suit it.
                                */}
                                <div className="mt-4 space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Template Style / Theme <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                        {styleOptions.map((s) => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                onClick={() => {
                                                    // The id is what saves; the slug
                                                    // is kept so the preview and any
                                                    // older reader still see a style.
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        template_category_id: s.value,
                                                        style: s.slug,
                                                    }));
                                                }}
                                                className={cn(
                                                    'flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs transition-colors',
                                                    form.template_category_id === s.value
                                                        ? 'border-primary bg-primary/5 font-semibold text-primary'
                                                        : 'border-border text-muted-foreground hover:border-primary/40'
                                                )}
                                            >
                                                <span
                                                    className="h-12 w-full rounded-md border border-border/60"
                                                    style={{
                                                        background:
                                                            form.template_category_id === s.value
                                                                ? `linear-gradient(140deg, ${form.background_color}, ${form.secondary_color})`
                                                                : undefined,
                                                    }}
                                                />
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">Tags</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {form.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            tags: prev.tags.filter((t) => t !== tag),
                                                        }))
                                                    }
                                                    aria-label={`Remove ${tag}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <Input
                                        value={tagDraft}
                                        onChange={(e) => setTagDraft(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ',') {
                                                // Or the form submits / a comma lands in the tag.
                                                e.preventDefault();
                                                addTag();
                                            }
                                        }}
                                        onBlur={addTag}
                                        placeholder="Add tags and press enter"
                                        className="h-10"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Example: wedding, floral, traditional
                                    </p>
                                </div>

                                <div className="mt-4 space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Description{' '}
                                        <span className="font-normal text-muted-foreground">
                                            (Visible to clients)
                                        </span>
                                    </Label>
                                    <Textarea
                                        value={form.description}
                                        onChange={(e) => setField('description', e.target.value.slice(0, 200))}
                                        placeholder="Enter template description"
                                        rows={4}
                                    />
                                    <div className="text-right text-[11px] text-muted-foreground">
                                        {form.description.length}/200
                                    </div>
                                </div>
                            </WizardCard>
                        )}

                        {step === 2 && (
                            <WizardCard
                                index={2}
                                title="Design & Background"
                                subtitle="Choose the visual style and background for your template."
                            >
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">Layout Style</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {LAYOUT_STYLES.map((l) => (
                                            <button
                                                key={l.value}
                                                type="button"
                                                onClick={() => setField('layout_style', l.value)}
                                                className={cn(
                                                    'rounded-md border px-4 py-2 text-xs transition-colors',
                                                    form.layout_style === l.value
                                                        ? 'border-primary bg-primary/5 font-semibold text-primary'
                                                        : 'border-border text-muted-foreground hover:border-primary/40'
                                                )}
                                            >
                                                {l.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">Background Type</Label>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {BACKGROUND_TYPES.map((b) => (
                                            <button
                                                key={b.value}
                                                type="button"
                                                onClick={() => setField('background_type', b.value)}
                                                className={cn(
                                                    'rounded-md border px-4 py-2 text-xs transition-colors',
                                                    form.background_type === b.value
                                                        ? 'border-primary bg-primary/5 font-semibold text-primary'
                                                        : 'border-border text-muted-foreground hover:border-primary/40'
                                                )}
                                            >
                                                {b.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* An existing template can arrive with an image and a
                                    non-image type — that is how the first one was saved.
                                    Said out loud, with the one-click fix, rather than
                                    leaving the preview silently ignoring the picture. */}
                                {form.background_image
                                    && form.background_type !== 'image'
                                    && form.background_type !== 'custom' && (
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 dark:bg-amber-500/10">
                                        <span className="text-xs text-amber-800 dark:text-amber-300">
                                            This template has a background image, but its Background Type is
                                            <span className="font-semibold"> {form.background_type}</span> — so the
                                            image is not used.
                                        </span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs"
                                            onClick={() => setField('background_type', 'image')}
                                        >
                                            Use the image
                                        </Button>
                                    </div>
                                )}

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <ColorField
                                        label={
                                            form.background_type === 'custom'
                                                ? 'Primary Color'
                                                : 'Background Color'
                                        }
                                        value={form.background_color}
                                        onChange={(v) => setField('background_color', v)}
                                    />
                                    <ColorField
                                        label="Secondary Color"
                                        optional
                                        value={form.secondary_color}
                                        onChange={(v) => setField('secondary_color', v)}
                                    />
                                </div>

                                {form.background_type === 'gradient' && (
                                    <div className="mt-4 space-y-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-foreground">
                                                    Gradient Type
                                                </Label>
                                                <div className="flex gap-2">
                                                    {GRADIENT_TYPES.map((g) => (
                                                        <button
                                                            key={g.value}
                                                            type="button"
                                                            onClick={() => setField('gradient_type', g.value)}
                                                            className={cn(
                                                                'flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors',
                                                                form.gradient_type === g.value
                                                                    ? 'border-primary bg-primary/5 font-semibold text-primary'
                                                                    : 'border-border text-muted-foreground hover:border-primary/40'
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border',
                                                                    form.gradient_type === g.value
                                                                        ? 'border-primary'
                                                                        : 'border-muted-foreground/50'
                                                                )}
                                                            >
                                                                {form.gradient_type === g.value ? (
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                                ) : null}
                                                            </span>
                                                            {g.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Direction is meaningless for a radial gradient,
                                                so it is hidden rather than shown doing nothing. */}
                                            {form.gradient_type === 'linear' ? (
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-foreground">
                                                        Direction
                                                    </Label>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {GRADIENT_DIRECTIONS.map((d) => (
                                                            <button
                                                                key={d.value}
                                                                type="button"
                                                                title={d.label}
                                                                onClick={() => setField('gradient_direction', d.value)}
                                                                className={cn(
                                                                    'grid h-9 w-9 place-items-center rounded-md border text-sm transition-colors',
                                                                    form.gradient_direction === d.value
                                                                        ? 'border-primary bg-primary/5 text-primary'
                                                                        : 'border-border text-muted-foreground hover:border-primary/40'
                                                                )}
                                                            >
                                                                {d.arrow}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <ColorField
                                                label="Color 1"
                                                value={form.gradient_from}
                                                onChange={(v) => setField('gradient_from', v)}
                                            />
                                            <ColorField
                                                label="Color 2"
                                                value={form.gradient_to}
                                                onChange={(v) => setField('gradient_to', v)}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Preview Gradient
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                                {GRADIENT_PRESETS.map((preset) => {
                                                    const on =
                                                        form.gradient_from.toUpperCase() === preset.from &&
                                                        form.gradient_to.toUpperCase() === preset.to;
                                                    return (
                                                        <button
                                                            key={preset.from + preset.to}
                                                            type="button"
                                                            title={preset.from + ' to ' + preset.to}
                                                            onClick={() =>
                                                                // One click sets BOTH colours. Setting one and
                                                                // leaving the other is how a preset ends up
                                                                // looking like neither swatch.
                                                                setForm((prev) => ({
                                                                    ...prev,
                                                                    gradient_from: preset.from,
                                                                    gradient_to: preset.to,
                                                                }))
                                                            }
                                                            className={cn(
                                                                'h-12 w-14 rounded-md border transition-colors',
                                                                on
                                                                    ? 'border-primary ring-1 ring-primary'
                                                                    : 'border-border hover:border-primary/40'
                                                            )}
                                                            style={{
                                                                backgroundImage: `linear-gradient(160deg, ${preset.from}, ${preset.to})`,
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {form.background_type === 'custom' && (
                                    <div className="mt-4 space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Image Shape
                                            </Label>
                                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                                {IMAGE_SHAPES.map((sh) => (
                                                    <button
                                                        key={sh.value}
                                                        type="button"
                                                        onClick={() => setField('image_shape', sh.value)}
                                                        className={cn(
                                                            'flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs transition-colors',
                                                            form.image_shape === sh.value
                                                                ? 'border-primary bg-primary/5 font-semibold text-primary'
                                                                : 'border-border text-muted-foreground hover:border-primary/40'
                                                        )}
                                                    >
                                                        {/* The tile shows the shape itself, so the control
                                                            is legible without reading the label. */}
                                                        <span
                                                            className={cn(
                                                                'h-7 w-7 border-2 border-current',
                                                                sh.value === 'circle' && 'rounded-full',
                                                                sh.value === 'rectangle' && 'h-5 w-8 rounded-sm',
                                                                sh.value === 'square' && 'rounded-sm',
                                                                sh.value === 'arch' && 'rounded-t-full rounded-b-sm',
                                                                sh.value === 'heart' &&
                                                                    'rotate-45 rounded-bl-full border-l-0 border-b-0'
                                                            )}
                                                        />
                                                        {sh.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Only rectangle, square and arch have corners to round.
                                            Disabled rather than hidden, so the control does not
                                            appear and vanish as the shape changes. */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Corner Radius
                                            </Label>
                                            <div className="flex items-center gap-3">
                                                <Slider
                                                    value={[form.corner_radius]}
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    disabled={
                                                        form.image_shape === 'circle' ||
                                                        form.image_shape === 'heart'
                                                    }
                                                    onValueChange={([v]) => setField('corner_radius', v)}
                                                />
                                                <div className="flex h-9 w-20 shrink-0 items-center justify-center rounded-md border border-border text-xs font-semibold">
                                                    {form.corner_radius} %
                                                </div>
                                            </div>
                                            {form.image_shape === 'circle' || form.image_shape === 'heart' ? (
                                                <p className="text-[11px] text-muted-foreground">
                                                    A {form.image_shape} has no corners to round.
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground">
                                            {form.background_type === 'custom'
                                                ? 'Upload Design'
                                                : 'Background Image'}{' '}
                                            <span className="font-normal text-muted-foreground">(Optional)</span>
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                                                {form.background_image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={form.background_image}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </span>
                                            <div className="min-w-0 space-y-1.5">
                                                <input
                                                    ref={backgroundInput}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) uploadImage(file, 'background');
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-2 text-xs"
                                                    disabled={uploading === 'background'}
                                                    onClick={() => backgroundInput.current?.click()}
                                                >
                                                    {uploading === 'background' ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-3.5 w-3.5" />
                                                    )}
                                                    Browse File
                                                </Button>
                                                {form.background_image && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-2 text-xs text-destructive"
                                                        onClick={() => setField('background_image', '')}
                                                    >
                                                        <X className="h-3.5 w-3.5" /> Remove
                                                    </Button>
                                                )}
                                                <p className="text-[11px] text-muted-foreground">
                                                    {form.background_type === 'custom'
                                                        ? 'JPG, PNG, SVG. Recommended 1080 x 1920 px.'
                                                        : 'JPG, PNG. Recommended 1080 x 1920 px.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground">Overlay / Shade</Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Adjust overlay to improve text readability
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <Slider
                                                value={[form.overlay_opacity]}
                                                min={0}
                                                max={100}
                                                step={1}
                                                onValueChange={([v]) => setField('overlay_opacity', v)}
                                            />
                                            <div className="flex h-9 w-20 shrink-0 items-center justify-center rounded-md border border-border text-xs font-semibold">
                                                {form.overlay_opacity} %
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground">Orientation</Label>
                                        <div className="flex gap-2">
                                            {(['portrait', 'landscape'] as const).map((o) => (
                                                <button
                                                    key={o}
                                                    type="button"
                                                    onClick={() => setField('orientation', o)}
                                                    className={cn(
                                                        'flex-1 rounded-md border px-4 py-2 text-xs capitalize transition-colors',
                                                        form.orientation === o
                                                            ? 'border-primary bg-primary/5 font-semibold text-primary'
                                                            : 'border-border text-muted-foreground hover:border-primary/40'
                                                    )}
                                                >
                                                    {o}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Field label="Dimension">
                                        <Select
                                            value={form.dimension}
                                            onValueChange={(v) => setField('dimension', v)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DIMENSIONS.map((d) => (
                                                    <SelectItem key={d.value} value={d.value}>
                                                        {d.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field label="Primary Font">
                                        <Select
                                            value={form.primary_font}
                                            onValueChange={(v) => setField('primary_font', v)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FONT_OPTIONS.map((f) => (
                                                    <SelectItem key={f} value={f}>
                                                        {f}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field label="Secondary Font">
                                        <Select
                                            value={form.secondary_font}
                                            onValueChange={(v) => setField('secondary_font', v)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FONT_OPTIONS.map((f) => (
                                                    <SelectItem key={f} value={f}>
                                                        {f}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/*
                                      Border / Frame Style and Decorations now read
                                      the Frame Styles and Decorations modules.

                                      Both used to be hardcoded adjectives that
                                      referenced nothing: `border_style` mapped to a
                                      CSS class (a double line, never an "ornate
                                      frame") and `decorations` drew nothing at all.
                                      What is picked here is now the actual artwork.
                                    */}
                                    <ArtworkPicker
                                        label="Border / Frame Style"
                                        optional
                                        items={(framesData?.data ?? []).map((f) => ({
                                            id: f.id,
                                            name: f.name,
                                            file_url: f.file_url,
                                            template_category_id: f.template_category_id,
                                        }))}
                                        isLoading={framesLoading}
                                        selectedId={form.frame_style_id}
                                        onSelect={(id) => setField('frame_style_id', id)}
                                        suggestCategoryId={
                                            form.template_category_id
                                                ? Number(form.template_category_id)
                                                : null
                                        }
                                        manageHref="/admin/templates/frame-styles"
                                        manageLabel="Manage frame styles"
                                        emptyHint="No frame styles have been uploaded yet."
                                    />

                                    <ArtworkPicker
                                        label="Decorations"
                                        optional
                                        multiple
                                        items={(decorationsData?.data ?? []).map((d) => ({
                                            id: d.id,
                                            name: d.name,
                                            file_url: d.file_url,
                                            type_label: d.type_label,
                                        }))}
                                        isLoading={decorationsLoading}
                                        selectedIds={form.decoration_ids}
                                        onToggle={(id) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                decoration_ids: prev.decoration_ids.includes(id)
                                                    ? prev.decoration_ids.filter((x) => x !== id)
                                                    : [...prev.decoration_ids, id],
                                            }))
                                        }
                                        manageHref="/admin/templates/decorations"
                                        manageLabel="Manage decorations"
                                        emptyHint="No decorations have been uploaded yet."
                                    />
                                </div>

                                {/* The CSS fallback, kept and demoted. It is what
                                    draws when no frame artwork is chosen, which is
                                    every template made before frame styles existed. */}
                                {!form.frame_style_id ? (
                                    <div className="mt-4 space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground">
                                            Fallback Border{' '}
                                            <span className="font-normal text-muted-foreground">
                                                (used when no frame artwork is chosen)
                                            </span>
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {BORDER_STYLES.map((b) => (
                                                <button
                                                    key={b.value}
                                                    type="button"
                                                    onClick={() => setField('border_style', b.value)}
                                                    className={cn(
                                                        'rounded-md border px-3 py-2 text-xs transition-colors',
                                                        form.border_style === b.value
                                                            ? 'border-primary bg-primary/5 font-semibold text-primary'
                                                            : 'border-border text-muted-foreground hover:border-primary/40'
                                                    )}
                                                >
                                                    {b.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </WizardCard>
                        )}

                        {step === 3 && (
                            <WizardCard
                                index={3}
                                title="Content & Components"
                                subtitle="Choose the components that will be shown in this template."
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Label className="text-xs font-semibold text-foreground">
                                            Invitation Components
                                        </Label>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {COMPONENT_KEYS.map((key) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium text-foreground">
                                                        {COMPONENT_LABELS[key]}
                                                    </div>
                                                    {key === 'event_qr_code' && (
                                                        <div className="truncate text-[11px] text-muted-foreground">
                                                            Clients will get QR code for this event
                                                        </div>
                                                    )}
                                                </div>
                                                <Switch
                                                    checked={!!Number(form.components[key])}
                                                    onCheckedChange={(v) => toggleComponent(key, v)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-5 space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">Component Settings</Label>
                                    <div className="rounded-lg border border-border p-3">
                                        <div className="text-xs font-semibold text-foreground">Component Order</div>
                                        <p className="mb-3 text-[11px] text-muted-foreground">
                                            Drag the chips to arrange the order in which components will appear on
                                            the invitation. Components switched off keep their place.
                                        </p>
                                        <ComponentOrderList
                                            order={form.component_order}
                                            components={form.components}
                                            onChange={(next) => setField('component_order', next)}
                                        />
                                    </div>
                                </div>
                            </WizardCard>
                        )}

                        {step === 4 && (
                            <WizardCard
                                index={4}
                                title="Customization Permissions"
                                subtitle="Choose what clients are allowed to customize after selecting this template."
                            >
                                <div className="flex items-center gap-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Allow Clients to Customize
                                    </Label>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>

                                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {PERMISSION_KEYS.map((key) => (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium text-foreground">
                                                    {PERMISSION_LABELS[key]}
                                                </div>
                                                <div className="truncate text-[11px] text-muted-foreground">
                                                    {PERMISSION_HINTS[key]}
                                                </div>
                                            </div>
                                            <Switch
                                                checked={!!Number(form.permissions[key])}
                                                onCheckedChange={(v) => togglePermission(key, v)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
                                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <div className="text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground">Note</span>
                                        <p>
                                            Items disabled here will be locked for clients and cannot be edited or
                                            changed.
                                        </p>
                                    </div>
                                </div>
                            </WizardCard>
                        )}

                        {step === 5 && (
                            <WizardCard
                                index={5}
                                title="Publishing & Availability"
                                subtitle="Manage the status and availability of this template."
                            >
                                <div className="rounded-lg border border-border p-3">
                                    <div className="text-xs font-bold text-foreground">Template Status</div>
                                    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Status <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="flex gap-2">
                                                {[
                                                    { label: 'Active', value: true },
                                                    { label: 'Inactive', value: false },
                                                ].map((o) => (
                                                    <button
                                                        key={o.label}
                                                        type="button"
                                                        onClick={() => setField('is_active', o.value)}
                                                        className={cn(
                                                            'flex-1 rounded-md border px-4 py-2 text-xs transition-colors',
                                                            form.is_active === o.value
                                                                ? 'border-primary bg-primary/5 font-semibold text-primary'
                                                                : 'border-border text-muted-foreground hover:border-primary/40'
                                                        )}
                                                    >
                                                        {o.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Active templates will be visible to clients.
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Featured Template
                                            </Label>
                                            <Switch
                                                checked={form.is_featured}
                                                onCheckedChange={(v) => setField('is_featured', v)}
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Show this template in featured section for clients.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-lg border border-border p-3">
                                    <div className="text-xs font-bold text-foreground">Available For</div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Select who can use this template.
                                    </p>
                                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {/* "Both" is a shortcut that ticks the other two, never a
                                            third stored value — see the service. */}
                                        <AudienceBox
                                            label="Individual Clients"
                                            hint="Individuals creating their own events"
                                            checked={form.available_for.includes('individual')}
                                            onChange={(on) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    available_for: on
                                                        ? [...new Set([...prev.available_for, 'individual' as Audience])]
                                                        : prev.available_for.filter((a) => a !== 'individual'),
                                                }))
                                            }
                                        />
                                        <AudienceBox
                                            label="Event Management Companies"
                                            hint="Companies managing events for clients"
                                            checked={form.available_for.includes('company')}
                                            onChange={(on) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    available_for: on
                                                        ? [...new Set([...prev.available_for, 'company' as Audience])]
                                                        : prev.available_for.filter((a) => a !== 'company'),
                                                }))
                                            }
                                        />
                                        <AudienceBox
                                            label="Both"
                                            hint="Available for both individuals and companies"
                                            checked={
                                                form.available_for.includes('individual') &&
                                                form.available_for.includes('company')
                                            }
                                            onChange={(on) =>
                                                setField('available_for', on ? ['individual', 'company'] : [])
                                            }
                                        />
                                    </div>
                                    {form.available_for.length === 0 && (
                                        <p className="mt-2 text-[11px] font-medium text-amber-600">
                                            With neither audience selected nobody can use this template.
                                        </p>
                                    )}
                                </div>

                                {/* NOTE: the mockup's "Template Pricing" block sat here and has
                                    been removed on instruction. Nothing stores a price. */}
                                <div className="mt-4 rounded-lg border border-border p-3">
                                    <div className="text-xs font-bold text-foreground">Plan Availability</div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Choose the plans on which this template will be available.
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        {(
                                            [
                                                { value: 'all', label: 'All Plans', hint: 'Available on all subscription plans' },
                                                { value: 'selected', label: 'Selected Plans', hint: 'Choose specific plans' },
                                                { value: 'trial', label: 'Free Trial Only', hint: 'Available only during free trial period' },
                                            ] as const
                                        ).map((o) => (
                                            <label
                                                key={o.value}
                                                className={cn(
                                                    'flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5 transition-colors',
                                                    form.plan_availability === o.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/40'
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="plan_availability"
                                                    className="mt-0.5 accent-primary"
                                                    checked={form.plan_availability === o.value}
                                                    onChange={() =>
                                                        setField('plan_availability', o.value as PlanAvailability)
                                                    }
                                                />
                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold text-foreground">
                                                        {o.label}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">{o.hint}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    {form.plan_availability === 'selected' && (
                                        <div className="mt-3 space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Plans
                                            </Label>
                                            <div className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto rounded-md border border-border p-2 sm:grid-cols-2">
                                                {plans.length === 0 ? (
                                                    <p className="p-2 text-[11px] text-muted-foreground">
                                                        No subscription plans found.
                                                    </p>
                                                ) : (
                                                    plans.map((plan: any) => {
                                                        const on = form.plan_ids.includes(plan.id);
                                                        return (
                                                            <label
                                                                key={plan.id}
                                                                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted/50"
                                                            >
                                                                <Checkbox
                                                                    checked={on}
                                                                    onCheckedChange={(v) =>
                                                                        setForm((prev) => ({
                                                                            ...prev,
                                                                            plan_ids: v
                                                                                ? [...prev.plan_ids, plan.id]
                                                                                : prev.plan_ids.filter(
                                                                                      (p) => p !== plan.id
                                                                                  ),
                                                                        }))
                                                                    }
                                                                />
                                                                <span className="truncate">{plan.name}</span>
                                                            </label>
                                                        );
                                                    })
                                                )}
                                            </div>
                                            {form.plan_ids.length === 0 && (
                                                <p className="text-[11px] font-medium text-amber-600">
                                                    Nothing selected — this will be saved as All Plans rather than
                                                    hidden from everyone.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 rounded-lg border border-border p-3">
                                    <div className="text-xs font-bold text-foreground">Display &amp; Ordering</div>
                                    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <Field label="Sort Order" required hint="Lower number appears first.">
                                            <Input
                                                value={form.sort_order}
                                                inputMode="numeric"
                                                onChange={(e) =>
                                                    // digits only — a sort order that accepts letters
                                                    // silently becomes 0 on the server.
                                                    setField('sort_order', e.target.value.replace(/\D/g, ''))
                                                }
                                                className="h-10"
                                            />
                                        </Field>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Display on Homepage
                                            </Label>
                                            <Switch
                                                checked={form.show_on_homepage}
                                                onCheckedChange={(v) => setField('show_on_homepage', v)}
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Show this template on client homepage.
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Thumbnail for Template Gallery{' '}
                                                <span className="font-normal text-muted-foreground">(Optional)</span>
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                                                    {form.thumbnail ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={form.thumbnail}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </span>
                                                <input
                                                    ref={thumbnailInput}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) uploadImage(file, 'thumbnail');
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-2 text-xs"
                                                    disabled={uploading === 'thumbnail'}
                                                    onClick={() => thumbnailInput.current?.click()}
                                                >
                                                    {uploading === 'thumbnail' ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-3.5 w-3.5" />
                                                    )}
                                                    Upload
                                                </Button>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Recommended size: 600 x 400 px
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </WizardCard>
                        )}

                        {step === 6 && (
                            <WizardCard
                                index={6}
                                title="Review & Save"
                                subtitle="Review all template details before saving and publishing."
                            >
                                <div className="space-y-3">
                                    <ReviewSection
                                        title="Basic Information"
                                        icon={FileText}
                                        onEdit={() => setStep(1)}
                                        rows={[
                                            ['Template Name', form.name || '—'],
                                            ['Template Code', form.code || '—'],
                                            ['Event Category', activeCategory?.name ?? '—'],
                                            ['Event Type', activeType?.name ?? '—'],
                                            ['Religion', activeReligion?.name ?? '—'],
                                            ['Style', form.style],
                                        ]}
                                    />

                                    <ReviewSection
                                        title="Design & Background"
                                        icon={Palette}
                                        onEdit={() => setStep(2)}
                                        rows={[
                                            ['Layout Style', form.layout_style],
                                            ['Background Type', form.background_type],
                                            ['Orientation', `${form.orientation} (${form.dimension})`],
                                            [
                                                'Primary Color',
                                                <span key="p" className="inline-flex items-center gap-1.5">
                                                    <span
                                                        className="inline-block h-3 w-3 rounded-sm border border-border"
                                                        style={{ backgroundColor: form.background_color }}
                                                    />
                                                    {form.background_color}
                                                </span>,
                                            ],
                                            [
                                                'Secondary Color',
                                                <span key="s" className="inline-flex items-center gap-1.5">
                                                    <span
                                                        className="inline-block h-3 w-3 rounded-sm border border-border"
                                                        style={{ backgroundColor: form.secondary_color }}
                                                    />
                                                    {form.secondary_color}
                                                </span>,
                                            ],
                                            ['Fonts', `${form.primary_font} · ${form.secondary_font}`],
                                        ]}
                                    />

                                    <ReviewSection
                                        title="Content & Components"
                                        icon={LayoutList}
                                        onEdit={() => setStep(3)}
                                        rows={[
                                            [
                                                'Included Components',
                                                <span key="c" className="flex flex-wrap items-center gap-1">
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {componentsOn.length}
                                                    </Badge>
                                                    {/* Rendered IN ORDER, because the order is the
                                                        thing step 3 was actually for. */}
                                                    {form.component_order
                                                        .filter((k) => Number(form.components[k]))
                                                        .map((k) => COMPONENT_LABELS[k])
                                                        .join(', ') || 'None'}
                                                </span>,
                                            ],
                                        ]}
                                    />

                                    <ReviewSection
                                        title="Customization Permissions"
                                        icon={ShieldCheck}
                                        onEdit={() => setStep(4)}
                                        rows={[
                                            [
                                                'Clients Can Customize',
                                                <span key="p" className="flex flex-wrap items-center gap-1">
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {permissionsOn.length}
                                                    </Badge>
                                                    {permissionsOn.map((k) => PERMISSION_LABELS[k]).join(', ') ||
                                                        'Nothing — the template is fully locked'}
                                                </span>,
                                            ],
                                        ]}
                                    />

                                    <ReviewSection
                                        title="Publishing & Availability"
                                        icon={Globe}
                                        onEdit={() => setStep(5)}
                                        rows={[
                                            [
                                                'Status',
                                                <Badge
                                                    key="st"
                                                    variant="outline"
                                                    className={cn(
                                                        'border-transparent text-[11px] font-semibold',
                                                        form.is_active
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-rose-50 text-rose-700'
                                                    )}
                                                >
                                                    {form.is_active ? 'Active' : 'Inactive'}
                                                </Badge>,
                                            ],
                                            ['Featured Template', form.is_featured ? 'Yes' : 'No'],
                                            [
                                                'Available For',
                                                form.available_for.length === 2
                                                    ? 'Both (Individuals & Companies)'
                                                    : form.available_for.length === 0
                                                        ? 'Nobody'
                                                        : form.available_for[0] === 'individual'
                                                            ? 'Individual Clients'
                                                            : 'Event Management Companies',
                                            ],
                                            [
                                                'Plan Availability',
                                                form.plan_availability === 'all'
                                                    ? 'All Plans'
                                                    : form.plan_availability === 'trial'
                                                        ? 'Free Trial Only'
                                                        : `${form.plan_ids.length} selected plan(s)`,
                                            ],
                                            ['Sort Order', form.sort_order || '0'],
                                            ['Display On Homepage', form.show_on_homepage ? 'Yes' : 'No'],
                                        ]}
                                    />

                                    <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <div className="text-xs text-muted-foreground">
                                            <span className="font-semibold text-foreground">Important</span>
                                            <p>
                                                Once you publish this template, it will be available to clients based
                                                on the selected availability and visibility settings.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </WizardCard>
                        )}

                        {/* Footer nav */}
                        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                            {step > 1 ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setStep((s) => s - 1)}
                                    className="h-9 gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Previous
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/admin/templates')}
                                    className="h-9"
                                >
                                    Cancel
                                </Button>
                            )}

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => submit('draft')}
                                    disabled={isSaving}
                                    className="h-9 gap-2"
                                >
                                    <Save className="h-4 w-4" /> Save as Draft
                                </Button>
                                {step < STEPS.length ? (
                                    <Button onClick={() => goToStep(step + 1)} className="h-9 gap-2">
                                        Next <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => submit('published')}
                                        disabled={isSaving}
                                        className="h-9 gap-2"
                                    >
                                        <Check className="h-4 w-4" /> Save &amp; Publish
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Live preview ─────────────────────────────────────── */}
                    <div className="min-w-0">
                        <Card className="border-border bg-card shadow-xs xl:sticky xl:top-4">
                            <CardContent className="p-4">
                                <TemplatePreview template={previewTemplate} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PermissionGuard>
    );
}

/* --------------------------------------------------------------- sub-components */

function StepBar({ step, onStepClick }: { step: number; onStepClick: (target: number) => void }) {
    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-card p-3">
            {STEPS.map((s, i) => {
                const index = i + 1;
                const done = step > index;
                const active = step === index;
                return (
                    <button
                        key={s.title}
                        type="button"
                        onClick={() => onStepClick(index)}
                        className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors hover:bg-muted',
                            active ? 'text-foreground' : 'text-muted-foreground'
                        )}
                    >
                        <span
                            className={cn(
                                'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                                active && 'bg-primary text-primary-foreground',
                                done && 'bg-emerald-100 text-emerald-700',
                                !active && !done && 'bg-muted text-muted-foreground'
                            )}
                        >
                            {done ? <Check className="h-3 w-3" /> : index}
                        </span>
                        <span className="hidden sm:block">
                            <span className={cn('block leading-tight', active && 'font-semibold')}>{s.title}</span>
                            <span className="block text-[10px] leading-tight text-muted-foreground">
                                {s.subtitle}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

function WizardCard({
    index,
    title,
    subtitle,
    children,
}: {
    index: number;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    const Icon = STEPS[index - 1].icon;
    return (
        <Card className="border-border bg-card shadow-xs">
            <CardHeader className="border-b border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index}
                    </span>
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <div>
                            <CardTitle className="text-sm font-bold text-foreground">{title}</CardTitle>
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">{children}</CardContent>
        </Card>
    );
}

function Field({
    label,
    required,
    hint,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    error?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {hint && (
                <p className={cn('text-[11px]', error ? 'text-destructive' : 'text-muted-foreground')}>{hint}</p>
            )}
        </div>
    );
}

/**
 * Hex text field beside a native colour swatch. Both write the same state, so
 * typing `#ABC` and picking from the wheel are the same edit — a colour picker
 * that cannot be typed into is unusable when somebody has a brand hex to match.
 */
function ColorField({
    label,
    value,
    optional,
    onChange,
}: {
    label: string;
    value: string;
    optional?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
                {label} {optional && <span className="font-normal text-muted-foreground">(Optional)</span>}
            </Label>
            <div className="flex h-10 items-center gap-2 rounded-md border border-border px-2">
                <span
                    className="inline-block h-5 w-5 shrink-0 rounded-sm border border-border"
                    style={{ backgroundColor: /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : 'transparent' }}
                />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    placeholder="#FFFFFF"
                    className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none"
                />
                <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#FFFFFF'}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    className="h-6 w-6 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    aria-label={`${label} picker`}
                />
            </div>
        </div>
    );
}

function AudienceBox({
    label,
    hint,
    checked,
    onChange,
}: {
    label: string;
    hint: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label
            className={cn(
                'flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5 transition-colors',
                checked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            )}
        >
            <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
            <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground">{label}</div>
                <div className="text-[11px] text-muted-foreground">{hint}</div>
            </div>
        </label>
    );
}

function ReviewSection({
    title,
    icon: Icon,
    onEdit,
    rows,
}: {
    title: string;
    icon: React.ElementType;
    onEdit: () => void;
    rows: Array<[string, React.ReactNode]>;
}) {
    return (
        <div className="rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">{title}</span>
                </div>
                <Button variant="outline" size="sm" onClick={onEdit} className="h-7 gap-1.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Edit
                </Button>
            </div>
            <dl className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map(([label, value]) => (
                    <div key={label} className="min-w-0">
                        <dt className="text-[11px] text-muted-foreground">{label}</dt>
                        <dd className="break-words text-xs font-medium capitalize text-foreground">{value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
