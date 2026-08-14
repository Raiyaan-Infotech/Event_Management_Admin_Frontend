'use client';

import { useState } from 'react';
import { TaxonomyManager } from '../_components/taxonomy-manager';
import {
    useReligions,
    useCreateReligion,
    useUpdateReligion,
    useUpdateReligionStatus,
    useDeleteReligion,
    useEventCategories,
    useEventTypes,
    type Religion,
} from '@/hooks/use-menu-management';

export default function ReligionsPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    // Which category the form currently has selected, so the Event Type list
    // can be fetched for it. Held here because the options have to be resolved
    // before TaxonomyManager renders them.
    const [formCategoryId, setFormCategoryId] = useState('');

    const { data, isLoading } = useReligions({ page, limit, search: search || undefined });

    // limit:200 — a select that lists only the first page of options silently
    // hides the rest.
    const { data: categories, isLoading: categoriesLoading } = useEventCategories({
        limit: 200,
        is_active: true,
    });

    // Scoped to the chosen category, so a type from another category can never
    // be picked — the backend rejects that pairing.
    const { data: eventTypes, isLoading: typesLoading } = useEventTypes({
        limit: 200,
        is_active: true,
        event_category_id: formCategoryId || undefined,
    });

    const createReligion = useCreateReligion();
    const updateReligion = useUpdateReligion();
    const toggleStatus = useUpdateReligionStatus();
    const deleteReligion = useDeleteReligion();

    return (
        <TaxonomyManager<Religion>
            entityLabel="Religion"
            entityPlural="Religions"
            description="Create and manage religions under each event category and type."
            nameLabel="Religion Name"
            namePlaceholder="Enter religion name"
            iconLabel="Religion Icon"
            colorLabel="Icon Color"
            permissionPrefix="religions"
            defaultColor="#8B5CF6"
            scopeSelects={[
                {
                    key: 'event_category_id',
                    label: 'Event Category',
                    placeholder: 'Select event category',
                    options: categories?.data ?? [],
                    isLoading: categoriesLoading,
                    emptyHint: 'No event categories yet — create one first.',
                    // Changing category invalidates the chosen type.
                    clears: ['event_type_id'],
                },
                {
                    key: 'event_type_id',
                    label: 'Event Type',
                    placeholder: formCategoryId ? 'Select event type' : 'Select a category first',
                    options: eventTypes?.data ?? [],
                    isLoading: typesLoading,
                    emptyHint: 'No event types in this category.',
                    disabledUntil: 'event_category_id',
                },
            ]}
            onScopeChange={(key, value) => {
                if (key === 'event_category_id') setFormCategoryId(value);
            }}
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
