'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Save,
    ArrowLeft,
    Plus,
    X,
    GripVertical,
    Monitor,
    Smartphone,
    Loader2,
    Check,
    Sparkles,
    DollarSign,
    Crown,
    Building2,
    User,
    CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
    usePricingPlansData,
    useSavePricingPlans,
    type PricingPlan,
} from '@/hooks/usePricingPlans';
import {
    BuilderCountedInput,
    BuilderCountedTextarea,
} from '../../_components/builder-field';

interface PlanFeatureItem {
    label: string;
    included: boolean;
}

function PricingPlanFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get('id');

    const { data: dbPlans, isLoading: isPlansLoading } = usePricingPlansData();
    const savePlansMutation = useSavePricingPlans();

    // Form state
    const [planName, setPlanName] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [targetType, setTargetType] = useState<'individuals' | 'companies'>('individuals');
    const [currency, setCurrency] = useState('₹');
    const [priceMonthly, setPriceMonthly] = useState('');
    const [priceYearly, setPriceYearly] = useState('');
    const [periodLabel, setPeriodLabel] = useState('/month');
    const [badgeText, setBadgeText] = useState('');
    const [badgeStyle, setBadgeStyle] = useState<'filled' | 'outline' | 'soft-filled' | 'soft-outline'>('filled');
    const [isPopular, setIsPopular] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [features, setFeatures] = useState<PlanFeatureItem[]>([]);
    const [newFeatureText, setNewFeatureText] = useState('');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

    const isSaving = savePlansMutation.isPending;

    // Load plan if editing
    useEffect(() => {
        if (planId && dbPlans) {
            const found = dbPlans.find((p) => String(p.id) === String(planId));
            if (found) {
                setPlanName(found.plan_name);
                setSubtitle(found.subtitle || '');
                setTargetType(found.target_type || 'individuals');
                setCurrency(found.currency || '₹');
                setPriceMonthly(String(found.price_monthly || 0));
                setPriceYearly(String(found.price_yearly || 0));
                setPeriodLabel(found.period_label || '/month');
                setBadgeText(found.badge_text || '');
                setBadgeStyle(found.badge_style || 'filled');
                setIsPopular(!!found.is_popular);
                setIsActive(found.is_active !== false);
                setFeatures(found.features_json || []);
            }
        }
    }, [planId, dbPlans]);

    const handleAddFeature = () => {
        if (!newFeatureText.trim()) return;
        setFeatures((prev) => [...prev, { label: newFeatureText.trim(), included: true }]);
        setNewFeatureText('');
    };

    const handleRemoveFeature = (idx: number) => {
        setFeatures((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleToggleFeatureIncluded = (idx: number) => {
        setFeatures((prev) =>
            prev.map((f, i) => (i === idx ? { ...f, included: !f.included } : f))
        );
    };

    const [priceMonthlyError, setPriceMonthlyError] = useState(false);
    const [previewBillingCycle, setPreviewBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handleSavePlan = () => {
        let hasError = false;
        if (!planName.trim()) {
            toast.error('Plan name is required.');
            hasError = true;
        }
        if (!priceMonthly.trim()) {
            setPriceMonthlyError(true);
            toast.error('Monthly price is required.');
            hasError = true;
        } else {
            setPriceMonthlyError(false);
        }

        if (hasError) return;

        const existingList = dbPlans || [];
        const planPayload: PricingPlan = {
            id: planId ? parseInt(planId, 10) : undefined,
            plan_name: planName,
            subtitle,
            target_type: targetType,
            currency,
            price_monthly: parseFloat(priceMonthly) || 0,
            price_yearly: parseFloat(priceYearly) || 0,
            period_label: periodLabel,
            badge_text: badgeText,
            badge_style: badgeStyle,
            is_popular: isPopular,
            features_json: features,
            is_active: isActive,
        };

        let updatedList: PricingPlan[];
        if (planId) {
            updatedList = existingList.map((p) => (String(p.id) === String(planId) ? { ...p, ...planPayload } : p));
        } else {
            updatedList = [...existingList, planPayload];
        }

        savePlansMutation.mutate(updatedList, {
            onSuccess: () => {
                router.push('/admin/website-builder/pricing-plans');
            },
        });
    };

    // Helper for Badge Style Classes
    const getBadgeStyleClass = (styleName?: string) => {
        switch (styleName || badgeStyle) {
            case 'outline':
                return 'bg-background text-primary border-2 border-primary shadow-xs font-extrabold';
            case 'soft-filled':
                return 'bg-primary/20 text-primary border border-primary/40 font-extrabold';
            case 'soft-outline':
                return 'bg-accent text-primary border border-primary/40 font-bold';
            case 'filled':
            default:
                return 'bg-primary text-primary-foreground border-primary shadow-sm font-extrabold';
        }
    };

    return (
        <div className="space-y-5 max-w-7xl mx-auto pb-12 text-foreground">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Link href="/admin/website-builder/pricing-plans" className="hover:underline">
                            Pricing Plans
                        </Link>
                        <span>›</span>
                        <span className="font-semibold text-foreground">{planId ? 'Edit Plan' : 'Add New Plan'}</span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                        {planId ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Configure pricing tier details, features checklist, and view live preview card.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/admin/website-builder/pricing-plans">
                        <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold border-border gap-1.5 cursor-pointer">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to Plans List
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        onClick={handleSavePlan}
                        disabled={isSaving}
                        className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5 cursor-pointer"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Pricing Plan'}
                    </Button>
                </div>
            </div>

            {/* Form Layout: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: 4 Section Cards (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Section 1: Basic Plan Information */}
                    <Card className="border-border bg-card shadow-xs">
                        <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                                1
                            </div>
                            <div className="text-left">
                                <CardTitle className="text-sm font-bold text-foreground">Basic Plan Information</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">Name, audience target, and summary description</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-foreground">
                                    Target Audience <span className="text-destructive">*</span>
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTargetType('individuals')}
                                        className={cn(
                                            'rounded-xl border p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                                            targetType === 'individuals'
                                                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                                : 'border-border bg-card hover:bg-accent text-muted-foreground'
                                        )}
                                    >
                                        <User className="h-4 w-4" /> Individuals
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetType('companies')}
                                        className={cn(
                                            'rounded-xl border p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                                            targetType === 'companies'
                                                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                                : 'border-border bg-card hover:bg-accent text-muted-foreground'
                                        )}
                                    >
                                        <Building2 className="h-4 w-4" /> Companies & Agencies
                                    </button>
                                </div>
                            </div>

                            <BuilderCountedInput
                                label="Plan Name"
                                required
                                placeholder="e.g. Professional Plan"
                                value={planName}
                                onChange={setPlanName}
                                maxLength={40}
                                inputClassName="!h-9 text-xs border-border bg-card text-foreground"
                            />

                            <BuilderCountedTextarea
                                label="Plan Subtitle / Description"
                                placeholder="e.g. Everything you need to manage events seamlessly."
                                value={subtitle}
                                onChange={setSubtitle}
                                maxLength={140}
                                textareaClassName="min-h-[70px] text-xs border-border bg-card text-foreground"
                            />
                        </CardContent>
                    </Card>

                    {/* Section 2: Pricing & Billing Settings */}
                    <Card className="border-border bg-card shadow-xs">
                        <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                                2
                            </div>
                            <div className="text-left">
                                <CardTitle className="text-sm font-bold text-foreground">Pricing & Billing Settings</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">Prices, currency, and period labels</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-foreground">Currency Symbol</Label>
                                    </div>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger className="h-9 text-xs border-border bg-card">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="₹">₹ - Indian Rupee (INR)</SelectItem>
                                            <SelectItem value="$">$ - US Dollar (USD)</SelectItem>
                                            <SelectItem value="€">€ - Euro (EUR)</SelectItem>
                                            <SelectItem value="£">£ - British Pound (GBP)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-foreground">Period Unit Label</Label>
                                    </div>
                                    <Input
                                        placeholder="e.g. /month or /year"
                                        value={periodLabel}
                                        onChange={(e) => setPeriodLabel(e.target.value)}
                                        className="h-9 text-xs border-border bg-card text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-foreground">
                                        Monthly Price ({currency}) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 999"
                                        value={priceMonthly}
                                        onChange={(e) => {
                                            setPriceMonthly(e.target.value);
                                            if (priceMonthlyError) setPriceMonthlyError(false);
                                        }}
                                        className={cn(
                                            'h-9 text-xs border-border bg-card text-foreground',
                                            priceMonthlyError && 'border-red-500 ring-1 ring-red-500'
                                        )}
                                    />
                                    {priceMonthlyError && (
                                        <p className="text-[11px] font-semibold text-red-500">Monthly price is required.</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-foreground">Yearly Price ({currency})</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 9999"
                                        value={priceYearly}
                                        onChange={(e) => setPriceYearly(e.target.value)}
                                        className="h-9 text-xs border-border bg-card text-foreground"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Plan Badge & Highlights */}
                    <Card className="border-border bg-card shadow-xs">
                        <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                                3
                            </div>
                            <div className="text-left">
                                <CardTitle className="text-sm font-bold text-foreground">Plan Badge & Highlights</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">Badge tag and popular recommendation status</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 items-start">
                                <BuilderCountedInput
                                    label="Badge Text (Optional)"
                                    placeholder="e.g. Most Popular, Best Value"
                                    value={badgeText}
                                    onChange={setBadgeText}
                                    maxLength={25}
                                    labelClassName="text-xs font-bold text-foreground"
                                    inputClassName="!h-9 text-xs border-border bg-card text-foreground"
                                />

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-foreground">Badge Style</Label>
                                    </div>
                                    <Select value={badgeStyle} onValueChange={(val: any) => setBadgeStyle(val)}>
                                        <SelectTrigger className="h-9 text-xs border-border bg-card">
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="filled">Filled Badge</SelectItem>
                                            <SelectItem value="outline">Outline Badge</SelectItem>
                                            <SelectItem value="soft-filled">Soft Filled Badge</SelectItem>
                                            <SelectItem value="soft-outline">Soft Outline Badge</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/20">
                                <div>
                                    <div className="text-xs font-bold text-foreground">Highlight as Popular Plan</div>
                                    <div className="text-[11px] text-muted-foreground">Adds a highlighted border and badge on website</div>
                                </div>
                                <Switch checked={isPopular} onCheckedChange={setIsPopular} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Features & Included Capabilities */}
                    <Card className="border-border bg-card shadow-xs">
                        <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                                4
                            </div>
                            <div className="text-left">
                                <CardTitle className="text-sm font-bold text-foreground">Features & Included Capabilities</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">List feature points shown inside the pricing card</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="space-y-2">
                                {features.map((feat, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 text-xs"
                                    >
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                                        <button
                                            type="button"
                                            onClick={() => handleToggleFeatureIncluded(idx)}
                                            className={cn(
                                                'h-5 w-5 rounded-md flex items-center justify-center border text-[10px] font-bold cursor-pointer shrink-0',
                                                feat.included
                                                    ? 'bg-emerald-500 text-white border-emerald-600'
                                                    : 'bg-muted text-muted-foreground border-border'
                                            )}
                                            title="Toggle Included / Excluded"
                                        >
                                            {feat.included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        </button>
                                        <span className={cn('flex-1 font-medium', feat.included ? 'text-foreground' : 'text-muted-foreground line-through')}>
                                            {feat.label}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeature(idx)}
                                            className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add feature item (e.g. Unlimited Event Invites)"
                                    value={newFeatureText}
                                    onChange={(e) => setNewFeatureText(e.target.value)}
                                    className="h-9 text-xs flex-1 border-border bg-card text-foreground"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddFeature();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddFeature}
                                    className="h-9 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Feature
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 5: Status & Display Options */}
                    <Card className="border-border bg-card shadow-xs">
                        <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                                5
                            </div>
                            <div className="text-left">
                                <CardTitle className="text-sm font-bold text-foreground">Status & Display Options</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">Visibility status on public website</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-card">
                                <div>
                                    <div className="text-xs font-bold text-foreground">Plan Status</div>
                                    <div className="text-[11px] text-muted-foreground">Active plans are displayed on your website pricing table</div>
                                </div>
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Live Pricing Card Preview (5 cols) */}
                <div className="lg:col-span-5 space-y-5 sticky top-6">
                    <Card className="shadow-xs border-border bg-card overflow-hidden">
                        <CardHeader className="py-3 px-4 border-b border-border flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide">
                                    Live Pricing Card Preview
                                </CardTitle>
                            </div>

                                <div className="flex items-center gap-2">
                                    {/* Monthly / Yearly Billing Preview Toggle */}
                                    <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40 text-[11px] font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewBillingCycle('monthly')}
                                            className={cn(
                                                'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                                                previewBillingCycle === 'monthly'
                                                    ? 'bg-card text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            )}
                                        >
                                            Monthly
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewBillingCycle('yearly')}
                                            className={cn(
                                                'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                                                previewBillingCycle === 'yearly'
                                                    ? 'bg-card text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            )}
                                        >
                                            Yearly
                                        </button>
                                    </div>

                                    {/* Device Toggle */}
                                    <div className="flex items-center border border-border rounded-lg p-0.5 bg-card">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewDevice('desktop')}
                                            className={cn(
                                                'p-1 rounded-md text-xs transition-colors cursor-pointer',
                                                previewDevice === 'desktop'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            )}
                                            title="Desktop View"
                                        >
                                            <Monitor className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewDevice('mobile')}
                                            className={cn(
                                                'p-1 rounded-md text-xs transition-colors cursor-pointer',
                                                previewDevice === 'mobile'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            )}
                                            title="Mobile View"
                                        >
                                            <Smartphone className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                        </CardHeader>

                        <CardContent className="p-5 flex justify-center bg-muted/10">
                            <div
                                className={cn(
                                    'transition-all duration-300 w-full',
                                    previewDevice === 'mobile' ? 'max-w-[320px]' : 'max-w-full'
                                )}
                            >
                                <div
                                    className={cn(
                                        'rounded-2xl border bg-card p-6 shadow-xl space-y-5 relative transition-all',
                                        isPopular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                                    )}
                                >
                                    {badgeText ? (
                                        <div className="absolute -top-3 left-6">
                                            <Badge className={cn('px-3 py-0.5 text-[10px] uppercase tracking-wider', getBadgeStyleClass())}>
                                                {badgeText}
                                            </Badge>
                                        </div>
                                    ) : null}

                                    <div>
                                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                                            {targetType === 'companies' ? 'Company Plan' : 'Individual Plan'}
                                        </div>
                                        <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                                            {planName || 'Plan Name'}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {subtitle || 'Plan description explaining key benefits for subscribers.'}
                                        </p>
                                    </div>

                                    <div className="border-t border-b border-border py-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-foreground tracking-tight">
                                                {currency}
                                                {previewBillingCycle === 'yearly'
                                                    ? (priceYearly || priceMonthly || '0')
                                                    : (priceMonthly || '0')}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-semibold">
                                                {previewBillingCycle === 'yearly' ? '/year' : periodLabel}
                                            </span>
                                        </div>
                                        {priceYearly ? (
                                            <div className="text-[11px] font-bold text-emerald-600 mt-1">
                                                Yearly Option: {currency}{priceYearly} / year
                                            </div>
                                        ) : null}
                                    </div>

                                    {features.length > 0 ? (
                                        <ul className="space-y-2">
                                            {features.map((feat, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-xs font-semibold">
                                                    {feat.included ? (
                                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                                                    )}
                                                    <span className={cn(feat.included ? 'text-foreground' : 'text-muted-foreground line-through')}>
                                                        {feat.label}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}

                                    <Button className="w-full h-10 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                                        Choose {planName || 'Plan'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function CreatePricingPlanPage() {
    return (
        <Suspense fallback={
            <div className="py-12 text-center text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Loading plan editor...
            </div>
        }>
            <PricingPlanFormContent />
        </Suspense>
    );
}
