'use client';

import { useState, useEffect } from 'react';
import {
    Save,
    RotateCcw,
    Sparkles,
    HelpCircle,
    Plus,
    Trash2,
    Check,
    X,
    Grid,
    CheckCircle2,
    DollarSign,
    Monitor,
    Smartphone,
    Crown,
    Building2,
    User,
    Loader2,
    ArrowLeft,
    Lightbulb,
    GripVertical,
    Star,
    Zap,
    Gem,
    Shield,
    Rocket,
    Gift,
    Upload,
    Pencil,
    ExternalLink,
    Info,
    Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ConfirmResetDialog } from '@/components/common/confirm-reset-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePricingPlansData, useSavePricingPlans, type PricingPlan } from '@/hooks/usePricingPlans';
import { BuilderCountedInput, BuilderCountedTextarea } from './builder-field';
import { cn } from '@/lib/utils';
import { useSectionTranslation, handleTranslationSave } from '@/hooks/useSectionTranslation';
import { TranslationSideCard } from './translation-side-card';
import { TranslationModeBanner } from './translation-mode-banner';

type PreviewDevice = 'desktop' | 'mobile';

interface PricingFeatureLimit {
    id: string;
    text: string;
    value: string;
}

export type BadgeStyleType = 'Filled' | 'Outline' | 'Soft Filled' | 'Soft Outline';

interface PricingPlanItem {
    id: string;
    planFor: 'Individuals' | 'Companies';
    name: string;
    description: string;
    badgeText: string;
    badgeStyle: BadgeStyleType;
    badgeColor: string;
    billingCycle: 'Monthly' | 'Yearly';
    currency: string;
    price: string;
    compareAtPrice: string;
    customUnitLabel: string;
    freeTrial: boolean;
    trialDays: string;
    ctaText: string;
    ctaLinkType: 'checkout' | 'contact' | 'custom';
    ctaLinkUrl: string;
    features: PricingFeatureLimit[];
    isActive: boolean;
    isHighlighted: boolean;
    allowUpgrade: boolean;
    icon: string;
    color: string;
    createdBy: string;
    createdOn: string;
}

interface MatrixFeatureRow {
    id: string;
    featureTitle: string;
    description: string;
    icon?: string;
    category: string;
    values: {
        Free: string;
        Basic: string;
        Pro: string;
        Premium: string;
        Companies: string;
    };
    status: 'Active' | 'Inactive';
}

const DEFAULT_PLANS: PricingPlanItem[] = [
    {
        id: '1',
        planFor: 'Individuals',
        name: 'Pro Plan',
        description: 'Everything you need to create beautiful events with ease.',
        badgeText: 'Best Value',
        badgeStyle: 'Filled',
        badgeColor: '#7C3AED',
        billingCycle: 'Monthly',
        currency: 'INR (₹) - Indian Rupee',
        price: '999',
        compareAtPrice: '1299',
        customUnitLabel: '/month',
        freeTrial: true,
        trialDays: '7',
        ctaText: 'Choose This Plan',
        ctaLinkType: 'checkout',
        ctaLinkUrl: '/checkout?plan=pro',
        features: [
            { id: 'f1', text: 'Create Events', value: 'Unlimited' },
            { id: 'f2', text: 'Invitations per Event', value: '500' },
            { id: 'f3', text: 'Guests per Event', value: '1000' },
            { id: 'f4', text: 'Custom Domains', value: '1' },
            { id: 'f5', text: 'Storage', value: '10 GB' },
            { id: 'f6', text: 'Priority Support', value: 'Included' },
        ],
        isActive: true,
        isHighlighted: true,
        allowUpgrade: true,
        icon: 'crown',
        color: '#7C3AED',
        createdBy: 'Rohan Mehta',
        createdOn: '18 May 2025, 11:30 AM',
    },
    {
        id: '2',
        planFor: 'Companies',
        name: 'Professional',
        description: 'For growing event management agencies managing multiple clients.',
        badgeText: 'Most Popular',
        badgeStyle: 'Soft Filled',
        badgeColor: '#2563EB',
        billingCycle: 'Monthly',
        currency: 'INR (₹) - Indian Rupee',
        price: '4999',
        compareAtPrice: '5999',
        customUnitLabel: '/month',
        freeTrial: false,
        trialDays: '0',
        ctaText: 'Choose Professional',
        ctaLinkType: 'checkout',
        ctaLinkUrl: '/checkout?plan=pro-agency',
        features: [
            { id: 'f1', text: 'Active Events / Month', value: 'Up to 100' },
            { id: 'f2', text: 'Guests per Event', value: '20,000' },
            { id: 'f3', text: 'Client Management', value: 'Included' },
            { id: 'f4', text: 'Team Collaboration', value: '10 Users' },
            { id: 'f5', text: 'White Labeling', value: 'Included' },
        ],
        isActive: true,
        isHighlighted: false,
        allowUpgrade: true,
        icon: 'building',
        color: '#2563EB',
        createdBy: 'Rohan Mehta',
        createdOn: '18 May 2025, 02:15 PM',
    },
];

const DEFAULT_MATRIX_FEATURES: MatrixFeatureRow[] = [
    {
        id: 'm1',
        featureTitle: 'Beautiful Templates',
        description: 'Access professionally designed wedding & event app templates',
        category: 'Core Features',
        values: { Free: '✓', Basic: '✓', Pro: '✓', Premium: '✓', Companies: '✓' },
        status: 'Active',
    },
    {
        id: 'm2',
        featureTitle: 'Custom Domain',
        description: 'Use your own domain name for event invitation links',
        category: 'Branding',
        values: { Free: '✗', Basic: '✓', Pro: '✓', Premium: '✓', Companies: '✓' },
        status: 'Active',
    },
    {
        id: 'm3',
        featureTitle: 'Live Streaming',
        description: 'Stream live event video directly to guests',
        category: 'Media',
        values: { Free: '✗', Basic: 'Limited', Pro: '✓', Premium: '✓', Companies: '✓' },
        status: 'Active',
    },
    {
        id: 'm4',
        featureTitle: 'QR Code Access',
        description: 'Generate fast contact & RSVP check-in QR codes',
        category: 'Core Features',
        values: { Free: '✗', Basic: '✓', Pro: '✓', Premium: '✓', Companies: '✓' },
        status: 'Active',
    },
    {
        id: 'm5',
        featureTitle: 'Guest Management',
        description: 'Track RSVPs, dietary needs, and check-in status',
        category: 'Guests',
        values: { Free: 'Up to 50', Basic: 'Up to 500', Pro: 'Up to 2000', Premium: 'Unlimited', Companies: 'Unlimited' },
        status: 'Active',
    },
    {
        id: 'm6',
        featureTitle: 'Priority Support',
        description: 'Dedicated 24/7 priority customer support helpline',
        category: 'Support',
        values: { Free: '✗', Basic: '✗', Pro: '✓', Premium: '✓', Companies: '✓' },
        status: 'Active',
    },
    {
        id: 'm7',
        featureTitle: 'Remove Branding',
        description: 'Hide standard EventCraft footer logo & copyright',
        category: 'Branding',
        values: { Free: '✗', Basic: '✗', Pro: '✓', Premium: '✓', Companies: '✓' },
        status: 'Active',
    },
    {
        id: 'm8',
        featureTitle: 'Analytics & Reports',
        description: 'Track pageviews, guest engagement, and RSVP conversion rates',
        category: 'Analytics',
        values: { Free: '✗', Basic: 'Basic', Pro: '✓', Premium: '✓', Companies: '✓' },
        status: 'Active',
    },
    {
        id: 'm9',
        featureTitle: 'Multiple Event Organizer',
        description: 'Manage multiple concurrent events from a single account',
        category: 'Management',
        values: { Free: '✗', Basic: '✗', Pro: 'partially', Premium: '✓', Companies: '✓' },
        status: 'Active',
    },
    {
        id: 'm10',
        featureTitle: 'Team Collaboration',
        description: 'Invite sub-admins and staff to manage event details',
        category: 'Management',
        values: { Free: '✗', Basic: '✗', Pro: 'partially', Premium: '✓', Companies: '✓' },
        status: 'Active',
    },
];

