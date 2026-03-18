import { notFound } from "next/navigation";

import { DeleteEmployeeButton } from "@/components/forms/delete-employee-button";
import { EmployeeForm } from "@/components/forms/employee-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { requireAdmin } from "@/lib/auth";
import { getEmployeeById } from "@/lib/queries";

export default async function EditEmployeePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  try {
    const employee = await getEmployeeById(id);

    return (
      <AppShell pathname="/">
        <PageHeader
          title="Edit Employee"
          description="Update employee profile details and opening values."
          action={<DeleteEmployeeButton id={employee.id} employeeName={employee.name} />}
        />
        <EmployeeForm
          employeeId={employee.id}
          defaultValues={{
            name: employee.name,
            joinDate: employee.join_date,
            initialAdvance: employee.initial_advance,
            defaultRate: employee.default_rate,
            isActive: employee.is_active
          }}
        />
      </AppShell>
    );
  } catch {
    notFound();
  }
}
