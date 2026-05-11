"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox, Send, Edit, Mail, Trash2, Users, Folder, Plus, X, Pencil,
} from "lucide-react";
import {
  useAdminMails, useAdminMailTrash,
  useAdminMailFolders, useCreateAdminMailFolder,
  useUpdateAdminMailFolder, useDeleteAdminMailFolder,
} from "@/hooks/use-admin-mail";

const LABELS = [
  { key: "label-social",     label: "Social",     color: "text-primary" },
  { key: "label-promotions", label: "Promotions", color: "text-green-500" },
  { key: "label-updates",    label: "Updates",    color: "text-sky-500" },
] as const;

export interface AdminMailSidebarProps {
  activeFolder?: string;
  onFolderChange?: (folder: string) => void;
}

export function AdminMailSidebar({ activeFolder = "inbox", onFolderChange }: AdminMailSidebarProps) {
  const router = useRouter();

  const { data: mails = [] }      = useAdminMails();
  const { data: trashMails = [] } = useAdminMailTrash();
  const { data: folders = [] }    = useAdminMailFolders();
  const createFolder = useCreateAdminMailFolder();
  const updateFolder = useUpdateAdminMailFolder();
  const deleteFolder = useDeleteAdminMailFolder();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState("");
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editName, setEditName]     = useState("");

  const counts = {
    sent:               mails.filter(m => m.folder === "sent"   && m.is_active === 1 && !m.label).length,
    drafts:             mails.filter(m => m.folder === "drafts" && m.is_active === 1 && !m.label).length,
    all:                mails.filter(m => m.is_active === 1).length,
    "label-social":     mails.filter(m => m.label === "social").length,
    "label-promotions": mails.filter(m => m.label === "promotions").length,
    "label-updates":    mails.filter(m => m.label === "updates").length,
  };

  const activeFolders = folders.filter(f => f.is_active === 1);
  const canCreate     = activeFolders.length < 10;
  const folderCount   = (id: number) => mails.filter(m => m.custom_folder_id === id && m.is_active === 1).length;

  const setFolder = (key: string) => {
    if (key === "contacts") { router.push("/admin/mail/contacts"); return; }
    if (onFolderChange) {
      onFolderChange(key);
    } else {
      router.push("/admin/mail");
    }
  };

  const cls = (f: string) =>
    `w-full flex items-center justify-between px-3 py-[7px] rounded-[3px] transition-all text-[13px] font-medium cursor-pointer ${
      activeFolder === f ? "text-primary bg-muted font-bold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createFolder.mutateAsync(newName.trim());
    setNewName(""); setShowCreate(false);
  };
  const handleEditSave = async (id: number) => {
    if (!editName.trim()) return;
    await updateFolder.mutateAsync({ id, data: { name: editName.trim() } });
    setEditingId(null); setEditName("");
  };
  const handleDelete = async (id: number) => {
    await deleteFolder.mutateAsync(id);
    if (activeFolder === `folder-${id}`) setFolder("inbox");
  };

  const navItems = [
    { f: "inbox",    icon: Inbox,  label: "Inbox",     count: 0 },
    { f: "sent",     icon: Send,   label: "Send Mail",  count: counts.sent },
    { f: "drafts",   icon: Edit,   label: "Draft",      count: counts.drafts },
    { f: "all",      icon: Mail,   label: "All Mails",  count: counts.all },
    { f: "contacts", icon: Users,  label: "Contacts",   count: 0 },
    { f: "trash",    icon: Trash2, label: "Trash",      count: trashMails.length },
  ] as const;

  return (
    <div className="w-[240px] xl:w-[260px] shrink-0 bg-card rounded-[5px] border border-border shadow-sm p-5 flex flex-col gap-1 self-start sticky top-6 overflow-y-auto max-h-[calc(100vh-140px)]">
      <button
        onClick={() => setFolder("compose")}
        className="w-full bg-primary text-white py-2.5 rounded-[5px] text-[13px] font-bold tracking-wider hover:bg-primary/90 transition-all mb-4 shadow-sm"
      >
        COMPOSE
      </button>

      {/* Main nav */}
      <ul className="space-y-0.5 mb-5">
        {navItems.map(({ f, icon: Icon, label, count }) => (
          <li key={f}>
            <button className={cls(f)} onClick={() => setFolder(f)}>
              <div className="flex items-center gap-3"><Icon size={16} /> {label}</div>
              {count > 0 && <span className="text-[12px]">{count}</span>}
            </button>
          </li>
        ))}
      </ul>

      {/* Label */}
      <div className="mb-5">
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-2 px-3">LABEL</p>
        <ul className="space-y-0.5">
          {LABELS.map(({ key, label, color }) => (
            <li key={key}>
              <button className={cls(key)} onClick={() => setFolder(key)}>
                <div className="flex items-center gap-3">
                  <Folder size={16} className={color} /> {label}
                </div>
                {counts[key as keyof typeof counts] > 0 && (
                  <span className="text-[12px]">{counts[key as keyof typeof counts]}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* My Folder */}
      <div>
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">MY FOLDER</p>
          {canCreate && (
            <button onClick={() => setShowCreate(true)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <Plus size={13} />
            </button>
          )}
        </div>

        {showCreate && (
          <div className="mb-2 px-1">
            <div className="flex items-center gap-1.5 bg-muted rounded-[4px] px-2 py-1.5">
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setShowCreate(false); setNewName(""); } }}
                placeholder="Folder name..." maxLength={30}
                className="flex-1 bg-transparent text-[13px] outline-none text-foreground placeholder:text-muted-foreground/60" />
              <button onClick={handleCreate} disabled={createFolder.isPending} className="text-primary text-[12px] font-bold hover:opacity-80 disabled:opacity-50">Add</button>
              <button onClick={() => { setShowCreate(false); setNewName(""); }}><X size={13} className="text-muted-foreground hover:text-foreground" /></button>
            </div>
          </div>
        )}

        <ul className="space-y-0.5">
          {activeFolders.map(folder => (
            <li key={folder.id} className="group">
              {editingId === folder.id ? (
                <div className="flex items-center gap-1.5 bg-muted rounded-[4px] px-2 py-1.5 mx-1">
                  <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleEditSave(folder.id); if (e.key === "Escape") { setEditingId(null); setEditName(""); } }}
                    maxLength={30} className="flex-1 bg-transparent text-[13px] outline-none text-foreground" />
                  <button onClick={() => handleEditSave(folder.id)} disabled={updateFolder.isPending} className="text-primary text-[12px] font-bold hover:opacity-80 disabled:opacity-50">Save</button>
                  <button onClick={() => { setEditingId(null); setEditName(""); }}><X size={13} className="text-muted-foreground" /></button>
                </div>
              ) : (
                <div className={`flex items-center justify-between rounded-[3px] transition-all ${activeFolder === `folder-${folder.id}` ? "bg-muted" : "hover:bg-muted"}`}>
                  <button
                    className={`flex-1 flex items-center gap-3 px-3 py-[7px] text-[13px] font-medium text-left ${activeFolder === `folder-${folder.id}` ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setFolder(`folder-${folder.id}`)}>
                    <Folder size={16} className="text-amber-500 shrink-0" />
                    <span className="truncate flex-1">{folder.name}</span>
                    {folderCount(folder.id) > 0 && <span className="text-[12px] text-muted-foreground">{folderCount(folder.id)}</span>}
                  </button>
                  <div className="flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingId(folder.id); setEditName(folder.name); }} className="w-6 h-6 flex items-center justify-center rounded hover:bg-border text-muted-foreground hover:text-foreground"><Pencil size={11} /></button>
                    <button onClick={() => handleDelete(folder.id)} disabled={deleteFolder.isPending} className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><X size={11} /></button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
