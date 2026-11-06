"use client";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { CopyToClipboard } from "@/components/ui/copy-to-clipboard";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { Column, ColumnDef } from "@tanstack/react-table";
import type { GuestUser } from "../../api/types";
import { CellAction } from "./cell-action";
import { IS_ADULT_OPTIONS } from "./options";

export const columns: ColumnDef<GuestUser>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }: { column: Column<GuestUser, unknown> }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground">
          {row.original.name || "Guest User"}
        </span>
        <div className="flex items-center gap-1.5">
          <CopyToClipboard
            variant="inline"
            text={row.original.guestId}
            successMessage="Guest ID copied to clipboard"
            className="text-muted-foreground hover:text-foreground cursor-pointer "
          />
        </div>
      </div>
    ),
    meta: {
      label: "Name or Guest ID",
      placeholder: "Search guest users...",
      variant: "text" as const,
      icon: Icons.text,
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "isAdult",
    id: "isAdult",
    enableSorting: true,
    header: ({ column }: { column: Column<GuestUser, unknown> }) => (
      <DataTableColumnHeader column={column} title="18+ / Preference" />
    ),
    cell: ({ cell }) => {
      const isAdult = Boolean(cell.getValue<boolean>());
      return isAdult ? (
        <Badge variant="destructive" className="text-xs">
          18+ Adult
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">
          All Ages
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: "Content Preference",
      variant: "multiSelect" as const,
      options: IS_ADULT_OPTIONS,
    },
  },
  {
    accessorKey: "lastActiveAt",
    header: "LAST ACTIVE",
    cell: ({ cell }) => {
      const val = cell.getValue<string | undefined>();
      if (!val) return "—";
      const date = new Date(val);
      return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(date);
    },
  },
  {
    accessorKey: "createdAt",
    header: "REGISTERED",
    cell: ({ cell }) => {
      const val = cell.getValue<string>();
      if (!val) return "—";
      const createdAt = new Date(val);
      return Number.isNaN(createdAt.getTime())
        ? "—"
        : new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(createdAt);
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
