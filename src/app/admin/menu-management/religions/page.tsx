'use client';

import { useState } from 'react';
import { TaxonomyManager } from '../_components/taxonomy-manager';
import {
    useReligions,
    useCreateReligion,
    useUpdateReligion,
    useUpdateReligionStatus,
    useDeleteReligion,
    type Religion,
} from '@/hooks/use-menu-management';

export default function ReligionsPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useReligions({ page, limit, search: search || undefined });
    const createReligion = useCreateReligion();
    const updateReligion = useUpdateReligion();
    const toggleStatus = useUpdateReligionStatus();
    const deleteReligion = useDeleteReligion();

    return (
        <TaxonomyManager<Religion>
            entityLabel="Religion"
            entityPlural="Religions"
            description="Create and manage religions that menus can be filtered by."
            breadcrumb={['Dashboard', 'Menu Management', 'Religion']}
            nameLabel="Religion Name"
            namePlaceholder="Enter religion name"
            iconLabel="Religion Icon"
            colorLabel="Icon Color"
            permissionPrefix="religions"
            defaultColor="#8B5CF6"
            data={data?.data ?? []}
            pagination={data?.pagination ?? null}
            isLoading={isLoading}
            isSaving={createReligion.isPending || updateReligion.isPending}
            isDeleting={deleteReligion.isPending}
            onPageChange={setPage}
            onLimitChange={(v) => {
                setLimit(v);
                setPage(1);
            }}
            onSearch={(v) => {
                setSearch(v);
                setPage(1);
            }}
            onCreate={(payload, done) => createReligion.mutate(payload, { onSuccess: done })}
            onUpdate={(id, payload, done) => updateReligion.mutate({ id, data: payload }, { onSuccess: done })}
            onToggleStatus={(id, is_active) => toggleStatus.mutate({ id, is_active })}
            onDelete={(id, done) => deleteReligion.mutate(id, { onSuccess: done })}
        />
    );
}
