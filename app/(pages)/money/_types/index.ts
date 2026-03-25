export type MoneyNavId = "dashboard" | "transactions" | "categories" | "budgets" | "goals";

export type FinanceAccount = {
  id: number;
  name: string;
  type: "CASH" | "BANK" | "EWALLET";
  currency: string;
  initialBalance: string;
  balance: string;
};

export type FinanceCategory = {
  id: number;
  name: string;
  kind: "INCOME" | "EXPENSE";
  parentId: number | null;
  classification?: "NEED" | "WANT" | "INVESTMENT" | "SAVING" | "DEBT" | "TAX" | "OTHER" | null;
};

export type FinanceTag = {
  id: number;
  name: string;
};

export type FinanceTransaction = {
  id: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  transferDirection?: "IN" | "OUT" | null;
  otherAccountId?: number | null;
  amount: string;
  currency: string;
  date: string;
  note?: string | null;
  category?: FinanceCategory | null;
  account: FinanceAccount;
  tags: FinanceTag[];
};

export type FinanceGoal = {
  id: number;
  name: string;
  currency: string;
  targetAmount: string;
  currentAmount: string;
  targetDate?: string | null;
  accountId?: number | null;
  account?: FinanceAccount | null;
  icon?: string | null;
  color?: string | null;
  createdAt?: string;
};

export type FinanceBudgetRow = {
  id: number;
  month: string;
  currency: string;
  limit: string;
  spent: string;
  category: { id: number; name: string };
};

export type InsightsResponse = {
  month: string;
  previousMonth: string;
  totalsByCurrency: Array<{
    currency: string;
    income: number;
    expense: number;
    balance: number;
    prevExpense: number;
    monthOverMonthExpenseDiff: number;
    monthOverMonthExpensePct: number | null;
    prevIncome: number;
    monthOverMonthIncomeDiff: number;
    monthOverMonthIncomePct: number | null;
    count: number;
    prevCount: number;
  }>;
  topSpendingByCurrency: Record<string, { category: string; amount: number }>;
  expenseByCategory: Array<{ currency: string; categoryId: number | null; category: string | null; amount: number; parentId: number | null }>;
  expenseByCategoryPrev: Array<{ currency: string; categoryId: number | null; category: string | null; amount: number; parentId: number | null }>;
  incomeByCategory: Array<{ currency: string; categoryId: number | null; category: string | null; amount: number; parentId: number | null }>;
  incomeByCategoryPrev: Array<{ currency: string; categoryId: number | null; category: string | null; amount: number; parentId: number | null }>;
  categoryMap: Array<{ id: number; name: string; parentId: number | null }>;
  budgetUsage: Array<{
    id: number;
    currency: string;
    category: { id: number; name: string };
    limit: number;
    spent: number;
    progress: number;
    isOver: boolean;
  }>;
};

export type DashboardViewText = {
  balance: string;
  income: string;
  expense: string;
  alerts: string;
  topSpending: string;
  cashflowOverview: string;
  cashflowDesc: string;
  highestExpense: string;
  highestIncome: string;
  highestExpenseDesc: string;
  highestIncomeDesc: string;
  categoryAlloc: string;
  categoryAllocDesc: string;
  categoryAllocDescInc: string;
  compareMonthly: string;
  compareMonthlyDesc: string;
  subCategory: string;
  parentCategory: string;
  total: string;
  thisMonth: string;
  lastMonth: string;
  noExpense: string;
  noIncome: string;
  noData: string;
  newItem: string;
  otherItem: string;
};

export type GoalsViewText = {
  goals: string;
  goalsSnapshotDesc: string;
  activeGoals: string;
  newGoal: string;
  target: string;
  aim: string;
  saved_short: string;
  now: string;
  rate: string;
  goalProgressBoard: string;
  goalBoardDesc: string;
  noGoals: string;
  targetDate: string;
  noDeadline: string;
  saved: string;
  left: string;
  progress: string;
  goalInsights: string;
  goalInsightsDesc: string;
  noGoalInsights: string;
  closestToFinish: string;
  mostRemaining: string;
  quickActions: string;
  quickActionsGoalDesc: string;
  backToDashboard: string;
  addContribution: string;
  deleteGoal: string;
  startFirstGoal: string;
  firstGoalDesc: string;
  createGoalNow: string;
  remainingDays: string;
  days: string;
  savePerMonth: string;
  insightNoDeadline: string;
  insightAhead: string;
  insightOnTrack: string;
  insightDone: string;
  insightNotStarted: string;
  insightBehindAmount: (amount: string) => string;
  insightOnTrackNoDate: string;
};

export type MoneyFabText = {
  transfer: string;
  expense: string;
  income: string;
};

export type TransferForm = {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  date: string;
  note: string;
};

export type TransactionForm = {
  type: "INCOME" | "EXPENSE";
  accountId: string;
  parentCategoryId: string;
  categoryId: string;
  amount: string;
  date: string;
  note: string;
  tags: string;
};


export type TransactionDialogText = {
  addTx: string;
  editTx: string;
  txDescLong: string;
  txType: string;
  selectType: string;
  expense: string;
  income: string;
  txAccount: string;
  selectAccount: string;
  txCategory: string;
  optional: string;
  txDate: string;
  txAmount: string;
  txCurrency: string;
  txTags: string;
  tagsPlaceholder: string;
  note?: string;
  cancel?: string;
  save?: string;
};

export type AccountForm = {
  name: string;
  type: "CASH" | "BANK" | "EWALLET";
  currency: string;
  initialBalance: string;
};

export type AccountDialogText = {
  addAccount: string;
  accountDescLong: string;
  accountName: string;
  accountType: string;
  selectType: string;
  txCurrency: string;
  initialBalance: string;
  cancel: string;
  create: string;
};

export type BudgetForm = {
  categoryId: string;
  currency: string;
  limit: string;
};

export type BudgetDialogText = {
  setBudget: string;
  budgetDescLong: string;
  txCategory: string;
  txCurrency: string;
  budgetLimit: string;
  cancel: string;
  save: string;
};

export type CategoryForm = {
  name: string;
  kind: "INCOME" | "EXPENSE";
  parentId: string;
};

export type CategoryDialogText = {
  addCategory: string;
  categoryDescLong: string;
  kind: string;
  selectKind: string;
  expense: string;
  income: string;
  categoryName: string;
  cancel: string;
  create: string;
};

export type GoalForm = {
  name: string;
  currency: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  accountId: string;
  icon: string;
  color: string;
};

export type GoalContributeForm = {
  goalId: string;
  accountId: string;
  amount: string;
};

export type GoalDialogText = {
  newGoal: string;
  goalDescLong: string;
  goalName: string;
  txCurrency: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  cancel: string;
  create: string;
};

export type TransferDialogText = {
  transfer: string;
  transferDescLong?: string;
  from: string;
  to: string;
  txAmount: string;
  txDate: string;
  note: string;
  optional: string;
  selectAccount: string;
  cancel: string;
  saveTransfer?: string;
};

export type SummaryFinanceCardProps = {
  title: string;
  value: string;
  badge: string;
  icon: React.ReactNode;
  iconTone: string;
  badgeTone?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: React.ReactNode;
    isPositive: boolean;
  };
};

export type AccountLike = {
  type?: string | null;
  accountType?: string | null;
  kind?: string | null;
  name?: string | null;
  balance?: number | string | null;
  currentBalance?: number | string | null;
  initialBalance?: number | string | null;
};
