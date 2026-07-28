'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    GripVertical,
    Loader2,
    Save,
    ExternalLink,
    Upload,
    Check,
    X,
    Sparkles,
    Gift,
    Share2,
    QrCode,
    Sliders,
    Image as ImageIcon,
    Zap,
    Heart,
    Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    useHowItWorksData,
    useCreateHowItWorksStep,
    useUpdateHowItWorksStep,
    useDeleteHowItWorksStep,
    useSaveHowItWorksSteps,
    useToggleHowItWorksStatus,
    type HowItWorksStep,
} from '@/hooks/useHowItWorks';
import { BuilderCountedInput, BuilderCountedTextarea } from '../_components/builder-field';
import { DeleteDialog } from '@/components/common/delete-dialog';

const ICON_PRESETS = [
    { name: 'gift', Icon: Gift, label: 'Gift / Template' },
    { name: 'sparkles', Icon: Sparkles, label: 'Sparkles / Custom' },
    { name: 'share-2', Icon: Share2, label: 'Share' },
    { name: 'qr-code', Icon: QrCode, label: 'QR Code' },
    { name: 'sliders', Icon: Sliders, label: 'Sliders / App' },
    { name: 'image', Icon: ImageIcon, label: 'Image' },
    { name: 'zap', Icon: Zap, label: 'Fast / Instant' },
    { name: 'heart', Icon: Heart, label: 'Love' },
];

const PRESET_ILLUSTRATION = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';

function getIconComponent(iconName?: string) {
    const found = ICON_PRESETS.find((i) => i.name === iconName);
    return found ? found.Icon : Gift;
}

