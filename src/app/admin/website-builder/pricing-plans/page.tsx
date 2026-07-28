'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Trash2,
    GripVertical,
    Loader2,
    Pencil,
    Search,
    DollarSign,
    Crown,
    Building2,
    User,
    Check,
    Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
    usePricingPlansData,
    useSavePricingPlans,
    type PricingPlan,
} from '@/hooks/usePricingPlans';

import { DeleteDialog } from '@/components/common/delete-dialog';

export default function PricingPlansPage() {
    const { data: dbPlans, isLoading: isPlansLoading } = usePricingPlansData();
    const savePlansMutation = useSavePricingPlans();
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const plans = dbPlans || [];

    const confirmDeletePlan = () => {
        if (deleteId === null) return;
        const updated = plans.filter((p) => p.id !== deleteId);
        savePlansMutation.mutate(updated, {
            onSuccess: () => setDeleteId(null),
        });
    };

    const handleToggleStatus = (id?: number, currentStatus?: boolean) => {
        if (id === undefined) return;
        const updated = plans.map((p) => (p.id === id ? { ...p, is_active: !(currentStatus !== false) } : p));
        savePlansMutation.mutate(updated);
    };

    const filteredPlans = plans.filter(
        (p) =>
            p.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-5 max-w-7xl mx-auto pb-12 text-foreground">
            {/* Top Header Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Website Builder</span>
                        <span>›</span>
                        <span className="font-semibold text-foreground">Pricing Plans</span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-foreground">Pricing Plans Management</h1>
                    <p className="text-xs text-muted-foreground">
                        Manage subscription tiers, feature capabilities, and public website pricing cards.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/admin/website-builder/pricing-plans/create">
                        <Button
                            size="sm"
                            className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> Add New Pricing Plan
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Pricing Plans Data Table */}
            <Card className="shadow-xs border-border bg-card">
                <CardHeader className="py-3.5 px-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/30">
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide">
                        Pricing Plans List ({filteredPlans.length})
                    </CardTitle>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search pricing plans..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-xs border-border bg-card text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                                <tr>
                                    <th className="py-3 px-3.5 w-12 text-center">#</th>
                                    <th className="py-3 px-3.5">Plan Name</th>
                                    <th className="py-3 px-3.5 text-center">Target Type</th>
                                    <th className="py-3 px-3.5 text-center">Price / Period</th>
                                    <th className="py-3 px-3.5 text-center">Badge</th>
                                    <th className="py-3 px-3.5 text-center">Features</th>
                                    <th className="py-3 px-3.5 text-center">Popular</th>
                                    <th className="py-3 px-3.5 text-center">Status</th>
                                    <th className="py-3 px-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isPlansLoading ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                                            Loading pricing plans from database...
                                        </td>
                                    </tr>
                                ) : filteredPlans.length > 0 ? (
                                    filteredPlans.map((item, idx) => (
                                        <tr key={item.id || idx} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3.5 px-3.5 text-center text-muted-foreground font-mono">
                                                <div className="flex items-center justify-center gap-1">
                                                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                                                    <span>{idx + 1}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3.5">
                                                <div className="font-bold text-foreground">{item.plan_name}</div>
                                                {item.subtitle ? (
                                                    <div className="text-[11px] text-muted-foreground truncate max-w-xs">{item.subtitle}</div>
                                                ) : null}
                                            </td>
                                            <td className="py-3.5 px-3.5 text-center">
                                                <Badge variant="outline" className="text-[10px] font-bold capitalize">
                                                    {item.target_type === 'companies' ? (
                                                        <span className="flex items-center gap-1 text-blue-600">
                                                            <Building2 className="h-3 w-3" /> Companies
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-purple-600">
                                                            <User className="h-3 w-3" /> Individuals
                                                        </span>
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-3.5 text-center font-bold text-foreground">
                                                {item.currency || '₹'}{item.price_monthly} <span className="text-[10px] font-normal text-muted-foreground">{item.period_label || '/month'}</span>
                                            </td>
                                            <td className="py-3.5 px-3.5 text-center">
                                                {item.badge_text ? (
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                                                        {item.badge_text}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3.5 text-center font-semibold text-foreground">
                                                {item.features_json ? item.features_json.length : 0} items
                                            </td>
                                            <td className="py-3.5 px-3.5 text-center">
                                                {item.is_popular ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                        <Sparkles className="h-3 w-3" /> Popular
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3.5 text-center">
                                                <Switch
                                                    checked={item.is_active !== false}
                                                    onCheckedChange={() => handleToggleStatus(item.id, item.is_active)}
                                                />
                                            </td>
                                            <td className="py-3.5 px-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link href={`/admin/website-builder/pricing-plans/create?id=${item.id}`}>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-lg p-0 border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => item.id !== undefined && setDeleteId(item.id)}
                                                        className="h-8 w-8 rounded-lg p-0 text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                                            No pricing plans found. Click "Add New Pricing Plan" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                        <span>Showing {filteredPlans.length} of {plans.length} pricing plans</span>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs bg-primary text-primary-foreground border-primary">
                                1
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={confirmDeletePlan}
                title="Delete Pricing Plan"
                description="Are you sure you want to delete this pricing plan? This action cannot be undone."
            />
        </div>
    );
}
