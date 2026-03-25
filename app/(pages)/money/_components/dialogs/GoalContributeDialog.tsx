import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoalContributeForm, FinanceGoal, FinanceAccount } from "../../_types";
import { formatAmountInput, parseAmountInput } from "../../_utils/formatAmount";

type GoalContributeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  form: GoalContributeForm;
  setForm: Dispatch<SetStateAction<GoalContributeForm>>;
  goals: FinanceGoal[];
  accounts: FinanceAccount[];
  onSave: () => void;
};

export function GoalContributeDialog({ open, onOpenChange, loading, form, setForm, goals, accounts, onSave }: GoalContributeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[1.25rem] border-border bg-card p-4 text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white sm:rounded-3xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-black sm:text-lg">Isi Tabungan Goal</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground sm:text-sm">Tambahkan uang yang sudah Anda kumpulkan ke dalam target.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">Pilih Target / Goal</Label>
            <Select
              value={form.goalId}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  goalId: value,
                }))
              }
            >
              <SelectTrigger className="w-full border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm">
                <SelectValue placeholder="Pilih yang ingin diisi" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white">
                {goals.length === 0 ? (
                  <SelectItem value="empty" disabled>Belum ada target</SelectItem>
                ) : (
                  goals.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.name} ({g.currency})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">Sumber Dana (Akun)</Label>
            <Select
              value={form.accountId}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  accountId: value,
                }))
              }
            >
              <SelectTrigger className="w-full border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm">
                <SelectValue placeholder="Pilih yang ingin dipotong" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white">
                {accounts.length === 0 ? (
                  <SelectItem value="empty" disabled>Belum ada akun</SelectItem>
                ) : (
                  accounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name} ({a.currency})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">Jumlah Tabungan (Rp)</Label>
            <Input
              inputMode="numeric"
              value={formatAmountInput(form.amount)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  amount: parseAmountInput(e.target.value),
                }))
              }
              placeholder="Contoh: 50.000"
              className="border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            className="h-9 rounded-xl border border-border bg-card/50 px-3 text-xs text-foreground hover:bg-accent dark:border-white/10 dark:bg-white/10 dark:text-slate-100 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>

          <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={onSave} disabled={loading}>
            Simpan Tabungan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
