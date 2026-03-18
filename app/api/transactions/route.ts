import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/api-auth";
import { sanitizeOptionalText } from "@/lib/sanitize";
import { getAdminClient } from "@/lib/supabase/admin";
import { transactionSchema } from "@/lib/validations";
import type { TransactionInsert } from "@/types/database";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const parsed = transactionSchema.safeParse({
      ...body,
      notes: sanitizeOptionalText(body.notes)
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid transaction data." },
        { status: 400 }
      );
    }

    if (parsed.data.transactionType !== "WAGE" && Number(parsed.data.amount) <= 0) {
      return NextResponse.json({ message: "Amount must be greater than 0" }, { status: 400 });
    }

    const amount =
      parsed.data.transactionType === "WAGE"
        ? (Number(parsed.data.bricksProduced) / 1000) * Number(parsed.data.rateUsed)
        : Number(parsed.data.amount);

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

    const adminClient = getAdminClient();
    const { error } = await adminClient.from("transactions").insert(payload);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Transaction recorded successfully." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 }
    );
  }
}
