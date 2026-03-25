import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { FinanceAccount, TransferDialogText, TransferForm } from "../../_types";
import { formatAmountInput, parseAmountInput } from "../../_utils/formatAmount";

type TransferDialogProps = {
  t: TransferDialogText;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  form: TransferForm;
  setForm: Dispatch<SetStateAction<TransferForm>>;
  accounts: FinanceAccount[];
  onSave: () => void;
};

export function TransferDialog({ t, open, onOpenChange, loading, form, setForm, accounts, onSave }: TransferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[1.25rem] border-border bg-card p-4 text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white sm:rounded-3xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-black sm:text-lg">{t.transfer}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground sm:text-sm">{t.transferDescLong ?? "Pindahkan saldo antar akun (mata uang harus sama)."}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">{t.from}</Label>
            <Select
              value={form.fromAccountId}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  fromAccountId: value,
                }))
              }
            >
              <SelectTrigger className="w-full border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm">
                <SelectValue placeholder={t.selectAccount} />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white">
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={String(account.id)}>
                    {account.name} ({account.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">{t.to}</Label>
            <Select
              value={form.toAccountId}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  toAccountId: value,
                }))
              }
            >
              <SelectTrigger className="w-full border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm">
                <SelectValue placeholder={t.selectAccount} />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white">
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={String(account.id)}>
                    {account.name} ({account.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">{t.txAmount}</Label>
            <Input
              inputMode="decimal"
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              placeholder="50000"
              className="border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm"
            />
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

          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs font-bold sm:text-sm">{t.note}</Label>
            <Input
              value={form.note}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              placeholder={t.optional}
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
            {t.saveTransfer ?? t.transfer}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
