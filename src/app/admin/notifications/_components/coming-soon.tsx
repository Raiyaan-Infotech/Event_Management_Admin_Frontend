'use client';

import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ComingSoon({ title, description }: { title: string; description: string }) {
    return (
        <div className="space-y-5">
            <div className="border-b border-border pb-4">
                <h1 className="text-xl font-extrabold tracking-tight text-foreground">{title}</h1>
            </div>
            <Card className="border-border bg-card shadow-xs">
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Construction className="h-6 w-6" />
                    </span>
                    <p className="text-sm font-medium text-foreground">Coming soon</p>
                    <p className="max-w-md text-xs text-muted-foreground">{description}</p>
                </CardContent>
            </Card>
        </div>
    );
}
