import { z } from "zod";

import { sanitizeOptionalText, sanitizeTextInput } from "@/lib/sanitize";

export const employeeSchema = z.object({
  name: z
    .string()
    .transform((value) => sanitizeTextInput(value))
    .pipe(
      z
        .string()
        .min(2, "Name is required.")
        .max(50, "Name must be 50 characters or less.")
    ),
  joinDate: z.string().min(1, "Join date is required."),
  initialAdvance: z.coerce.number().min(0, "Initial advance cannot be negative."),
  defaultRate: z.coerce.number().min(0, "Default rate cannot be negative."),
  isActive: z.boolean().default(true)
});

export const transactionSchema = z
  .object({
    employeeId: z.string().uuid("Select an employee."),
    transactionDate: z.string().min(1, "Transaction date is required."),
    transactionType: z.enum(["WAGE", "ADVANCE", "DEDUCTION"]),
    amount: z.coerce.number().min(0, "Amount cannot be negative."),
    bricksProduced: z.coerce.number().min(0, "Bricks cannot be negative.").optional(),
    rateUsed: z.coerce.number().min(0, "Rate cannot be negative.").optional(),
    notes: z
      .string()
      .transform((value) => sanitizeOptionalText(value))
      .pipe(z.string().max(500, "Notes must be 500 characters or less."))
      .optional()
  })
  .superRefine((value, ctx) => {
    if (value.transactionType === "WAGE") {
      if (!value.bricksProduced || value.bricksProduced <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bricksProduced"],
          message: "Bricks produced must be greater than zero."
        });
      }

      if (!value.rateUsed || value.rateUsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rateUsed"],
          message: "Rate used must be greater than zero."
        });
      }
    }

    if (
      (value.transactionType === "ADVANCE" || value.transactionType === "DEDUCTION") &&
      value.amount <= 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Amount must be greater than 0"
      });
    }
  });

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type TransactionFormValues = z.infer<typeof transactionSchema>;
