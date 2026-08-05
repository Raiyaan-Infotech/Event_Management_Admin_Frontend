'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmResetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmResetDialog({
    open,
    onOpenChange,
    onConfirm,
    title = 'Discard all changes?',
    description = 'This action will reset the form to its original values. Any unsaved changes will be lost.',
    confirmText = 'Discard',
    cancelText = 'Cancel',
}: ConfirmResetDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md bg-card border-border text-foreground p-6 rounded-xl shadow-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-bold text-foreground">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 flex items-center justify-end gap-2">
                    <AlertDialogCancel
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="h-8 text-xs px-4"
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className="h-8 text-xs px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
