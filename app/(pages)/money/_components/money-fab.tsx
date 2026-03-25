"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { format } from "date-fns";
import { ArrowDownRight, ArrowLeftRight, ArrowUpRight, Plus, Target, Landmark, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

type MoneyFabText = {
  transfer: string;
  expense: string;
  income: string;
};

import { TransactionForm, TransferForm } from "../_types";

type MoneyFabProps = {
  t: MoneyFabText & { setBudget?: string; addAccount?: string };
  setTransferForm: Dispatch<SetStateAction<TransferForm>>;
  setTransferDialogOpen: Dispatch<SetStateAction<boolean>>;
  setTxForm: Dispatch<SetStateAction<TransactionForm>>;
  setTxDialogOpen: Dispatch<SetStateAction<boolean>>;
  setBudgetDialogOpen: Dispatch<SetStateAction<boolean>>;
  setAccountDialogOpen: Dispatch<SetStateAction<boolean>>;
  setGoalDialogOpen?: Dispatch<SetStateAction<boolean>>;
  setGoalContributeDialogOpen?: Dispatch<SetStateAction<boolean>>;
  resetTxEditing?: () => void;
};

export function MoneyFab({ t, setTransferForm, setTransferDialogOpen, setTxForm, setTxDialogOpen, setBudgetDialogOpen, setAccountDialogOpen, setGoalDialogOpen, setGoalContributeDialogOpen, resetTxEditing }: MoneyFabProps) {
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      {fabOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-300" onClick={() => setFabOpen(false)} />}

      <div className="fixed bottom-6 right-6 z-99 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
        <div className={`flex flex-col items-end gap-3 origin-bottom transition-all duration-300 ${fabOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-10 scale-50 opacity-0"}`}>
          <Button
            size="icon"
            title={t.transfer}
            className="h-12 w-12 rounded-full border border-blue-500/20 bg-blue-500 text-white shadow-xl shadow-blue-900/40 transition-transform hover:bg-blue-600 active:scale-95"
            onClick={() => {
              setTransferForm({
                fromAccountId: "",
                toAccountId: "",
                amount: "",
                date: format(new Date(), "yyyy-MM-dd"),
                note: "",
              });
              setTransferDialogOpen(true);
              setFabOpen(false);
            }}
          >
            <ArrowLeftRight className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            title={t.expense}
            className="h-12 w-12 rounded-full border border-rose-500/20 bg-rose-500 text-white shadow-xl shadow-rose-900/40 transition-transform hover:bg-rose-600 active:scale-95"
            onClick={() => {
              setTxForm((prev) => ({
                ...prev,
                type: "EXPENSE",
              }));
              resetTxEditing?.();
              setTxDialogOpen(true);
              setFabOpen(false);
            }}
          >
            <ArrowDownRight className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            title={t.income}
            className="h-12 w-12 rounded-full border border-emerald-500/20 bg-emerald-500 text-white shadow-xl shadow-emerald-900/40 transition-transform hover:bg-emerald-600 active:scale-95"
            onClick={() => {
              setTxForm((prev) => ({
                ...prev,
                type: "INCOME",
              }));
              resetTxEditing?.();
              setTxDialogOpen(true);
              setFabOpen(false);
            }}
          >
            <ArrowUpRight className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            title={t.addAccount || "Tambah Akun"}
            className="h-12 w-12 rounded-full border border-violet-500/20 bg-violet-500 text-white shadow-xl shadow-violet-900/40 transition-transform hover:bg-violet-600 active:scale-95"
            onClick={() => {
              setAccountDialogOpen(true);
              setFabOpen(false);
            }}
          >
            <Landmark className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            title={t.setBudget || "Set Budget"}
            className="h-12 w-12 rounded-full border border-orange-500/20 bg-orange-500 text-white shadow-xl shadow-orange-900/40 transition-transform hover:bg-orange-600 active:scale-95"
            onClick={() => {
              setBudgetDialogOpen(true);
              setFabOpen(false);
            }}
          >
            <Target className="h-6 w-6" />
          </Button>

          {setGoalDialogOpen && (
            <>
              <Button
                size="icon"
                title="Target Baru"
                className="h-12 w-12 rounded-full border border-cyan-500/20 bg-cyan-500 text-white shadow-xl shadow-cyan-900/40 transition-transform hover:bg-cyan-600 active:scale-95"
                onClick={() => {
                  setGoalDialogOpen(true);
                  setFabOpen(false);
                }}
              >
                <Plus className="h-6 w-6" />
              </Button>

              <Button
                size="icon"
                title="Isi Tabungan"
                className="h-12 w-12 rounded-full border border-amber-500/20 bg-amber-500 text-white shadow-xl shadow-amber-900/40 transition-transform hover:bg-amber-600 active:scale-95"
                onClick={() => {
                  if (setGoalContributeDialogOpen) {
                    setGoalContributeDialogOpen(true);
                  }
                  setFabOpen(false);
                }}
              >
                <CircleDollarSign className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        <Button
          size="icon"
          className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 active:scale-90 ${fabOpen ? "rotate-45 bg-foreground text-background" : "bg-primary text-primary-foreground"}`}
          onClick={() => setFabOpen((prev) => !prev)}
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>
    </>
  );
}
