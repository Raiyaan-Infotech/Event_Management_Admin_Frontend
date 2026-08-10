'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Star, HelpCircle, Loader2, Languages as LanguagesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { PageLoader } from '@/components/common/page-loader';
import {
  useBuilderLanguages,
  useCreateBuilderLanguage,
  useUpdateBuilderLanguage,
  useSetDefaultBuilderLanguage,
  useDeleteBuilderLanguage,
  useTranslateAllToLanguage,
  useWBTranslationStats,
  type BuilderLanguage,
} from '@/hooks/useWebsiteBuilderTranslations';

const emptyForm = { code: '', name: '', native_name: '', direction: 'ltr' as 'ltr' | 'rtl' };

export function WebsiteBuilderLanguagesContent() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<BuilderLanguage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: languages, isLoading, isFetching } = useBuilderLanguages();
  const createLanguage = useCreateBuilderLanguage();
  const updateLanguage = useUpdateBuilderLanguage();
  const setDefaultLanguage = useSetDefaultBuilderLanguage();
  const deleteLanguage = useDeleteBuilderLanguage();
  const translateAll = useTranslateAllToLanguage();
  // Deleting a language also deletes every translation saved for it, with no
  // undo. Stats already carries the per-language counts, so the confirmation
  // can state exactly what is about to be destroyed instead of warning vaguely.
  const { data: translationStats } = useWBTranslationStats();
  const [translateTarget, setTranslateTarget] = useState<BuilderLanguage | null>(null);

  const filtered = (languages || []).filter((lang) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q) ||
      (lang.native_name || '').toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingLanguage(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (lang: BuilderLanguage) => {
    setEditingLanguage(lang);
    setForm({
      code: lang.code,
      name: lang.name,
      native_name: lang.native_name || '',
      direction: lang.direction,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    const payload = {
      code: form.code.trim().toLowerCase(),
      name: form.name.trim(),
      native_name: form.native_name.trim() || undefined,
      direction: form.direction,
    };
    if (editingLanguage) {
      await updateLanguage.mutateAsync({ id: editingLanguage.id, data: payload });
    } else {
      await createLanguage.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    await deleteLanguage.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const isSaving = createLanguage.isPending || updateLanguage.isPending;

  /**
   * Spells out what deleting this language destroys. Hand-reviewed translations
   * are called out separately because they are the only ones that cannot be
   * recreated by re-running auto-translate.
   */
  const deleteWarning = (() => {
    const language = (languages || []).find((lang) => lang.id === deleteId);
    const stats = translationStats?.languages?.find((entry) => entry.id === deleteId);
    const name = language?.name || 'this language';
    const total = stats?.total ?? 0;
    const reviewed = stats?.reviewed ?? 0;

    if (total === 0) {
      return `Delete ${name}? It has no saved translations, so nothing else is lost. To hide a language from your site without deleting it, switch it to Inactive instead.`;
    }

    const reviewedNote = reviewed > 0
      ? ` ${reviewed} of them ${reviewed === 1 ? 'was' : 'were'} edited by hand and cannot be recreated by auto-translate.`
      : '';

    return `Delete ${name}? This permanently removes ${total} saved translation${total === 1 ? '' : 's'}.${reviewedNote} This cannot be undone. To hide the language from your site but keep its translations, switch it to Inactive instead.`;
  })();

  return (
    <div className="space-y-4">
      <PageLoader open={isLoading || isFetching || setDefaultLanguage.isPending || deleteLanguage.isPending} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3.5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Website Builder Languages</h1>
          <p className="text-xs text-muted-foreground">
            Manage which languages your website content can be translated into. Separate from the admin panel&apos;s own language settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm">About Website Builder Languages</DialogTitle>
                <DialogDescription className="text-xs">
                  Languages added here appear as translation options on Website Builder forms (Hero Section,
                  Header, etc.) via the &quot;Translations&quot; side card. The default language cannot be
                  disabled or deleted — it is the language admins type content in directly.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button size="sm" onClick={openCreate} className="h-8 px-3 text-xs font-bold">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Language
          </Button>
        </div>
      </div>

      <Card className="shadow-xs border-slate-200">
        <CardHeader className="py-3 px-3 border-b">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Native Name</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lang) => (
                <TableRow key={lang.id}>
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-2">
                      {lang.name}
                      {Boolean(lang.is_default) && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 bg-amber-50 text-amber-700">
                          <Star className="h-2.5 w-2.5 mr-1 fill-amber-500 text-amber-500" /> Default
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{lang.code}</code>
                  </TableCell>
                  <TableCell className="text-sm">{lang.native_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{lang.direction.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={Number(lang.is_active) === 1}
                      disabled={Boolean(lang.is_default) || updateLanguage.isPending}
                      onCheckedChange={(checked) =>
                        updateLanguage.mutate({ id: lang.id, data: { is_active: checked } })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!lang.is_default && (
                        <Button
                          size="sm"
                          onClick={() => setTranslateTarget(lang)}
                          disabled={translateAll.isPending}
                          className="h-7 px-2 text-[11px] font-semibold bg-blue-500 hover:bg-blue-600 text-white"
                          title="Translate all Website Builder text into this language"
                        >
                          <LanguagesIcon className="h-3 w-3 mr-1" /> Translate
                        </Button>
                      )}
                      {!lang.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultLanguage.mutate(lang.id)}
                          disabled={setDefaultLanguage.isPending}
                          className="h-7 px-2 text-[11px] font-semibold"
                          title="Set as default"
                        >
                          <Star className="h-3 w-3 mr-1" /> Set Default
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openEdit(lang)}
                        className="h-7 w-7 rounded-lg p-0"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteId(lang.id)}
                        disabled={Boolean(lang.is_default)}
                        className="h-7 w-7 rounded-lg p-0 text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                        title={lang.is_default ? 'Default language cannot be deleted' : 'Delete'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                    No languages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">{editingLanguage ? 'Edit Language' : 'Add Language'}</DialogTitle>
            <DialogDescription className="text-xs">
              This language becomes available as a translation option across Website Builder forms.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Language Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="e.g. ta, hi, fr"
                maxLength={10}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Language Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Tamil"
                maxLength={100}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Native Name (optional)</Label>
              <Input
                value={form.native_name}
                onChange={(e) => setForm((prev) => ({ ...prev, native_name: e.target.value }))}
                placeholder="e.g. தமிழ்"
                maxLength={100}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Direction</Label>
              <Select value={form.direction} onValueChange={(v) => setForm((prev) => ({ ...prev, direction: v as 'ltr' | 'rtl' }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ltr">LTR (Left to Right)</SelectItem>
                  <SelectItem value="rtl">RTL (Right to Left)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={isSaving || !form.code.trim() || !form.name.trim()}
              className="h-8 text-xs"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
              {editingLanguage ? 'Save Changes' : 'Add Language'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        isDeleting={deleteLanguage.isPending}
        title="Delete Language"
        description={deleteWarning}
      />

      {/* Translate All Confirmation */}
      <Dialog
        open={translateTarget !== null}
        onOpenChange={(open) => {
          if (!translateAll.isPending && !open) setTranslateTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Translate All Text</DialogTitle>
            <DialogDescription className="text-xs">
              Machine-translate every saved Website Builder text field into{' '}
              <strong>{translateTarget?.name}</strong>. Existing translations for this language will be
              overwritten. You can review and edit the results afterwards in Translations.
            </DialogDescription>
          </DialogHeader>
          {translateAll.isPending && (
            <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Translating... this may take a while for large sites.
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTranslateTarget(null)}
              disabled={translateAll.isPending}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!translateTarget) return;
                translateAll.mutate(translateTarget.id, {
                  onSettled: () => setTranslateTarget(null),
                });
              }}
              disabled={translateAll.isPending}
              className="h-8 text-xs"
            >
              {translateAll.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
              {translateAll.isPending ? 'Translating...' : 'Translate All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
