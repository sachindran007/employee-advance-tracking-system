"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { createTransactionAction, updateTransactionAction } from "@/lib/actions";
import { transactionSchema, type TransactionFormValues } from "@/lib/validations";

interface TransactionFormProps {
  employees: {
    id: string;
    name: string;
    default_rate: number;
    is_active: boolean;
  }[];
  defaultValues?: TransactionFormValues;
  transactionId?: string;
}

export function TransactionForm({
  employees,
  defaultValues,
  transactionId
}: TransactionFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const hasManuallyEditedRate = useRef(false);
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    mode: "onChange",
    defaultValues:
      defaultValues ??
      ({
        employeeId: employees[0]?.id ?? "",
        transactionDate: new Date().toISOString().slice(0, 10),
        transactionType: "WAGE",
        amount: 0,
        bricksProduced: 0,
        rateUsed: employees[0] && employees[0].default_rate > 0 ? employees[0].default_rate : 120,
        notes: ""
      } satisfies TransactionFormValues)
  });
  const employeeField = form.register("employeeId");
  const transactionTypeField = form.register("transactionType");
  const rateUsedField = form.register("rateUsed", { valueAsNumber: true });

  const transactionType = form.watch("transactionType");
  const employeeId = form.watch("employeeId");
  const bricksProduced = Number(form.watch("bricksProduced") || 0);
  const rateUsed = Number(form.watch("rateUsed") || 0);
  const manualAmount = Number(form.watch("amount") || 0);
  const amountPreview =
    transactionType === "WAGE" ? (bricksProduced / 1000) * rateUsed : manualAmount;
  const isPreviewInvalid = transactionType === "WAGE" ? amountPreview <= 0 : manualAmount <= 0;

  const selectedEmployee = employees.find((employee) => employee.id === employeeId);

  const onSubmit = (values: TransactionFormValues) => {
    startTransition(async () => {
      const result = transactionId
        ? await updateTransactionAction(transactionId, values)
        : await createTransactionAction(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>{transactionId ? "Edit transaction" : "Add transaction"}</CardTitle>
        <CardDescription>
          Record production wages, additional advances, or deductions with instant calculation
          feedback. Wages use `(bricks / 1000) x rate`.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-6 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit(onSubmit)(event);
          }}
        >
          <FormField
            label="Employee"
            htmlFor="employeeId"
            error={form.formState.errors.employeeId?.message}
            className="md:col-span-2"
          >
            <Select
              id="employeeId"
              {...employeeField}
              onChange={(event) => {
                employeeField.onChange(event);
                const employee = employees.find((item) => item.id === event.target.value);
                if (employee && transactionType === "WAGE" && !hasManuallyEditedRate.current) {
                  form.setValue("rateUsed", employee.default_rate > 0 ? employee.default_rate : 120);
                }
              }}
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} {employee.is_active ? "" : "(Inactive)"}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Transaction date"
            htmlFor="transactionDate"
            error={form.formState.errors.transactionDate?.message}
          >
            <Input id="transactionDate" type="date" {...form.register("transactionDate")} />
          </FormField>

          <FormField
            label="Transaction type"
            htmlFor="transactionType"
            error={form.formState.errors.transactionType?.message}
          >
            <Select
              id="transactionType"
              {...transactionTypeField}
              onChange={(event) => {
                transactionTypeField.onChange(event);
                const nextType = event.target.value as TransactionFormValues["transactionType"];
                if (nextType === "WAGE" && !hasManuallyEditedRate.current) {
                  form.setValue(
                    "rateUsed",
                    selectedEmployee && selectedEmployee.default_rate > 0
                      ? selectedEmployee.default_rate
                      : 120
                  );
                }
              }}
            >
              <option value="WAGE">WAGE</option>
              <option value="ADVANCE">ADVANCE</option>
              <option value="DEDUCTION">DEDUCTION</option>
            </Select>
          </FormField>

          {transactionType === "WAGE" ? (
            <>
              <FormField
                label="Bricks produced"
                htmlFor="bricksProduced"
                error={form.formState.errors.bricksProduced?.message}
              >
                <Input
                  id="bricksProduced"
                  type="number"
                  min="1"
                  placeholder="0"
                  {...form.register("bricksProduced", { valueAsNumber: true })}
                />
              </FormField>

              <FormField
                label="Rate used"
                htmlFor="rateUsed"
                error={form.formState.errors.rateUsed?.message}
              >
                <Input
                  id="rateUsed"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  {...rateUsedField}
                  onChange={(event) => {
                    hasManuallyEditedRate.current = true;
                    rateUsedField.onChange(event);
                  }}
                />
              </FormField>
            </>
          ) : (
            <FormField
              label="Amount"
              htmlFor="amount"
              error={form.formState.errors.amount?.message}
            >
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="0.00"
                {...form.register("amount", { valueAsNumber: true })}
              />
            </FormField>
          )}

          <FormField
            label={transactionType === "DEDUCTION" ? "Notes" : "Notes (optional)"}
            htmlFor="notes"
            error={form.formState.errors.notes?.message}
            className="md:col-span-2"
          >
            <Textarea
              id="notes"
              placeholder="Add any remarks or reason for this transaction"
              {...form.register("notes")}
            />
          </FormField>

          <div className="rounded-lg border bg-muted/30 p-4 md:col-span-2">
            <p className="text-sm text-muted-foreground">Calculated amount</p>
            <p className="mt-1 text-2xl font-semibold">{formatCurrency(amountPreview)}</p>
          </div>

          <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Changes update the employee ledger and balance immediately after save.
            </p>
            <Button
              type="submit"
              disabled={pending || !form.formState.isValid || isPreviewInvalid}
            >
              {pending ? "Saving..." : transactionId ? "Update transaction" : "Save transaction"}
            </Button>
          </div>
        </form>
        {selectedEmployee ? (
          <div className="mt-6 text-sm text-muted-foreground">
            Selected employee: <span className="font-medium text-foreground">{selectedEmployee.name}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
