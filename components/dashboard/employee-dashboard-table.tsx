import Link from "next/link";
import { ArrowRight, PencilLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatCurrency, getBalanceTone } from "@/lib/utils";

interface DashboardRow {
  employee_id: string;
  employee_name: string;
  initial_advance: number;
  total_earned: number;
  current_balance: number;
}

export function EmployeeDashboardTable({ rows }: { rows: DashboardRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee balances</CardTitle>
        <CardDescription>
          Review balances quickly and open the full ledger for transaction details.
        </CardDescription>
      </CardHeader>
      <CardContent className="hidden p-0 md:block">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Initial Advance</TableHead>
              <TableHead>Total Earned</TableHead>
              <TableHead>Current Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.employee_id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{row.employee_name}</p>
                    <p className="text-xs text-muted-foreground">ID: {row.employee_id.slice(0, 8)}</p>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(row.initial_advance)}</TableCell>
                <TableCell className="font-medium text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(row.total_earned)}
                </TableCell>
                <TableCell>
                  <Badge className={getBalanceTone(row.current_balance)}>
                    {formatCurrency(row.current_balance)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/employees/edit/${row.employee_id}`}>
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/employees/${row.employee_id}`}>
                        View ledger
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardContent className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <div key={row.employee_id} className="rounded-lg border p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{row.employee_name}</p>
                <p className="text-xs text-muted-foreground">Initial: {formatCurrency(row.initial_advance)}</p>
              </div>
              <Badge className={getBalanceTone(row.current_balance)}>
                {formatCurrency(row.current_balance)}
              </Badge>
            </div>
            <div className="mb-4 text-sm text-muted-foreground">
              Earned: <span className="font-medium text-emerald-700 dark:text-emerald-300">{formatCurrency(row.total_earned)}</span>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/employees/edit/${row.employee_id}`}>Edit</Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link href={`/employees/${row.employee_id}`}>View ledger</Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
