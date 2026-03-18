import type { ReactNode } from "react";
import Link from "next/link";
import { Home, PlusCircle, ReceiptText, Users } from "lucide-react";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/employees", label: "Employees", icon: ReceiptText },
  { href: "/add-employee", label: "Add Employee", icon: Users },
  { href: "/add-transaction", label: "Add Transaction", icon: PlusCircle }
];

export function AppShell({
  pathname,
  children
}: {
  pathname: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-6 border-b bg-background">
          <div className="flex flex-col gap-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ReceiptText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight">
                  Employee Advance & Production Tracking
                </h1>
                <p className="text-sm text-muted-foreground">
                  Simple daily tracking for advances, wages, and balances.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>

          <nav className="flex flex-wrap gap-2 pb-4">
            {links.map((link) => {
              const Icon = link.icon;
              const active =
                pathname === link.href ||
                (link.href === "/employees" && pathname.startsWith("/employees"));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
