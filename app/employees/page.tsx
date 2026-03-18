import { EmployeeDashboardTable } from "@/components/dashboard/employee-dashboard-table";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/auth";
import { getDashboardRows } from "@/lib/queries";

export default async function EmployeesPage() {
  await requireAdmin();
  const rows = await getDashboardRows();

  return (
    <AppShell pathname="/employees">
      <PageHeader
        title="Employees"
        description="All employees with opening advance, earnings, and current balance at a glance."
      />
      {rows.length ? (
        <EmployeeDashboardTable rows={rows} />
      ) : (
        <EmptyState
          title="No employees yet"
          description="Create an employee record to start tracking balances and production wages."
          ctaHref="/add-employee"
          ctaLabel="Add employee"
        />
      )}
    </AppShell>
  );
}
