"use client";

import { useCallback, useMemo, useRef, useEffect, useState } from "react";
import {
  CheckSquare, RotateCw, MailOpen, Star, ChevronDown, X, Folder, Search, Trash2,
} from "lucide-react";
import { AdminMailSidebar } from "./_components/AdminMailSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useAdminMails, useAdminMailTrash, useAdminMail,
  useSaveAdminDraft, useUpdateAdminDraft, useSendAdminDraft, useSendAdminMail,
  useBulkDeleteAdminMail, useBulkMarkAdminRead,
  useRestoreAdminMail, usePermanentDeleteAdminMail,
  useAssignAdminMailLabel, useBulkMoveAdminFolder,
  useAdminMailFolders,
  useMailContacts,
} from "@/hooks/use-admin-mail";
import type { AdminMail, MailContact, ContactType } from "@/hooks/use-admin-mail";

import { RichTextEditor } from "@/components/common/rich-text-editor";

import { stripHtml } from "@/lib/utils";

const LIMITS = { to: 25, cc: 10, bcc: 5 };

const LABELS = [
  { key: "label-social",     label: "Social",     color: "text-primary" },
  { key: "label-promotions", label: "Promotions", color: "text-green-500" },
  { key: "label-updates",    label: "Updates",    color: "text-sky-500" },
] as const;

type ActiveFolder = string; // "inbox"|"sent"|"drafts"|"all"|"trash"|"compose"|"label-*"|"folder-{id}"

// ─── Contact chip ─────────────────────────────────────────────────────────────
type Role = "to" | "cc" | "bcc";
interface SelectedContact extends MailContact { role: Role; }

function ContactChip({ c, onRemove }: { c: SelectedContact; onRemove: () => void }) {
  const bg: Record<ContactType, string> = { admin: "bg-primary/10 text-primary", vendor: "bg-amber-500/10 text-amber-600", client: "bg-green-500/10 text-green-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${bg[c.type]}`}>
      {c.name}<button onClick={onRemove} className="hover:opacity-70"><X size={10} /></button>
    </span>
  );
}

