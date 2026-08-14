'use client';

import { useState } from 'react';
import { TaxonomyManager } from '../_components/taxonomy-manager';
import {
    useEventTypes,
    useCreateEventType,
    useUpdateEventType,
    useUpdateEventTypeStatus,
    useDeleteEventType,
    useEventCategories,
    type EventType,
} from '@/hooks/use-menu-management';

export default function EventTypesPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useEventTypes({ page, limit, search: search || undefined });

    // Every category, not the paginated first 10 — this feeds a select, and a
    // category missing from it cannot be chosen at all.
    const { data: categories, isLoading: categoriesLoading } = useEventCategories({ limit: 200, is_active: true });

    const createType = useCreateEventType();
    const updateType = useUpdateEventType();
    const toggleStatus = useUpdateEventTypeStatus();
    const deleteType = useDeleteEventType();

    return (
        <TaxonomyManager<EventType>
            entityLabel="Event Type"
            entityPlural="Event Types"
            description="Create and manage the event types that sit under each event category."
            nameLabel="Event Type Name"
            namePlaceholder="Enter event type name"
            iconLabel="Type Icon"
            colorLabel="Type Color"
            permissionPrefix="event_types"
            defaultColor="#6366F1"
            scopeSelects={[
                {
                    key: 'event_category_id',
                    label: 'Event Category',
                    placeholder: 'Select event category',
                    options: categories?.data ?? [],
                    isLoading: categoriesLoading,
                    emptyHint: 'No event categories yet — create one first.',
                },
            ]}
            data={data?.data ?? []}
            pagination={data?.pagination ?? null}
            isLoading={isLoading}
            isSaving={createType.isPending || updateType.isPending}
            isDeleting={deleteType.isPending}
            onPageChange={setPage}
            onLimitChange={(v) => {
                setLimit(v);
                setPage(1);
            }}
            onSearch={(v) => {
                setSearch(v);
                setPage(1);
            }}
            onCreate={(payload, done) => createType.mutate(payload, { onSuccess: done })}
            onUpdate={(id, payload, done) => updateType.mutate({ id, data: payload }, { onSuccess: done })}
            onToggleStatus={(id, is_active) => toggleStatus.mutate({ id, is_active })}
            onDelete={(id, done) => deleteType.mutate(id, { onSuccess: done })}
        />
    );
}
