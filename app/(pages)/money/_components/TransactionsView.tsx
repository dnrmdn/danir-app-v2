import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { formatMoney, toNumber } from "../_lib/utils";
import { FinanceTransaction } from "../_types";

type TransactionsViewProps = {
  t: Record<"transactions" | "txDesc" | "addTx" | "transfer" | "txDate" | "txType" | "txAccount" | "txCategory" | "txTags" | "txAmount" | "noTxs", string>;
  transactions: FinanceTransaction[];
  openNewTransaction: () => void;
  setTransferDialogOpen: (open: boolean) => void;
  openEditTransaction: (tx: FinanceTransaction) => void;
  deleteTransaction: (id: number) => void;
};

export function TransactionsView({ t, transactions, openEditTransaction, deleteTransaction }: TransactionsViewProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border dark:border-white/5">
              <TableHead>{t.txDate}</TableHead>
              <TableHead>{t.txType}</TableHead>
              <TableHead>{t.txAccount}</TableHead>
              <TableHead>{t.txCategory}</TableHead>
              <TableHead>{t.txTags}</TableHead>
              <TableHead className="text-right">{t.txAmount}</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.length === 0 ? (
              <TableRow className="border-border dark:border-white/5">
                <TableCell colSpan={7} className="text-xs text-muted-foreground sm:text-sm">
                  {t.noTxs}
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id} className="border-border dark:border-white/5">
                  <TableCell className="text-xs sm:text-sm">{format(new Date(tx.date), "yyyy-MM-dd")}</TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="rounded-xl border border-border bg-muted text-[10px] dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:text-xs">
                      {tx.type}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs sm:text-sm">{tx.account.name}</TableCell>

                  <TableCell className="text-xs sm:text-sm">{tx.category?.name || "-"}</TableCell>

                  <TableCell className="max-w-[220px] truncate text-xs sm:text-sm">{tx.tags.length ? tx.tags.map((tag) => tag.name).join(", ") : "-"}</TableCell>

                  <TableCell className="text-right font-mono text-xs font-bold sm:text-sm">{formatMoney(toNumber(tx.amount), tx.currency)}</TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {tx.type !== "TRANSFER" && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-xl border-border bg-card/50 hover:bg-accent dark:border-white/10 dark:bg-[#07111f]/80 dark:text-slate-100 dark:hover:bg-white/10 sm:h-9 sm:w-9"
                          onClick={() => openEditTransaction(tx)}
                        >
                          <Pencil size={14} />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-xl border-border bg-card/50 hover:bg-accent dark:border-white/10 dark:bg-[#07111f]/80 dark:text-slate-100 dark:hover:bg-white/10 sm:h-9 sm:w-9"
                        onClick={() => deleteTransaction(tx.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
