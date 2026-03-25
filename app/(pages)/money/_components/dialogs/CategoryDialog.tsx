import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { asIncomeExpense } from "../../_lib/utils";
import { CategoryDialogText, CategoryForm, FinanceCategory } from "../../_types";

type CategoryDialogProps = {
  t: CategoryDialogText;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  form: CategoryForm;
  setForm: Dispatch<SetStateAction<CategoryForm>>;
  onSave: () => void;
  expenseCategories: FinanceCategory[];
  incomeCategories: FinanceCategory[];
};

export function CategoryDialog({
  t,
  open,
  onOpenChange,
  loading,
  form,
  setForm,
  onSave,
  expenseCategories,
  incomeCategories,
}: CategoryDialogProps) {
  const parentCategories = useMemo(() => {
    const all = form.kind === "INCOME" ? incomeCategories : expenseCategories;
    return all.filter((c) => c.parentId === null);
  }, [form.kind, incomeCategories, expenseCategories]);

  const [level, setLevel] = useState<"parent" | "sub">("sub");

  useEffect(() => {
    if (open) {
      setLevel(form.parentId ? "sub" : "parent");
    }
  }, [open, form.parentId]);

  const handleTabChange = (val: string) => {
    const newLevel = val as "parent" | "sub";
    setLevel(newLevel);
    if (newLevel === "parent") {
      setForm((prev) => ({ ...prev, parentId: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[1.25rem] border-border bg-card p-4 text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white sm:rounded-3xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-black sm:text-lg">{t.addCategory}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground sm:text-sm">{t.categoryDescLong}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">{t.kind}</Label>
            <Select
              value={form.kind}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  kind: asIncomeExpense(value),
                  parentId: "",
                }))
              }
            >
              <SelectTrigger className="w-full border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm">
                <SelectValue placeholder={t.selectKind} />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white">
                <SelectItem value="EXPENSE">{t.expense}</SelectItem>
                <SelectItem value="INCOME">{t.income}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">Tingkat Kategori</Label>
            <Tabs value={level} onValueChange={handleTabChange}>
              <TabsList className="w-full grid grid-cols-2 bg-muted/50 dark:bg-white/5 border border-border/50">
                <TabsTrigger value="parent" className="text-xs sm:text-sm font-medium">Induk Kategori</TabsTrigger>
                <TabsTrigger value="sub" className="text-xs sm:text-sm font-medium">Sub-Kategori</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {level === "sub" && (
            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Pilih Induk Kategori</Label>
              <Select
                value={form.parentId || "none"}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    parentId: value === "none" ? "" : value,
                  }))
                }
                disabled={parentCategories.length === 0}
              >
                <SelectTrigger className={`w-full border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm ${parentCategories.length === 0 ? "opacity-50" : ""}`}>
                  <SelectValue placeholder="Pilih Induk Kategori" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white">
                  <SelectItem value="none">Tanpa Induk</SelectItem>
                  {parentCategories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {parentCategories.length === 0 && (
                <p className="text-[10px] text-rose-500 font-medium">Belum ada induk kategori untuk jenis ini. Silakan buat Induk Kategori terlebih dahulu.</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">{t.categoryName}</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="h-9 rounded-xl border border-border bg-card/50 px-3 text-xs text-foreground hover:bg-accent dark:border-white/10 dark:bg-white/10 dark:text-slate-100 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t.cancel}
          </Button>

          <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={onSave} disabled={loading}>
            {t.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
