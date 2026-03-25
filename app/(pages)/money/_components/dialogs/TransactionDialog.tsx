import type { Dispatch, SetStateAction } from "react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { asIncomeExpense } from "../../_lib/utils";
import { FinanceAccount, FinanceCategory, FinanceTag, TransactionDialogText, TransactionForm, CategoryForm } from "../../_types";
import { formatAmountInput, parseAmountInput } from "../../_utils/formatAmount";

type TransactionDialogProps = {
  t: TransactionDialogText;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  editing: boolean;
  form: TransactionForm;
  setForm: Dispatch<SetStateAction<TransactionForm>>;
  accounts: FinanceAccount[];
  expenseCategories: FinanceCategory[];
  incomeCategories: FinanceCategory[];
  tags: FinanceTag[];
  onSave: () => void;
  setCategoryDialogOpen?: (open: boolean) => void;
  setCategoryForm?: Dispatch<SetStateAction<CategoryForm>>;
};

export function TransactionDialog({ t, open, onOpenChange, loading, editing, form, setForm, accounts, expenseCategories, incomeCategories, tags, onSave, setCategoryDialogOpen, setCategoryForm }: TransactionDialogProps) {
  const categories = form.type === "EXPENSE" ? expenseCategories : incomeCategories;

  const parentCategories = categories.filter((category) => category.parentId == null);
  const subCategories = form.parentCategoryId ? categories.filter((category) => category.parentId === Number(form.parentCategoryId)) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[1.25rem] border-border bg-card p-4 text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white sm:rounded-3xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-black sm:text-lg">{editing ? t.editTx : t.addTx}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground sm:text-sm">{t.txDescLong}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">{t.txType}</Label>
            <Select
              value={form.type}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  type: asIncomeExpense(value),
                  parentCategoryId: "",
                  categoryId: "",
                }))
              }
            >
              <SelectTrigger className="w-full border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm">
                <SelectValue placeholder={t.selectType} />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white">
                <SelectItem value="EXPENSE">{t.expense}</SelectItem>
                <SelectItem value="INCOME">{t.income}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">{t.txAccount}</Label>
            <Select
              value={form.accountId || undefined}
              onValueChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  accountId: value,
                }));
              }}
            >
              <SelectTrigger className="w-full border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm">
                <SelectValue placeholder={t.selectAccount} />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white">
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={String(account.id)}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold sm:text-sm">{t.txCategory}</Label>
              {setCategoryDialogOpen && setCategoryForm && (
                <button
                  type="button"
                  className="text-[10px] text-primary hover:underline sm:text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    setCategoryForm({ name: "", kind: form.type, parentId: "" });
                    setCategoryDialogOpen(true);
                  }}
                >
                  + Tambah
                </button>
              )}
            </div>
            <Select
              value={form.parentCategoryId || undefined}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  parentCategoryId: value,
                  categoryId: "",
                }))
              }
            >
              <SelectTrigger className="w-full border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white">
                {parentCategories.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Belum ada kategori
                  </SelectItem>
                ) : (
                  parentCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold sm:text-sm">Sub Kategori</Label>
              {setCategoryDialogOpen && setCategoryForm && form.parentCategoryId && (
                <button
                  type="button"
                  className="text-[10px] text-primary hover:underline sm:text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    setCategoryForm({ name: "", kind: form.type, parentId: form.parentCategoryId });
                    setCategoryDialogOpen(true);
                  }}
                >
                  + Tambah
                </button>
              )}
            </div>
            <Select
              value={form.categoryId || undefined}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  categoryId: value,
                }))
              }
              disabled={!form.parentCategoryId || subCategories.length === 0}
            >
              <SelectTrigger className="w-full border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm">
                <SelectValue placeholder={subCategories.length > 0 ? "Pilih sub kategori" : "Tidak ada sub kategori"} />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white">
                {subCategories.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Belum ada sub kategori
                  </SelectItem>
                ) : (
                  subCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">{t.txDate}</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">{t.txAmount}</Label>
            <Input
              inputMode="numeric"
              value={formatAmountInput(form.amount)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  amount: parseAmountInput(e.target.value),
                }))
              }
              placeholder="2.000.000"
              className="border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm"
            />
          </div>


          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs font-bold sm:text-sm">{t.txTags}</Label>
            <Input
              value={form.tags}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tags: e.target.value,
                }))
              }
              placeholder={t.tagsPlaceholder}
              className="border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm"
            />

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 10).map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="rounded-xl border border-primary/10 px-2 py-1 text-[10px] hover:bg-primary/5 sm:text-xs"
                    onClick={() => {
                      const currentTags = form.tags
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean);

                      if (currentTags.includes(tag.name)) return;

                      setForm((prev) => ({
                        ...prev,
                        tags: [...currentTags, tag.name].join(", "),
                      }));
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs font-bold sm:text-sm">{t.note ?? "Note"}</Label>
            <Input
              value={form.note}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              placeholder={t.optional ?? "Optional"}
              className="text-xs sm:text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-9 rounded-xl px-3 text-xs sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => onOpenChange(false)} disabled={loading}>
            {t.cancel ?? "Cancel"}
          </Button>

          <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={onSave} disabled={loading}>
            {t.save ?? "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
