"use client";

import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteGuestUserMutation } from "../../api/mutations";
import type { GuestUser } from "../../api/types";
import { Icons } from "@/components/icons";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GuestUserFormSheet } from "../user-form-sheet";
import { guestUserKeys } from "../../api/queries";

interface CellActionProps {
  data: GuestUser;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    ...deleteGuestUserMutation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: guestUserKeys.all });
      toast.success("Guest user deleted successfully");
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete guest user");
    },
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
      />
      <GuestUserFormSheet
        guestUser={data}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg cursor-pointer border border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => setEditOpen(true)}
          title="Edit Category"
        >
          <Icons.edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg cursor-pointer border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          onClick={() => setDeleteOpen(true)}
          title="Delete Category"
        >
          <Icons.trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </>
  );
}
