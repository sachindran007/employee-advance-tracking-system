"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/env";
import { requireAdmin } from "@/lib/auth";
import { sanitizeOptionalText, sanitizeTextInput } from "@/lib/sanitize";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { EmployeeInsert, TransactionInsert } from "@/types/database";
import {
  employeeSchema,
  transactionSchema,
  type EmployeeFormValues,
  type TransactionFormValues
} from "@/lib/validations";

export interface ActionResult {
  success: boolean;
  message: string;
  redirectTo?: string;
}

function actionError(message: string): ActionResult {
  return { success: false, message };
}

async function employeeNameExists(name: string, excludeId?: string) {
  const adminClient = getAdminClient();
  let query = adminClient
    .from("employees")
    .select("id", { count: "exact", head: true })
    .ilike("name", name);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
}

export async function signInAction(input: { email: string; password: string }): Promise<ActionResult> {
  if (!isAdminEmail(input.email)) {
    return actionError("This account is not allowed to access the admin panel.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password
  });

  if (error) {
    return actionError(error.message);
  }

  return { success: true, message: "Signed in successfully.", redirectTo: "/" };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createEmployeeAction(values: EmployeeFormValues): Promise<ActionResult> {
  await requireAdmin();
  const adminClient = getAdminClient();
  const parsed = employeeSchema.safeParse({
    ...values,
    name: sanitizeTextInput(values.name)
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid employee data.");
  }

  if (await employeeNameExists(parsed.data.name)) {
    return actionError("An employee with this name already exists.");
  }

  const payload: EmployeeInsert = {
    name: parsed.data.name,
    join_date: parsed.data.joinDate,
    initial_advance: parsed.data.initialAdvance,
    default_rate: parsed.data.defaultRate,
    is_active: parsed.data.isActive
  };

  const { error } = await adminClient.from("employees").insert(payload);

  if (error) {
    return actionError(error.message);
  }

  revalidatePath("/");
  revalidatePath("/add-employee");
  revalidatePath("/employees");
  return { success: true, message: "Employee added successfully.", redirectTo: "/employees" };
}

export async function updateEmployeeAction(
  id: string,
  values: EmployeeFormValues
): Promise<ActionResult> {
  await requireAdmin();
  const adminClient = getAdminClient();
  const parsed = employeeSchema.safeParse({
    ...values,
    name: sanitizeTextInput(values.name)
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid employee data.");
  }

  if (await employeeNameExists(parsed.data.name, id)) {
    return actionError("An employee with this name already exists.");
  }

  const { error } = await adminClient
    .from("employees")
    .update({
      name: parsed.data.name,
      join_date: parsed.data.joinDate,
      initial_advance: parsed.data.initialAdvance,
      default_rate: parsed.data.defaultRate,
      is_active: parsed.data.isActive
    })
    .eq("id", id);

  if (error) {
    return actionError(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/employees/${id}`);
  revalidatePath(`/employees/edit/${id}`);
  return { success: true, message: "Employee updated successfully.", redirectTo: `/employees/${id}` };
}

export async function deleteEmployeeAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const adminClient = getAdminClient();

  const { error } = await adminClient.from("employees").delete().eq("id", id);

  if (error) {
    return actionError(error.message);
  }

  revalidatePath("/");
  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  revalidatePath(`/employees/edit/${id}`);
  revalidatePath("/add-transaction");
  return {
    success: true,
    message: "Employee deleted successfully.",
    redirectTo: "/employees"
  };
}

export async function createTransactionAction(
  values: TransactionFormValues
): Promise<ActionResult> {
  await requireAdmin();
  const adminClient = getAdminClient();
  const parsed = transactionSchema.safeParse({
    ...values,
    notes: sanitizeOptionalText(values.notes)
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid transaction data.");
  }

  const amount =
    parsed.data.transactionType === "WAGE"
      ? (Number(parsed.data.bricksProduced) / 1000) * Number(parsed.data.rateUsed)
      : parsed.data.amount;

  if (parsed.data.transactionType !== "WAGE" && amount <= 0) {
    return actionError("Amount must be greater than 0");
  }

  const payload: TransactionInsert = {
    employee_id: parsed.data.employeeId,
    transaction_date: parsed.data.transactionDate,
    transaction_type: parsed.data.transactionType,
    amount,
    bricks_produced:
      parsed.data.transactionType === "WAGE" ? parsed.data.bricksProduced ?? null : null,
    rate_used: parsed.data.transactionType === "WAGE" ? parsed.data.rateUsed ?? null : null,
    notes: parsed.data.notes || null
  };

  const { error } = await adminClient.from("transactions").insert(payload);

  if (error) {
    return actionError(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/employees/${parsed.data.employeeId}`);
  revalidatePath("/add-transaction");
  return {
    success: true,
    message: "Transaction recorded successfully.",
    redirectTo: `/employees/${parsed.data.employeeId}`
  };
}

export async function updateTransactionAction(
  id: string,
  values: TransactionFormValues
): Promise<ActionResult> {
  await requireAdmin();
  const adminClient = getAdminClient();
  const parsed = transactionSchema.safeParse({
    ...values,
    notes: sanitizeOptionalText(values.notes)
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid transaction data.");
  }

  const amount =
    parsed.data.transactionType === "WAGE"
      ? (Number(parsed.data.bricksProduced) / 1000) * Number(parsed.data.rateUsed)
      : parsed.data.amount;

  if (parsed.data.transactionType !== "WAGE" && amount <= 0) {
    return actionError("Amount must be greater than 0");
  }

  const { error } = await adminClient
    .from("transactions")
    .update({
      employee_id: parsed.data.employeeId,
      transaction_date: parsed.data.transactionDate,
      transaction_type: parsed.data.transactionType,
      amount,
      bricks_produced:
        parsed.data.transactionType === "WAGE" ? parsed.data.bricksProduced ?? null : null,
      rate_used: parsed.data.transactionType === "WAGE" ? parsed.data.rateUsed ?? null : null,
      notes: parsed.data.notes || null
    })
    .eq("id", id);

  if (error) {
    return actionError(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/employees/${parsed.data.employeeId}`);
  revalidatePath(`/transactions/edit/${id}`);
  return {
    success: true,
    message: "Transaction updated successfully.",
    redirectTo: `/employees/${parsed.data.employeeId}`
  };
}

export async function deleteTransactionAction(
  id: string,
  employeeId: string
): Promise<ActionResult> {
  await requireAdmin();
  const adminClient = getAdminClient();

  const { error } = await adminClient.from("transactions").delete().eq("id", id);

  if (error) {
    return actionError(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath(`/transactions/edit/${id}`);
  return {
    success: true,
    message: "Transaction deleted successfully.",
    redirectTo: `/employees/${employeeId}`
  };
}
