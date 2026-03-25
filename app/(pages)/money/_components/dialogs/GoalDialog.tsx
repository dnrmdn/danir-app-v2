import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoalDialogText, GoalForm } from "../../_types";
import { formatAmountInput, parseAmountInput } from "../../_utils/formatAmount";

type GoalDialogProps = {
  t: GoalDialogText;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  form: GoalForm;
  setForm: Dispatch<SetStateAction<GoalForm>>;
  onSave: () => void;
};

export function GoalDialog({ t, open, onOpenChange, loading, form, setForm, onSave }: GoalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[1.25rem] border-border bg-card p-4 text-foreground dark:border-white/10 dark:bg-[#07111f] dark:text-white sm:rounded-3xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-black sm:text-lg">{t.newGoal}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground sm:text-sm">{t.goalDescLong}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold sm:text-sm">{t.goalName}</Label>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">{t.txCurrency}</Label>
              <Input
                value={form.currency}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    currency: e.target.value.toUpperCase(),
                  }))
                }
                className="border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">{t.targetAmount}</Label>
              <Input
                inputMode="numeric"
                value={formatAmountInput(form.targetAmount)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    targetAmount: parseAmountInput(e.target.value),
                  }))
                }
                className="border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">{t.currentAmount}</Label>
              <Input
                inputMode="numeric"
                value={formatAmountInput(form.currentAmount)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    currentAmount: parseAmountInput(e.target.value),
                  }))
                }
                className="border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">{t.targetDate}</Label>
              <Input
                type="date"
                value={form.targetDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    targetDate: e.target.value,
                  }))
                }
                className="border-border bg-muted/50 text-xs dark:border-white/10 dark:bg-white/5 sm:text-sm"
              />
            </div>
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
