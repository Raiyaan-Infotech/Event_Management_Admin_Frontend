'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLoader } from '@/components/common/page-loader';
import {
    useCreateWebsiteClient,
    useUpdateWebsiteClient,
    type WebsiteClient,
} from '@/hooks/use-website-clients';

interface ClientFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Null = create. */
    client: WebsiteClient | null;
}

const EMPTY = { name: '', email: '', dial_code: '+91', mobile: '', password: '' };

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
    const isEdit = !!client;
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [showPassword, setShowPassword] = useState(false);

    const createClient = useCreateWebsiteClient();
    const updateClient = useUpdateWebsiteClient();
    const busy = createClient.isPending || updateClient.isPending;

    // Re-seed whenever the dialog opens or the target row changes, so a second
    // open never shows the previous client's values.
    useEffect(() => {
        if (!open) return;
        setErrors({});
        setShowPassword(false);
        setForm(
            client
                ? {
                      name: client.name || '',
                      email: client.email || '',
                      dial_code: client.dial_code || '+91',
                      mobile: client.mobile || '',
                      // Never round-trip a hash into an editable field. Blank
                      // means "leave the password alone".
                      password: '',
                  }
                : EMPTY
        );
    }, [open, client]);

    // Functional updater: a `{ ...form }` spread writes back a stale snapshot
    // when two fields change in the same tick.
    const set = (key: keyof typeof EMPTY, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: false }));
    };

    const handleSave = () => {
        const nextErrors = {
            name: !form.name.trim(),
            email: !form.email.trim(),
        };
        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) {
            toast.error('Please fill all mandatory fields.');
            return;
        }

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            dial_code: form.dial_code || '+91',
            mobile: form.mobile || null,
            // Only sent when actually typed — an empty box must not clear or
            // rewrite an existing password.
            ...(form.password ? { password: form.password } : {}),
        };

        const onSuccess = () => onOpenChange(false);
        if (isEdit && client) {
            updateClient.mutate({ id: client.id, data: payload }, { onSuccess });
        } else {
            createClient.mutate(payload, { onSuccess });
        }
    };

    return (
        <>
            <PageLoader open={busy} />
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit Client' : 'Add Client'}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-2">
                        <div>
                            <Label htmlFor="client-name">
                                Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="client-name"
                                value={form.name}
                                onChange={(e) => set('name', e.target.value)}
                                placeholder="Enter full name"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                        </div>

                        <div>
                            <Label htmlFor="client-email">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="client-email"
                                type="email"
                                value={form.email}
                                onChange={(e) => set('email', e.target.value)}
                                placeholder="Enter email address"
                                className={errors.email ? 'border-destructive' : ''}
                            />
                        </div>

                        <div className="grid grid-cols-[90px_1fr] gap-2">
                            <div>
                                <Label htmlFor="client-dial">Code</Label>
                                <Input
                                    id="client-dial"
                                    value={form.dial_code}
                                    onChange={(e) => set('dial_code', e.target.value)}
                                    placeholder="+91"
                                />
                            </div>
                            <div>
                                <Label htmlFor="client-mobile">Mobile</Label>
                                <Input
                                    id="client-mobile"
                                    inputMode="numeric"
                                    value={form.mobile}
                                    // Digits only — a phone field that accepts
                                    // letters just fails later.
                                    onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 15))}
                                    placeholder="Enter mobile number"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="client-password">
                                Password {isEdit ? <span className="text-muted-foreground">(leave blank to keep current)</span> : null}
                            </Label>
                            {/* The eye button is positioned against this wrapper
                                only, so nothing else may live inside it. */}
                            <div className="relative">
                                <Input
                                    id="client-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={(e) => set('password', e.target.value)}
                                    placeholder={isEdit ? 'Unchanged' : 'At least 8 chars, 1 number, 1 uppercase'}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={busy}>
                            {isEdit ? 'Save Changes' : 'Add Client'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
