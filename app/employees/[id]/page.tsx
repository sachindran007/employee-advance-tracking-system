import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilLine } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { getEmployeeLedger } from "@/lib/queries";
import { formatCurrency, formatDate, getBalanceTone } from "@/lib/utils";

export default async function EmployeeLedgerPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  try {
    const { employee, ledger, totalEarned, currentBalance } = await getEmployeeLedger(id);

    return (
      <AppShell pathname="/employees">
        <PageHeader
          title={employee.name}
          description="Ledger view with credit, debit, and live running balance."
          action={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={`/employees/edit/${employee.id}`}>
                  <PencilLine className="h-4 w-4" />
                  Edit employee
                </Link>
              </Button>
              <Button asChild>
                <Link href="/add-transaction">Add transaction</Link>
              </Button>
            </div>
          }
        />

        <div className="mb-6 grid gap-4 lg:grid-cols-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Join Date</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold">{formatDate(employee.join_date)}</CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Initial Advance</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold">
              {formatCurrency(employee.initial_advance)}
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Total Earned</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(totalEarned)}
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getBalanceTone(currentBalance)}>{formatCurrency(currentBalance)}</Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Running Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className={
                      entry.transaction_type === "ADVANCE"
                        ? "bg-red-50/70 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/30"
                        : "bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20"
                    }
                  >
                    <TableCell>{formatDate(entry.transaction_date)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          className={
                            entry.transaction_type === "ADVANCE"
                              ? "border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
                              : entry.transaction_type === "WAGE"
                                ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                                : "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          }
                        >
                          {entry.transaction_type}
                        </Badge>
                        {entry.transaction_type === "WAGE" ? (
                          <p className="text-sm text-muted-foreground">
                            {entry.bricks_produced} bricks x {formatCurrency(entry.rate_used ?? 0)}
                          </p>
                        ) : null}
                        {entry.notes ? <p>{entry.notes}</p> : <p className="text-muted-foreground">-</p>}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-red-700 dark:text-red-300">
                      {entry.transaction_type === "ADVANCE" ? formatCurrency(entry.amount) : "-"}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-700 dark:text-emerald-300">
                      {entry.transaction_type !== "ADVANCE" ? formatCurrency(entry.amount) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getBalanceTone(entry.runningBalance)}>
                        {formatCurrency(entry.runningBalance)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/transactions/edit/${entry.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AppShell>
    );
  } catch {
    notFound();
  }
}
