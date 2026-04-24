import { UiBlockCategoriesContent } from './_components/ui-block-categories-content';

export const metadata = {
    title: 'UI Block Categories — Admin Portal',
    description: 'Organise UI blocks into categories',
};

export default function UiBlockCategoriesPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">UI Block Categories</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Group UI blocks into meaningful categories for easier management.
                </p>
            </div>
            <UiBlockCategoriesContent />
        </div>
    );
}
