'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useWebsiteFaq, useCreateWebsiteFaq, useUpdateWebsiteFaq } from '@/hooks/useWebsiteFaqs';
import { useWebsiteFaqCategories } from '@/hooks/useWebsiteFaqCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { BuilderCountedInput, BuilderCountedTextarea } from './builder-field';
import { RichTextEditor } from '@/components/common/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSectionTranslation, handleTranslationSave } from '@/hooks/useSectionTranslation';
import { TranslationSideCard } from './translation-side-card';
import { TranslationModeBanner } from './translation-mode-banner';

interface FaqFormContentProps {
    id?: number;
}

export function FaqFormContent({ id }: FaqFormContentProps) {
    const router = useRouter();
    const isEdit = Boolean(id);

    const { data: categories = [] } = useWebsiteFaqCategories();
    const { data: faq, isLoading: isFaqLoading } = useWebsiteFaq(id);

    const createMutation = useCreateWebsiteFaq();
    const updateMutation = useUpdateWebsiteFaq();

    const [question, setQuestion] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [tags, setTags] = useState('');
    const [answer, setAnswer] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState<number>(1);
    const [isFeatured, setIsFeatured] = useState(false);

    const [errors, setErrors] = useState<{ question?: string; category?: string; answer?: string; displayOrder?: string }>({});

    useEffect(() => {
        if (faq) {
            setQuestion(faq.question || '');
            setCategoryId(String(faq.faq_category_id || ''));
            setTags(faq.tags || '');
            setAnswer(faq.answer || '');
            setIsActive(Number(faq.is_active) === 1 || faq.is_active === true);
            setSortOrder(faq.sort_order ?? 1);
            setIsFeatured(Boolean(faq.is_featured));
        } else if (!isEdit && categories.length > 0 && !categoryId) {
            setCategoryId(String(categories[0].id));
        }
    }, [faq, categories, isEdit]);

    const isSaving = createMutation.isPending || updateMutation.isPending;

    // Per-form translation mode (?lang=<id>), same as Hero Section.
    // Field keys match the `faqs` entry in the backend FIELD_CATALOG, which
    // registers at page_slug='' with the FAQ row id as record_id.
    const translationFields = [
        { key: 'question', label: 'Question', type: 'textarea' as const, value: question },
        { key: 'answer', label: 'Answer', type: 'textarea' as const, value: answer },
    ];
    const translation = useSectionTranslation({
        section: 'faqs',
        recordId: id,
        fields: translationFields,
    });
    const { isTranslationMode, bind } = translation;
    // Category, tags, status, order and the featured flag are shared across
    // languages - they are edited from the English version only.
    const sharedOnly = cn(isTranslationMode && 'opacity-50 pointer-events-none');

    const handleSave = async () => {
        // In translation mode only the translated text is written; the FAQ row
        // itself is untouched, so the English validation below does not apply.
        if (await handleTranslationSave(translation, 'FAQ')) return;
        const newErrors: { question?: string; category?: string; answer?: string; displayOrder?: string } = {};

        if (!question.trim()) {
            newErrors.question = 'Question is required';
        }
        if (!categoryId) {
            newErrors.category = 'Category is required';
        }
        if (!answer.trim() || answer === '<p></p>') {
            newErrors.answer = 'Answer is required';
        }
        if (sortOrder === undefined || sortOrder === null || isNaN(sortOrder) || sortOrder <= 0) {
            newErrors.displayOrder = 'Display order is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const payload = {
            faq_category_id: Number(categoryId),
            question: question.trim(),
            answer: answer.trim(),
            tags: tags.trim() || null,
            is_active: isActive,
            sort_order: sortOrder,
            is_featured: isFeatured,
        };

        if (isEdit && id) {
            updateMutation.mutate({ id, data: payload }, {
                onSuccess: () => router.push('/admin/website-builder/faqs')
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => router.push('/admin/website-builder/faqs')
            });
        }
    };

    if (isEdit && isFaqLoading) {
        return (
            <div className="py-20 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Loading FAQ details...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16 text-foreground">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {isEdit ? 'Edit FAQ' : 'Add New FAQ'}
                        {isTranslationMode && translation.activeLanguage && (
                            <span className="ml-2 text-primary">({translation.activeLanguage.name})</span>
                        )}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Add a frequently asked question and answer to help your users.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/admin/website-builder/faqs')}
                        className="gap-2 border-border bg-card hover:bg-accent text-foreground font-semibold"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || translation.isSaving}
                        className="h-9 px-4 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-xs cursor-pointer"
                    >
                        {isSaving || translation.isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isSaving || translation.isSaving ? 'Saving...' : isTranslationMode ? 'Save Translation' : 'Save FAQ'}
                    </Button>
                </div>
            </div>

            {/* Languages + translation mode - only once the FAQ exists, since a
                translation slot is addressed by the saved row's id. */}
            {isEdit && id ? (
                <div className="flex flex-col gap-3">
                    <div className="w-full self-end lg:w-72">
                        <TranslationSideCard
                            section="faqs"
                            recordId={id}
                            activeLanguageId={translation.activeLanguage?.id ?? null}
                            buildHref={translation.buildHref}
                        canTranslate={translation.canTranslate}
                            fields={translationFields}
                        />
                    </div>
                    <div className="order-first min-w-0">
                        <TranslationModeBanner translation={translation} label="this FAQ" />
                    </div>
                </div>
            ) : null}

            {/* Section 1: FAQ Details */}
            <Card className="border-border bg-card shadow-xs overflow-hidden">
                <CardContent className="p-6 space-y-6">
                    <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3">
                        1. FAQ Details
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Column */}
                        <div className="lg:col-span-5 space-y-5">
                            {/* Question Input */}
                            <div>
                                <BuilderCountedTextarea
                                    label="Question"
                                    required
                                    maxLength={200}
                                    {...bind('question', question, (val) => {
                                        setQuestion(val);
                                        if (errors.question) setErrors(prev => ({ ...prev, question: undefined }));
                                    })}
                                    placeholder={isTranslationMode ? question : 'Enter the question here...'}
                                    textareaClassName={cn(
                                        'min-h-[90px] text-xs border-border bg-background text-foreground',
                                        errors.question && 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                                    )}
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Enter a clear and concise question.
                                </p>
                                {errors.question && (
                                    <p className="text-xs font-semibold text-red-500 mt-1">{errors.question}</p>
                                )}
                            </div>

                            {/* Category Select - shared across languages */}
                            <div className={cn('space-y-1.5', sharedOnly)}>
                                <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                                    Category <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={categoryId}
                                    onValueChange={(val) => {
                                        setCategoryId(val);
                                        if (errors.category) setErrors(prev => ({ ...prev, category: undefined }));
                                    }}
                                >
                                    <SelectTrigger className={cn(
                                        'h-10 text-xs border-border bg-background text-foreground',
                                        errors.category && 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                                    )}>
                                        <SelectValue placeholder="Select a category">
                                            {categories.find(c => String(c.id) === categoryId)?.name || ''}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category && (
                                    <p className="text-xs font-semibold text-red-500 mt-1">{errors.category}</p>
                                )}
                            </div>

                            {/* Tags Input - shared across languages */}
                            <div className={sharedOnly}>
                                <BuilderCountedInput
                                    label="Tags (Optional)"
                                    placeholder="Add tags and press Enter..."
                                    value={tags}
                                    onChange={setTags}
                                    maxLength={100}
                                    inputClassName="!h-10 text-xs border-border bg-background text-foreground"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Helps users find this FAQ easily.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Answer Rich Text Editor */}
                        <div className="lg:col-span-7 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                                    Answer <span className="text-red-500">*</span>
                                </Label>
                                <span className="text-[11px] text-muted-foreground">
                                    {answer.length}/2000
                                </span>
                            </div>

                            <div className={cn(
                                'border rounded-xl overflow-hidden bg-background transition-all',
                                errors.answer ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                            )}>
                                <RichTextEditor
                                    {...bind('answer', answer, (val) => {
                                        setAnswer(val);
                                        if (errors.answer) setErrors(prev => ({ ...prev, answer: undefined }));
                                    })}
                                    placeholder="Enter the answer here..."
                                />
                            </div>

                            <p className="text-[11px] text-muted-foreground mt-1">
                                Provide a helpful and accurate answer.
                            </p>
                            {errors.answer && (
                                <p className="text-xs font-semibold text-red-500 mt-1">{errors.answer}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Settings */}
            <Card className="border-border bg-card shadow-xs overflow-hidden">
                <CardContent className="p-6 space-y-6">
                    <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3">
                        2. Settings
                    </h2>

                    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-6 items-start', sharedOnly)}>
                        {/* Status Toggle - shared across languages */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                                Status <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-3 pt-1">
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                                <span className={`text-xs font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Active FAQs will be visible to users.
                            </p>
                        </div>

                        {/* Display Order */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                                Display Order <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                value={sortOrder}
                                onChange={(e) => {
                                    setSortOrder(Number(e.target.value));
                                    if (errors.displayOrder) setErrors(prev => ({ ...prev, displayOrder: undefined }));
                                }}
                                className={cn(
                                    'h-10 text-xs border-border bg-background text-foreground',
                                    errors.displayOrder && 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                                )}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Set the order in which this FAQ will appear.
                            </p>
                            {errors.displayOrder && (
                                <p className="text-xs font-semibold text-red-500 mt-1">{errors.displayOrder}</p>
                            )}
                        </div>

                        {/* Featured FAQ Toggle */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-foreground">
                                Featured FAQ
                            </Label>
                            <div className="flex items-center gap-3 pt-1">
                                <Switch
                                    checked={isFeatured}
                                    onCheckedChange={setIsFeatured}
                                />
                                <span className={`text-xs font-bold ${isFeatured ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {isFeatured ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Toggle on to highlight this FAQ.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
