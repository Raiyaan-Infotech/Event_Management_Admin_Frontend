'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Trash2,
    GripVertical,
    Loader2,
    Calendar,
    MapPin,
    Users,
    Image as ImageIcon,
    MessageSquare,
    Gift,
    Video,
    Music,
    Heart,
    Bell,
    Scan,
    QrCode,
    Pencil,
    Search,
    Save,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { DeleteDialog } from '@/components/common/delete-dialog';
import {
    useFeaturesData,
    useToggleFeatureStatus,
    useToggleFeatureMenu,
    useDeleteFeature,
    type FeatureItem,
} from '@/hooks/useFeatures';

const ICON_PRESETS = [
    { name: 'calendar', Icon: Calendar },
    { name: 'map-pin', Icon: MapPin },
    { name: 'users', Icon: Users },
    { name: 'image', Icon: ImageIcon },
    { name: 'message', Icon: MessageSquare },
    { name: 'gift', Icon: Gift },
    { name: 'video', Icon: Video },
    { name: 'music', Icon: Music },
    { name: 'heart', Icon: Heart },
    { name: 'bell', Icon: Bell },
    { name: 'scan', Icon: Scan },
    { name: 'qr-code', Icon: QrCode },
];

function getIconComponent(iconName?: string) {
    const found = ICON_PRESETS.find((i) => i.name === iconName);
    return found ? found.Icon : Calendar;
}

export default function FeaturesPage() {
    const { data: dbFeatures, isLoading: isFeaturesLoading } = useFeaturesData();
    const toggleStatusMutation = useToggleFeatureStatus();
    const toggleMenuMutation = useToggleFeatureMenu();
    const deleteFeatureMutation = useDeleteFeature();

    const [localFeatures, setLocalFeatures] = useState<FeatureItem[] | null>(null);

    useEffect(() => {
        if (dbFeatures) {
            setLocalFeatures(dbFeatures);
        }
    }, [dbFeatures]);

    const features = localFeatures ?? dbFeatures ?? [];
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<string | number | null>(null);

    const confirmDeleteFeature = () => {
        if (!deleteId) return;
        deleteFeatureMutation.mutate(deleteId, {
            onSuccess: () => setDeleteId(null),
        });
    };

    const handleToggleStatus = (id?: string | number, currentStatus?: string) => {
        if (!id) return;
        const nextStatus: 'Active' | 'Inactive' = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const nextActive = nextStatus === 'Active';
        const updated: FeatureItem[] = features.map((f) => (f.id === id ? { ...f, status: nextStatus, is_active: nextActive } : f));
        setLocalFeatures(updated);
        toggleStatusMutation.mutate({ id, is_active: nextActive, status: nextStatus });
    };

    const handleToggleMenu = (id?: string | number, currentShowInMenu?: boolean) => {
        if (!id) return;
        const nextShow = !currentShowInMenu;
        const updated: FeatureItem[] = features.map((f) => (f.id === id ? { ...f, show_in_menu: nextShow } : f));
        setLocalFeatures(updated);
        toggleMenuMutation.mutate({ id, show_in_menu: nextShow });
    };

    const filteredFeatures = features.filter(
        (f) =>
            f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.short_description.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <span className="font-semibold text-foreground">Features List</span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-foreground">Features Management</h1>
                    <p className="text-xs text-muted-foreground">
                        Manage interactive feature highlights and key benefits shown on your event website.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/admin/website-builder/features/create">
                        <Button
                            size="sm"
                            className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> Add New Feature
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Features Data Table */}
            <Card className="shadow-xs border-border bg-card">
                <CardHeader className="py-3.5 px-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/30">
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide">
                        Features List ({filteredFeatures.length})
                    </CardTitle>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search features by title..."
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
                                    <th className="py-3 px-3.5 w-16 text-center">Icon</th>
                                    <th className="py-3 px-3.5">Feature Title</th>
                                    <th className="py-3 px-3.5">Short Description</th>
                                    <th className="py-3 px-3.5 text-center">Show in Menu</th>
                                    <th className="py-3 px-3.5 text-center">Menu Order</th>
                                    <th className="py-3 px-3.5 text-center">Status</th>
                                    <th className="py-3 px-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isFeaturesLoading ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                                            Loading features from database...
                                        </td>
                                    </tr>
                                ) : filteredFeatures.length > 0 ? (
                                    filteredFeatures.map((item, idx) => {
                                        const IconComp = getIconComponent(item.icon);
                                        return (
                                            <tr key={item.id || idx} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3.5 px-3.5 text-center text-muted-foreground font-mono">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                                                        <span>{idx + 1}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3.5 text-center">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                                                        <IconComp className="h-4 w-4" />
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3.5 font-bold text-foreground">
                                                    {item.title}
                                                </td>
                                                <td className="py-3.5 px-3.5 text-muted-foreground max-w-sm truncate">
                                                    {item.short_description}
                                                </td>
                                                <td className="py-3.5 px-3.5 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Switch
                                                            checked={item.show_in_menu !== false && (item.show_in_menu as any) !== 0 && (item.show_in_menu as any) !== '0'}
                                                            onCheckedChange={() => handleToggleMenu(item.id, item.show_in_menu !== false && (item.show_in_menu as any) !== 0 && (item.show_in_menu as any) !== '0')}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3.5 text-center font-bold text-foreground">
                                                    {item.menu_order || idx + 1}
                                                </td>
                                                <td className="py-3.5 px-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Switch
                                                            checked={item.status === 'Active' || item.is_active !== false}
                                                            onCheckedChange={() => handleToggleStatus(item.id, item.status)}
                                                        />
                                                        <Badge
                                                            variant={item.status === 'Active' || item.is_active !== false ? 'default' : 'secondary'}
                                                            className={cn(
                                                                'text-[10px] font-bold px-2 py-0.5 cursor-pointer',
                                                                (item.status === 'Active' || item.is_active !== false)
                                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                                    : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                                                            )}
                                                            onClick={() => handleToggleStatus(item.id, item.status)}
                                                        >
                                                            {item.status === 'Active' || item.is_active !== false ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link href={`/admin/website-builder/features/create?id=${item.id}`}>
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
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                                            No features found in database. Click "Add New Feature" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                        <span>Showing {filteredFeatures.length} of {features.length} features</span>
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
                onConfirm={confirmDeleteFeature}
                title="Delete Feature"
                description="Are you sure you want to delete this feature? This action cannot be undone."
            />
        </div>
    );
}
