"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { useUserSession } from "@/hooks/useUserSession";
import { usePartnerStore } from "@/lib/store/partner-store";
import { ViewModeToggle } from "@/components/partner/view-mode-toggle";

export type GroceryItem = {
  id: number;
  name: string;
  checked: boolean;
};

export type GroceryCategory = {
  id: number;
  name: string;
  items: GroceryItem[];
};

export function GroceriesView() {
  const { locale } = useLanguage();
  const { session } = useUserSession();
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const categoriesRef = useRef(categories);
  const savingRef = useRef(false);
  const pendingSave = useRef(false);

  // Keep ref in sync
  useEffect(() => { categoriesRef.current = categories; }, [categories]);

  // Partner sharing
  const { viewMode: partnerViewMode, fetchConnection, fetchFeatureAccess, getActiveConnectionId, isFeatureShared, connection } = usePartnerStore();

  const partnerQs = useMemo(() => {
    if (partnerViewMode === "shared" && isFeatureShared("MEAL")) {
      const connId = getActiveConnectionId();
      if (connId) return `view=shared&connectionId=${connId}`;
    }
    return "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerViewMode]);

  const partnerBodyParams = useMemo(() => {
    if (partnerViewMode === "shared" && isFeatureShared("MEAL")) {
      const connId = getActiveConnectionId();
      if (connId) return { view: "shared", connectionId: connId };
    }
    return {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerViewMode]);

  const partnerName = useMemo(() => {
    if (!connection || !session || partnerViewMode !== "shared" || !isFeatureShared("MEAL")) return null;
    const partner = connection.userAId === session.user.id ? connection.userB : connection.userA;
    return partner?.name || partner?.email || null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, session, partnerViewMode]);

  const appendPartnerQs = (url: string) => {
    if (!partnerQs) return url;
    return url + (url.includes("?") ? "&" : "?") + partnerQs;
  };

  // ─── Fetch ───
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(appendPartnerQs("/api/groceries"));
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (e) {
      console.error("Failed to load groceries:", e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerQs]);

  // ─── Save (serialized — prevents concurrent saves) ───
  const syncToServer = useCallback(async () => {
    if (savingRef.current) {
      pendingSave.current = true;
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const snapshot = categoriesRef.current;
      const payload = snapshot.map((c: GroceryCategory) => ({
        name: c.name,
        items: (c.items || []).map((it: GroceryItem) => ({ name: it.name, checked: it.checked })),
      }));
      const res = await fetch("/api/groceries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: payload, ...partnerBodyParams }),
      });
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (e) {
      console.error("Failed to save groceries:", e);
    } finally {
      savingRef.current = false;
      setSaving(false);
      if (pendingSave.current) {
        pendingSave.current = false;
        syncToServer();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerBodyParams]);

  useEffect(() => {
    if (!session) return;
    fetchConnection().then(() => fetchFeatureAccess());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session, fetchData]);

  // ─── Handlers (add/edit = local only, save on blur/action) ───
  const handleAddCategory = () => {
    const temp: GroceryCategory = { id: -Date.now(), name: "Label Baru", items: [] };
    const updated = [...categories, temp];
    setCategories(updated);
    categoriesRef.current = updated;
    syncToServer();
  };

  const deleteCategory = (id: number) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    categoriesRef.current = updated;
    syncToServer();
  };

  const handleUpdateCategoryName = (id: number, newName: string) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, name: newName } : c));
      categoriesRef.current = next;
      return next;
    });
  };

  const handleBlurSave = () => {
    syncToServer();
  };

  const handleAddItem = (catId: number) => {
    const newItem: GroceryItem = { id: -Date.now(), name: "", checked: false };
    const updated = categories.map((c) =>
      c.id === catId ? { ...c, items: [...(c.items || []), newItem] } : c
    );
    setCategories(updated);
    categoriesRef.current = updated;
    syncToServer();
  };

  const handleUpdateItemName = (catId: number, itemId: number, newName: string) => {
    setCategories((prev) => {
      const next = prev.map((c) => {
        if (c.id !== catId) return c;
        const newItems = (c.items || []).map((it) => (it.id === itemId ? { ...it, name: newName } : it));
        return { ...c, items: newItems };
      });
      categoriesRef.current = next;
      return next;
    });
  };

  const toggleItem = (catId: number, itemId: number) => {
    const updated = categories.map((c) => {
      if (c.id !== catId) return c;
      const newItems = (c.items || []).map((it) =>
        it.id === itemId ? { ...it, checked: !it.checked } : it
      );
      return { ...c, items: newItems };
    });
    setCategories(updated);
    categoriesRef.current = updated;
    syncToServer();
  };

  const deleteItem = (catId: number, itemId: number) => {
    const updated = categories.map((c) => {
      if (c.id !== catId) return c;
      return { ...c, items: (c.items || []).filter((it) => it.id !== itemId) };
    });
    setCategories(updated);
    categoriesRef.current = updated;
    syncToServer();
  };

  const t = locale === "id"
    ? {
        title: "Groceries Note",
        desc: "Tulis list kebutuhan belanja, tersusun rapi layaknya kertas catatan.",
        empty: 'Kertas belanja masih kosong. Klik "(+) Grup Baru" untuk mulai.',
        addGroup: "(+) Grup Baru",
        addMore: "Tambah lagi",
        addItem: "Tambah item",
        placeholder: "Ketik item...",
        catPlaceholder: "Nama kategori...",
        shared: `Berbagi dengan ${partnerName}`,
      }
    : {
        title: "Groceries Note",
        desc: "Write your grocery list, neatly organized like a note sheet.",
        empty: 'Shopping list is empty. Click "(+) New Group" to start.',
        addGroup: "(+) New Group",
        addMore: "Add more",
        addItem: "Add item",
        placeholder: "Type item...",
        catPlaceholder: "Category name...",
        shared: `Shared with ${partnerName}`,
      };

  return (
    <div className="w-full">
      <Card className="min-h-[60vh] rounded-[1.25rem] border border-border bg-card/80 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-[2rem] sm:p-10 text-foreground dark:text-white">
        <div className="mb-8 flex items-end justify-between border-b border-border pb-4 dark:border-white/10">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black tracking-tight sm:text-4xl text-foreground dark:text-white">{t.title}</h2>
              <ViewModeToggle feature="MEAL" locale={locale} />
            </div>
            {partnerViewMode === "shared" && isFeatureShared("MEAL") && partnerName && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50/80 px-3 py-1 text-xs font-medium text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                👀 {t.shared}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{t.desc}</p>
          </div>
          <Button variant="ghost" className="h-10 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30" onClick={handleAddCategory} disabled={saving}>
            <Plus className="mr-2 h-4 w-4" />
            {t.addGroup}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-sm text-muted-foreground">{locale === "id" ? "Memuat..." : "Loading..."}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center opacity-70">
            <p className="text-sm text-muted-foreground">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <div key={cat.id} className="group/cat flex flex-col items-start gap-1">
                <div className="flex w-full items-center justify-between border-b border-border/50 pb-1 dark:border-white/5">
                  <input
                    className="w-full bg-transparent text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none dark:text-emerald-300"
                    value={cat.name}
                    onChange={(e) => handleUpdateCategoryName(cat.id, e.target.value)}
                    onBlur={handleBlurSave}
                    placeholder={t.catPlaceholder}
                  />
                  <button onClick={() => deleteCategory(cat.id)} className="opacity-0 transition group-hover/cat:opacity-100 text-muted-foreground hover:text-red-500 p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2 flex w-full flex-col gap-1.5">
                  {(cat.items || []).map((item) => (
                    <div key={item.id} className="group/item flex items-center justify-between gap-2">
                       <div className="flex flex-1 items-start gap-2 overflow-hidden">
                         <button onClick={() => toggleItem(cat.id, item.id)} className={`mt-0.5 shrink-0 ${item.checked ? "text-emerald-500" : "text-muted-foreground hover:text-cyan-500"}`}>
                           {item.checked ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                         </button>
                         <input
                           className={`flex-1 bg-transparent text-sm focus:outline-none ${item.checked ? "text-muted-foreground line-through opacity-60" : "text-foreground dark:text-slate-200"}`}
                           value={item.name}
                           onChange={(e) => handleUpdateItemName(cat.id, item.id, e.target.value)}
                           onBlur={handleBlurSave}
                           placeholder={t.placeholder}
                         />
                       </div>
                       <button onClick={() => deleteItem(cat.id, item.id)} className="opacity-0 transition group-hover/item:opacity-100 text-rose-500/70 hover:text-rose-500 p-1">
                         <Trash2 className="h-3.5 w-3.5" />
                       </button>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddItem(cat.id)}
                    className="mt-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-cyan-500 w-fit p-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> {cat.items?.length > 0 ? t.addMore : t.addItem}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
