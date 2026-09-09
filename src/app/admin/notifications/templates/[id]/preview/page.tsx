'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function NotificationTemplatePreviewPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();

    useEffect(() => {
        if (params?.id) {
            router.replace(`/admin/notifications/templates?preview=${params.id}`);
        } else {
            router.replace('/admin/notifications/templates');
        }
    }, [params, router]);

    return (
        <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">Opening template preview...</p>
        </div>
    );
}
