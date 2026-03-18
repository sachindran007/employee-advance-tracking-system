import { TransactionForm } from "@/components/forms/transaction-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/auth";
import { getEmployees } from "@/lib/queries";

export default async function AddTransactionPage() {
  await requireAdmin();
  const employees = await getEmployees();

  return (
    <AppShell pathname="/add-transaction">
      <PageHeader
        title="Add Transaction"
        description="Record wages, advances, or deductions for any employee."
      />
      {employees.length ? (
        <TransactionForm employees={employees} />
      ) : (
        <EmptyState
          title="Employees required"
          description="Create at least one employee before adding transactions."
          ctaHref="/add-employee"
          ctaLabel="Add employee"
        />
      )}
    </AppShell>
  );
}
