"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteTransactionAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

export function DeleteTransactionButton({
  id,
  employeeId
}: {
  id: string;
  employeeId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete transaction?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The employee ledger and balance will be recalculated
            immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteTransactionAction(id, employeeId);

                if (!result.success) {
                  toast.error(result.message);
                  return;
                }

                toast.success(result.message);
                setOpen(false);
                if (result.redirectTo) {
                  router.push(result.redirectTo);
                  router.refresh();
                }
              });
            }}
          >
            {pending ? "Deleting..." : "Delete transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
