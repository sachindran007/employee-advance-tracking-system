"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { signOutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      onClick={() => startTransition(async () => signOutAction())}
      disabled={pending}
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
