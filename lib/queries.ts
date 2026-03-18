import { getAdminClient } from "@/lib/supabase/admin";
import { toNumber } from "@/lib/utils";
import type { DashboardRow, EmployeeRow, TransactionRow } from "@/types/database";

export async function getDashboardRows() {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient.rpc("get_employee_dashboard_data");

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DashboardRow[]).map((row) => ({
    ...row,
    initial_advance: toNumber(row.initial_advance),
    total_earned: toNumber(row.total_earned),
    current_balance: toNumber(row.current_balance)
  }));
}

export async function getEmployees() {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from("employees")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as EmployeeRow[];
}

export async function getEmployeeById(id: string) {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as EmployeeRow;
}

export async function getTransactionById(id: string) {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from("transactions")
    .select("*, employees(name)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TransactionRow & { employees: { name: string } | null };
}

export async function getEmployeeLedger(id: string) {
  const adminClient = getAdminClient();
  const [employeeResult, transactionsResult] = await Promise.all([
    adminClient.from("employees").select("*").eq("id", id).single(),
    adminClient
      .from("transactions")
      .select("*")
      .eq("employee_id", id)
      .order("transaction_date", { ascending: true })
      .order("created_at", { ascending: true })
  ]);

  if (employeeResult.error) {
    throw new Error(employeeResult.error.message);
  }

  if (transactionsResult.error) {
    throw new Error(transactionsResult.error.message);
  }

  const employee = employeeResult.data as EmployeeRow;
  const transactions = transactionsResult.data as TransactionRow[];
  let runningBalance = toNumber(employee.initial_advance) * -1;

  const ledger = transactions.map((transaction) => {
    const amount = toNumber(transaction.amount);

    if (transaction.transaction_type === "WAGE") {
      runningBalance += amount;
    } else {
      runningBalance -= amount;
    }

    return {
      ...transaction,
      amount,
      runningBalance
    };
  });

  const totalEarned = ledger
    .filter((transaction) => transaction.transaction_type === "WAGE")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    employee,
    ledger,
    totalEarned,
    currentBalance: runningBalance
  };
}
