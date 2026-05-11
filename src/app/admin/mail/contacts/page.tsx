"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Mail, Users, X, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { useMailContacts } from "@/hooks/use-admin-mail";
import type { MailContact } from "@/hooks/use-admin-mail";
import { AdminMailSidebar } from "../_components/AdminMailSidebar";

const TYPE_BADGE: Record<string, string> = {
  admin:  "bg-primary/10 text-primary",
  vendor: "bg-amber-500/10 text-amber-600",
  client: "bg-green-500/10 text-green-600",
};

const PAGE_SIZE = 10;
const key = (c: MailContact) => `${c.type}-${c.id}`;

export default function AdminMailContactsPage() {
  const router = useRouter();
  const { data: contacts, isLoading } = useMailContacts();

  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage]           = useState(1);

  const all: MailContact[] = useMemo(() => [
    ...(contacts?.admins  ?? []),
    ...(contacts?.vendors ?? []),
    ...(contacts?.clients ?? []),
  ], [contacts]);

  const filtered = useMemo(() => {
    setPage(1);
    return search.trim()
      ? all.filter(c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()))
      : all;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selectedContacts = all.filter(c => selected.has(key(c)));

  const toggle = (c: MailContact) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key(c)) ? next.delete(key(c)) : next.add(key(c));
      setSelectAll(next.size === filtered.length);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectAll) { setSelected(new Set()); setSelectAll(false); }
    else           { setSelected(new Set(filtered.map(key))); setSelectAll(true); }
  };

  const clearSel = () => { setSelected(new Set()); setSelectAll(false); };

  const handleCompose = (recipients?: MailContact[]) => {
    const list = recipients ?? selectedContacts;
    if (!list.length) return;
    const p = new URLSearchParams();
    list.forEach((c, i) => { p.set(`r${i}_id`, String(c.id)); p.set(`r${i}_type`, c.type); p.set(`r${i}_name`, c.name); });
    p.set("count", String(list.length));
    router.push(`/admin/mail?compose=1&${p.toString()}`);
  };

  const goTo = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      <AdminMailSidebar activeFolder="contacts" />

      <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="bg-card rounded-[5px] border border-border overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Users size={15} className="text-muted-foreground" />
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground">All Contacts</h2>
            <span className="text-[12px] text-muted-foreground">({filtered.length})</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
                className="w-full pl-9 pr-8 h-9 bg-muted text-[13px] rounded-[5px] border border-border focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-colors" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={13} /></button>}
            </div>

            {selected.size > 0 && (
              <>
                <button onClick={clearSel} className="px-3 h-9 text-[12px] font-bold text-muted-foreground border border-border rounded-[5px] hover:bg-muted transition-colors">Clear</button>
                <button onClick={() => handleCompose()} className="flex items-center gap-2 px-4 h-9 bg-primary text-white text-[12px] font-bold rounded-[5px] hover:brightness-110 transition-all shadow-sm whitespace-nowrap">
                  <Mail size={13} /> Compose to {selected.size}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Select-all toolbar */}
        {filtered.length > 0 && (
          <div className="px-6 py-2.5 border-b border-border bg-muted/40 flex items-center gap-3">
            <div onClick={toggleAll} className={`w-4 h-4 rounded-[3px] border flex items-center justify-center cursor-pointer shrink-0 transition-all ${selectAll ? "bg-primary border-primary" : "border-border hover:border-primary"}`}>
              {selectAll && <CheckSquare size={11} className="text-white" />}
            </div>
            <span className="text-[13px] text-muted-foreground cursor-pointer" onClick={toggleAll}>{selectAll ? "Deselect All" : "Select All"}</span>
            {selected.size > 0 && <span className="text-[12px] font-bold text-primary ml-1">· {selected.size} selected</span>}
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="p-10 text-center text-sm font-bold text-muted-foreground">Loading contacts…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-muted-foreground">{search ? "No contacts match your search." : "No contacts available."}</div>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {paginated.map(c => {
                const isChecked = selected.has(key(c));
                return (
                  <li key={key(c)} onClick={() => toggle(c)}
                    className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors select-none ${isChecked ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 transition-all ${isChecked ? "bg-primary border-primary" : "border-border"}`}>
                        {isChecked && <CheckSquare size={11} className="text-white" />}
                      </div>
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-[13px] font-bold text-primary uppercase">{c.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[14px] truncate ${isChecked ? "font-bold" : "font-medium"} text-foreground`}>{c.name}</p>
                        <p className="text-[12px] text-muted-foreground truncate">{c.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_BADGE[c.type] ?? "bg-muted text-muted-foreground"}`}>{c.type}</span>
                      <button onClick={e => { e.stopPropagation(); handleCompose([c]); }}
                        className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-bold text-primary border border-primary/30 rounded-[5px] hover:bg-primary/5 transition-colors">
                        <Mail size={13} /> Compose
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-4">
                <p className="text-[12px] text-muted-foreground">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => goTo(safePage - 1)} disabled={safePage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-[4px] border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft size={14} />
                  </button>
                  {pageNumbers.map((p, i) =>
                    p === "..." ? (
                      <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-muted-foreground">…</span>
                    ) : (
                      <button key={p} onClick={() => goTo(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-[4px] text-[13px] font-bold transition-colors ${p === safePage ? "bg-primary text-white" : "border border-border text-muted-foreground hover:bg-muted"}`}>
                        {p}
                      </button>
                    )
                  )}
                  <button onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-[4px] border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
