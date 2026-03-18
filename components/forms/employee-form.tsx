"use client";

import { useTransition } from "react";
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
import { updateEmployeeAction } from "@/lib/actions";
import { employeeSchema, type EmployeeFormValues } from "@/lib/validations";

interface EmployeeFormProps {
  defaultValues?: EmployeeFormValues;
  employeeId?: string;
}

export function EmployeeForm({ defaultValues, employeeId }: EmployeeFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    mode: "onChange",
    defaultValues: defaultValues ?? {
      name: "",
      joinDate: new Date().toISOString().slice(0, 10),
      initialAdvance: 0,
      defaultRate: 0,
      isActive: true
    }
  });

  const onSubmit = (values: EmployeeFormValues) => {
    startTransition(async () => {
      if (employeeId) {
        const result = await updateEmployeeAction(employeeId, values);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        if (result.redirectTo) {
          router.push(result.redirectTo);
          router.refresh();
        }
        return;
      }

      try {
        const response = await fetch("/api/employees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        });

        const result = (await response.json()) as { message?: string };

        if (!response.ok) {
          toast.error(result.message ?? "Failed to create employee.");
          return;
        }

        toast.success(result.message ?? "Employee added successfully.");
        router.push("/employees");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create employee.");
      }
    });
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{employeeId ? "Edit employee" : "Add employee"}</CardTitle>
        <CardDescription>
          Capture the basic profile and opening financial position. Balances are computed live from
          transactions.
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
            label="Employee name"
            htmlFor="name"
            error={form.formState.errors.name?.message}
            className="md:col-span-2"
          >
            <Input
              id="name"
              maxLength={50}
              placeholder="Enter employee name"
              {...form.register("name")}
            />
          </FormField>

          <FormField
            label="Join date"
            htmlFor="joinDate"
            error={form.formState.errors.joinDate?.message}
          >
            <Input id="joinDate" type="date" {...form.register("joinDate")} />
          </FormField>

          <FormField
            label="Default rate"
            htmlFor="defaultRate"
            error={form.formState.errors.defaultRate?.message}
          >
            <Input
              id="defaultRate"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register("defaultRate", { valueAsNumber: true })}
            />
          </FormField>

          <FormField
            label="Initial advance"
            htmlFor="initialAdvance"
            error={form.formState.errors.initialAdvance?.message}
          >
            <Input
              id="initialAdvance"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register("initialAdvance", { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Status" htmlFor="isActive">
            <label className="flex h-11 items-center gap-3 rounded-xl border bg-card px-4 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded" {...form.register("isActive")} />
              Employee is active
            </label>
          </FormField>

          <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Use non-negative values only. This helps keep wage and balance calculations accurate.
            </p>
            <Button type="submit" disabled={pending || !form.formState.isValid}>
              {pending ? "Saving..." : employeeId ? "Update employee" : "Create employee"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
