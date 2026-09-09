import { createTaxonomyHooks, type TaxonomyRecord } from '@/hooks/use-menu-management';

/**
 * Master data for the "Notification Category" dropdown on Notification
 * Templates (Event & Invitation, RSVP & Participation, ...). Same resource
 * shape as Event Category, so it reuses the same taxonomy hook factory.
 */
export interface NotificationCategory extends TaxonomyRecord {}

const notificationCategoryHooks = createTaxonomyHooks<NotificationCategory>({
    path: '/notification-categories',
    queryKey: 'notification-categories',
    resourceKey: 'notificationCategory',
    label: 'Notification category',
});

export const useNotificationCategories = notificationCategoryHooks.useList;
export const useNotificationCategory = notificationCategoryHooks.useOne;
export const useCreateNotificationCategory = notificationCategoryHooks.useCreate;
export const useUpdateNotificationCategory = notificationCategoryHooks.useUpdate;
export const useUpdateNotificationCategoryStatus = notificationCategoryHooks.useUpdateStatus;
export const useDeleteNotificationCategory = notificationCategoryHooks.useDelete;
