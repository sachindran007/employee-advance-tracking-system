import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/api-auth";
import { sanitizeTextInput } from "@/lib/sanitize";
import { getAdminClient } from "@/lib/supabase/admin";
import { employeeSchema } from "@/lib/validations";
import type { EmployeeInsert } from "@/types/database";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const parsed = employeeSchema.safeParse({
      ...body,
      name: sanitizeTextInput(String(body.name ?? ""))
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid employee data." },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();
    const { count, error: duplicateError } = await adminClient
      .from("employees")
      .select("id", { count: "exact", head: true })
      .ilike("name", parsed.data.name);

    if (duplicateError) {
      return NextResponse.json({ message: duplicateError.message }, { status: 500 });
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { message: "An employee with this name already exists." },
        { status: 409 }
      );
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
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Employee added successfully." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 }
    );
  }
}
