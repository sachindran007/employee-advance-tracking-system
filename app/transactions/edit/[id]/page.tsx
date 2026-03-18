import { notFound } from "next/navigation";

import { DeleteTransactionButton } from "@/components/forms/delete-transaction-button";
import { TransactionForm } from "@/components/forms/transaction-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { requireAdmin } from "@/lib/auth";
import { getEmployees, getTransactionById } from "@/lib/queries";

export default async function EditTransactionPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  try {
    const [transaction, employees] = await Promise.all([getTransactionById(id), getEmployees()]);

    return (
      <AppShell pathname="/">
        <PageHeader
          title="Edit Transaction"
          description="Adjust wage, advance, or deduction entries while preserving live balance calculation."
          action={
            <DeleteTransactionButton id={transaction.id} employeeId={transaction.employee_id} />
          }
        />
        <TransactionForm
          transactionId={transaction.id}
          employees={employees}
          defaultValues={{
            employeeId: transaction.employee_id,
            transactionDate: transaction.transaction_date,
            transactionType: transaction.transaction_type,
            amount: transaction.amount,
            bricksProduced: transaction.bricks_produced ?? 0,
            rateUsed: transaction.rate_used ?? 0,
            notes: transaction.notes ?? ""
          }}
        />
      </AppShell>
    );
  } catch {
    notFound();
  }
}
