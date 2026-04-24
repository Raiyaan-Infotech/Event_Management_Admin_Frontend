import { AppearanceContent } from './_components/appearance-content';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Appearance — Admin Portal',
    description: 'View and manage all saved themes',
};

export default function AppearancePage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        All saved themes — edit layouts, manage colors, and set which theme is active.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/theme-builder">
                        <button className="inline-flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                            <Plus className="h-4 w-4" /> New Theme
                        </button>
                    </Link>
                </div>
            </div>
            <AppearanceContent />
        </div>
    );
}
