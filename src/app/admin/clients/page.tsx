'use client';

/**
 * Clients — people who signed themselves up on the public tenant website.
 *
 * Read-mostly by nature: rows arrive from the website's signup form, so the
 * primary actions here are reviewing, activating/blocking and deleting rather
 * than creating. An admin CAN add one manually (source = 'admin').
 *
 * Distinct from the vendor portal's Clients screen, which reads `vendor_clients`
 * — clients a vendor creates and grants a portal login to.
 */

import { useState } from 'react';
import { Users, UserCheck, UserX, ShieldOff, Plus, Mail, Phone } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { CommonTable, type CommonColumn } from '@/components/common/common-table';
import { PageLoader } from '@/components/common/page-loader';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ClientFormDialog } from './_components/client-form-dialog';
import {
    useWebsiteClients,
    useWebsiteClientStats,
    useUpdateWebsiteClientStatus,
    useDeleteWebsiteClient,
    type WebsiteClient,
    type WebsiteClientSource,
} from '@/hooks/use-website-clients';

const SOURCE_LABELS: Record<WebsiteClientSource, string> = {
    website: 'Website',
    google: 'Google',
    facebook: 'Facebook',
    admin: 'Admin',
};

export default function ClientsPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [source, setSource] = useState<WebsiteClientSource | 'all'>('all');

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<WebsiteClient | null>(null);
    const [deleting, setDeleting] = useState<WebsiteClient | null>(null);

    const { data, isLoading } = useWebsiteClients({
        page,
        limit,
        search: search || undefined,
        source: source === 'all' ? undefined : source,
    });
    const { data: stats } = useWebsiteClientStats();

    const toggleStatus = useUpdateWebsiteClientStatus();
    const deleteClient = useDeleteWebsiteClient();

    const rows: WebsiteClient[] = data?.data ?? [];
    const pagination = data?.pagination;

    // One overlay covering every mutation on this page, rather than per-button
    // spinners.
    const busy = toggleStatus.isPending || deleteClient.isPending;

    const statCards = [
        { key: 'total', label: 'Total Clients', value: stats?.total ?? 0, icon: Users },
        { key: 'active', label: 'Active', value: stats?.active ?? 0, icon: UserCheck },
        { key: 'inactive', label: 'Inactive', value: stats?.inactive ?? 0, icon: UserX },
        { key: 'blocked', label: 'Blocked', value: stats?.blocked ?? 0, icon: ShieldOff },
    ];

    const columns: CommonColumn<WebsiteClient>[] = [
        {
            key: 'name',
            header: 'Name',
            className: 'min-w-[180px]',
            render: (row) => (
                <div className="min-w-0">
                    {/* break-all + line-clamp, never truncate — the table is
                        auto-layout, so truncate collapses the cell. */}
                    <p className="break-all line-clamp-2 font-medium">{row.name}</p>
                    {row.vendor?.company_name ? (
                        <p className="break-all line-clamp-1 text-xs text-muted-foreground">
                            {row.vendor.company_name}
                        </p>
                    ) : null}
                </div>
            ),
        },
        {
            key: 'email',
            header: 'Email',
            className: 'min-w-[200px]',
            render: (row) => (
                <div className="flex min-w-0 items-center gap-1.5" title={row.email}>
                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="break-all line-clamp-2">{row.email}</span>
                </div>
            ),
        },
        {
            key: 'mobile',
            header: 'Mobile',
            hideOnMobile: true,
            render: (row) =>
                row.mobile ? (
                    <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="break-all">
                            {row.dial_code ? `${row.dial_code} ` : ''}
                            {row.mobile}
                        </span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            key: 'source',
            header: 'Source',
            hideOnMobile: true,
            render: (row) => (
                <Badge variant={row.source === 'admin' ? 'secondary' : 'outline'}>
                    {SOURCE_LABELS[row.source] ?? row.source}
                </Badge>
            ),
        },
    ];

    return (
        <>
            <PageLoader open={busy} />

            <PageHeader
                title="Clients"
                description="People who signed up through your public website."
                action={
                    <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Client
                    </Button>
                }
            />

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card key={card.key} className="flex items-center gap-3 p-4">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-lg font-bold leading-tight">{card.value}</p>
                                <p className="truncate text-xs text-muted-foreground">{card.label}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <Select
                    value={source}
                    onValueChange={(value) => {
                        setSource(value as WebsiteClientSource | 'all');
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <CommonTable<WebsiteClient>
                columns={columns}
                data={rows}
                isLoading={isLoading}
                emptyMessage="No clients have signed up yet."
                searchPlaceholder="Search by name, email or mobile..."
                onSearch={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                onStatusToggle={(row, value) =>
                    toggleStatus.mutate({ id: row.id, is_active: value ? 1 : 0 })
                }
                onEdit={(row) => {
                    setEditing(row);
                    setFormOpen(true);
                }}
                onDelete={(row) => setDeleting(row)}
                pagination={
                    pagination
                        ? {
                              page,
                              pageSize: limit,
                              totalItems: pagination.totalItems ?? pagination.total ?? 0,
                              totalPages: pagination.totalPages ?? 1,
                              onPageChange: setPage,
                              onPageSizeChange: (size) => {
                                  setLimit(size);
                                  setPage(1);
                              },
                          }
                        : undefined
                }
            />

            <ClientFormDialog
                open={formOpen}
                client={editing}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditing(null);
                }}
            />

            <DeleteDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete client?"
                description={
                    deleting
                        ? `This removes ${deleting.name} (${deleting.email}) from your client list. This cannot be undone.`
                        : undefined
                }
                isDeleting={deleteClient.isPending}
                onConfirm={() => {
                    if (!deleting) return;
                    deleteClient.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
                }}
            />
        </>
    );
}
