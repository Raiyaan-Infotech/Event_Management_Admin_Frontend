'use client';

import { useState } from 'react';
import { TaxonomyManager } from '../_components/taxonomy-manager';
import {
    useResponsibilities,
    useCreateResponsibility,
    useUpdateResponsibility,
    useUpdateResponsibilityStatus,
    useDeleteResponsibility,
    useEventCategories,
    type GuestOption,
} from '@/hooks/use-menu-management';

/**
 * Menu Management → Responsibilities (Jamal, 2026-10-27).
 *
 * What the event's Contact Person handles ("Guest Help Desk", "Venue
 * Guidance", ...): a label name and a description, linked to an event
 * category. The app's Contact Person profile shows the event category's list.
 * Was a field on the Menu form; it is its own module now.
 *
 * A row with no category is the fallback list, used by events whose category
 * has no list of its own.
 */
export default function ResponsibilitiesPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [filterCategoryId, setFilterCategoryId] = useState('');

    const { data, isLoading } = useResponsibilities({
        page,
        limit,
        search: search || undefined,
        event_category_id: filterCategoryId || undefined,
    });

    const { data: categories, isLoading: categoriesLoading } = useEventCategories({
        limit: 200,
        is_active: true,
    });

    const createRow = useCreateResponsibility();
    const updateRow = useUpdateResponsibility();
    const toggleStatus = useUpdateResponsibilityStatus();
    const deleteRow = useDeleteResponsibility();

    return (
        <TaxonomyManager<GuestOption>
            entityLabel="Responsibility"
            entityPlural="Responsibilities"
            description="What the event's Contact Person handles, shown on the Contact Person profile in the app. Each responsibility belongs to an event category; leave the category empty to make it part of the fallback list."
            nameLabel="Label Name"
            namePlaceholder="e.g. Guest Help Desk"
            iconLabel="Icon"
            colorLabel="Color"
            permissionPrefix="event_responsibilities"
            hiddenFields={['icon', 'color']}
            scopeSelects={[
                {
                    key: 'event_category_id',
                    label: 'Event Category',
                    placeholder: 'All categories (general)',
                    options: categories?.data ?? [],
                    isLoading: categoriesLoading,
                    optional: true,
                    optionalLabel: 'All categories (general)',
                },
            ]}
            onScopeChange={(key, value) => {
                if (key === 'event_category_id') setFilterCategoryId(value);
            }}
            data={data?.data ?? []}
            pagination={data?.pagination ?? null}
            isLoading={isLoading}
            isSaving={createRow.isPending || updateRow.isPending}
            isDeleting={deleteRow.isPending}
            onPageChange={setPage}
            onLimitChange={(v) => {
                setLimit(v);
                setPage(1);
            }}
            onSearch={(v) => {
                setSearch(v);
                setPage(1);
            }}
            onCreate={(payload, done) => createRow.mutate(payload, { onSuccess: done })}
            onUpdate={(id, payload, done) => updateRow.mutate({ id, data: payload }, { onSuccess: done })}
            onToggleStatus={(id, is_active) => toggleStatus.mutate({ id, is_active })}
            onDelete={(id, done) => deleteRow.mutate(id, { onSuccess: done })}
        />
    );
}
