"use client";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { Column, ColumnDef } from "@tanstack/react-table";
import type { User } from "../../api/types";
import { CellAction } from "./cell-action";
import { ROLE_OPTIONS } from "./options";
import { CopyToClipboard } from "@/components/ui/copy-to-clipboard";

export const columns: ColumnDef<User>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name || "User"}</span>
        <div className="flex items-center gap-1.5">
          <CopyToClipboard
            variant="inline"
            text={row.original.email}
            successMessage="User Email copied to clipboard"
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          />
        </div>
      </div>
    ),
    meta: {
      label: "Name",
      placeholder: "Search users...",
      variant: "text" as const,
      icon: Icons.text,
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "referralCode",
    header: "REFERRAL CODE",
    cell: ({ cell }) => {
      const code = cell.getValue<string>();
      if (!code)
        return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <CopyToClipboard
          variant="badge"
          text={code}
          successMessage="Referral code copied"
        />
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "JOINED",
    cell: ({ cell }) => {
      const createdAt = new Date(cell.getValue<string>());
      return Number.isNaN(createdAt.getTime())
        ? "—"
        : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
            createdAt,
          );
    },
  },
  {
    id: "role",
    accessorKey: "role",
    enableSorting: false,
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ cell }) => {
      return (
        <Badge variant="outline" className="capitalize">
          {cell.getValue<User["role"]>()}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: "Role",
      variant: "multiSelect" as const,
      options: ROLE_OPTIONS,
    },
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ cell }) => {
      const status = cell.getValue<User["status"]>();
      const variant =
        status === "Active"
          ? "default"
          : status === "Inactive"
            ? "secondary"
            : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const isAdmin = row.original.role === "admin";
      if (isAdmin) {
        return null;
      }
      return <CellAction data={row.original} />;
    },
  },
];
