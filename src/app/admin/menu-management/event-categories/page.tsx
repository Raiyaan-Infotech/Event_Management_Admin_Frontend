'use client';

import { useState } from 'react';
import { TaxonomyManager } from '../_components/taxonomy-manager';
import {
    useEventCategories,
    useCreateEventCategory,
    useUpdateEventCategory,
    useUpdateEventCategoryStatus,
    useDeleteEventCategory,
    type EventCategory,
} from '@/hooks/use-menu-management';

export default function EventCategoriesPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useEventCategories({ page, limit, search: search || undefined });
    const createCategory = useCreateEventCategory();
    const updateCategory = useUpdateEventCategory();
    const toggleStatus = useUpdateEventCategoryStatus();
    const deleteCategory = useDeleteEventCategory();

    return (
        <TaxonomyManager<EventCategory>
            entityLabel="Event Category"
            entityPlural="Event Categories"
            description="Create and manage the categories that group your events."
            nameLabel="Category Name"
            namePlaceholder="Enter event category name"
            iconLabel="Category Icon"
            colorLabel="Category Color"
            permissionPrefix="event_categories"
            defaultColor="#7C5AED"
            data={data?.data ?? []}
            pagination={data?.pagination ?? null}
            isLoading={isLoading}
            isSaving={createCategory.isPending || updateCategory.isPending}
            isDeleting={deleteCategory.isPending}
            onPageChange={setPage}
            onLimitChange={(v) => {
                setLimit(v);
                setPage(1);
            }}
            onSearch={(v) => {
                setSearch(v);
                setPage(1);
            }}
            onCreate={(payload, done) => createCategory.mutate(payload, { onSuccess: done })}
            onUpdate={(id, payload, done) => updateCategory.mutate({ id, data: payload }, { onSuccess: done })}
            onToggleStatus={(id, is_active) => toggleStatus.mutate({ id, is_active })}
            onDelete={(id, done) => deleteCategory.mutate(id, { onSuccess: done })}
        />
    );
}