const COLOR_OPTIONS = [
    { name: 'Purple', hex: '#7C3AED' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Orange', hex: '#F97316' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Cyan', hex: '#06B6D4' },
    { name: 'Violet', hex: '#8B5CF6' },
    { name: 'Gray', hex: '#6B7280' },
];

export function PricingPlansBuilderContent() {
    const [activeTab, setActiveTab] = useState<'matrix' | 'plans'>('matrix');
    const { data: dbPlans, isLoading: isPlansLoading } = usePricingPlansData();
    const [plans, setPlans] = useState<PricingPlanItem[]>(DEFAULT_PLANS);
    const [selectedPlanId, setSelectedPlanId] = useState<string>('1');
    const [matrixFeatures, setMatrixFeatures] = useState<MatrixFeatureRow[]>(DEFAULT_MATRIX_FEATURES);

    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
    const savePlansMutation = useSavePricingPlans();
    const isSaving = savePlansMutation.isPending;
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        if (dbPlans && dbPlans.length > 0) {
            const mapped: PricingPlanItem[] = dbPlans.map((p, idx) => ({
                id: String(p.id || idx + 1),
                planFor: p.target_type === 'companies' ? 'Companies' : 'Individuals',
                name: p.plan_name,
                description: p.subtitle || '',
                badgeText: p.badge_text || '',
                badgeStyle: (p.badge_style ? (p.badge_style.replace('-', ' ') as BadgeStyleType) : 'Filled'),
                badgeColor: '#7C3AED',
                billingCycle: 'Monthly',
                currency: p.currency === '₹' ? 'INR (₹) - Indian Rupee' : 'USD ($) - US Dollar',
                price: String(p.price_monthly || 0),
                compareAtPrice: String(p.price_yearly || 0),
                customUnitLabel: p.period_label || '/month',
                freeTrial: false,
                trialDays: '0',
                ctaText: 'Choose This Plan',
                ctaLinkType: 'checkout',
                ctaLinkUrl: '/checkout',
                features: (p.features_json || []).map((f: any, fIdx: number) => ({
                    id: `f_${fIdx}`,
                    text: f.label || '',
                    value: f.included ? 'Included' : 'Not Included',
                })),
                isActive: p.is_active !== false,
                isHighlighted: !!p.is_popular,
                allowUpgrade: true,
                icon: 'crown',
                color: '#7C3AED',
                createdBy: 'Admin',
                createdOn: new Date().toLocaleDateString(),
            }));
            setPlans(mapped);
        }
    }, [dbPlans]);

    const handleSave = async () => {
        // In translation mode only the selected plan's translated text is
        // written; the plan rows themselves are untouched.
        if (await handleTranslationSave(translation, 'Pricing Plan')) return;
        const payload: PricingPlan[] = plans.map((p, index) => ({
            plan_name: p.name,
            subtitle: p.description,
            target_type: p.planFor === 'Individuals' ? 'individuals' : 'companies',
            currency: p.currency.includes('INR') ? '₹' : '$',
            price_monthly: parseFloat(p.price) || 0,
            price_yearly: parseFloat(p.price) || 0,
            period_label: p.customUnitLabel || '/Month',
            badge_text: p.badgeText,
            badge_style: p.badgeStyle.toLowerCase().replace(' ', '-') as any,
            is_popular: p.badgeText === 'Most Popular' || p.badgeText === 'Best Value',
            features_json: p.features.map((f) => ({ label: f.text, included: f.value !== 'Not Included' })),
            is_active: p.isActive,
            sort_order: index,
        }));

        savePlansMutation.mutate(payload);
    };

    // Drag and Drop States
    const [draggedMatrixIdx, setDraggedMatrixIdx] = useState<number | null>(null);
    const [draggedFeatIdx, setDraggedFeatIdx] = useState<number | null>(null);

    // Feature Limit Form State
    const [newFeatureText, setNewFeatureText] = useState('');
    const [newFeatureValue, setNewFeatureValue] = useState('');

    // Add Plan Badge Modal State
    const [badgeModalOpen, setBadgeModalOpen] = useState(false);
    const [customBadgeText, setCustomBadgeText] = useState('');
    const [customBadgeStyle, setCustomBadgeStyle] = useState<BadgeStyleType>('Filled');
    const [customBadgeColor, setCustomBadgeColor] = useState('#7C3AED');

    // Matrix Feature Modal State (Add / Edit)
    const [matrixModalOpen, setMatrixModalOpen] = useState(false);
    const [editingMatrixId, setEditingMatrixId] = useState<string | null>(null);
    const [featureTitle, setFeatureTitle] = useState('');
    const [featureIcon, setFeatureIcon] = useState('video');
    const [featureDesc, setFeatureDesc] = useState('');

    const [planAvailability, setPlanAvailability] = useState({
        Free: { notIncluded: false, limit: '' },
        Basic: { notIncluded: false, limit: '' },
        Pro: { notIncluded: false, limit: '' },
        Premium: { notIncluded: false, limit: '' },
        Companies: { notIncluded: false, limit: '' },
    });
    const [featureActive, setFeatureActive] = useState(true);

    const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

    // Per-form translation mode (?lang=<id>), same as Hero Section. This form
    // edits one plan at a time, so the slot follows the SELECTED plan.
    // Field keys match the `pricing-plans` entry in the backend FIELD_CATALOG,
    // registered at page_slug='' with the plan row id as record_id.
    const translationFields = [
        { key: 'plan_name', label: 'Plan Name', type: 'input' as const, value: currentPlan?.name || '' },
        { key: 'subtitle', label: 'Subtitle', type: 'textarea' as const, value: currentPlan?.description || '' },
        { key: 'period_label', label: 'Period Label', type: 'input' as const, value: currentPlan?.customUnitLabel || '' },
        { key: 'badge_text', label: 'Badge Text', type: 'input' as const, value: currentPlan?.badgeText || '' },
    ];
    const translation = useSectionTranslation({
        section: 'pricing-plans',
        recordId: Number(currentPlan?.id) || undefined,
        fields: translationFields,
    });
    const { isTranslationMode, bind } = translation;
    // Pricing, currency, features and badge styling are shared across
    // languages - they are edited from the English version only.
    const sharedOnly = cn(isTranslationMode && 'opacity-50 pointer-events-none');

    const updateCurrentPlan = (updates: Partial<PricingPlanItem>) => {
        setPlans((prev) => prev.map((p) => (p.id === currentPlan.id ? { ...p, ...updates } : p)));
    };

    // Matrix Drag and Drop Handlers
    const handleMatrixDragStart = (idx: number) => {
        setDraggedMatrixIdx(idx);
    };

    const handleMatrixDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleMatrixDrop = (targetIdx: number) => {
        if (draggedMatrixIdx === null || draggedMatrixIdx === targetIdx) return;
        setMatrixFeatures((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(draggedMatrixIdx, 1);
            updated.splice(targetIdx, 0, moved);
            return updated;
        });
        setDraggedMatrixIdx(null);
        toast.success('Matrix features reordered successfully!');
    };

    // Plan Features Drag and Drop Handlers
    const handleFeatDragStart = (idx: number) => {
        setDraggedFeatIdx(idx);
    };

    const handleFeatDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleFeatDrop = (targetIdx: number) => {
        if (draggedFeatIdx === null || draggedFeatIdx === targetIdx) return;
        const updated = [...currentPlan.features];
        const [moved] = updated.splice(draggedFeatIdx, 1);
        updated.splice(targetIdx, 0, moved);
        updateCurrentPlan({ features: updated });
        setDraggedFeatIdx(null);
        toast.success('Plan feature limits reordered successfully!');
    };

    const handleAddFeature = () => {
        if (!newFeatureText.trim()) return;
        const newFeat: PricingFeatureLimit = {
            id: Date.now().toString(),
            text: newFeatureText.trim(),
            value: newFeatureValue.trim() || 'Included',
        };
        updateCurrentPlan({
            features: [...currentPlan.features, newFeat],
        });
        setNewFeatureText('');
        setNewFeatureValue('');
        toast.success('Feature limit added to plan.');
    };

    const handleRemoveFeature = (id: string) => {
        updateCurrentPlan({
            features: currentPlan.features.filter((f) => f.id !== id),
        });
        toast.info('Feature limit removed.');
    };

    const handleOpenBadgeModal = () => {
        setCustomBadgeText(currentPlan.badgeText || 'Best Value');
        setCustomBadgeStyle(currentPlan.badgeStyle || 'Filled');
        setCustomBadgeColor(currentPlan.badgeColor || '#7C3AED');
        setBadgeModalOpen(true);
    };

    const handleSaveCustomBadge = () => {
        if (!customBadgeText.trim()) {
            toast.error('Please enter badge text.');
            return;
        }
        updateCurrentPlan({
            badgeText: customBadgeText.trim(),
            badgeStyle: customBadgeStyle,
            badgeColor: customBadgeColor,
        });
        setBadgeModalOpen(false);
        toast.success('Custom badge updated successfully!');
    };

    const handleOpenAddMatrixModal = (rowToEdit?: MatrixFeatureRow) => {
        if (rowToEdit) {
            setEditingMatrixId(rowToEdit.id);
            setFeatureTitle(rowToEdit.featureTitle);
            setFeatureDesc(rowToEdit.description);
            setFeatureIcon(rowToEdit.icon || 'video');
            setFeatureActive(rowToEdit.status === 'Active');

            const computeLimit = (val: string) => {
                if (val === '✗') return { notIncluded: true, limit: '' };
                if (val === '✓') return { notIncluded: false, limit: '' };
                return { notIncluded: false, limit: val };
            };

            setPlanAvailability({
                Free: computeLimit(rowToEdit.values.Free),
                Basic: computeLimit(rowToEdit.values.Basic),
                Pro: computeLimit(rowToEdit.values.Pro),
                Premium: computeLimit(rowToEdit.values.Premium),
                Companies: computeLimit(rowToEdit.values.Companies),
            });
        } else {
            setEditingMatrixId(null);
            setFeatureTitle('');
            setFeatureDesc('');
            setFeatureIcon('video');
            setFeatureActive(true);
            setPlanAvailability({
                Free: { notIncluded: true, limit: '' },
                Basic: { notIncluded: false, limit: '' },
                Pro: { notIncluded: false, limit: '' },
                Premium: { notIncluded: false, limit: '' },
                Companies: { notIncluded: false, limit: '' },
            });
        }
        setMatrixModalOpen(true);
    };

    const handleSaveMatrixFeature = () => {
        if (!featureTitle.trim()) {
            toast.error('Please enter feature title.');
            return;
        }

        const resolveVal = (obj: { notIncluded: boolean; limit: string }) => {
            if (obj.notIncluded) return '✗';
            if (!obj.limit.trim()) return '✓';
            return obj.limit.trim();
        };

        const values = {
            Free: resolveVal(planAvailability.Free),
            Basic: resolveVal(planAvailability.Basic),
            Pro: resolveVal(planAvailability.Pro),
            Premium: resolveVal(planAvailability.Premium),
            Companies: resolveVal(planAvailability.Companies),
        };

        if (editingMatrixId) {
            setMatrixFeatures((prev) =>
                prev.map((r) =>
                    r.id === editingMatrixId
                        ? {
                            ...r,
                            featureTitle: featureTitle.trim(),
                            description: featureDesc.trim(),
                            icon: featureIcon,
                            values,
                            status: featureActive ? 'Active' : 'Inactive',
                        }
                        : r
                )
            );
            toast.success('Matrix feature updated successfully!');
        } else {
            const newRow: MatrixFeatureRow = {
                id: Date.now().toString(),
                featureTitle: featureTitle.trim(),
                description: featureDesc.trim(),
                icon: featureIcon,
                category: 'Features',
                values,
                status: featureActive ? 'Active' : 'Inactive',
            };
            setMatrixFeatures((prev) => [...prev, newRow]);
            toast.success('New matrix feature added!');
        }

        setMatrixModalOpen(false);
    };

    const [resetDialogOpen, setResetDialogOpen] = useState(false);

    const handleReset = () => {
        setPlans(DEFAULT_PLANS);
        setMatrixFeatures(DEFAULT_MATRIX_FEATURES);
        toast.info('Pricing Plan settings reset to defaults.');
    };

    // Helper to render badge based on style & color
    const renderBadgePreview = (text: string, style: BadgeStyleType, color: string) => {
        if (!text) return null;
        switch (style) {
            case 'Filled':
                return (
                    <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs"
                        style={{ backgroundColor: color }}
                    >
                        {text}
                    </span>
                );
            case 'Outline':
                return (
                    <span
                        className="inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-card"
                        style={{ borderColor: color, color: color }}
                    >
                        {text}
                    </span>
                );
            case 'Soft Filled':
                return (
                    <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${color}18`, color: color }}
                    >
                        {text}
                    </span>
                );
            case 'Soft Outline':
                return (
                    <span
                        className="inline-flex items-center rounded-full border-2 border-dashed px-3 py-1 text-xs font-bold uppercase tracking-wider bg-card"
                        style={{ borderColor: `${color}80`, color: color }}
                    >
                        {text}
                    </span>
                );
            default:
                return null;
        }
    };

    const renderPlanIcon = (iconName: string) => {
        switch (iconName) {
            case 'star':
                return <Star className="h-6 w-6 text-primary" />;
            case 'zap':
                return <Zap className="h-6 w-6 text-primary" />;
            case 'gem':
                return <Gem className="h-6 w-6 text-primary" />;
            case 'shield':
                return <Shield className="h-6 w-6 text-primary" />;
            case 'rocket':
                return <Rocket className="h-6 w-6 text-primary" />;
            case 'gift':
                return <Gift className="h-6 w-6 text-primary" />;
            case 'building':
                return <Building2 className="h-6 w-6 text-primary" />;
            case 'crown':
            default:
                return <Crown className="h-6 w-6 text-primary" />;
        }
    };

    // Helper for matrix table value icon/text
    const renderMatrixCell = (val: string) => {
        if (val === '✓') {
            return <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mx-auto font-bold" />;
        }
        if (val === '✗') {
            return <X className="h-4 w-4 text-rose-500 dark:text-rose-400 mx-auto font-bold" />;
        }
        if (val === 'partially' || val === 'partially_included') {
            return (
                <div className="flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 dark:text-amber-400 font-bold" />
                </div>
            );
        }
        return <span className="font-semibold text-foreground">{val}</span>;
    };

    return (
        <div className="space-y-4 text-foreground">
            {/* Top Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-3.5">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        {activeTab === 'matrix' ? 'All Plans Include Features' : 'Add Pricing Plan'}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {activeTab === 'matrix'
                            ? 'Manage the list of powerful features that are included in every pricing plan.'
                            : 'Create a new pricing plan for Individuals or Event Management Companies.'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewOpen(true)}
                        className="h-9 px-3 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1.5"
                    >
                        <Eye className="h-3.5 w-3.5 text-emerald-600" /> Live Preview
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/pricing', '_blank')}
                        className="h-9 px-3 text-xs font-semibold text-foreground border-border bg-card hover:bg-accent gap-1.5"
                    >
                        View Public Page <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* View Switcher Tabs */}
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
                <TabsList className="bg-muted p-1 border border-border">
                    <TabsTrigger
                        value="matrix"
                        className="text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground text-muted-foreground"
                    >
                        <Grid className="h-3.5 w-3.5" /> All Plans Include Features Matrix
                    </TabsTrigger>
                    <TabsTrigger
                        value="plans"
                        className="text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground text-muted-foreground"
                    >
                        <DollarSign className="h-3.5 w-3.5" /> Add / Edit Pricing Plans
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Features Comparison Matrix */}
                <TabsContent value="matrix" className="mt-3 space-y-4">
                    <Card className="shadow-xs border-border bg-card">
                        <CardHeader className="py-3.5 px-4 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-card rounded-t-xl">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base font-bold text-card-foreground">All Plans Include Powerful Features</CardTitle>
                                    <Badge className="bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        Visible on Pricing Page
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    Add and manage the features that will be included in every plan category.
                                </CardDescription>
                            </div>
                            <Button
                                onClick={() => handleOpenAddMatrixModal()}
                                size="sm"
                                variant="outline"
                                className="h-9 px-3 text-xs font-bold text-foreground border-border bg-card hover:bg-accent gap-1.5"
                            >
                                <Plus className="h-4 w-4 text-primary" /> Add New Feature
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="border-b border-border font-bold text-muted-foreground">
                                    <tr className="divide-x divide-border">
                                        <th className="p-3 bg-muted/50 min-w-[200px]">Features</th>
                                        <th className="p-3 text-center bg-muted/50 text-foreground min-w-[90px]">Free</th>
                                        <th className="p-3 text-center bg-blue-50/40 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 min-w-[90px]">Basic</th>
                                        <th className="p-3 text-center bg-rose-50/40 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 min-w-[90px]">Pro</th>
                                        <th className="p-3 text-center bg-amber-50/40 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 min-w-[90px]">Premium</th>
                                        <th className="p-3 text-center bg-primary/10 text-primary min-w-[90px]">Companies</th>
                                        <th className="p-3 text-center bg-muted/50 w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border font-medium">
                                    {matrixFeatures.map((row, index) => (
                                        <tr
                                            key={row.id}
                                            draggable
                                            onDragStart={() => handleMatrixDragStart(index)}
                                            onDragOver={handleMatrixDragOver}
                                            onDrop={() => handleMatrixDrop(index)}
                                            className={cn(
                                                'hover:bg-muted/50 transition-colors divide-x divide-border',
                                                draggedMatrixIdx === index ? 'opacity-40 bg-primary/10 ring-2 ring-primary/30' : ''
                                            )}
                                        >
                                            {/* Feature Title & Tooltip */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary cursor-grab active:cursor-grabbing shrink-0" />
                                                    <span className="font-bold text-foreground">{row.featureTitle}</span>
                                                    <span title={row.description} className="cursor-help text-muted-foreground hover:text-foreground">
                                                        <Info className="h-3.5 w-3.5" />
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Plan Values */}
                                            <td className="p-3 text-center bg-muted/20">{renderMatrixCell(row.values.Free)}</td>
                                            <td className="p-3 text-center bg-blue-50/10 dark:bg-blue-950/10">{renderMatrixCell(row.values.Basic)}</td>
                                            <td className="p-3 text-center bg-rose-50/10 dark:bg-rose-950/10">{renderMatrixCell(row.values.Pro)}</td>
                                            <td className="p-3 text-center bg-amber-50/10 dark:bg-amber-950/10">{renderMatrixCell(row.values.Premium)}</td>
                                            <td className="p-3 text-center bg-primary/5">{renderMatrixCell(row.values.Companies)}</td>

                                            {/* Action Buttons */}
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAddMatrixModal(row)}
                                                        className="h-7 w-7 rounded-md border border-border text-muted-foreground hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 flex items-center justify-center transition-all"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setMatrixFeatures((prev) => prev.filter((r) => r.id !== row.id));
                                                            toast.info('Feature removed from matrix.');
                                                        }}
                                                        className="h-7 w-7 rounded-md border border-red-200 dark:border-red-900/60 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 flex items-center justify-center transition-all"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Info Banner at Bottom of Matrix */}
                            <div className="m-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2 text-xs text-primary">
                                <Info className="h-4 w-4 text-primary shrink-0" />
                                <span>These features will be shown on your pricing comparison section and applied to all plan categories.</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legend Footer Bar */}
                    <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground font-medium px-2">
                        <div className="flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 font-bold" />
                            <span>Included</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-500 dark:text-amber-400 font-bold" />
                            <span>Partially Included</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <X className="h-4 w-4 text-rose-500 dark:text-rose-400 font-bold" />
                            <span>Not Included</span>
                        </div>
                        <div>
                            <span className="font-bold text-foreground">Text/Number</span> = Limit
                        </div>
                        <div>
                            <span className="font-bold text-foreground">–</span> Not Applicable
                        </div>
                    </div>
                </TabsContent>

                {/* Tab 2: Plan Add/Edit Form & Real-time Live Preview */}
                <TabsContent value="plans" className="mt-3">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                        {/* Left Column: Form Sections 1 to 5 (7 Cols) */}
                        <div className="xl:col-span-7 space-y-4">
                            {/* Plan Switcher Bar */}
                            <Card className="shadow-xs border-border bg-primary/5">
                                <CardContent className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-foreground">Editing Plan:</span>
                                        <div className="flex gap-2">
                                            {plans.map((p) => (
                                                <Button
                                                    key={p.id}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedPlanId(p.id)}
                                                    className={cn(
                                                        'h-8 text-xs font-bold border-border',
                                                        selectedPlanId === p.id
                                                            ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                                            : 'bg-card text-foreground hover:bg-accent'
                                                    )}
                                                >
                                                    {p.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] bg-card font-semibold text-muted-foreground border-border">
                                        {plans.length} Total Plans
                                    </Badge>

                                </CardContent>
                            </Card>

                            {/* Languages + translation mode - scoped to the plan
                                selected above, since each plan is its own slot. */}
                            {currentPlan?.id ? (
                                <div className="flex flex-col gap-3">
                                    <div className="w-full self-end lg:w-72">
                                        <TranslationSideCard
                                            section="pricing-plans"
                                            recordId={Number(currentPlan.id) || undefined}
                                            activeLanguageId={translation.activeLanguage?.id ?? null}
                                            buildHref={translation.buildHref}
                        canTranslate={translation.canTranslate}
                                            fields={translationFields}
                                        />
                                    </div>
                                    <div className="order-first min-w-0">
                                        <TranslationModeBanner translation={translation} label={currentPlan.name} />
                                    </div>
                                </div>
                            ) : null}

                            {/* Section 1: Basic Information */}
                            <Card className="shadow-xs border-border bg-card">
                                <CardHeader className="py-3 px-4 border-b border-border bg-muted/40">
                                    <CardTitle className="text-xs font-bold text-card-foreground flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {/* Plan Name */}
                                    <BuilderCountedInput
                                        label="Plan Name"
                                        required
                                        maxLength={60}
                                        {...bind('plan_name', currentPlan.name, (val) => updateCurrentPlan({ name: val }))}
                                        placeholder={isTranslationMode ? currentPlan.name : 'e.g., Pro Plan'}
                                        inputClassName={cn(
                                            '!h-9 text-xs border-border bg-card text-foreground',
                                            !currentPlan.name?.trim() && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                        )}
                                    />

                                    {/* Plan For */}
                                    <div>
                                        <Label className="text-xs font-semibold text-foreground">Plan For *</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                                            <button
                                                type="button"
                                                onClick={() => updateCurrentPlan({ planFor: 'Individuals' })}
                                                className={cn(
                                                    'flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                                                    currentPlan.planFor === 'Individuals'
                                                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                                        : 'border-border hover:border-slate-300 dark:hover:border-slate-600 bg-card'
                                                )}
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-foreground">Individuals</div>
                                                    <div className="text-[11px] text-muted-foreground leading-tight">For personal use to create and manage events.</div>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => updateCurrentPlan({ planFor: 'Companies' })}
                                                className={cn(
                                                    'flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                                                    currentPlan.planFor === 'Companies'
                                                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                                        : 'border-border hover:border-slate-300 dark:hover:border-slate-600 bg-card'
                                                )}
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-foreground">Event Management Companies</div>
                                                    <div className="text-[11px] text-muted-foreground leading-tight">For businesses and agencies managing multiple events.</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Plan Description */}
                                    <BuilderCountedTextarea
                                        label="Plan Description"
                                        required
                                        maxLength={200}
                                        rows={3}
                                        {...bind('subtitle', currentPlan.description, (val) => updateCurrentPlan({ description: val }))}
                                        placeholder={isTranslationMode ? currentPlan.description : 'A short description of what this plan offers...'}
                                    />

                                    {/* Plan Badge (Optional) */}
                                    <div>
                                        <Label className="text-xs font-semibold text-foreground">Plan Badge (Optional)</Label>
                                        <Input
                                            value={isTranslationMode ? (translation.values.badge_text ?? '') : currentPlan.badgeText}
                                            onChange={(e) =>
                                                isTranslationMode
                                                    ? translation.setValue('badge_text', e.target.value)
                                                    : updateCurrentPlan({ badgeText: e.target.value })
                                            }
                                            placeholder={isTranslationMode ? currentPlan.badgeText : 'e.g., Best Value, Most Popular'}
                                            className="h-9 text-xs mt-1.5 bg-card border-input text-foreground"
                                        />

                                        {/* Preset Pills */}
                                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                            {[
                                                { label: 'Popular', color: '#EC4899', style: 'Outline' },
                                                { label: 'Best Value', color: '#10B981', style: 'Outline' },
                                                { label: 'Recommended', color: '#3B82F6', style: 'Outline' },
                                                { label: 'New', color: '#8B5CF6', style: 'Outline' },
                                            ].map((preset) => (
                                                <button
                                                    key={preset.label}
                                                    type="button"
                                                    onClick={() =>
                                                        updateCurrentPlan({
                                                            badgeText: preset.label,
                                                            badgeColor: preset.color,
                                                            badgeStyle: preset.style as BadgeStyleType,
                                                        })
                                                    }
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-90',
                                                        currentPlan.badgeText === preset.label ? 'ring-2 ring-primary font-bold' : ''
                                                    )}
                                                    style={{ borderColor: `${preset.color}60`, color: preset.color, backgroundColor: `${preset.color}0D` }}
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: preset.color }} />
                                                    {preset.label}
                                                </button>
                                            ))}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleOpenBadgeModal}
                                                className="h-7 px-3 text-xs font-bold text-primary border-primary/30 bg-primary/10 hover:bg-primary/20 rounded-full"
                                            >
                                                + Custom
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section 2: Pricing Details */}
                            <Card className="shadow-xs border-border bg-card">
                                <CardHeader className="py-3 px-4 border-b border-border bg-muted/40">
                                    <CardTitle className="text-xs font-bold text-card-foreground flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">2</span>
                                        Pricing Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {/* Billing Cycle */}
                                    <div>
                                        <Label className="text-xs font-semibold text-foreground">Billing Cycle *</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                                            <button
                                                type="button"
                                                onClick={() => updateCurrentPlan({ billingCycle: 'Monthly', customUnitLabel: '/month' })}
                                                className={cn(
                                                    'flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                                                    currentPlan.billingCycle === 'Monthly'
                                                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                                        : 'border-border hover:border-slate-300 dark:hover:border-slate-600 bg-card'
                                                )}
                                            >
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                    📅
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-foreground">Monthly</div>
                                                    <div className="text-[11px] text-muted-foreground leading-tight">Billed every month</div>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => updateCurrentPlan({ billingCycle: 'Yearly', customUnitLabel: '/year' })}
                                                className={cn(
                                                    'flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all relative',
                                                    currentPlan.billingCycle === 'Yearly'
                                                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                                        : 'border-border hover:border-slate-300 dark:hover:border-slate-600 bg-card'
                                                )}
                                            >
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                    🔄
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-foreground">Yearly</span>
                                                        <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[9px] font-bold px-1.5 py-0">
                                                            Save up to 20%
                                                        </Badge>
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground leading-tight">Billed every year</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Currency Select */}
                                    <div>
                                        <Label className="text-xs font-semibold text-foreground">Currency *</Label>
                                        <Select value={currentPlan.currency} onValueChange={(val) => updateCurrentPlan({ currency: val })}>
                                            <SelectTrigger className="h-9 text-xs mt-1.5 bg-card border-input text-foreground">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                                <SelectItem value="INR (₹) - Indian Rupee">INR (₹) – Indian Rupee</SelectItem>
                                                <SelectItem value="USD ($) - US Dollar">USD ($) – US Dollar</SelectItem>
                                                <SelectItem value="EUR (€) - Euro">EUR (€) – Euro</SelectItem>
                                                <SelectItem value="GBP (£) - British Pound">GBP (£) – British Pound</SelectItem>
                                                <SelectItem value="AED (AED) - UAE Dirham">AED (AED) – UAE Dirham</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Price & Compare Price */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs font-semibold text-foreground">Price (Monthly) *</Label>
                                            <div className="relative mt-1.5">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                                                <Input
                                                    type="text"
                                                    value={currentPlan.price}
                                                    onChange={(e) => updateCurrentPlan({ price: e.target.value })}
                                                    placeholder="999"
                                                    className="h-9 text-xs pl-7 font-bold text-foreground bg-card border-input"
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1">Enter 0 for a free plan</p>
                                        </div>

                                        <div>
                                            <Label className="text-xs font-semibold text-foreground">Compare At Price (Optional)</Label>
                                            <div className="relative mt-1.5">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                                                <Input
                                                    type="text"
                                                    value={currentPlan.compareAtPrice}
                                                    onChange={(e) => updateCurrentPlan({ compareAtPrice: e.target.value })}
                                                    placeholder="1299"
                                                    className="h-9 text-xs pl-7 text-foreground bg-card border-input"
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1">Show crossed-out price (e.g., MRP)</p>
                                        </div>
                                    </div>

                                    {/* Free Trial Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <Switch checked={currentPlan.freeTrial} onCheckedChange={(val) => updateCurrentPlan({ freeTrial: val })} />
                                            <div>
                                                <div className="text-xs font-bold text-foreground">Free Trial</div>
                                                <div className="text-[11px] text-muted-foreground">Allow users to try this plan for a limited time</div>
                                            </div>
                                        </div>

                                        {currentPlan.freeTrial ? (
                                            <div className="flex items-center gap-1.5">
                                                <Input
                                                    type="text"
                                                    value={currentPlan.trialDays}
                                                    onChange={(e) => updateCurrentPlan({ trialDays: e.target.value })}
                                                    placeholder="7"
                                                    className="h-8 w-16 text-xs text-center font-bold bg-card border-input text-foreground"
                                                />
                                                <span className="text-xs text-foreground font-medium">days</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section 3: Features & Limits */}
                            <Card className="shadow-xs border-border bg-card">
                                <CardHeader className="py-3 px-4 border-b border-border bg-muted/40 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xs font-bold text-card-foreground flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
                                        Features & Limits
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <Label className="text-xs font-semibold text-foreground">Plan Includes *</Label>

                                    {/* Features List Table with Drag and Drop */}
                                    <div className="space-y-2 border border-border rounded-lg p-2 bg-muted/30">
                                        {currentPlan.features.map((feat, index) => (
                                            <div
                                                key={feat.id}
                                                draggable
                                                onDragStart={() => handleFeatDragStart(index)}
                                                onDragOver={handleFeatDragOver}
                                                onDrop={() => handleFeatDrop(index)}
                                                className={cn(
                                                    'flex items-center gap-2 p-2 bg-card rounded-md border border-border text-xs shadow-xs transition-all',
                                                    draggedFeatIdx === index ? 'opacity-40 bg-primary/10 border-primary' : 'hover:border-primary/50'
                                                )}
                                            >
                                                <GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary cursor-grab active:cursor-grabbing shrink-0" />
                                                <span className="font-semibold text-foreground flex-1">{feat.text}</span>
                                                <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded text-[11px]">{feat.value}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFeature(feat.id)}
                                                    className="p-1 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Feature Row */}
                                    <div className="flex gap-2 pt-1">
                                        <Input
                                            value={newFeatureText}
                                            onChange={(e) => setNewFeatureText(e.target.value)}
                                            placeholder="Feature Name (e.g. Storage)"
                                            className="h-9 text-xs flex-1 bg-card border-input text-foreground"
                                        />
                                        <Input
                                            value={newFeatureValue}
                                            onChange={(e) => setNewFeatureValue(e.target.value)}
                                            placeholder="Limit (e.g. 10 GB)"
                                            className="h-9 text-xs w-32 bg-card border-input text-foreground"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddFeature}
                                        className="w-full h-9 text-xs font-bold text-primary border-primary/30 bg-primary/10 hover:bg-primary/20 gap-1.5"
                                    >
                                        <Plus className="h-4 w-4" /> Add Feature / Limit
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Section 4: Plan Settings */}
                            <Card className="shadow-xs border-border bg-card">
                                <CardHeader className="py-3 px-4 border-b border-border bg-muted/40">
                                    <CardTitle className="text-xs font-bold text-card-foreground flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">4</span>
                                        Plan Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                                        <div>
                                            <div className="text-xs font-bold text-foreground">Active Plan</div>
                                            <div className="text-[11px] text-muted-foreground">Make this plan available for users to subscribe</div>
                                        </div>
                                        <Switch checked={currentPlan.isActive} onCheckedChange={(val) => updateCurrentPlan({ isActive: val })} />
                                    </div>

                                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                                        <div>
                                            <div className="text-xs font-bold text-foreground">Highlight this plan</div>
                                            <div className="text-[11px] text-muted-foreground">Display this plan as highlighted on the pricing page</div>
                                        </div>
                                        <Switch checked={currentPlan.isHighlighted} onCheckedChange={(val) => updateCurrentPlan({ isHighlighted: val })} />
                                    </div>

                                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                                        <div>
                                            <div className="text-xs font-bold text-foreground">Allow Upgrade / Downgrade</div>
                                            <div className="text-[11px] text-muted-foreground">Allow users to upgrade or downgrade to this plan</div>
                                        </div>
                                        <Switch checked={currentPlan.allowUpgrade} onCheckedChange={(val) => updateCurrentPlan({ allowUpgrade: val })} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section 5: Additional Settings (Optional) */}
                            <Card className="shadow-xs border-border bg-card">
                                <CardHeader className="py-3 px-4 border-b border-border bg-muted/40">
                                    <CardTitle className="text-xs font-bold text-card-foreground flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">5</span>
                                        Additional Settings (Optional)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {/* Icon Selector */}
                                    <div>
                                        <Label className="text-xs font-semibold text-foreground">Plan Icon (Optional)</Label>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            {[
                                                { id: 'crown', label: 'Crown', icon: <Crown className="h-4 w-4" /> },
                                                { id: 'star', label: 'Star', icon: <Star className="h-4 w-4" /> },
                                                { id: 'zap', label: 'Zap', icon: <Zap className="h-4 w-4" /> },
                                                { id: 'gem', label: 'Gem', icon: <Gem className="h-4 w-4" /> },
                                                { id: 'shield', label: 'Shield', icon: <Shield className="h-4 w-4" /> },
                                                { id: 'rocket', label: 'Rocket', icon: <Rocket className="h-4 w-4" /> },
                                                { id: 'gift', label: 'Gift', icon: <Gift className="h-4 w-4" /> },
                                            ].map((iconObj) => (
                                                <button
                                                    key={iconObj.id}
                                                    type="button"
                                                    onClick={() => updateCurrentPlan({ icon: iconObj.id })}
                                                    className={cn(
                                                        'h-10 w-10 flex items-center justify-center rounded-lg border-2 transition-all',
                                                        currentPlan.icon === iconObj.id
                                                            ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                                            : 'border-border bg-card text-muted-foreground hover:border-slate-300 dark:hover:border-slate-600'
                                                    )}
                                                >
                                                    {iconObj.icon}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => toast.info('Custom icon upload requested.')}
                                                className="h-10 px-3 flex items-center gap-1 rounded-lg border-2 border-dashed border-border text-xs font-semibold text-muted-foreground hover:bg-accent"
                                            >
                                                <Upload className="h-3.5 w-3.5" /> Custom
                                            </button>
                                        </div>
                                    </div>

                                    {/* Color Swatch Selector */}
                                    <div>
                                        <Label className="text-xs font-semibold text-foreground">Plan Color (Optional)</Label>
                                        <div className="flex flex-wrap items-center gap-2.5 mt-2">
                                            {COLOR_OPTIONS.map((c) => (
                                                <button
                                                    key={c.hex}
                                                    type="button"
                                                    onClick={() => updateCurrentPlan({ color: c.hex })}
                                                    className={cn(
                                                        'h-7 w-7 rounded-full flex items-center justify-center transition-all shadow-xs',
                                                        currentPlan.color === c.hex ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'
                                                    )}
                                                    style={{ backgroundColor: c.hex }}
                                                >
                                                    {currentPlan.color === c.hex ? <Check className="h-3.5 w-3.5 text-white font-bold" /> : null}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bottom Form Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="h-10 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                                        {isSaving ? 'Saving...' : 'Save Plan'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => toast.success('Plan saved as draft.')}
                                        className="h-10 px-4 text-xs font-semibold text-foreground border-border bg-card hover:bg-accent"
                                    >
                                        Save as Draft
                                    </Button>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setResetDialogOpen(true)}
                                    className="h-10 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>

                        {/* Right Column: Cards (Plan Preview, Plan Summary, Tips) (5 Cols) */}
                        <div className="xl:col-span-5 space-y-4">
                            {/* Card 1: Live Plan Preview */}
                            <Card className="shadow-sm border-border bg-card sticky top-4">
                                <CardHeader className="py-3 px-4 border-b border-border flex flex-row items-center justify-between bg-card">
                                    <CardTitle className="text-xs font-bold text-card-foreground flex items-center gap-1.5">
                                        <Sparkles className="h-4 w-4 text-primary" /> Plan Preview
                                    </CardTitle>

                                    {/* Viewport switcher */}
                                    <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPreviewDevice('desktop')}
                                            className={cn('h-7 w-7 p-0 text-muted-foreground', previewDevice === 'desktop' ? 'bg-card text-primary shadow-xs' : '')}
                                        >
                                            <Monitor className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPreviewDevice('mobile')}
                                            className={cn('h-7 w-7 p-0 text-muted-foreground', previewDevice === 'mobile' ? 'bg-card text-primary shadow-xs' : '')}
                                        >
                                            <Smartphone className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 flex justify-center">
                                    <div className={cn('transition-all w-full', previewDevice === 'mobile' ? 'max-w-[300px]' : 'max-w-[360px]')}>
                                        {/* Card Container */}
                                        <div className="relative rounded-2xl bg-card p-6 text-card-foreground shadow-lg border border-border text-center">
                                            {/* Badge at top */}
                                            {currentPlan.badgeText ? (
                                                <div className="mb-4 inline-block">
                                                    {renderBadgePreview(currentPlan.badgeText, currentPlan.badgeStyle, currentPlan.badgeColor)}
                                                </div>
                                            ) : null}

                                            {/* Big Icon */}
                                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                {renderPlanIcon(currentPlan.icon)}
                                            </div>

                                            {/* Plan Name */}
                                            <h3 className="text-xl font-extrabold text-foreground tracking-tight">{currentPlan.name}</h3>
                                            <p className="text-xs font-semibold text-primary mt-0.5">For {currentPlan.planFor}</p>

                                            {/* Description */}
                                            <p className="text-xs text-muted-foreground mt-2 px-2 leading-relaxed">{currentPlan.description}</p>

                                            {/* Price */}
                                            <div className="my-5">
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <span className="text-3xl font-black text-foreground">₹{currentPlan.price || '0'}</span>
                                                    <span className="text-xs font-bold text-muted-foreground">
                                                        {currentPlan.customUnitLabel || `/${currentPlan.billingCycle.toLowerCase()}`}
                                                    </span>
                                                </div>
                                                {currentPlan.compareAtPrice ? (
                                                    <div className="text-xs text-muted-foreground line-through mt-0.5">₹{currentPlan.compareAtPrice}</div>
                                                ) : null}
                                            </div>

                                            {/* Feature Checkmarks List */}
                                            <div className="space-y-2.5 text-left border-t border-border pt-4 my-4">
                                                {currentPlan.features.map((feat) => (
                                                    <div key={feat.id} className="flex items-center gap-2 text-xs text-foreground">
                                                        <Check className="h-4 w-4 text-primary shrink-0 font-bold" />
                                                        <span className="font-semibold text-foreground">{feat.text}</span>
                                                        <span className="ml-auto font-bold text-foreground">{feat.value}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* CTA Button */}
                                            <Button className="w-full h-11 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md transition-all">
                                                {currentPlan.ctaText || 'Choose This Plan'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 2: Plan Summary */}
                            <Card className="shadow-xs border-border bg-card">
                                <CardHeader className="py-3 px-4 border-b border-border bg-muted/40">
                                    <CardTitle className="text-xs font-bold text-card-foreground">Plan Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-border">
                                        <span className="text-muted-foreground font-medium">Plan For</span>
                                        <span className="font-bold text-foreground">{currentPlan.planFor}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border">
                                        <span className="text-muted-foreground font-medium">Plan Name</span>
                                        <span className="font-bold text-foreground">{currentPlan.name}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border">
                                        <span className="text-muted-foreground font-medium">Billing Cycle</span>
                                        <span className="font-bold text-foreground">{currentPlan.billingCycle}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border">
                                        <span className="text-muted-foreground font-medium">Price</span>
                                        <span className="font-bold text-foreground">₹{currentPlan.price} / month</span>
                                    </div>
                                    {currentPlan.compareAtPrice ? (
                                        <div className="flex justify-between py-1 border-b border-border">
                                            <span className="text-muted-foreground font-medium">Compare At Price</span>
                                            <span className="font-bold text-foreground">₹{currentPlan.compareAtPrice} / month</span>
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between py-1 border-b border-border">
                                        <span className="text-muted-foreground font-medium">Status</span>
                                        <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5">Active</Badge>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border">
                                        <span className="text-muted-foreground font-medium">Free Trial</span>
                                        <span className="font-bold text-foreground">{currentPlan.freeTrial ? `${currentPlan.trialDays} Days` : 'Disabled'}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border">
                                        <span className="text-muted-foreground font-medium">Created By</span>
                                        <span className="font-bold text-foreground">{currentPlan.createdBy}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-muted-foreground font-medium">Created On</span>
                                        <span className="font-bold text-foreground">{currentPlan.createdOn}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 3: Tips Card */}
                            <Card className="shadow-xs border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
                                <CardHeader className="py-3 px-4 border-b border-amber-200/60 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40">
                                    <CardTitle className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2 text-xs text-amber-950 dark:text-amber-200">
                                    {[
                                        'Keep the plan name short and descriptive',
                                        'Clearly list what\'s included in the plan',
                                        'Use limits (e.g., guests, storage) where applicable',
                                        'Highlight the most popular plan',
                                        'Offer yearly plans to encourage savings',
                                    ].map((tip) => (
                                        <div key={tip} className="flex items-start gap-2">
                                            <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5 font-bold" />
                                            <span className="font-medium text-foreground">{tip}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Modal 1: Add Plan Badge Modal */}
            <Dialog open={badgeModalOpen} onOpenChange={setBadgeModalOpen}>
                <DialogContent className="sm:max-w-[480px] bg-card text-card-foreground border-border">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-foreground">Add Plan Badge</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Create a badge label to highlight this plan and attract more customers.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Badge Text Input */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label className="text-xs font-semibold text-foreground">Badge Text *</Label>
                                <span className="text-[10px] text-muted-foreground font-mono">{customBadgeText.length}/25</span>
                            </div>
                            <Input
                                value={customBadgeText}
                                onChange={(e) => setCustomBadgeText(e.target.value.slice(0, 25))}
                                placeholder="e.g., Best Value, Most Popular"
                                className="h-9 text-xs bg-card border-input text-foreground"
                            />
                        </div>

                        {/* Badge Style Selector Cards */}
                        <div>
                            <Label className="text-xs font-semibold text-foreground">Badge Style *</Label>
                            <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                                {[
                                    { id: 'Filled', label: 'Filled' },
                                    { id: 'Outline', label: 'Outline' },
                                    { id: 'Soft Filled', label: 'Soft Filled' },
                                    { id: 'Soft Outline', label: 'Soft Outline' },
                                ].map((styleObj) => (
                                    <button
                                        key={styleObj.id}
                                        type="button"
                                        onClick={() => setCustomBadgeStyle(styleObj.id as BadgeStyleType)}
                                        className={cn(
                                            'relative flex flex-col items-center justify-between p-3 rounded-lg border-2 transition-all bg-card min-h-[72px]',
                                            customBadgeStyle === styleObj.id
                                                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                                : 'border-border hover:border-slate-300 dark:hover:border-slate-600'
                                        )}
                                    >
                                        <span className="text-[10px] font-semibold text-muted-foreground mb-1">{styleObj.label}</span>
                                        <div className="my-auto">
                                            {renderBadgePreview(customBadgeText || 'BEST VALUE', styleObj.id as BadgeStyleType, customBadgeColor)}
                                        </div>
                                        <div className="absolute bottom-2 left-2 flex h-4 w-4 items-center justify-center rounded-full border border-border">
                                            {customBadgeStyle === styleObj.id ? (
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                            ) : null}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Badge Color Selector */}
                        <div>
                            <Label className="text-xs font-semibold text-foreground">Badge Color *</Label>
                            <div className="flex flex-wrap items-center gap-2.5 mt-2">
                                {COLOR_OPTIONS.map((c) => (
                                    <button
                                        key={c.hex}
                                        type="button"
                                        onClick={() => setCustomBadgeColor(c.hex)}
                                        className={cn(
                                            'h-7 w-7 rounded-full flex items-center justify-center transition-all shadow-xs',
                                            customBadgeColor === c.hex ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'
                                        )}
                                        style={{ backgroundColor: c.hex }}
                                    >
                                        {customBadgeColor === c.hex ? <Check className="h-3.5 w-3.5 text-white font-bold" /> : null}
                                    </button>
                                ))}
                                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 p-0.5 cursor-pointer hover:scale-105 transition-all">
                                    <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-[10px]">🎨</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            onClick={handleSaveCustomBadge}
                            className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm gap-1.5"
                        >
                            <Save className="h-3.5 w-3.5" /> Save Badge
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setBadgeModalOpen(false)}
                            className="h-9 text-xs font-semibold text-foreground border-border bg-card hover:bg-accent"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal 2: Add New Feature Modal */}
            <Dialog open={matrixModalOpen} onOpenChange={setMatrixModalOpen}>
                <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-foreground">
                            {editingMatrixId ? 'Edit Feature' : 'Add New Feature'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Add a powerful feature that will be included in all pricing plan categories.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Section 1: Feature Information */}
                        <div className="space-y-3 p-3.5 rounded-xl border border-border bg-muted/30">
                            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
                                Feature Information
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <BuilderCountedInput
                                        label="Feature Title"
                                        required
                                        maxLength={80}
                                        value={featureTitle}
                                        onChange={setFeatureTitle}
                                        placeholder="e.g., Live Streaming"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Enter a clear and short title for this feature.</p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <Label className="text-xs font-semibold text-foreground">Feature Icon</Label>
                                        <span className="text-[10px] opacity-0 font-mono">0/0</span>
                                    </div>
                                    <Select value={featureIcon} onValueChange={setFeatureIcon}>
                                        <SelectTrigger className="h-9 text-xs bg-card border-input text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            <SelectItem value="video">Live Streaming</SelectItem>
                                            <SelectItem value="qr">QR Code Access</SelectItem>
                                            <SelectItem value="crown">Crown / Pro</SelectItem>
                                            <SelectItem value="users">Guest Management</SelectItem>
                                            <SelectItem value="headset">Priority Support</SelectItem>
                                            <SelectItem value="chart">Analytics & Reports</SelectItem>
                                            <SelectItem value="calendar">Multiple Event Organizer</SelectItem>
                                            <SelectItem value="team">Team Collaboration</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground mt-1">Choose an icon that represents this feature.</p>
                                </div>
                            </div>

                            <div className="pt-1">
                                <BuilderCountedTextarea
                                    label="Feature Description"
                                    required
                                    maxLength={200}
                                    rows={2}
                                    value={featureDesc}
                                    onChange={setFeatureDesc}
                                    placeholder="Describe this feature and how it helps users..."
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Briefly explain the feature and its benefits.</p>
                            </div>
                        </div>

                        {/* Section 2: Plan Availability & Limits */}
                        <div className="space-y-3 p-3.5 rounded-xl border border-border bg-muted/30">
                            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">2</span>
                                Plan Availability & Limits
                            </h3>
                            <p className="text-xs text-muted-foreground">Set availability and limits for this feature across all plan categories.</p>

                            {/* 5 Column Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                                {[
                                    { name: 'Free', bg: 'bg-muted text-muted-foreground', placeholder: 'e.g., 10, 50' },
                                    { name: 'Basic', bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300', placeholder: 'e.g., 100' },
                                    { name: 'Pro', bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300', placeholder: 'e.g., 500' },
                                    { name: 'Premium', bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300', placeholder: 'e.g., 1000' },
                                    { name: 'Companies', bg: 'bg-primary/10 text-primary', placeholder: 'e.g., Unlimited' },
                                ].map((col) => {
                                    const planKey = col.name as keyof typeof planAvailability;
                                    const currentConf = planAvailability[planKey];

                                    return (
                                        <div key={col.name} className="border border-border rounded-lg bg-card overflow-hidden space-y-2 pb-2">
                                            <div className={cn('py-1 px-2 text-center text-xs font-bold border-b border-border', col.bg)}>
                                                {col.name}
                                            </div>

                                            <div className="p-2 space-y-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Checkbox
                                                        id={`not-inc-${col.name}`}
                                                        checked={currentConf.notIncluded}
                                                        onCheckedChange={(checked) =>
                                                            setPlanAvailability((prev) => ({
                                                                ...prev,
                                                                [planKey]: { ...prev[planKey], notIncluded: Boolean(checked) },
                                                            }))
                                                        }
                                                    />
                                                    <label htmlFor={`not-inc-${col.name}`} className="text-[11px] font-semibold text-foreground cursor-pointer select-none">
                                                        Not Included
                                                    </label>
                                                </div>

                                                {!currentConf.notIncluded ? (
                                                    <div>
                                                        <Label className="text-[10px] font-medium text-muted-foreground">Limit (Optional)</Label>
                                                        <Input
                                                            value={currentConf.limit}
                                                            onChange={(e) =>
                                                                setPlanAvailability((prev) => ({
                                                                    ...prev,
                                                                    [planKey]: { ...prev[planKey], limit: e.target.value },
                                                                }))
                                                            }
                                                            placeholder={col.placeholder}
                                                            className="h-7 text-xs mt-0.5 bg-card border-input text-foreground"
                                                        />
                                                        <p className="text-[9px] text-muted-foreground mt-0.5">Leave empty for unlimited</p>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2 text-[11px] text-primary">
                                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>Leave limit field empty if the feature is unlimited for the selected plan.</span>
                            </div>
                        </div>

                        {/* Section 3: Status */}
                        <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
                            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
                                Status
                            </h3>
                            <p className="text-xs text-muted-foreground">Enable or disable this feature.</p>

                            <div className="flex items-center gap-3 pt-1">
                                <Switch checked={featureActive} onCheckedChange={setFeatureActive} />
                                <div>
                                    <div className="text-xs font-bold text-foreground">Active</div>
                                    <div className="text-[11px] text-muted-foreground">This feature will be visible on the pricing page and applied to all plans.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            onClick={handleSaveMatrixFeature}
                            className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm gap-1.5"
                        >
                            <Save className="h-3.5 w-3.5" /> Save Feature
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMatrixModalOpen(false)}
                            className="h-9 text-xs font-semibold text-foreground border-border bg-card hover:bg-accent"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Live Pricing Preview Modal Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl border-border bg-card">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <DialogTitle className="text-sm font-bold text-foreground">Pricing Plans — Live Preview</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            This is how your plans and pricing comparison matrix appear to visitors.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 max-h-[70vh] overflow-y-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.slice(0, 3).map((plan) => (
                                <Card key={plan.id} className={cn('relative border-2', plan.badgeText ? 'border-primary shadow-lg' : 'border-border')}>
                                    {plan.badgeText ? (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            {renderBadgePreview(plan.badgeText, plan.badgeStyle || 'Filled', plan.badgeColor || '#7C3AED')}
                                        </div>
                                    ) : null}
                                    <CardHeader className="text-center pb-2 pt-6">
                                        <div className="mx-auto mb-2">{renderPlanIcon(plan.icon)}</div>
                                        <CardTitle className="text-base font-extrabold">{plan.name}</CardTitle>
                                        <CardDescription className="text-xs">{plan.description}</CardDescription>
                                        <div className="pt-2">
                                            <span className="text-2xl font-black">{plan.currency}{plan.price}</span>
                                            <span className="text-xs text-muted-foreground">/{plan.billingCycle}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-2 text-xs">
                                        <Button className="w-full h-8 text-xs font-bold bg-primary text-primary-foreground">
                                            {plan.ctaText || 'Get Started'}
                                        </Button>
                                        <div className="space-y-1.5 pt-2">
                                            {plan.features.slice(0, 5).map((f) => (
                                                <div key={f.id} className="flex items-center gap-2 text-[11px]">
                                                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                    <span>{f.text} ({f.value})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmResetDialog
                open={resetDialogOpen}
                onOpenChange={setResetDialogOpen}
                onConfirm={handleReset}
            />
        </div>
    );
}
