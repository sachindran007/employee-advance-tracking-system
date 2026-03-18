import { EmployeeForm } from "@/components/forms/employee-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { requireAdmin } from "@/lib/auth";

export default async function AddEmployeePage() {
  await requireAdmin();

  return (
    <AppShell pathname="/add-employee">
      <PageHeader
        title="Add Employee"
        description="Create an employee profile with opening advance and default production rate."
      />
      <EmployeeForm />
    </AppShell>
  );
}
