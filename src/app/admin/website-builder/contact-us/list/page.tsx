'use client';

import { useState } from 'react';
import { Sparkles, Trash2, Mail, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    category: string;
    categoryOther?: string;
    message: string;
    date: string;
}

export default function ContactListPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([
        {
            id: '101',
            name: 'Elena Rostova',
            email: 'elena@example.com',
            category: 'Wedding Inquiry',
            message: 'Looking for full wedding planning and stage floral decor for December 2026.',
            date: '2026-07-20',
        },
        {
            id: '102',
            name: 'Robert Vance',
            email: 'rvance@vancecorp.com',
            category: 'Other',
            categoryOther: 'Annual Corporate Gala',
            message: 'Need a quote for lighting and sound staging for 500 executives.',
            date: '2026-07-21',
        },
    ]);

    const handleDeleteMessage = (id: string) => {
        setMessages(messages.filter((m) => m.id !== id));
        toast.success('Contact submission deleted.');
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
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Contact Submissions List</h1>
                    <p className="text-sm text-muted-foreground">View and manage messages submitted via the public contact form.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Received Contact Inquiries</CardTitle>
                    <CardDescription>Submitted contact form records with full category details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {messages.map((msg) => (
                        <div key={msg.id} className="rounded-lg border p-4 space-y-2 bg-card">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm">{msg.name}</h4>
                                    <span className="text-xs text-muted-foreground">({msg.email})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px]">
                                        {msg.category} {msg.categoryOther ? `- ${msg.categoryOther}` : ''}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{msg.date}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteMessage(msg.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed">{msg.message}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
