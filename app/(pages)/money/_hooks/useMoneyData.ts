import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useUserSession } from "@/hooks/useUserSession";
import { useLanguage } from "@/components/language-provider";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { usePartnerStore } from "@/lib/store/partner-store";
import {
  FinanceAccount,
  FinanceBudgetRow,
  FinanceCategory,
  FinanceGoal,
  FinanceTag,
  FinanceTransaction,
  InsightsResponse,
  MoneyNavId,
  TransactionForm,
  GoalForm,
  GoalContributeForm,
} from "../_types";
import { contentMoneyLocal } from "../_constants";
import { monthRange, monthString, showDeleteConfirmToast, showErrorToast, showSuccessToast } from "../_lib/utils";

export function useMoneyData() {
  const { session } = useUserSession();
  const { locale } = useLanguage();
  const { plan } = usePlanAccess();
  const t = contentMoneyLocal[locale];

  const { viewMode: partnerViewMode, setViewMode, fetchConnection, fetchFeatureAccess, getActiveConnectionId, isFeatureShared, connection } = usePartnerStore();

  const partnerName = useMemo(() => {
    if (!connection || !session || partnerViewMode !== "shared" || !isFeatureShared("MONEY")) return null;
    const partner = connection.userAId === session.user.id ? connection.userB : connection.userA;
    return partner?.name || partner?.email || null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, session, partnerViewMode]);

  // Build query string for partner view
  const partnerQs = useMemo(() => {
    if (partnerViewMode === "shared" && isFeatureShared("MONEY")) {
      const connId = getActiveConnectionId();
      if (connId) return `view=shared&connectionId=${connId}`;
    }
    return "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerViewMode]);

  const appendPartnerQs = (url: string) => {
    if (!partnerQs) return url;
    return url + (url.includes("?") ? "&" : "?") + partnerQs;
  };

  const [active, setActive] = useState<MoneyNavId>("dashboard");
  const [month, setMonth] = useState<string>(() => monthString());
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [tags, setTags] = useState<FinanceTag[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [budgets, setBudgets] = useState<FinanceBudgetRow[]>([]);
  const [goals, setGoals] = useState<FinanceGoal[]>([]);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [txEditing, setTxEditing] = useState<FinanceTransaction | null>(null);
  const [txForm, setTxForm] = useState<TransactionForm>({
    type: "EXPENSE",
    accountId: "",
    parentCategoryId: "",
    categoryId: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    note: "",
    tags: "",
  });

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    note: "",
  });

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    kind: "EXPENSE" as "INCOME" | "EXPENSE",
    parentId: "",
  });

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
    type: "CASH" as "CASH" | "BANK" | "EWALLET",
    currency: "IDR",
    initialBalance: "0",
  });

  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    categoryId: "",
    currency: "IDR",
    limit: "",
  });

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState<GoalForm>({
    name: "",
    currency: "IDR",
    targetAmount: "",
    currentAmount: "0",
    targetDate: "",
    accountId: "",
    icon: "",
    color: "",
  });

  const importInputRef = useRef<HTMLInputElement | null>(null);

  const expenseCategories = useMemo(() => categories.filter((c) => c.kind === "EXPENSE"), [categories]);
  const incomeCategories = useMemo(() => categories.filter((c) => c.kind === "INCOME"), [categories]);

  const monthStartEnd = useMemo(() => monthRange(month), [month]);
  const moneyHistoryStartAt = useMemo(() => {
    if (!plan?.moneyHistoryStartAt) return null;
    return new Date(plan.moneyHistoryStartAt);
  }, [plan?.moneyHistoryStartAt]);
  const isHistoryLocked = useMemo(() => {
    if (!moneyHistoryStartAt) return false;
    const [year, monthIndex] = month.split("-").map(Number);
    const selectedMonthStart = new Date(year, monthIndex - 1, 1);
    const minMonthStart = new Date(moneyHistoryStartAt.getFullYear(), moneyHistoryStartAt.getMonth(), 1);
    return selectedMonthStart < minMonthStart;
  }, [moneyHistoryStartAt, month]);
  const historyLimitMessage = useMemo(() => {
    if (!isHistoryLocked || !plan?.moneyHistoryMonths) return null;
    return locale === "id"
      ? `Paket Free hanya bisa membuka riwayat money ${plan.moneyHistoryMonths} bulan terakhir. Upgrade ke Pro untuk melihat bulan yang lebih lama.`
      : `Free plan can only open money history from the last ${plan.moneyHistoryMonths} months. Upgrade to Pro to view older months.`;
  }, [isHistoryLocked, locale, plan?.moneyHistoryMonths]);

  const reloadCore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, c, tagsResp, g] = await Promise.all([
        fetch(appendPartnerQs("/api/finance/accounts")).then((r) => r.json()),
        fetch(appendPartnerQs("/api/finance/categories")).then((r) => r.json()),
        fetch(appendPartnerQs("/api/finance/tags")).then((r) => r.json()),
        fetch(appendPartnerQs("/api/finance/goals")).then((r) => r.json()),
      ]);

      if (a.success) setAccounts(a.data);
      if (c.success) setCategories(c.data);
      if (tagsResp.success) setTags(tagsResp.data);
      if (g.success) setGoals(g.data);
    } catch {
      setError(t.errorLoadCore);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.errorLoadCore, partnerQs]);

  const [goalContributeDialogOpen, setGoalContributeDialogOpen] = useState(false);
  const [goalContributeForm, setGoalContributeForm] = useState<GoalContributeForm>({ goalId: "", accountId: "", amount: "" });
  
  const reloadMonthData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (isHistoryLocked) {
      setTransactions([]);
      setBudgets([]);
      setInsights(null);
      setLoading(false);
      return;
    }
    
    try {
      const start = monthStartEnd.start.toISOString();
      const end = monthStartEnd.end.toISOString();

      const [tx, b, ins] = await Promise.all([
        fetch(appendPartnerQs(`/api/finance/transactions?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&_t=${Date.now()}`)).then((r) => r.json()),
        fetch(appendPartnerQs(`/api/finance/budgets?month=${encodeURIComponent(month)}&_t=${Date.now()}`)).then((r) => r.json()),
        fetch(appendPartnerQs(`/api/finance/insights?month=${encodeURIComponent(month)}&_t=${Date.now()}`)).then((r) => r.json()),
      ]);

      if (tx.success) setTransactions(tx.data);
      else setTransactions([]);
      if (b.success) setBudgets(b.data);
      else setBudgets([]);
      if (ins.success) setInsights(ins.data);
      else setInsights(null);
    } catch {
      setError(t.errorLoadMonth);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHistoryLocked, month, monthStartEnd, t.errorLoadMonth, partnerQs]);

  useEffect(() => {
    if (!session) return;
    fetchConnection().then(() => fetchFeatureAccess());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (!plan?.hasSharedFeatures && partnerViewMode === "shared") {
      setViewMode("personal");
    }
  }, [partnerViewMode, plan?.hasSharedFeatures, setViewMode]);

  useEffect(() => {
    if (!session) return;
    reloadCore();
  }, [session, reloadCore]);

  useEffect(() => {
    if (!session) return;
    reloadMonthData();
  }, [session, reloadMonthData]);

  const resetTxForm = () => {
    setTxEditing(null);
    setTxForm({
      type: "EXPENSE",
      accountId: accounts[0]?.id ? String(accounts[0].id) : "",
      parentCategoryId: "",
      categoryId: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      note: "",
      tags: "",
    });
  };

  const openNewTransaction = () => {
    resetTxForm();
    setTxDialogOpen(true);
  };

  const openEditTransaction = (tx: FinanceTransaction) => {
    const selectedCategory = tx.category;
    const isChild = selectedCategory?.parentId != null;

    setTxEditing(tx);
    setTxForm({
      type: tx.type === "INCOME" ? "INCOME" : "EXPENSE",
      accountId: String(tx.account.id),
      parentCategoryId: selectedCategory
        ? String(isChild ? selectedCategory.parentId : selectedCategory.id)
        : "",
      categoryId: selectedCategory
        ? String(isChild ? selectedCategory.id : "")
        : "",
      amount: String(tx.amount),
      date: format(new Date(tx.date), "yyyy-MM-dd"),
      note: tx.note || "",
      tags: tx.tags.map((x) => x.name).join(", "),
    });
    setTxDialogOpen(true);
  };

  const saveTransaction = async () => {
    setLoading(true);
    setError(null);

    try {
      const isEditing = Boolean(txEditing);
      const currentCategories = txForm.type === "INCOME" ? incomeCategories : expenseCategories;

      const selectedParent = txForm.parentCategoryId
        ? currentCategories.find((cat) => cat.id === Number(txForm.parentCategoryId))
        : null;

      const parentHasChildren = selectedParent
        ? currentCategories.some((cat) => cat.parentId === selectedParent.id)
        : false;

      const finalCategoryId = txForm.categoryId
        ? Number(txForm.categoryId)
        : txForm.parentCategoryId && !parentHasChildren
          ? Number(txForm.parentCategoryId)
          : null;

      const payload = {
        type: txForm.type,
        accountId: Number(txForm.accountId),
        categoryId: finalCategoryId,
        amount: Number(txForm.amount),
        currency: "IDR",
        date: new Date(txForm.date).toISOString(),
        note: txForm.note || undefined,
        tags: txForm.tags,
      };

      const res = await fetch(
        txEditing ? `/api/finance/transactions/${txEditing.id}` : "/api/finance/transactions",
        {
          method: txEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!json.success) {
        const message = json.error || "Gagal menyimpan transaksi";
        setError(message);
        showErrorToast(message);
        return;
      }

      setTxDialogOpen(false);
      resetTxForm();
      await reloadCore();
      await reloadMonthData();

      showSuccessToast(isEditing ? "Transaksi berhasil diperbarui" : "Transaksi berhasil ditambahkan");
    } catch {
      const message = "Gagal menyimpan transaksi";
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTxDialogOpenChange = (open: boolean) => {
    setTxDialogOpen(open);

    if (!open) {
      resetTxForm();
    }
  };

  const deleteTransaction = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!json.success) {
        const message = json.error || "Gagal menghapus transaksi";
        setError(message);
        showErrorToast(message);
        return;
      }

      await reloadCore();
      await reloadMonthData();

      showSuccessToast("Transaksi berhasil dihapus");
    } catch {
      const message = "Gagal menghapus transaksi";
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  const saveTransfer = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        fromAccountId: Number(transferForm.fromAccountId),
        toAccountId: Number(transferForm.toAccountId),
        amount: Number(transferForm.amount),
        date: new Date(transferForm.date).toISOString(),
        note: transferForm.note || undefined,
      };

      const res = await fetch("/api/finance/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        const message = json.error || "Gagal transfer";
        setError(message);
        showErrorToast(message);
        return;
      }

      setTransferDialogOpen(false);
      setTransferForm({
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        note: "",
      });

      await reloadCore();
      await reloadMonthData();

      showSuccessToast("Transfer berhasil");
    } catch {
      const message = "Gagal transfer";
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload: { name: string; kind: "INCOME" | "EXPENSE"; parentId?: number } = {
        name: categoryForm.name,
        kind: categoryForm.kind,
      };
      if (categoryForm.parentId) {
        payload.parentId = Number(categoryForm.parentId);
      }

      const res = await fetch("/api/finance/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        const message = json.error || "Gagal membuat kategori";
        setError(message);
        showErrorToast(message);
        return;
      }

      setCategoryDialogOpen(false);
      setCategoryForm({ name: "", kind: "EXPENSE", parentId: "" });
      await reloadCore();

      showSuccessToast("Kategori berhasil dibuat");
    } catch {
      const message = "Gagal membuat kategori";
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/finance/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });

      const json = await res.json();

      if (!json.success) {
        const message = json.error || "Gagal membuat akun";
        setError(message);
        showErrorToast(message);
        return;
      }

      setAccountDialogOpen(false);
      setAccountForm({
        name: "",
        type: "CASH",
        currency: "IDR",
        initialBalance: "0",
      });

      await reloadCore();
      showSuccessToast("Akun berhasil dibuat");
    } catch {
      const message = "Gagal membuat akun";
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/finance/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          categoryId: Number(budgetForm.categoryId),
          currency: budgetForm.currency,
          limit: Number(budgetForm.limit),
        }),
      });

      const json = await res.json();

      if (!json.success) {
        const message = json.error || "Gagal menyimpan budget";
        setError(message);
        showErrorToast(message);
        return;
      }

      setBudgetDialogOpen(false);
      setBudgetForm({ categoryId: "", currency: "IDR", limit: "" });
      await reloadMonthData();

      showSuccessToast("Budget berhasil disimpan");
    } catch {
      const message = "Gagal menyimpan budget";
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: goalForm.name,
        currency: goalForm.currency,
        targetAmount: Number(goalForm.targetAmount),
        currentAmount: Number(goalForm.currentAmount || 0),
        targetDate: goalForm.targetDate ? new Date(goalForm.targetDate).toISOString() : undefined,
        accountId: goalForm.accountId ? Number(goalForm.accountId) : undefined,
        icon: goalForm.icon || undefined,
        color: goalForm.color || undefined,
      };

      const res = await fetch("/api/finance/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        const message = json.error || "Gagal membuat goal";
        setError(message);
        showErrorToast(message);
        return;
      }

      setGoalDialogOpen(false);
      setGoalForm({
        name: "",
        currency: "IDR",
        targetAmount: "",
        currentAmount: "0",
        targetDate: "",
        accountId: "",
        icon: "",
        color: "",
      });

      await reloadCore();
      showSuccessToast("Goal berhasil dibuat");
    } catch {
      const message = "Gagal membuat goal";
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: number) => {
    showDeleteConfirmToast("Hapus target tabungan ini?", async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/finance/goals?id=${id}`, { method: "DELETE" });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Gagal menghapus goal");

        setGoals((prev) => prev.filter((g) => g.id !== id));
        await reloadCore();
        await reloadMonthData();
        showSuccessToast("Target berhasil dihapus");
      } catch {
        showErrorToast("Gagal menghapus goal");
      } finally {
        setLoading(false);
      }
    });
  };

  const contributeGoal = async () => {
    if (!goalContributeForm.goalId || !goalContributeForm.accountId || !goalContributeForm.amount || Number(goalContributeForm.amount) <= 0) {
      showErrorToast("Masukkan target, sumber dana, dan nominal yang valid.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/finance/goals/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalContributeForm),
      });
      const json = await res.json();
      if (!json.success) {
        showErrorToast(json.error || "Gagal mengisi tabungan");
        return;
      }

      await reloadCore();
      await reloadMonthData();
      
      setGoalContributeDialogOpen(false);
      setGoalContributeForm({ goalId: "", accountId: "", amount: "" });
      showSuccessToast("Tabungan berhasil diisi!");
    } catch {
      showErrorToast("Gagal mengisi tabungan");
    } finally {
      setLoading(false);
    }
  };

  const exportUrl = useMemo(() => {
    const start = monthStartEnd.start.toISOString();
    const end = monthStartEnd.end.toISOString();
    return `/api/finance/export?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  }, [monthStartEnd]);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/finance/import", { method: "POST", body: fd });
      const json = await res.json();

      if (!json.success) {
        const message = json.error || "Gagal import";
        setError(message);
        showErrorToast(message);
        return;
      }

      await reloadCore();
      await reloadMonthData();

      showSuccessToast("Import berhasil");
    } catch {
      const message = "Gagal import";
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  return {
    t,
    locale,
    session,
    partnerName,
    plan,
    active,
    setActive,
    month,
    setMonth,
    accounts,
    categories,
    tags,
    transactions,
    budgets,
    goals,
    insights,
    loading,
    error,
    txDialogOpen,
    setTxDialogOpen,
    txEditing,
    setTxEditing,
    txForm,
    setTxForm,
    transferDialogOpen,
    setTransferDialogOpen,
    transferForm,
    setTransferForm,
    categoryDialogOpen,
    setCategoryDialogOpen,
    categoryForm,
    setCategoryForm,
    accountDialogOpen,
    setAccountDialogOpen,
    accountForm,
    setAccountForm,
    handleTxDialogOpenChange,
    budgetDialogOpen,
    setBudgetDialogOpen,
    budgetForm,
    reloadCore,
    setBudgetForm,
    goalDialogOpen,
    setGoalDialogOpen,
    goalForm,
    setGoalForm,
    goalContributeDialogOpen,
    setGoalContributeDialogOpen,
    goalContributeForm,
    setGoalContributeForm,
    contributeGoal,
    importInputRef,
    expenseCategories,
    incomeCategories,
    monthStartEnd,
    isHistoryLocked,
    historyLimitMessage,
    reloadMonthData,
    openNewTransaction,
    openEditTransaction,
    saveTransaction,
    deleteTransaction,
    saveTransfer,
    createCategory,
    createAccount,
    saveBudget,
    createGoal,
    deleteGoal,
    exportUrl,
    handleImportClick,
    handleImportFile,
  };
}
