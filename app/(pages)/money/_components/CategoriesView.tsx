import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FinanceCategory } from "../_types";
import { useState } from "react";
import { showErrorToast, showSuccessToast } from "../_lib/utils";

type CategoriesViewProps = {
  t: {
    categories: string;
    categoryDesc: string;
    addCategory: string;
    expense: string;
    income: string;
    seedCategories?: string;
    seedCategoriesDesc?: string;
    seeding?: string;
  };
  expenseCategories: FinanceCategory[];
  incomeCategories: FinanceCategory[];
  setCategoryDialogOpen: (open: boolean) => void;
  reloadCore: () => Promise<void>;
};

export function CategoriesView({ t, expenseCategories, incomeCategories, setCategoryDialogOpen, reloadCore }: CategoriesViewProps) {
  const [seeding, setSeeding] = useState(false);

  const handleSeedCategories = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/finance/categories/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showSuccessToast("Kategori berhasil dibuat");
        await reloadCore();
      } else {
        showErrorToast(json.error || "Gagal membuat kategori");
      }
    } catch (error) {
      showErrorToast("Gagal membuat kategori");
    } finally {
      setSeeding(false);
    }
  };

  const hasNoCategories = expenseCategories.length === 0 && incomeCategories.length === 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <div>
          <div className="text-base font-black sm:text-lg">{t.categories}</div>
          <div className="text-xs text-muted-foreground sm:text-sm">{t.categoryDesc}</div>
        </div>
        <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setCategoryDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
          {t.addCategory}
        </Button>
      </div>

      {hasNoCategories && (
        <div className="mb-6 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center dark:border-white/5 dark:bg-[#07111f]/50 sm:rounded-2xl">
          <div className="mb-1 text-sm font-bold">{t.seedCategories || "Tidak ada kategori"}</div>
          <div className="mb-3 text-xs text-muted-foreground">{t.seedCategoriesDesc || "Buat kategori awal untuk memulai"}</div>
          <Button onClick={handleSeedCategories} disabled={seeding} className="h-9 rounded-xl px-3 text-xs font-bold sm:rounded-2xl">
            {seeding ? t.seeding || "Membuat..." : t.addCategory}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/20 p-3 dark:border-white/5 dark:bg-[#07111f]/50 sm:rounded-2xl sm:p-4">
          <div className="mb-3 text-sm font-black sm:text-base">{t.expense}</div>
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map((c) => (
              <Badge key={c.id} variant="secondary" className="rounded-xl border border-border bg-muted text-[10px] dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:text-xs">
                {c.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-3 dark:border-white/5 dark:bg-[#07111f]/50 sm:rounded-2xl sm:p-4">
          <div className="mb-3 text-sm font-black sm:text-base">{t.income}</div>
          <div className="flex flex-wrap gap-2">
            {incomeCategories.map((c) => (
              <Badge key={c.id} variant="outline" className="rounded-xl border border-border bg-muted text-[10px] dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:text-xs">
                {c.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
