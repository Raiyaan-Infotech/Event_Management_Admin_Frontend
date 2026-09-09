'use client';

import { useState } from 'react';
import { TaxonomyManager } from '../_components/taxonomy-manager';
import {
    useGuestRelationshipOptions,
    useCreateGuestRelationshipOption,
    useUpdateGuestRelationshipOption,
    useUpdateGuestRelationshipOptionStatus,
    useDeleteGuestRelationshipOption,
    useEventCategories,
    type GuestOption,
} from '@/hooks/use-menu-management';

/**
 * "Relationship with Invitor" — step 1 of the mobile app's guest registration.
 *
 * Managed here rather than hardcoded in the Flutter build: a hardcoded list can
 * only change by shipping through app-store review, which is days to add one
 * value. Rows here reach every installed app immediately.
 *
 * Unlike Religions, the category is OPTIONAL. A row with no category is the
 * fallback list, used when an event has no category, or its category has no
 * list of its own — without it a guest could open the form to an empty
 * dropdown.
 *
 * Icon, colour and description are hidden: these are hundreds of plain labels
 * ("Bride's Father", "Colleague") and demanding artwork for each would be
 * busywork that nothing ever renders.
 */
export default function GuestRelationshipsPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    // Filters the TABLE, not the form. The lists run to ~200 rows across 17
    // categories, so browsing "the wedding list" is the normal way to work.
    const [filterCategoryId, setFilterCategoryId] = useState('');

    const { data, isLoading } = useGuestRelationshipOptions({
        page,
        limit,
        search: search || undefined,
        event_category_id: filterCategoryId || undefined,
    });

    // limit:200 — a select that lists only the first page of options silently
    // hides the rest, and there are 17 categories.
    const { data: categories, isLoading: categoriesLoading } = useEventCategories({
        limit: 200,
        is_active: true,
    });

    const createOption = useCreateGuestRelationshipOption();
    const updateOption = useUpdateGuestRelationshipOption();
    const toggleStatus = useUpdateGuestRelationshipOptionStatus();
    const deleteOption = useDeleteGuestRelationshipOption();

    return (
        <TaxonomyManager<GuestOption>
            entityLabel="Relationship"
            entityPlural="Guest Relationships"
            description="Values offered in the “Relationship with Invitor” dropdown when a guest registers in the app. Leave the category empty to make a value part of the fallback list every event can use."
            nameLabel="Relationship"
            namePlaceholder="e.g. Bride's Father"
            iconLabel="Icon"
            colorLabel="Color"
            permissionPrefix="guest_relationship_options"
            hiddenFields={['description', 'icon', 'color']}
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
            isSaving={createOption.isPending || updateOption.isPending}
            isDeleting={deleteOption.isPending}
            onPageChange={setPage}
            onLimitChange={(v) => {
                setLimit(v);
                setPage(1);
            }}
            onSearch={(v) => {
                setSearch(v);
                setPage(1);
            }}
            onCreate={(payload, done) => createOption.mutate(payload, { onSuccess: done })}
            onUpdate={(id, payload, done) => updateOption.mutate({ id, data: payload }, { onSuccess: done })}
            onToggleStatus={(id, is_active) => toggleStatus.mutate({ id, is_active })}
            onDelete={(id, done) => deleteOption.mutate(id, { onSuccess: done })}
        />
    );
}
