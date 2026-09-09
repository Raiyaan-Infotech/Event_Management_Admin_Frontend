'use client';

import { useState } from 'react';
import { TaxonomyManager } from '../../menu-management/_components/taxonomy-manager';
import {
    useNotificationCategories,
    useCreateNotificationCategory,
    useUpdateNotificationCategory,
    useUpdateNotificationCategoryStatus,
    useDeleteNotificationCategory,
    type NotificationCategory,
} from '@/hooks/use-notification-categories';

export default function NotificationCategoriesPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useNotificationCategories({ page, limit, search: search || undefined });
    const createCategory = useCreateNotificationCategory();
    const updateCategory = useUpdateNotificationCategory();
    const toggleStatus = useUpdateNotificationCategoryStatus();
    const deleteCategory = useDeleteNotificationCategory();

    return (
        <TaxonomyManager<NotificationCategory>
            entityLabel="Notification Category"
            entityPlural="Notification Categories"
            description="Manage the categories notification templates are grouped under."
            nameLabel="Category Name"
            namePlaceholder="Enter notification category name"
            iconLabel="Category Icon"
            colorLabel="Category Color"
            permissionPrefix="notification_categories"
            defaultColor="#6E22FE"
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
