import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { designConfig } from "@/lib/design-config";

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isDeleting?: boolean;
    confirmText?: string;
}

export function DeleteDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText,
    isDeleting = false,
}: DeleteDialogProps) {
    const { t } = useTranslation();

    return (
        <AlertDialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
            <AlertDialogContent className={designConfig.surface.panel}>
                <AlertDialogHeader>
                    <AlertDialogTitle className={designConfig.type.cardTitle}>{title || t("common.are_you_sure", "Are you sure?")}</AlertDialogTitle>
                    <AlertDialogDescription className={designConfig.type.helper}>
                        {description || t("common.delete_confirm", "This action cannot be undone.")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{t("common.cancel", "Cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        className={cn("inline-flex items-center gap-2", designConfig.feedback.danger)}
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader2 className="animate-spin h-4 w-4" />}
                        {isDeleting ? t("common.deleting", "Deleting...") : (confirmText || t("common.delete", "Delete"))}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