export default function HowItWorksPage() {
    const { data: dbSteps, isLoading } = useHowItWorksData();
    const createMutation = useCreateHowItWorksStep();
    const updateMutation = useUpdateHowItWorksStep();
    const deleteMutation = useDeleteHowItWorksStep();
    const saveAllMutation = useSaveHowItWorksSteps();
    const toggleStatusMutation = useToggleHowItWorksStatus();

    const [steps, setSteps] = useState<HowItWorksStep[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [iconPickerOpen, setIconPickerOpen] = useState(false);
const [pendingDelete, setPendingDelete] = useState<{ id?: string | number; idx?: number } | null>(null);    const [editingStepIdx, setEditingStepIdx] = useState<number | null>(null);
    const [draggedStepIdx, setDraggedStepIdx] = useState<number | null>(null);

    // Modal Form State (Single Image & Form inputs)
    const [modalIcon, setModalIcon] = useState('gift');
    const [modalIllustration, setModalIllustration] = useState(PRESET_ILLUSTRATION);
    const [modalTitle, setModalTitle] = useState('');
    const [modalDesc, setModalDesc] = useState('');
    const [modalHighlightTitle, setModalHighlightTitle] = useState('');
    const [modalHighlightSubtext, setModalHighlightSubtext] = useState('');
    const [modalStepOrder, setModalStepOrder] = useState('1');
    const [modalIsActive, setModalIsActive] = useState(true);

    const isSaving = saveAllMutation.isPending || createMutation.isPending || updateMutation.isPending;

    // Load database steps into state
    useEffect(() => {
        if (dbSteps) {
            setSteps(dbSteps);
        }
    }, [dbSteps]);
    const handleUpdateStepField = (idx: number, field: keyof HowItWorksStep, value: any) => {
        const target = steps[idx];
        setSteps((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
        );
        if (field === 'is_active' && target?.id) {
            toggleStatusMutation.mutate({ id: target.id, is_active: Boolean(value) });
        }
    };

    const [modalErrors, setModalErrors] = useState<{ title?: boolean; desc?: boolean; highlightTitle?: boolean; highlightSubtext?: boolean }>({});

    const validateModalFields = () => {
        const errs: typeof modalErrors = {};
        if (!modalTitle.trim()) errs.title = true;
        if (!modalDesc.trim()) errs.desc = true;
        if (!modalHighlightTitle.trim()) errs.highlightTitle = true;
        if (!modalHighlightSubtext.trim()) errs.highlightSubtext = true;

        if (Object.keys(errs).length > 0) {
            setModalErrors(errs);
            toast.error('Title, Description, Highlight Title, and Subtext are required.');
            return false;
        }
        setModalErrors({});
        return true;
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        const { id, idx } = pendingDelete;
        if (id) {
            deleteMutation.mutate(id, {
                onSuccess: () => setPendingDelete(null),
            });
        } else if (idx !== undefined) {
            setSteps((prev) => prev.filter((_, i) => i !== idx));
            setPendingDelete(null);
        }
    };
    const handleSaveAll = () => {
        for (let i = 0; i < steps.length; i++) {
            const s = steps[i];
            if (!s.title?.trim() || !s.description?.trim() || !s.highlight_title?.trim() || !s.highlight_subtext?.trim()) {
                toast.error(`Step ${i + 1}: Title, Description, Highlight Title, and Subtext are required.`);
                return;
            }
        }
        saveAllMutation.mutate(steps);
    };

    const handleDeleteStep = (id?: number | string, idx?: number) => {
        if (id) {
            deleteMutation.mutate(id);
        } else if (idx !== undefined) {
            setSteps((prev) => prev.filter((_, i) => i !== idx));
        }
    };

    // Drag & Drop Reordering Handlers
    const handleDragStart = (e: React.DragEvent, idx: number) => {
        setDraggedStepIdx(idx);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetIdx: number) => {
        e.preventDefault();
        if (draggedStepIdx === null || draggedStepIdx === targetIdx) return;

        const reordered = [...steps];
        const [moved] = reordered.splice(draggedStepIdx, 1);
        reordered.splice(targetIdx, 0, moved);

        const updated = reordered.map((item, index) => ({
            ...item,
            step_number: index + 1,
            sort_order: index + 1,
        }));

        setSteps(updated);
        setDraggedStepIdx(null);
        saveAllMutation.mutate(updated);
        toast.success('Steps reordered successfully!');
    };

    // Open Add Modal
    const handleOpenAddModal = () => {
        setEditingStepIdx(null);
        setModalIcon('gift');
        setModalIllustration(PRESET_ILLUSTRATION);
        setModalTitle('');
        setModalDesc('');
        setModalHighlightTitle('');
        setModalHighlightSubtext('');
        setModalStepOrder(String(steps.length + 1));
        setModalIsActive(true);
        setModalErrors({});
        setAddModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEditModal = (idx: number) => {
        const target = steps[idx];
        if (!target) return;
        setEditingStepIdx(idx);
        setModalIcon(target.icon || 'gift');
        setModalIllustration(target.illustration_url || PRESET_ILLUSTRATION);
        setModalTitle(target.title || '');
        setModalDesc(target.description || '');
        setModalHighlightTitle(target.highlight_title || '');
        setModalHighlightSubtext(target.highlight_subtext || '');
        setModalStepOrder(String(target.step_number || idx + 1));
        setModalIsActive(target.is_active !== false);
        setModalErrors({});
        setEditModalOpen(true);
    };

    // Save Add Modal Submit
    const handleAddStepSubmit = () => {
        if (!validateModalFields()) return;

        const newStep: HowItWorksStep = {
            step_number: parseInt(modalStepOrder, 10) || steps.length + 1,
            title: modalTitle,
            description: modalDesc,
            highlight_title: modalHighlightTitle,
            highlight_subtext: modalHighlightSubtext,
            icon: modalIcon,
            illustration_url: modalIllustration,
            is_active: modalIsActive,
            sort_order: parseInt(modalStepOrder, 10) || steps.length + 1,
        };

        createMutation.mutate(newStep, {
            onSuccess: () => {
                setAddModalOpen(false);
            },
        });
    };

    // Save Edit Modal Submit
    const handleEditStepSubmit = () => {
        if (editingStepIdx === null) return;
        if (!validateModalFields()) return;

        const target = steps[editingStepIdx];
        const updatedStep: HowItWorksStep = {
            ...target,
            step_number: parseInt(modalStepOrder, 10) || editingStepIdx + 1,
            title: modalTitle,
            description: modalDesc,
            highlight_title: modalHighlightTitle,
            highlight_subtext: modalHighlightSubtext,
            icon: modalIcon,
            illustration_url: modalIllustration,
            is_active: modalIsActive,
            sort_order: parseInt(modalStepOrder, 10) || editingStepIdx + 1,
        };

        if (target.id) {
            updateMutation.mutate(
                { id: target.id, payload: updatedStep },
                {
                    onSuccess: () => {
                        setEditModalOpen(false);
                    },
                }
            );
        } else {
            setSteps((prev) => prev.map((s, i) => (i === editingStepIdx ? updatedStep : s)));
            setEditModalOpen(false);
            toast.success('Step updated successfully!');
        }
    };

    const handleOpenIconPicker = (stepIdx: number | null) => {
        setEditingStepIdx(stepIdx);
        setIconPickerOpen(true);
    };

    const handleSelectIcon = (iconName: string) => {
        if (editingStepIdx !== null && !editModalOpen && !addModalOpen) {
            handleUpdateStepField(editingStepIdx, 'icon', iconName);
        } else {
            setModalIcon(iconName);
        }
        setIconPickerOpen(false);
    };

    // Handle File Upload for Single Image
    const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isCardRowIdx?: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const imgDataUrl = ev.target?.result as string;
                if (imgDataUrl) {
                    if (isCardRowIdx !== undefined) {
                        handleUpdateStepField(isCardRowIdx, 'illustration_url', imgDataUrl);
                    } else {
                        setModalIllustration(imgDataUrl);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16 text-foreground">
            {/* Top Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                        How Event Invit Works
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Configure the {steps.length} simple steps that explain how your platform works.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewOpen(true)}
                        className="h-9 px-3.5 text-xs font-semibold border-border gap-1.5 hover:bg-accent text-foreground"
                    >
                        Preview <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleOpenAddModal}
                        className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" /> Add Next Step
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 cursor-pointer"
                    >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save All Steps
                    </Button>
                </div>
            </div>

            {/* Step Rows List */}
            {isLoading ? (
                <div className="py-16 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading steps from database...
                </div>
            ) : steps.length > 0 ? (
                <div className="space-y-4">
                    {steps.map((item, idx) => {
                        const IconComp = getIconComponent(item.icon);
                        return (
                            <Card
                                key={item.id || idx}
                                draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, idx)}
                                className={cn(
                                    'relative border-border bg-card shadow-xs overflow-hidden transition-all duration-200 cursor-move',
                                    draggedStepIdx === idx && 'opacity-40 border-dashed border-primary bg-primary/10'
                                )}
                            >
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Dynamic Theme Step Circle Badge */}
                                        <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-extrabold flex items-center justify-center text-xs shrink-0 mt-2 shadow-xs">
                                            {idx + 1}
                                        </div>

                                        {/* Main Grid Content */}
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                            {/* Column 1: Icon Box */}
                                            <div className="md:col-span-2 flex flex-col items-center justify-center text-center space-y-2 border-r border-border/50 pr-3 min-w-0">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Icon</span>
                                                <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs shrink-0">
                                                    <IconComp className="h-6 w-6" />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenIconPicker(idx)}
                                                    className="h-7 px-2.5 text-[11px] font-bold border-border bg-card hover:bg-accent text-foreground cursor-pointer whitespace-nowrap shrink-0"
                                                >
                                                    Change
                                                </Button>
                                            </div>

                                            {/* Column 2: Illustration Box (Single Image Upload) */}
                                            <div className="md:col-span-2 flex flex-col items-center justify-center text-center space-y-2 border-r border-border/50 pr-3 min-w-0">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Illustration</span>
                                                <div className="h-14 w-24 rounded-xl border border-border overflow-hidden bg-muted/30 flex items-center justify-center shrink-0">
                                                    {item.illustration_url ? (
                                                        <img src={item.illustration_url} alt="Illustration" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <label className="h-7 px-2.5 text-[11px] font-bold border border-border bg-card hover:bg-accent text-foreground rounded-lg flex items-center justify-center cursor-pointer transition-all whitespace-nowrap shrink-0 shadow-xs">
                                                    Change Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleSingleFileUpload(e, idx)}
                                                    />
                                                </label>
                                            </div>

                                            {/* Column 3: Title & Description Inputs */}
                                            <div className="md:col-span-5 space-y-3">
                                                <BuilderCountedInput
                                                    label="Title"
                                                    required
                                                    placeholder="Enter step title"
                                                    value={item.title}
                                                    onChange={(val) => handleUpdateStepField(idx, 'title', val)}
                                                    maxLength={60}
                                                    inputClassName="!h-9 text-xs border-border bg-card text-foreground"
                                                />
                                                <BuilderCountedTextarea
                                                    label="Description"
                                                    required
                                                    placeholder="Describe this step in detail..."
                                                    value={item.description}
                                                    onChange={(val) => handleUpdateStepField(idx, 'description', val)}
                                                    maxLength={200}
                                                    textareaClassName="min-h-[65px] text-xs border-border bg-card text-foreground"
                                                />
                                            </div>

                                            {/* Column 4: Highlight Title & Subtext */}
                                            <div className="md:col-span-3 space-y-3">
                                                <BuilderCountedInput
                                                    label="Highlight Title"
                                                    required
                                                    placeholder="Enter highlight title"
                                                    value={item.highlight_title || ''}
                                                    onChange={(val) => handleUpdateStepField(idx, 'highlight_title', val)}
                                                    maxLength={30}
                                                    inputClassName={cn(
                                                        '!h-9 text-xs border-border bg-card text-foreground',
                                                        !item.highlight_title?.trim() && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                                    )}
                                                />
                                                <BuilderCountedInput
                                                    label="Highlight Subtext"
                                                    required
                                                    placeholder="Enter highlight subtext"
                                                    value={item.highlight_subtext || ''}
                                                    onChange={(val) => handleUpdateStepField(idx, 'highlight_subtext', val)}
                                                    maxLength={30}
                                                    inputClassName={cn(
                                                        '!h-9 text-xs border-border bg-card text-foreground',
                                                        !item.highlight_subtext?.trim() && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Right Action Icons Column */}
                                        <div className="flex flex-col items-end justify-between gap-4 border-l border-border/50 pl-3">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={item.is_active !== false}
                                                    onCheckedChange={(val) => handleUpdateStepField(idx, 'is_active', val)}
                                                />
                                                <span className="text-xs font-bold text-foreground">Active</span>
                                                <GripVertical className="h-4 w-4 text-muted-foreground/60 cursor-grab ml-1" />
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleOpenEditModal(idx)}
                                                    className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                                    title="Edit Step Details"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setPendingDelete({ id: item.id, idx })}
                                                    className="h-8 w-8 rounded-lg text-rose-500 border-rose-200 hover:bg-rose-50 cursor-pointer"
                                                    title="Delete Step"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* Dynamic Theme Pagination Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-4 border-t border-border">
                        <span className="text-muted-foreground">You can reorder steps by dragging them up or down. Showing {steps.length} steps.</span>
                        <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-border bg-card text-foreground cursor-pointer" disabled>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 text-xs bg-primary text-primary-foreground border-primary font-bold shadow-xs">
                                1
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-border bg-card text-foreground cursor-pointer" disabled>
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-16 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
                    No steps created yet. Click "Add Next Step" to create your first step.
                </div>
            )}

            {/* MODAL 1: ADD NEXT STEP DIALOG */}
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent className="max-w-2xl bg-card border-border text-foreground p-6 rounded-2xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold text-foreground">Add Next Step</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Add a new step to explain how Event Invit works.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Icon & Single Illustration Upload Top Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                            {/* Icon Picker */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2 border border-border rounded-xl p-3 bg-muted/20">
                                <Label className="text-xs font-bold text-foreground">Icon</Label>
                                <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                                    {(() => {
                                        const IconC = getIconComponent(modalIcon);
                                        return <IconC className="h-7 w-7" />;
                                    })()}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenIconPicker(null)}
                                    className="h-7 px-3 text-xs font-bold border-border bg-card hover:bg-accent cursor-pointer"
                                >
                                    Change Icon
                                </Button>
                                <span className="text-[10px] text-muted-foreground">Choose an icon that represents this step.</span>
                            </div>

                            {/* Single Image Upload Box */}
                            <div className="md:col-span-8 space-y-2 border border-border rounded-xl p-3 bg-muted/20">
                                <Label className="text-xs font-bold text-foreground">Illustration Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-32 rounded-xl border-2 border-border overflow-hidden bg-muted flex items-center justify-center shrink-0 shadow-xs">
                                        {modalIllustration ? (
                                            <img src={modalIllustration} alt="Illustration" className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary cursor-pointer transition-all w-fit text-xs font-bold shadow-xs">
                                            <Upload className="h-4 w-4" />
                                            Upload Single Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleSingleFileUpload(e)}
                                            />
                                        </label>
                                        <p className="text-[10px] text-muted-foreground">
                                            Recommended size: 600×400px (PNG, JPG, WEBP).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <BuilderCountedInput
                                label="Title"
                                required
                                placeholder="Enter step title"
                                value={modalTitle}
                                onChange={(val) => {
                                    setModalTitle(val);
                                    if (modalErrors.title && val.trim()) setModalErrors((e) => ({ ...e, title: false }));
                                }}
                                maxLength={60}
                                inputClassName={cn(
                                    '!h-9 text-xs border-border bg-card text-foreground',
                                    modalErrors.title && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                )}
                            />
                            <BuilderCountedTextarea
                                label="Description"
                                required
                                placeholder="Describe this step in detail..."
                                value={modalDesc}
                                onChange={(val) => {
                                    setModalDesc(val);
                                    if (modalErrors.desc && val.trim()) setModalErrors((e) => ({ ...e, desc: false }));
                                }}
                                maxLength={200}
                                textareaClassName={cn(
                                    'min-h-[70px] text-xs border-border bg-card text-foreground',
                                    modalErrors.desc && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                )}
                            />
                        </div>

                        {/* Highlight Title & Subtext */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <BuilderCountedInput
                                label="Highlight Title"
                                required
                                placeholder="Enter highlight title"
                                value={modalHighlightTitle}
                                onChange={(val) => {
                                    setModalHighlightTitle(val);
                                    if (modalErrors.highlightTitle && val.trim()) setModalErrors((e) => ({ ...e, highlightTitle: false }));
                                }}
                                maxLength={30}
                                inputClassName={cn(
                                    '!h-9 text-xs border-border bg-card text-foreground',
                                    modalErrors.highlightTitle && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                )}
                            />
                            <BuilderCountedInput
                                label="Highlight Subtext"
                                required
                                placeholder="Enter highlight subtext"
                                value={modalHighlightSubtext}
                                onChange={(val) => {
                                    setModalHighlightSubtext(val);
                                    if (modalErrors.highlightSubtext && val.trim()) setModalErrors((e) => ({ ...e, highlightSubtext: false }));
                                }}
                                maxLength={30}
                                inputClassName={cn(
                                    '!h-9 text-xs border-border bg-card text-foreground',
                                    modalErrors.highlightSubtext && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                )}
                            />
                        </div>

                        {/* Step Order & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-foreground">Step Order</Label>
                                <Input
                                    type="number"
                                    value={modalStepOrder}
                                    onChange={(e) => setModalStepOrder(e.target.value)}
                                    className="h-9 text-xs border-border bg-card text-foreground"
                                />
                                <span className="text-[10px] text-muted-foreground">This step will be placed as the last step.</span>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-foreground">Status</Label>
                                <div className="flex items-center gap-3 pt-1">
                                    <Switch checked={modalIsActive} onCheckedChange={setModalIsActive} />
                                    <span className="text-xs font-bold text-foreground">{modalIsActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">Inactive steps will not be shown on the public page.</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setAddModalOpen(false)}
                            className="h-9 px-4 text-xs font-bold border-border text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddStepSubmit}
                            disabled={createMutation.isPending}
                            className="h-9 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
                        >
                            {createMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add Step'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL 2: EDIT STEP DIALOG */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-2xl bg-card border-border text-foreground p-6 rounded-2xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold text-foreground">Edit Step</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Update details and options for this step.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Icon & Single Illustration Upload Top Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                            {/* Icon Picker */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2 border border-border rounded-xl p-3 bg-muted/20">
                                <Label className="text-xs font-bold text-foreground">Icon</Label>
                                <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                                    {(() => {
                                        const IconC = getIconComponent(modalIcon);
                                        return <IconC className="h-7 w-7" />;
                                    })()}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIconPickerOpen(true)}
                                    className="h-7 px-3 text-xs font-bold border-border bg-card hover:bg-accent cursor-pointer"
                                >
                                    Change Icon
                                </Button>
                                <span className="text-[10px] text-muted-foreground">Choose an icon for this step.</span>
                            </div>

                            {/* Single Image Upload Box */}
                            <div className="md:col-span-8 space-y-2 border border-border rounded-xl p-3 bg-muted/20">
                                <Label className="text-xs font-bold text-foreground">Illustration Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-32 rounded-xl border-2 border-border overflow-hidden bg-muted flex items-center justify-center shrink-0 shadow-xs">
                                        {modalIllustration ? (
                                            <img src={modalIllustration} alt="Illustration" className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary cursor-pointer transition-all w-fit text-xs font-bold shadow-xs">
                                            <Upload className="h-4 w-4" />
                                            Upload Single Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleSingleFileUpload(e)}
                                            />
                                        </label>
                                        <p className="text-[10px] text-muted-foreground">
                                            Recommended size: 600×400px (PNG, JPG, WEBP).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <BuilderCountedInput
                                label="Title"
                                required
                                placeholder="Enter step title"
                                value={modalTitle}
                                onChange={(val) => {
                                    setModalTitle(val);
                                    if (modalErrors.title && val.trim()) setModalErrors((e) => ({ ...e, title: false }));
                                }}
                                maxLength={60}
                                inputClassName={cn(
                                    '!h-9 text-xs border-border bg-card text-foreground',
                                    modalErrors.title && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                )}
                            />
                            <BuilderCountedTextarea
                                label="Description"
                                required
                                placeholder="Describe this step in detail..."
                                value={modalDesc}
                                onChange={(val) => {
                                    setModalDesc(val);
                                    if (modalErrors.desc && val.trim()) setModalErrors((e) => ({ ...e, desc: false }));
                                }}
                                maxLength={200}
                                textareaClassName={cn(
                                    'min-h-[70px] text-xs border-border bg-card text-foreground',
                                    modalErrors.desc && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                )}
                            />
                        </div>

                        {/* Highlight Title & Subtext */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <BuilderCountedInput
                                label="Highlight Title"
                                required
                                placeholder="Enter highlight title"
                                value={modalHighlightTitle}
                                onChange={(val) => {
                                    setModalHighlightTitle(val);
                                    if (modalErrors.highlightTitle && val.trim()) setModalErrors((e) => ({ ...e, highlightTitle: false }));
                                }}
                                maxLength={30}
                                inputClassName={cn(
                                    '!h-9 text-xs border-border bg-card text-foreground',
                                    modalErrors.highlightTitle && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                )}
                            />
                            <BuilderCountedInput
                                label="Highlight Subtext"
                                required
                                placeholder="Enter highlight subtext"
                                value={modalHighlightSubtext}
                                onChange={(val) => {
                                    setModalHighlightSubtext(val);
                                    if (modalErrors.highlightSubtext && val.trim()) setModalErrors((e) => ({ ...e, highlightSubtext: false }));
                                }}
                                maxLength={30}
                                inputClassName={cn(
                                    '!h-9 text-xs border-border bg-card text-foreground',
                                    modalErrors.highlightSubtext && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                                )}
                            />
                        </div>

                        {/* Step Order & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-foreground">Step Order</Label>
                                <Input
                                    type="number"
                                    value={modalStepOrder}
                                    onChange={(e) => setModalStepOrder(e.target.value)}
                                    className="h-9 text-xs border-border bg-card text-foreground"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-foreground">Status</Label>
                                <div className="flex items-center gap-3 pt-1">
                                    <Switch checked={modalIsActive} onCheckedChange={setModalIsActive} />
                                    <span className="text-xs font-bold text-foreground">{modalIsActive ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setEditModalOpen(false)}
                            className="h-9 px-4 text-xs font-bold border-border text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditStepSubmit}
                            disabled={updateMutation.isPending}
                            className="h-9 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
                        >
                            {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL 3: ICON PICKER DIALOG */}
            <Dialog open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                <DialogContent className="max-w-md bg-card border-border text-foreground p-5 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-foreground">Select Icon</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-3 py-3">
                        {ICON_PRESETS.map(({ name, Icon, label }) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => handleSelectIcon(name)}
                                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary transition-all cursor-pointer space-y-1"
                            >
                                <Icon className="h-6 w-6 text-primary" />
                                <span className="text-[10px] font-semibold text-muted-foreground truncate w-full text-center">{label}</span>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL 4: PUBLIC OUTPUT / PREVIEW MODAL */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl bg-gradient-to-b from-slate-50 to-white text-slate-900 p-8 rounded-3xl shadow-2xl border-none">
                    <div className="text-center space-y-1.5 max-w-xl mx-auto mb-8">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                            WORKING PROCESS
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">
                            How Event Invit Works
                        </h2>
                        <div className="h-1 w-12 bg-primary rounded-full mx-auto my-2" />
                        <p className="text-xs text-slate-500 font-medium">
                            Create your event app in {steps.filter((s) => s.is_active !== false).length} simple steps
                        </p>
                    </div>

                    {/* Step Cards with Connected Flow */}
                    <div className="space-y-4 relative">
                        {steps
                            .filter((s) => s.is_active !== false)
                            .map((item, idx) => {
                                const IconComp = getIconComponent(item.icon);
                                return (
                                    <div key={item.id || idx} className="flex items-center gap-4 relative">
                                        {/* Step Circle */}
                                        <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center text-sm shadow-md shrink-0 z-10">
                                            {idx + 1}
                                        </div>

                                        {/* White Step Card */}
                                        <div className="flex-1 rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                                            {/* Left: Illustration */}
                                            <div className="h-20 w-36 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-xs">
                                                {item.illustration_url ? (
                                                    <img src={item.illustration_url} alt="Step Illustration" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                        <ImageIcon className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Middle: Title & Description */}
                                            <div className="flex-1 space-y-1 text-left">
                                                <h3 className="text-base font-extrabold text-slate-900">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {/* Right: Icon + Highlight Text */}
                                            {item.highlight_title ? (
                                                <div className="flex items-center gap-3 border-l border-slate-100 pl-5 shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                                                        <IconComp className="h-5 w-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xs font-black text-slate-900">{item.highlight_title}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium">{item.highlight_subtext}</div>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteDialog
    open={pendingDelete !== null}
    onOpenChange={(open) => !open && setPendingDelete(null)}
    onConfirm={confirmDelete}
    isDeleting={deleteMutation.isPending}
    title="Delete How It Works"
    description="Are you sure you want to delete this How it Works? This action cannot be undone."
/>
        </div>
    );
}
