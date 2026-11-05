"use client";

import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import type { MainCategory } from "../../api/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteMainCategory } from "../../hooks/useMainCategory";

interface CellActionProps {
  data: MainCategory;
}

export function CellAction({ data }: CellActionProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const deleteMutation = useDeleteMainCategory();

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() =>
          deleteMutation.mutate(data.id, {
            onSuccess: () => {
              toast.success("Main category deleted successfully");
              setOpen(false);
            },
            onError: (error) =>
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to delete main category",
              ),
          })
        }
        loading={deleteMutation.isPending}
      />
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg border border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => router.push(`/dashboard/main-category/${data.id}`)}
          title="Manage & Assign Categories"
        >
          <Icons.edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          onClick={() => setOpen(true)}
          title="Delete Main Category"
        >
          <Icons.trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </>
  );
}
