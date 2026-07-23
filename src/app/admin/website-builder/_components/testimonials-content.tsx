'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Sparkles, Pencil, Star, Upload, User } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Testimonial {
    id: string;
    customerName: string;
    eventName: string;
    feedback: string;
    rating: number;
    showRating: boolean;
    status: boolean;
    isFeatured: boolean;
}

export function TestimonialsContent() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([
        {
            id: '1',
            customerName: 'Eleanor Vance',
            eventName: 'Grand Wedding Reception',
            feedback: 'The team handled our 500-guest wedding seamlessly. Every detail was elegant and executed to perfection!',
            rating: 5,
            showRating: true,
            status: true,
            isFeatured: true,
        },
        {
            id: '2',
            customerName: 'Marcus Sterling',
            eventName: 'Annual Corporate Gala',
            feedback: 'Outstanding production quality and timeline control for our keynote summit. Highly recommended.',
            rating: 5,
            showRating: true,
            status: true,
            isFeatured: false,
        },
    ]);

    const [editingId, setEditingId] = useState<string | null>('1');
    const [isSaving, setIsSaving] = useState(false);

    const activeItem = testimonials.find((t) => t.id === editingId) || testimonials[0];

    const NAME_MAX = 60;
    const EVENT_MAX = 60;
    const FEEDBACK_MAX = 300;

    const handleAddTestimonial = () => {
        const newItem: Testimonial = {
            id: Date.now().toString(),
            customerName: 'New Client',
            eventName: 'Event Name',
            feedback: 'Customer feedback testimonial text goes here...',
            rating: 5,
            showRating: true,
            status: true,
            isFeatured: false,
        };
        setTestimonials([...testimonials, newItem]);
        setEditingId(newItem.id);
        toast.info('New testimonial added for editing.');
    };

    const handleDeleteTestimonial = (id: string) => {
        setTestimonials(testimonials.filter((t) => t.id !== id));
        if (editingId === id) setEditingId(testimonials[0]?.id || null);
        toast.success('Testimonial removed.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Testimonials saved successfully!');
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
                            <Sparkles className="h-3 w-3" /> Website Builder
                        </Badge>
                        <Badge variant="secondary" className="text-xs">Super Admin Panel</Badge>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Client Testimonials</h1>
                    <p className="text-sm text-muted-foreground">Manage customer reviews, star ratings, event names, and featured badges.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleAddTestimonial} className="gap-1.5">
                        <Plus className="h-4 w-4" /> Add Testimonial
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                        <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Testimonials'}
                    </Button>
                </div>
            </div>

            {/* Testimonials Management List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Testimonials List</CardTitle>
                    <CardDescription>Select a review to edit customer details and feedback copy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {testimonials.map((item) => (
                        <div
                            key={item.id}
                            className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3 transition-all ${
                                editingId === item.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'bg-card'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                    {item.customerName[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">{item.customerName}</h4>
                                        {item.isFeatured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{item.eventName}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-amber-500 text-xs">
                                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                                    <span className="font-bold">{item.rating}.0</span>
                                </div>
                                <Switch
                                    checked={item.status}
                                    onCheckedChange={(val) => {
                                        setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, status: val } : t)));
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant={editingId === item.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setEditingId(item.id)}
                                    className="gap-1 text-xs"
                                >
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteTestimonial(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Testimonial Form Editor */}
            {activeItem && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Edit Testimonial ({activeItem.customerName})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Customer Name */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-muted-foreground">Customer Name</Label>
                                    <span className="text-[10px] text-muted-foreground">{activeItem.customerName.length}/{NAME_MAX}</span>
                                </div>
                                <Input
                                    value={activeItem.customerName}
                                    onChange={(e) => {
                                        setTestimonials(testimonials.map((t) => (t.id === activeItem.id ? { ...t, customerName: e.target.value } : t)));
                                    }}
                                    maxLength={NAME_MAX}
                                    className="h-9 text-sm"
                                />
                            </div>

                            {/* Event Name */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-muted-foreground">Event Name / Occasion</Label>
                                    <span className="text-[10px] text-muted-foreground">{activeItem.eventName.length}/{EVENT_MAX}</span>
                                </div>
                                <Input
                                    value={activeItem.eventName}
                                    onChange={(e) => {
                                        setTestimonials(testimonials.map((t) => (t.id === activeItem.id ? { ...t, eventName: e.target.value } : t)));
                                    }}
                                    maxLength={EVENT_MAX}
                                    className="h-9 text-sm"
                                />
                            </div>
                        </div>

                        {/* Rating & Switches */}
                        <div className="grid gap-4 md:grid-cols-3 pt-1">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Rating Stars</Label>
                                <div className="flex items-center gap-1 pt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => {
                                                setTestimonials(testimonials.map((t) => (t.id === activeItem.id ? { ...t, rating: star } : t)));
                                            }}
                                            className="p-1 text-amber-500 focus:outline-none"
                                        >
                                            <Star className={`h-5 w-5 ${star <= activeItem.rating ? 'fill-amber-500' : 'text-muted-foreground'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                                <span className="text-xs font-semibold">Show Rating Stars</span>
                                <Switch
                                    checked={activeItem.showRating}
                                    onCheckedChange={(val) => {
                                        setTestimonials(testimonials.map((t) => (t.id === activeItem.id ? { ...t, showRating: val } : t)));
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                                <span className="text-xs font-semibold">Featured Badge</span>
                                <Switch
                                    checked={activeItem.isFeatured}
                                    onCheckedChange={(val) => {
                                        setTestimonials(testimonials.map((t) => (t.id === activeItem.id ? { ...t, isFeatured: val } : t)));
                                    }}
                                />
                            </div>
                        </div>

                        {/* Feedback Copy */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-muted-foreground">Feedback Review Text</Label>
                                <span className="text-[10px] text-muted-foreground">{activeItem.feedback.length}/{FEEDBACK_MAX}</span>
                            </div>
                            <Textarea
                                value={activeItem.feedback}
                                onChange={(e) => {
                                    setTestimonials(testimonials.map((t) => (t.id === activeItem.id ? { ...t, feedback: e.target.value } : t)));
                                }}
                                maxLength={FEEDBACK_MAX}
                                rows={3}
                                className="text-sm"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
