"use client";

import { Card } from "@/components/ui/card";
import { useMoneyData } from "./_hooks/useMoneyData";
import { MoneyPageHeader } from "./_components/MoneyPageHeader";
import { MoneyTabs } from "./_components/MoneyTabs";
import { DashboardView } from "./_components/DashboardView";
import { TransactionsView } from "./_components/TransactionsView";
import { CategoriesView } from "./_components/CategoriesView";
import { BudgetsView } from "./_components/BudgetsView";
import { GoalsView } from "./_components/GoalsView";
import { TransactionDialog } from "./_components/dialogs/TransactionDialog";
import { TransferDialog } from "./_components/dialogs/TransferDialog";
import { CategoryDialog } from "./_components/dialogs/CategoryDialog";
import { AccountDialog } from "./_components/dialogs/AccountDialog";
import { BudgetDialog } from "./_components/dialogs/BudgetDialog";
import { GoalDialog } from "./_components/dialogs/GoalDialog";
import { GoalContributeDialog } from "./_components/dialogs/GoalContributeDialog";
import { MoneyFab } from "./_components/money-fab";

export default function MoneyPage() {
  const {
    t,
    session,
    active,
    setActive,
    month,
    setMonth,
    accounts,
    tags,
    transactions,
    budgets,
    goals,
    insights,
    loading,
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
    budgetDialogOpen,
    setBudgetDialogOpen,
    budgetForm,
    setBudgetForm,
    reloadCore,
    goalDialogOpen,
    setGoalDialogOpen,
    goalForm,
    setGoalForm,
    importInputRef,
    expenseCategories,
    incomeCategories,
    monthStartEnd,
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
    goalContributeDialogOpen,
    setGoalContributeDialogOpen,
    goalContributeForm,
    setGoalContributeForm,
    contributeGoal,
    exportUrl,
    handleImportClick,
    handleImportFile,
  } = useMoneyData();

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <Card className="rounded-[1.25rem] border border-primary/10 p-5 sm:rounded-3xl sm:p-8">
          <div className="mb-2 text-2xl font-black sm:text-3xl">Money Tracker</div>
          <div className="text-sm text-muted-foreground sm:text-base">Login dulu untuk memakai fitur money tracker.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] pb-20 sm:pb-28 relative">
      <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-8 lg:px-6">
        <MoneyPageHeader
          t={t}
          month={month}
          setMonth={setMonth}
          reloadMonthData={reloadMonthData}
          loading={loading}
          exportUrl={exportUrl}
          handleImportClick={handleImportClick}
          importInputRef={importInputRef}
          handleImportFile={handleImportFile}
        />
        <MoneyTabs t={t} active={active} setActive={setActive} />

        {active === "dashboard" && <DashboardView t={t} insights={insights} transactions={transactions} accounts={accounts} goals={goals} setActive={setActive} monthStartEnd={monthStartEnd} />}

        {active === "transactions" && (
          <TransactionsView t={t} transactions={transactions} openNewTransaction={openNewTransaction} setTransferDialogOpen={setTransferDialogOpen} openEditTransaction={openEditTransaction} deleteTransaction={deleteTransaction} />
        )}

        {active === "categories" && <CategoriesView t={t} expenseCategories={expenseCategories} incomeCategories={incomeCategories} setCategoryDialogOpen={setCategoryDialogOpen} reloadCore={reloadCore} />}

        {active === "budgets" && <BudgetsView t={t} budgets={budgets} setBudgetDialogOpen={setBudgetDialogOpen} />}

        {active === "goals" && <GoalsView t={t} goals={goals} setGoalDialogOpen={setGoalDialogOpen} setGoalContributeDialogOpen={setGoalContributeDialogOpen} deleteGoal={deleteGoal} setActive={setActive} />}
      </div>

      <TransactionDialog
        t={t}
        open={txDialogOpen}
        onOpenChange={setTxDialogOpen}
        loading={loading}
        editing={!!txEditing}
        form={txForm}
        setForm={setTxForm}
        accounts={accounts}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        tags={tags}
        onSave={saveTransaction}
        setCategoryDialogOpen={setCategoryDialogOpen}
        setCategoryForm={setCategoryForm}
      />

      <TransferDialog t={t} open={transferDialogOpen} onOpenChange={setTransferDialogOpen} loading={loading} form={transferForm} setForm={setTransferForm} accounts={accounts} onSave={saveTransfer} />

      <CategoryDialog
        t={t}
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        loading={loading}
        form={categoryForm}
        setForm={setCategoryForm}
        onSave={createCategory}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
      />

      <AccountDialog t={t} open={accountDialogOpen} onOpenChange={setAccountDialogOpen} loading={loading} form={accountForm} setForm={setAccountForm} onSave={createAccount} />

      <BudgetDialog t={t} open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen} loading={loading} form={budgetForm} setForm={setBudgetForm} expenseCategories={expenseCategories} onSave={saveBudget} />

      <GoalDialog t={t} open={goalDialogOpen} onOpenChange={setGoalDialogOpen} loading={loading} form={goalForm} setForm={setGoalForm} onSave={createGoal} />
      
      <GoalContributeDialog open={goalContributeDialogOpen} onOpenChange={setGoalContributeDialogOpen} loading={loading} form={goalContributeForm} setForm={setGoalContributeForm} goals={goals} accounts={accounts} onSave={contributeGoal} />

      <MoneyFab 
        t={t} 
        setTransferForm={setTransferForm} 
        setTransferDialogOpen={setTransferDialogOpen} 
        setTxForm={setTxForm} 
        setTxDialogOpen={setTxDialogOpen} 
        setBudgetDialogOpen={setBudgetDialogOpen} 
        setAccountDialogOpen={setAccountDialogOpen}
        setGoalDialogOpen={setGoalDialogOpen}
        setGoalContributeDialogOpen={setGoalContributeDialogOpen}
        resetTxEditing={() => setTxEditing(null)} 
      />
    </div>
  );
}
