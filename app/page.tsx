import Link from "next/link";

import { EmployeeDashboardTable } from "@/components/dashboard/employee-dashboard-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { getDashboardRows } from "@/lib/queries";
import type { DashboardRow } from "@/types/database";

export default async function DashboardPage() {
  await requireAdmin();
  const rows = await getDashboardRows();
  const totals = rows.reduce(
    (
      accumulator: { totalEarned: number; totalOutstanding: number; atRiskCount: number },
      row: DashboardRow
    ) => {
      accumulator.totalEarned += row.total_earned;
      accumulator.totalOutstanding += Math.max(row.current_balance, 0);
      if (row.current_balance > 15000) {
        accumulator.atRiskCount += 1;
      }
      return accumulator;
    },
    { totalEarned: 0, totalOutstanding: 0, atRiskCount: 0 }
  );

  return (
    <AppShell pathname="/">
      <PageHeader
        title="Dashboard"
        description="Overview of all employee balances and earned wages."
        action={
          <Button asChild>
            <Link href="/add-transaction">New transaction</Link>
          </Button>
        }
      />

      {rows.length ? (
        <>
          <StatsCards
            employeeCount={rows.length}
            totalEarned={totals.totalEarned}
            totalOutstanding={totals.totalOutstanding}
            atRiskCount={totals.atRiskCount}
          />
          <EmployeeDashboardTable rows={rows} />
        </>
      ) : (
        <EmptyState
          title="No employees found"
          description="Create your first employee record to start tracking advances and wages."
          ctaHref="/add-employee"
          ctaLabel="Add employee"
        />
      )}
    </AppShell>
  );
}
