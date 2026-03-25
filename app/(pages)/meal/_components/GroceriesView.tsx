"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, PlusCircle, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-provider";

export type GroceryItem = {
  id: string;
  name: string;
  checked: boolean;
};

export type GroceryCategory = {
  id: string;
  name: string;
  items: GroceryItem[];
};

export function GroceriesView() {
  const { locale } = useLanguage();
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem("meal-groceries");
    if (saved) {
      try {
        setCategories(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const save = (newCats: GroceryCategory[]) => {
    setCategories(newCats);
    localStorage.setItem("meal-groceries", JSON.stringify(newCats));
  };

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const handleAddCategory = () => {
    const cat: GroceryCategory = {
      id: generateId(),
      name: "Label Baru",
      items: [],
    };
    save([...categories, cat]);
  };

  const deleteCategory = (id: string) => {
    save(categories.filter((c) => c.id !== id));
  };

  const handleUpdateCategoryName = (id: string, newName: string) => {
    save(categories.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleAddItem = (catId: string) => {
    const newItem: GroceryItem = {
      id: generateId(),
      name: "",
      checked: false,
    };
    save(categories.map((c) =>
      c.id === catId ? { ...c, items: [...(c.items || []), newItem] } : c
    ));
  };

  const handleUpdateItemName = (catId: string, itemId: string, newName: string) => {
    save(categories.map((c) => {
      if (c.id !== catId) return c;
      const newItems = (c.items || []).map((it) => it.id === itemId ? { ...it, name: newName } : it);
      return { ...c, items: newItems };
    }));
  };

  const toggleItem = (catId: string, itemId: string) => {
    save(categories.map((c) => {
      if (c.id !== catId) return c;
      const newItems = (c.items || []).map((it) =>
        it.id === itemId ? { ...it, checked: !it.checked } : it
      );
      return { ...c, items: newItems };
    }));
  };

  const deleteItem = (catId: string, itemId: string) => {
    save(categories.map((c) => {
      if (c.id !== catId) return c;
      return { ...c, items: (c.items || []).filter((it) => it.id !== itemId) };
    }));
  };

  return (
    <div className="w-full">
      <Card className="min-h-[60vh] rounded-[1.25rem] border border-border bg-card/80 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-[2rem] sm:p-10 text-foreground dark:text-white">
        <div className="mb-8 flex items-end justify-between border-b border-border pb-4 dark:border-white/10">
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-4xl text-foreground dark:text-white">Groceries Note</h2>
            <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">Tulis list kebutuhan belanja, tersusun rapi layaknya kertas catatan.</p>
          </div>
          <Button variant="ghost" className="h-10 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30" onClick={handleAddCategory}>
            <Plus className="mr-2 h-4 w-4" />
            (+) Grup Baru
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center opacity-70">
            <p className="text-sm text-muted-foreground">Kertas belanja masih kosong. Klik "(+) Grup Baru" untuk mulai.</p>
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
                    placeholder="Nama kategori..."
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
                            placeholder="Ketik item..."
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
                    <Plus className="h-3.5 w-3.5" /> Tambah {cat.items?.length > 0 ? "lagi" : "item"}
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