// ─── Compose Panel ────────────────────────────────────────────────────────────
function ComposePanel({ onDone, initialRecipients = [], draft = null }: { onDone: () => void; initialRecipients?: SelectedContact[]; draft?: AdminMail | null }) {
  const saveDraft = useSaveAdminDraft();
  const updateDraft = useUpdateAdminDraft();
  const sendDraft = useSendAdminDraft();
  const sendMail  = useSendAdminMail();
  const { data: contacts } = useMailContacts();

  const [selected, setSelected] = useState<SelectedContact[]>(initialRecipients);
  const [subject, setSubject]   = useState(draft?.subject ?? "");
  const [body, setBody]         = useState(draft?.body ?? "");
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [popover, setPopover]   = useState<MailContact | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const isPending = saveDraft.isPending || updateDraft.isPending || sendDraft.isPending || sendMail.isPending;

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) { setShowDrop(false); setPopover(null); } };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    if (!draft?.recipients || !contacts) return;
    const all = [...(contacts.admins ?? []), ...(contacts.vendors ?? []), ...(contacts.clients ?? [])];
    const restored = draft.recipients
      .map((r) => {
        const contact = all.find((c) => c.id === r.recipient_id && c.type === r.recipient_type);
        return contact ? { ...contact, role: r.role } : null;
      })
      .filter(Boolean) as SelectedContact[];
    setSelected(restored);
  }, [draft?.id, contacts]);

  const allContacts: MailContact[] = [...(contacts?.admins ?? []), ...(contacts?.vendors ?? []), ...(contacts?.clients ?? [])];
  const filtered = allContacts.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())) &&
    !selected.some(s => s.id === c.id && s.type === c.type)
  );

  const addContact = (c: MailContact, role: Role) => {
    setSelected(prev => {
      if (prev.some(s => s.id === c.id && s.type === c.type)) return prev;
      if (prev.filter(s => s.role === role).length >= LIMITS[role]) return prev;
      return [...prev, { ...c, role }];
    });
    setPopover(null); setSearch("");
  };
  const removeContact = (c: SelectedContact) => setSelected(prev => prev.filter(s => !(s.id === c.id && s.type === c.type)));

  const byRole = (r: Role) => selected.filter(s => s.role === r);

  const handleBody = useCallback((html: string) => setBody(html), []);

  const buildPayload = () => ({ subject, body, recipients: selected.map(s => ({ id: s.id, type: s.type as ContactType, role: s.role })) });

  const validate = () => {
    if (!selected.some(s => s.role === "to")) { setError("At least one To recipient is required"); return false; }
    if (!subject.trim()) { setError("Subject is required"); return false; }
    if (!body.trim() || body === "<p><br></p>") { setError("Message body is required"); return false; }
    setError(""); return true;
  };

  const handleSave = async () => {
    if (!subject.trim()) { setError("Subject required to save draft"); return; }
    setError("");
    if (draft?.id) await updateDraft.mutateAsync({ id: draft.id, payload: buildPayload() });
    else await saveDraft.mutateAsync(buildPayload());
    onDone();
  };
  const handleSend = async () => {
    if (!validate()) return;
    if (draft?.id) await sendDraft.mutateAsync({ id: draft.id, payload: buildPayload() });
    else await sendMail.mutateAsync(buildPayload());
    onDone();
  };

  const ROLE_BTNS: { role: Role; label: string; cls: string }[] = [
    { role: "to",  label: "To",  cls: "bg-primary text-white" },
    { role: "cc",  label: "CC",  cls: "bg-muted text-foreground border border-border" },
    { role: "bcc", label: "BCC", cls: "bg-muted text-foreground border border-border" },
  ];

  return (
    <div className="flex-1 min-w-0 bg-card rounded-[5px] border border-border shadow-sm flex flex-col overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-foreground">{draft ? "Edit Draft" : "Compose New Message"}</h2>
        <button onClick={onDone} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto space-y-0">
        {/* Recipient chips per role */}
        {(["to", "cc", "bcc"] as Role[]).map(role => {
          const chips = byRole(role);
          if (role !== "to" && chips.length === 0) return null;
          return (
            <div key={role} className="flex items-start gap-3 border-b border-border py-2.5">
              <label className="w-12 text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 pt-1">{role.toUpperCase()}</label>
              <div className="flex-1 flex flex-wrap gap-1.5 min-h-[24px] items-center">
                {chips.map(c => <ContactChip key={`${c.type}-${c.id}`} c={c} onRemove={() => removeContact(c)} />)}
              </div>
            </div>
          );
        })}

        {/* Search / add contacts */}
        <div ref={dropRef} className="relative border-b border-border py-2.5">
          <div className="flex items-center gap-3">
            <label className="w-12 text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Add</label>
            <button type="button" onClick={() => setShowDrop(v => !v)} className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              <Search size={13} /> Search contacts… <ChevronDown size={11} className={`transition-transform ${showDrop ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showDrop && (
            <div className="absolute top-full left-0 z-50 mt-1 w-[320px] bg-popover border border-border rounded-[5px] shadow-lg">
              <div className="p-2 border-b border-border">
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
                  className="w-full text-[13px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60" />
              </div>
              <ul className="max-h-[200px] overflow-y-auto">
                {filtered.length === 0
                  ? <li className="px-3 py-2 text-[12px] text-muted-foreground">No contacts found</li>
                  : filtered.map(c => (
                    <li key={`${c.type}-${c.id}`}>
                      {popover?.id === c.id && popover.type === c.type ? (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-muted">
                          <span className="flex-1 text-[12px] font-medium text-foreground truncate">{c.name}</span>
                          {ROLE_BTNS.map(({ role, label, cls }) => {
                            const atLimit = selected.filter(s => s.role === role).length >= LIMITS[role];
                            return (
                              <button key={role} onClick={() => addContact(c, role)} disabled={atLimit}
                                title={atLimit ? `Max ${LIMITS[role]} ${label} recipients` : undefined}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-opacity ${atLimit ? "opacity-30 cursor-not-allowed bg-muted text-muted-foreground" : cls}`}>
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <button onClick={() => setPopover(c)} className="w-full text-left px-3 py-2 hover:bg-muted transition-colors">
                          <div className="flex items-center justify-between">
                            <div><p className="text-[13px] font-medium text-foreground">{c.name}</p><p className="text-[11px] text-muted-foreground">{c.email}</p></div>
                            <span className="text-[10px] font-bold uppercase text-muted-foreground/60 capitalize">{c.type}</span>
                          </div>
                        </button>
                      )}
                    </li>
                  ))
                }
              </ul>
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="flex items-center gap-3 border-b border-border py-2.5">
          <label className="w-12 text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject"
            className="flex-1 bg-transparent text-[14px] focus:outline-none text-foreground placeholder:text-muted-foreground/50" />
        </div>

        {/* Body */}
        <div className="pt-4">
          <RichTextEditor value={body} onChange={handleBody} placeholder="Write your message..." />
        </div>
        {error && <p className="text-destructive text-[13px] font-bold pt-3">{error}</p>}
      </div>

      <div className="p-5 border-t border-border flex items-center justify-end gap-2">
        <button onClick={onDone} disabled={isPending} className="px-5 py-2 border border-border rounded-[5px] text-[13px] font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50">Cancel</button>
        <button onClick={handleSave} disabled={isPending} className="px-5 py-2 bg-primary text-white rounded-[5px] text-[13px] font-bold hover:brightness-110 disabled:opacity-50">
          {saveDraft.isPending ? "Saving..." : "Save Draft"}
        </button>
        <button onClick={handleSend} disabled={isPending} className="px-5 py-2 bg-destructive text-white rounded-[5px] text-[13px] font-bold hover:brightness-110 disabled:opacity-50">
          {sendMail.isPending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminMailPage() {
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const composeParam = searchParams?.get("compose");
  const countParam   = Number(searchParams?.get("count") ?? 0);
  const initRecipients: SelectedContact[] = countParam > 0 && searchParams
    ? Array.from({ length: countParam }, (_, i) => {
        const id   = searchParams.get(`r${i}_id`);
        const type = searchParams.get(`r${i}_type`) as ContactType | null;
        const name = searchParams.get(`r${i}_name`) ?? "";
        if (!id || !type) return null;
        return { id: Number(id), type, name, email: "", role: "to" as Role };
      }).filter(Boolean) as SelectedContact[]
    : [];

  const [activeFolder, setActiveFolder] = useState<ActiveFolder>(composeParam === "1" ? "compose" : "inbox");
  const [selectedIds, setSelectedIds]   = useState<Set<number>>(new Set());
  const [editingDraft, setEditingDraft] = useState<AdminMail | null>(null);
  const [starredIds, setStarredIds]     = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [moveOpen, setMoveOpen]           = useState(false);
  const [selectedMailId, setSelectedMailId] = useState<number | null>(null);

  const { data: mails = [], isLoading, refetch } = useAdminMails();
  const { data: mailDetail, isLoading: detailLoading } = useAdminMail(selectedMailId ?? undefined);
  const { data: trashMails = [], refetch: refetchTrash } = useAdminMailTrash();
  const { data: folders = [] } = useAdminMailFolders();
  const bulkDelete  = useBulkDeleteAdminMail();
  const bulkRead    = useBulkMarkAdminRead();
  const bulkLabel   = useAssignAdminMailLabel();
  const bulkFolder  = useBulkMoveAdminFolder();
  const restore     = useRestoreAdminMail();
  const permDelete  = usePermanentDeleteAdminMail();

  const selectedArr  = Array.from(selectedIds);
  const hasSelection = selectedArr.length > 0;
  const customFolders = folders.filter((f) => f.is_active === 1);

  const filtered = useMemo<AdminMail[]>(() => {
    if (activeFolder === "inbox")            return mails.filter((m) => m.folder === "inbox" && m.is_active === 1 && !m.label && !m.custom_folder_id);
    if (activeFolder === "sent")             return mails.filter((m) => m.folder === "sent"   && m.is_active === 1 && !m.label && !m.custom_folder_id);
    if (activeFolder === "drafts")           return mails.filter((m) => m.folder === "drafts" && m.is_active === 1 && !m.label && !m.custom_folder_id);
    if (activeFolder === "all")              return mails.filter((m) => m.is_active === 1);
    if (activeFolder === "label-social")     return mails.filter((m) => m.label === "social");
    if (activeFolder === "label-promotions") return mails.filter((m) => m.label === "promotions");
    if (activeFolder === "label-updates")    return mails.filter((m) => m.label === "updates");
    if (activeFolder.startsWith("folder-")) {
      const fid = Number(activeFolder.replace("folder-", ""));
      return mails.filter((m) => m.custom_folder_id === fid && m.is_active === 1);
    }
    return [];
  }, [mails, activeFolder]);

  const changeFolder = (f: ActiveFolder) => { setActiveFolder(f); setSelectedIds(new Set()); setSelectAll(false); setMoveOpen(false); };

  const toggleSelectAll = () => {
    const next = !selectAll; setSelectAll(next);
    setSelectedIds(next ? new Set(filtered.map((m) => m.id)) : new Set());
  };
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); setSelectAll(next.size > 0 && next.size === filtered.length); return next; });
  };
  const clearSel = () => { setSelectedIds(new Set()); setSelectAll(false); };
  const handleRestoreOne = async (id: number) => {
    clearSel();
    await restore.mutateAsync(id);
  };
  const handlePermanentDeleteOne = async (id: number) => {
    clearSel();
    await permDelete.mutateAsync(id);
  };

  const handleBulkDelete = async () => { await bulkDelete.mutateAsync(selectedArr); clearSel(); setConfirmDelete(false); };
  const handleMoveLabel  = async (label: string | null) => { setMoveOpen(false); await bulkLabel.mutateAsync({ ids: selectedArr, label }); clearSel(); };
  const handleMoveFolder = async (fid: number | null)   => { setMoveOpen(false); await bulkFolder.mutateAsync({ ids: selectedArr, folder_id: fid }); clearSel(); };

  const isWorking = bulkDelete.isPending || bulkRead.isPending || bulkLabel.isPending || bulkFolder.isPending;

  const folderLabel: Record<string, string> = {
    inbox: "Inbox", sent: "Sent Mail", drafts: "Draft", all: "All Mails",
    "label-social": "Social", "label-promotions": "Promotions", "label-updates": "Updates",
  };
  const currentLabel = activeFolder.startsWith("folder-")
    ? (customFolders.find((f) => `folder-${f.id}` === activeFolder)?.name ?? "Folder")
    : (folderLabel[activeFolder] ?? activeFolder);

  if (activeFolder === "compose") {
    return (
      <div className="flex gap-5 h-[calc(100vh-120px)]">
        <AdminMailSidebar activeFolder={activeFolder} onFolderChange={changeFolder} />
        <ComposePanel onDone={() => changeFolder("sent")} initialRecipients={initRecipients} draft={editingDraft} />
      </div>
    );
  }

  if (activeFolder === "trash") {
    return (
      <div className="flex gap-5 h-[calc(100vh-120px)]">
        <AdminMailSidebar activeFolder={activeFolder} onFolderChange={changeFolder} />
        <div className="flex-1 min-w-0 bg-card rounded-[5px] border border-border shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Trash</h2>
            <button onClick={() => refetchTrash()} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"><RotateCw size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {trashMails.length === 0
              ? <div className="p-10 text-center text-sm font-bold text-muted-foreground">Trash is empty.</div>
              : trashMails.map((mail) => (
                <div key={mail.id} className="flex items-start gap-4 p-5 border-b border-border hover:bg-muted/20 transition-all">
                  <Avatar className="w-[30px] h-[30px] shrink-0">
                    <AvatarFallback className="bg-muted text-muted-foreground text-[11px] font-bold rounded-full">{mail.folder === "drafts" ? "D" : "S"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-muted-foreground truncate">{mail.to_email}</p>
                    <p className="text-[14px] font-bold text-foreground truncate">{mail.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleRestoreOne(mail.id); }} disabled={restore.isPending} className="px-3 h-8 text-[12px] font-bold border border-border rounded-[4px] hover:bg-muted transition-colors disabled:opacity-50">Restore</button>
                    <button onClick={(e) => { e.stopPropagation(); handlePermanentDeleteOne(mail.id); }} disabled={permDelete.isPending} className="px-3 h-8 text-[12px] font-bold border border-destructive/30 rounded-[4px] text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50">Delete</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      <AdminMailSidebar activeFolder={activeFolder} onFolderChange={changeFolder} />

      <div className={`flex gap-5 flex-1 min-w-0 overflow-hidden transition-all duration-300`}>
      <div className={`bg-card rounded-[5px] border border-border shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${selectedMailId ? "w-[42%] shrink-0" : "flex-1"}`}>
        <div className="p-5 pb-4">
          <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{currentLabel}</h2>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-y border-border bg-muted/50 flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`flex items-center justify-center w-[16px] h-[16px] rounded-[3px] border ${selectAll ? "bg-primary border-primary" : "bg-transparent border-[#c4c9d7] group-hover:border-primary"} transition-all`}>
              {selectAll && <CheckSquare size={12} className="text-white" />}
            </div>
            <span className="text-[14px] text-muted-foreground">Select All</span>
            <input type="checkbox" className="hidden" checked={selectAll} onChange={toggleSelectAll} />
          </label>

          <div className="flex items-center gap-2">
            <button title="Refresh" onClick={() => refetch()} className="w-[34px] h-[34px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"><RotateCw size={15} /></button>
            <button title="Mark as Read" disabled={!hasSelection || isWorking}
              onClick={() => { bulkRead.mutate({ ids: selectedArr, is_read: true }); clearSel(); }}
              className="w-[34px] h-[34px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all disabled:opacity-40"><MailOpen size={15} /></button>
            <button title="Delete" disabled={!hasSelection} onClick={() => hasSelection && setConfirmDelete(true)}
              className="w-[34px] h-[34px] flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted rounded-full transition-all disabled:opacity-40"><Trash2 size={15} /></button>

            {/* Move to */}
            {hasSelection && (
              <div className="relative">
                <button onClick={() => setMoveOpen((o) => !o)} disabled={isWorking}
                  className="flex items-center gap-1.5 px-3 h-[34px] text-[12px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-[3px] transition-all border border-border disabled:opacity-40">
                  <Folder size={14} /> Move to <ChevronDown size={11} className={`transition-transform ${moveOpen ? "rotate-180" : ""}`} />
                </button>
                {moveOpen && (
                  <div className="absolute right-0 top-[38px] z-50 bg-card border border-border rounded-[5px] shadow-xl min-w-[180px] py-1" onClick={(e) => e.stopPropagation()}>
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Label</p>
                    {LABELS.map(({ key, label }) => (
                      <button key={key} onClick={() => handleMoveLabel(key.replace("label-", ""))}
                        className="w-full text-left px-4 py-2 text-[13px] hover:bg-muted text-foreground transition-colors">{label}</button>
                    ))}
                    <button onClick={() => handleMoveLabel(null)} className="w-full text-left px-4 py-2 text-[13px] hover:bg-muted text-muted-foreground transition-colors">Remove label</button>
                    {customFolders.length > 0 && <>
                      <div className="border-t border-border my-1" />
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Folder</p>
                      {customFolders.map((f) => (
                        <button key={f.id} onClick={() => handleMoveFolder(f.id)}
                          className="w-full text-left px-4 py-2 text-[13px] hover:bg-muted text-foreground transition-colors">{f.name}</button>
                      ))}
                      <button onClick={() => handleMoveFolder(null)} className="w-full text-left px-4 py-2 text-[13px] hover:bg-muted text-muted-foreground transition-colors">Remove from folder</button>
                    </>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mail list */}
        <div className="flex-1 overflow-y-auto" onClick={() => setMoveOpen(false)}>
          {isLoading && <div className="p-10 text-center text-sm font-bold text-muted-foreground">Loading...</div>}
          {!isLoading && filtered.length === 0 && (
            <div className="p-10 text-center text-sm font-bold text-muted-foreground">
              {activeFolder === "inbox" ? "Inbox is empty." : "No mails found."}
            </div>
          )}
          {filtered.map((mail) => {
            const isSelected = selectedIds.has(mail.id);
            const isStarred  = starredIds.has(mail.id);
            const isRead     = mail.is_read === 1;
            const time = new Date(mail.sent_at || mail.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
            const labelColor = LABELS.find((l) => l.key === `label-${mail.label}`)?.color;
            return (
              <div key={mail.id} onClick={() => {
                if (mail.folder === "drafts") { setEditingDraft(mail); changeFolder("compose"); return; }
                setSelectedMailId(mail.id === selectedMailId ? null : mail.id);
              }} className={`group flex items-start gap-4 pt-5 pb-4 pl-5 pr-5 border-b border-border transition-all cursor-pointer ${mail.id === selectedMailId ? "bg-primary/10 border-l-2 border-l-primary" : isSelected ? "bg-primary/5" : isRead ? "bg-card hover:bg-muted/20" : "bg-muted/10 hover:bg-muted/30"}`}>
                <div className="flex items-center gap-4 shrink-0 mt-[1px]">
                  <label className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <div className={`flex items-center justify-center w-[16px] h-[16px] rounded-[3px] border ${isSelected ? "bg-primary border-primary" : "bg-transparent border-[#c4c9d7] hover:border-primary"} transition-all`}>
                      {isSelected && <CheckSquare size={12} className="text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleSelect(mail.id)} />
                  </label>
                  <button onClick={(e) => { e.stopPropagation(); setStarredIds((p) => { const n = new Set(p); n.has(mail.id) ? n.delete(mail.id) : n.add(mail.id); return n; }); }}
                    className={`hover:scale-110 transition-transform ${isStarred ? "text-yellow-500" : "text-muted-foreground"}`}>
                    <Star size={15} className={isStarred ? "fill-current" : ""} />
                  </button>
                </div>
                <Avatar className="w-[30px] h-[30px] shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary text-white font-bold text-[11px] rounded-full">{mail.folder === "drafts" ? "D" : "S"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className={`text-[13px] font-bold truncate ${isRead ? "text-muted-foreground" : "text-foreground"}`}>{mail.to_email}</p>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      {mail.label && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] bg-muted capitalize ${labelColor || "text-muted-foreground"}`}>{mail.label}</span>}
                      <span className="text-[12px] text-muted-foreground whitespace-nowrap">{time}</span>
                    </div>
                  </div>
                  <p className={`text-[14px] mb-1 truncate ${isRead ? "font-medium" : "font-bold"} text-foreground`}>{mail.subject}</p>
                  <p className="text-[13px] text-muted-foreground truncate">{stripHtml(mail.body).slice(0, 120)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mail detail panel */}
      {selectedMailId && (
        <div className="flex-1 bg-card rounded-[5px] border border-border shadow-sm flex flex-col overflow-hidden">
          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center text-sm font-bold text-muted-foreground">Loading...</div>
          ) : mailDetail ? (
            <>
              <div className="p-5 border-b border-border flex items-start justify-between gap-4 shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    {mailDetail.recipientRow
                      ? `From: ${mailDetail.mail.sender_type.charAt(0).toUpperCase() + mailDetail.mail.sender_type.slice(1)}`
                      : `To: ${(mailDetail.mail.recipients ?? []).filter(r => r.role === "to").length} recipient(s)`}
                  </p>
                  <h3 className="text-[16px] font-black text-foreground leading-snug break-words">{mailDetail.mail.subject}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {mailDetail.mail.sent_at
                      ? new Date(mailDetail.mail.sent_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : new Date(mailDetail.mail.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMailId(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              {!mailDetail.recipientRow && (mailDetail.mail.recipients ?? []).length > 0 && (
                <div className="px-5 py-2.5 border-b border-border bg-muted/30 shrink-0 flex flex-wrap gap-1.5">
                  {(mailDetail.mail.recipients ?? []).map((r) => (
                    <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-muted text-[11px] font-bold text-foreground capitalize">
                      <span className="text-muted-foreground">{r.role.toUpperCase()}:</span> {r.recipient_type}#{r.recipient_id}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-5">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-[14px] text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: mailDetail.mail.body }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm font-bold text-muted-foreground">Mail not found.</div>
          )}
        </div>
      )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-[8px] shadow-2xl p-8 w-full max-w-sm mx-4 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto"><Trash2 size={24} className="text-destructive" /></div>
            <div>
              <h3 className="text-[16px] font-black uppercase tracking-tight text-foreground">Delete {selectedArr.length} Mail{selectedArr.length > 1 ? "s" : ""}?</h3>
              <p className="text-[13px] text-muted-foreground mt-1">This will move them to Trash.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} disabled={bulkDelete.isPending} className="flex-1 h-10 border border-border rounded-[5px] text-[13px] font-bold hover:bg-muted transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleBulkDelete} disabled={bulkDelete.isPending} className="flex-1 h-10 bg-destructive text-white rounded-[5px] text-[13px] font-bold hover:brightness-110 transition-colors disabled:opacity-50">
                {bulkDelete.isPending ? "Moving..." : "Move to Trash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
