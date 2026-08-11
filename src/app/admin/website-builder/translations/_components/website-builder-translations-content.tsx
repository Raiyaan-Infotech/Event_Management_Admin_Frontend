'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, Check, AlertCircle, Minus, Pencil, Trash2, Languages as LanguagesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { PageLoader } from '@/components/common/page-loader';
import { Spinner } from '@/components/ui/spinner';
import {
  useBuilderLanguages,
  useWBTranslationKeys,
  useWBTranslationStats,
  useTranslationSections,
  useSaveKeyTranslations,
  useRetranslateKey,
  useDeleteTranslationKey,
  type WBTranslationKey,
  type BuilderLanguage,
} from '@/hooks/useWebsiteBuilderTranslations';

function sectionLabel(section: string): string {
  return section
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function WebsiteBuilderTranslationsContent() {
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<WBTranslationKey | null>(null);
  const [editTranslations, setEditTranslations] = useState<Record<number, string>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: languages = [] } = useBuilderLanguages();
  const { data: stats } = useWBTranslationStats();
  const { data: sections = [] } = useTranslationSections();
  const { data: keys = [], isLoading } = useWBTranslationKeys({
    section: sectionFilter !== 'all' ? sectionFilter : undefined,
    search: search || undefined,
  });

  const saveKeyTranslations = useSaveKeyTranslations();
  const retranslateKey = useRetranslateKey();
  const deleteKey = useDeleteTranslationKey();

  const nonDefaultLanguages = languages.filter((l) => Number(l.is_default) !== 1);
  const displayLanguages =
    selectedLanguageId === 'all'
      ? nonDefaultLanguages
      : nonDefaultLanguages.filter((l) => l.id.toString() === selectedLanguageId);

  const getTranslationStatus = (key: WBTranslationKey, language: BuilderLanguage) => {
    const translation = key.translations?.find((t) => t.language_id === language.id);
    if (!translation || !(translation.value || '').trim()) {
      return { status: 'missing', icon: Minus, color: 'text-red-500' };
    }
    if (translation.status === 'reviewed') {
      return { status: 'reviewed', icon: Check, color: 'text-green-500' };
    }
    return { status: 'auto', icon: AlertCircle, color: 'text-yellow-500' };
  };

  const getTranslationValue = (key: WBTranslationKey, languageId: number) =>
    key.translations?.find((t) => t.language_id === languageId)?.value || '';

  const handleEditKey = (key: WBTranslationKey) => {
    setSelectedKey(key);
    const values: Record<number, string> = {};
    key.translations?.forEach((t) => {
      values[t.language_id] = t.value;
    });
    setEditTranslations(values);
    setIsEditDialogOpen(true);
  };

  const handleSaveTranslations = () => {
    if (!selectedKey) return;
    const translations = Object.entries(editTranslations).map(([langId, value]) => ({
      language_id: parseInt(langId, 10),
      value,
    }));
    saveKeyTranslations.mutate(
      { id: selectedKey.id, translations },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedKey(null);
          setEditTranslations({});
        },
      }
    );
  };

  const filteredKeys = keys.filter((key) => {
    if (statusFilter === 'all') return true;
    const languagesToCheck = displayLanguages.length > 0 ? displayLanguages : nonDefaultLanguages;
    for (const lang of languagesToCheck) {
      const status = getTranslationStatus(key, lang);
      if (statusFilter === status.status) return true;
    }
    return false;
  });

  const isMutating = saveKeyTranslations.isPending || retranslateKey.isPending || deleteKey.isPending;

  return (
    <>
      <PageLoader open={isLoading} />

      {isMutating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-lg shadow-lg border">
            <Spinner className="h-12 w-12" />
            <p className="text-sm font-medium">
              {saveKeyTranslations.isPending && 'Saving translations...'}
              {retranslateKey.isPending && 'Re-translating...'}
              {deleteKey.isPending && 'Deleting translation key...'}
            </p>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Website Builder Translations</h1>
              <p className="text-muted-foreground">
                Every text field saved from your Website Builder sections, translated per language.
              </p>
            </div>
            <Link href="/admin/website-builder/languages">
              <Button variant="outline">
                <LanguagesIcon className="mr-2 h-4 w-4" />
                Manage Languages
              </Button>
            </Link>
          </div>

          {/* Stats Section */}
          {stats && stats.languages.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-sm font-medium text-muted-foreground">Completion Statistics</h2>
                <span className="text-xs text-muted-foreground">{nonDefaultLanguages.length} languages</span>
              </div>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                  <Card className="flex-shrink-0 w-[160px]">
                    <CardHeader className="p-4">
                      <CardDescription className="text-xs">Total Keys</CardDescription>
                      <CardTitle className="text-2xl">{stats.total_keys}</CardTitle>
                    </CardHeader>
                  </Card>

                  {stats.languages.map((lang) => (
                    <Card
                      key={lang.id}
                      className={`flex-shrink-0 w-[180px] cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedLanguageId === lang.id.toString() ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() =>
                        setSelectedLanguageId(
                          selectedLanguageId === lang.id.toString() ? 'all' : lang.id.toString()
                        )
                      }
                    >
                      <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-xs truncate">{lang.name}</CardDescription>
                        <CardTitle className="text-xl flex items-center gap-1">
                          {lang.completion}%
                          <span className="text-xs font-normal text-muted-foreground">
                            ({lang.total}/{stats.total_keys})
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px]">
                          <span className="text-green-500">{lang.reviewed} ✓</span>
                          <span className="text-yellow-500">{lang.auto} ⚡</span>
                          <span className="text-red-500">{lang.missing} ✗</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          {/* Main Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by English text or field..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sectionFilter} onValueChange={setSectionFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections.map((s) => (
                        <SelectItem key={s} value={s}>
                          {sectionLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLanguageId} onValueChange={setSelectedLanguageId}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {nonDefaultLanguages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id.toString()}>
                          {lang.native_name || lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="missing">✗ Missing</SelectItem>
                      <SelectItem value="auto">⚡ Auto</SelectItem>
                      <SelectItem value="reviewed">✓ Reviewed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-10 min-w-[180px]">Field</TableHead>
                      <TableHead className="min-w-[200px]">English (Original)</TableHead>
                      {displayLanguages.map((lang) => (
                        <TableHead key={lang.id} className="min-w-[200px]">
                          {lang.native_name || lang.name}
                        </TableHead>
                      ))}
                      <TableHead className="text-right min-w-[100px] sticky right-0 bg-background z-10">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div className="flex flex-col gap-1">
                            <code
                              className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[160px]"
                              title={key.field_label}
                            >
                              {key.field_label}
                            </code>
                            <Badge variant="outline" className="text-[10px] w-fit">
                              {sectionLabel(key.section)}
                              {key.page_slug ? ` · ${key.page_slug}` : ''}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <span className="line-clamp-2 text-sm" title={key.default_value || ''}>
                            {key.default_value || <span className="text-muted-foreground italic">empty</span>}
                          </span>
                        </TableCell>
                        {displayLanguages.map((lang) => {
                          const status = getTranslationStatus(key, lang);
                          const StatusIcon = status.icon;
                          const value = getTranslationValue(key, lang.id);
                          return (
                            <TableCell
                              key={lang.id}
                              className="max-w-[200px] cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleEditKey(key)}
                              title={`Click to edit - Status: ${status.status}`}
                            >
                              <div className="flex items-start gap-2">
                                <StatusIcon className={`h-3 w-3 flex-shrink-0 mt-1 ${status.color}`} />
                                <span className="line-clamp-2 text-sm" dir={lang.direction}>
                                  {value || <span className="text-muted-foreground italic">Missing</span>}
                                </span>
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right sticky right-0 bg-background z-10">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => retranslateKey.mutate(key.id)}
                              title="Re-translate all languages"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditKey(key)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive-outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeleteId(key.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredKeys.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3 + displayLanguages.length}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {keys.length === 0
                            ? 'No translation keys yet. Save a Website Builder section (e.g. Hero Section) to register its fields here.'
                            : 'No translation keys found with this status'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Edit Translations Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Translations</DialogTitle>
                <DialogDescription>
                  <code className="bg-muted px-2 py-1 rounded">
                    {selectedKey ? `${sectionLabel(selectedKey.section)} · ${selectedKey.field_label}` : ''}
                  </code>
                </DialogDescription>
              </DialogHeader>
              {selectedKey && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>English (Default)</Label>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {selectedKey.default_value || <span className="italic text-muted-foreground">empty</span>}
                    </div>
                  </div>
                  {nonDefaultLanguages.map((lang) => (
                    <div key={lang.id} className="space-y-2">
                      <Label className="flex items-center gap-2">
                        {lang.name}
                        {(() => {
                          const status = getTranslationStatus(selectedKey, lang);
                          const StatusIcon = status.icon;
                          return <StatusIcon className={`h-4 w-4 ${status.color}`} />;
                        })()}
                      </Label>
                      <Textarea
                        value={editTranslations[lang.id] ?? getTranslationValue(selectedKey, lang.id)}
                        onChange={(e) =>
                          setEditTranslations({ ...editTranslations, [lang.id]: e.target.value })
                        }
                        placeholder={`Translation in ${lang.name}`}
                        dir={lang.direction}
                      />
                    </div>
                  ))}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTranslations} isLoading={saveKeyTranslations.isPending}>
                  {saveKeyTranslations.isPending ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DeleteDialog
            open={deleteId !== null}
            onOpenChange={(open) => !open && setDeleteId(null)}
            onConfirm={() => {
              if (deleteId != null) {
                deleteKey.mutate(deleteId, { onSettled: () => setDeleteId(null) });
              }
            }}
            isDeleting={deleteKey.isPending}
            title="Delete Translation Key"
            description="Are you sure you want to delete this translation key? All saved translations for it will be removed. It will reappear if the section is saved again."
          />
        </div>
      )}
    </>
  );
}
