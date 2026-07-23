'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, Sparkles, Folder, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ContactCategory {
    id: string;
    name: string;
    isProtected: boolean;
}

export default function ContactCategoriesPage() {
    const [categories, setCategories] = useState<ContactCategory[]>([
        { id: '1', name: 'Wedding Inquiry', isProtected: false },
        { id: '2', name: 'Corporate Event', isProtected: false },
        { id: '3', name: 'Birthday & Private Party', isProtected: false },
        { id: '4', name: 'Other', isProtected: true },
    ]);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) {
            toast.error('Category name cannot be empty.');
            return;
        }
        const newCat: ContactCategory = {
            id: Date.now().toString(),
            name: newCategoryName.trim(),
            isProtected: false,
        };
        setCategories([...categories, newCat]);
        setNewCategoryName('');
        toast.success('Contact category added.');
    };

    const handleDeleteCategory = (id: string) => {
        const cat = categories.find((c) => c.id === id);
        if (cat?.isProtected) {
            toast.error('Protected "Other" category cannot be deleted.');
            return;
        }
        setCategories(categories.filter((c) => c.id !== id));
        toast.success('Category deleted.');
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
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Contact Inquiry Categories</h1>
                    <p className="text-sm text-muted-foreground">Manage categories available in the contact form dropdown menu.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Add New Contact Category</CardTitle>
                    <CardDescription>Enter a new inquiry topic or service type for contact submissions.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                    <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Venue Booking & Catering"
                        className="max-w-md"
                    />
                    <Button onClick={handleAddCategory} className="gap-1.5">
                        <Plus className="h-4 w-4" /> Add Category
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Existing Contact Categories</CardTitle>
                    <CardDescription>Category list displayed on the contact inquiry dropdown.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between rounded-lg border p-3 bg-card">
                            <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold">{cat.name}</span>
                                {cat.isProtected && (
                                    <Badge variant="secondary" className="gap-1 text-[10px] text-amber-600">
                                        <Lock className="h-2.5 w-2.5" /> Protected System
                                    </Badge>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={cat.isProtected}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 disabled:opacity-40"
                                onClick={() => handleDeleteCategory(cat.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
