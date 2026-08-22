'use client';

/**
 * Frame Style detail — the Action menu's "View".
 *
 * Shows the artwork applied to a sample invitation rather than only the file on
 * its own: a border SVG viewed flat is hard to judge, and framing sample content
 * is the whole reason the record exists.
 */

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, FileImage, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FramePreview } from '../_components/frame-preview';
import {
    useFrameStyle,
    layoutsLabel,
    normaliseLayouts,
    FRAME_LAYOUTS,
} from '@/hooks/use-frame-styles';

export default function FrameStyleDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: frame, isLoading } = useFrameStyle(id);

    if (isLoading) return <PageLoader open />;

    if (!frame) {
        return (
            <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">This frame style no longer exists.</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push('/admin/templates/frame-styles')}
                >
                    Back to Frame Styles
                </Button>
            </Card>
        );
    }

    const rows: Array<{ label: string; value: React.ReactNode }> = [
        {
            label: 'Category',
            value: frame.category ? (
                <Badge variant="secondary">{frame.category.name}</Badge>
            ) : (
                <span className="text-muted-foreground">Uncategorised</span>
            ),
        },
        { label: 'Supported Layouts', value: layoutsLabel(frame.supported_layouts) },
        {
            label: 'Publish Status',
            value: (
                <Badge variant={frame.status === 'published' ? 'default' : 'outline'}>
                    {frame.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
            ),
        },
        {
            label: 'Status',
            value: (
                <span className="flex items-center gap-1.5">
                    <span
                        className={`h-2 w-2 rounded-full ${Number(frame.is_active) === 1 ? 'bg-green-500' : 'bg-muted-foreground'}`}
                    />
                    {Number(frame.is_active) === 1 ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            label: 'File',
            value: frame.file_url ? (
                <a
                    href={frame.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 break-all text-primary underline-offset-2 hover:underline"
                >
                    <FileImage className="h-3.5 w-3.5 shrink-0" />
                    {frame.file_name || 'Open file'}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
        },
        { label: 'Created By', value: frame.creator?.full_name || '—' },
        { label: 'Last Updated By', value: frame.updater?.full_name || '—' },
        {
            label: 'Created',
            value: frame.created_at ? new Date(frame.created_at).toLocaleDateString() : '—',
        },
    ];

    return (
        <>
            <PageHeader
                title={frame.name}
                description="Frame style"
                action={
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/admin/templates/frame-styles')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button
                            onClick={() =>
                                router.push(`/admin/templates/frame-styles/create?id=${frame.id}`)
                            }
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="p-5">
                    <h2 className="text-base font-bold text-foreground">Details</h2>
                    <dl className="mt-4 divide-y divide-border">
                        {rows.map((row) => (
                            <div
                                key={row.label}
                                className="grid grid-cols-[140px_1fr] gap-3 py-2.5 text-sm"
                            >
                                <dt className="text-muted-foreground">{row.label}</dt>
                                <dd className="min-w-0 break-words font-medium">{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                </Card>

                <Card className="p-5">
                    <FramePreview
                        fileUrl={frame.file_url}
                        layouts={
                            normaliseLayouts(frame.supported_layouts).length
                                ? normaliseLayouts(frame.supported_layouts)
                                : [...FRAME_LAYOUTS]
                        }
                    />
                </Card>
            </div>
        </>
    );
}
