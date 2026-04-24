import { UiBlocksContent } from './_components/ui-blocks-content';

export const metadata = {
    title: 'UI Blocks — Admin Portal',
    description: 'Manage reusable UI blocks for theme layouts',
};

export default function UiBlocksPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">UI Blocks</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Define and manage all reusable UI blocks available for theme layouts.
                </p>
            </div>
            <UiBlocksContent />
        </div>
    );
}
