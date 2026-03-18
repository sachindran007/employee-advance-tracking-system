# Employee Advance & Production Tracking System

Production-ready Next.js + Supabase application for managing employee advances, wages, deductions, and live balance tracking.

## Tech Stack

- Next.js App Router
- React + TypeScript
- Supabase Auth + PostgreSQL + RPC
- Tailwind CSS
- Shadcn-style reusable UI components

## Folder Structure

```text
app/
  add-employee/
  add-transaction/
  employees/[id]/
  employees/edit/[id]/
  login/
  transactions/edit/[id]/
components/
  dashboard/
  forms/
  layout/
  ui/
lib/
  supabase/
  actions.ts
  auth.ts
  env.ts
  queries.ts
  validations.ts
sql/
  schema.sql
  rpc.sql
types/
  database.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
ADMIN_EMAILS=admin@example.com,owner@example.com
```

3. In Supabase SQL editor, run:
   - [`sql/schema.sql`](/C:/Users/Sachindran/Desktop/New%20folder/employee-advance-tracking-system/sql/schema.sql)
   - [`sql/rpc.sql`](/C:/Users/Sachindran/Desktop/New%20folder/employee-advance-tracking-system/sql/rpc.sql)

4. Create at least one auth user in Supabase Authentication whose email exists in `ADMIN_EMAILS`.

5. Start the app:

```bash
npm run dev
```

## Features

- Email/password admin authentication with route protection
- Dynamic balance calculation without storing balances in the database
- Dashboard summary via Supabase RPC
- Employee creation and editing
- Transaction creation, editing, and deletion
- Employee ledger with running balance
- Client-side validation and toast notifications

## Balance Formula

```text
current_balance = total_earned - (initial_advance + total_advance + total_deduction)
```
