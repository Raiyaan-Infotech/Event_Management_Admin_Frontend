'use client';

import { useState } from 'react';
import { TaxonomyManager } from '../_components/taxonomy-manager';
import {
    useGuestFoodPreferenceOptions,
    useCreateGuestFoodPreferenceOption,
    useUpdateGuestFoodPreferenceOption,
    useUpdateGuestFoodPreferenceOptionStatus,
    useDeleteGuestFoodPreferenceOption,
    useEventCategories,
    type GuestOption,
} from '@/hooks/use-menu-management';

/**
 * "Food Preference" — step 1 of the mobile app's guest registration.
 *
 * Mirrors the Guest Relationships screen exactly; see that file's header for
 * why the category is optional and why icon/colour/description are hidden.
 */
export default function GuestFoodPreferencesPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    const [filterCategoryId, setFilterCategoryId] = useState('');

    const { data, isLoading } = useGuestFoodPreferenceOptions({
        page,
        limit,
        search: search || undefined,
        event_category_id: filterCategoryId || undefined,
    });

    const { data: categories, isLoading: categoriesLoading } = useEventCategories({
        limit: 200,
        is_active: true,
    });

    const createOption = useCreateGuestFoodPreferenceOption();
    const updateOption = useUpdateGuestFoodPreferenceOption();
    const toggleStatus = useUpdateGuestFoodPreferenceOptionStatus();
    const deleteOption = useDeleteGuestFoodPreferenceOption();

    return (
        <TaxonomyManager<GuestOption>
            entityLabel="Food Preference"
            entityPlural="Guest Food Preferences"
            description="Values offered in the “Food Preference” dropdown when a guest registers in the app. Leave the category empty to make a value part of the fallback list every event can use."
            nameLabel="Food Preference"
            namePlaceholder="e.g. Jain Food"
            iconLabel="Icon"
            colorLabel="Color"
            permissionPrefix="guest_food_preference_options"
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
