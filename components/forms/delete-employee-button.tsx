"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteEmployeeAction } from "@/lib/actions";
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

export function DeleteEmployeeButton({
  id,
  employeeName
}: {
  id: string;
  employeeName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
          Delete employee
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {employeeName}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All transactions linked to this employee will also be deleted.
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
                const result = await deleteEmployeeAction(id);

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
            {pending ? "Deleting..." : "Delete employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
