"use client";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import type { Column, ColumnDef } from "@tanstack/react-table";
import type { MainCategory } from "../../api/types";
import { CellAction } from "./cell-action";
import Link from "next/link";

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}

export const columns: ColumnDef<MainCategory>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }: { column: Column<MainCategory, unknown> }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      const subtitle = [
        "Type: story",
        data.slug ? `Slug: ${data.slug}` : null,
        data.tags?.length ? `Tags: ${data.tags.slice(0, 2).join(", ")}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      return (
        <div className="flex items-center gap-3.5 py-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-sm">
            {data.iconImage || data.bannerImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.iconImage || data.bannerImage}
                alt={data.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Icons.categories className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col">
            <Link
              href={`/dashboard/main-category/${data.id}`}
              className="font-semibold text-foreground transition-colors hover:text-primary hover:underline"
            >
              {data.title}
            </Link>
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "sortOrder",
    header: "Placement",
    cell: ({ row }) => {
      const order = row.original.sortOrder;
      return (
        <div className="text-muted-foreground">
          {order !== undefined && order !== null ? order : "—"}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.isActive;
      return (
        <Badge
          variant="outline"
          className={
            active
              ? "rounded-full border-emerald-800/60 bg-emerald-950/60 px-3 py-0.5 text-xs font-semibold text-emerald-400"
              : "rounded-full border-zinc-700 bg-zinc-800/80 px-3 py-0.5 text-xs font-semibold text-zinc-400"
          }
        >
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "totalStories",
    header: "Total Stories",
    cell: ({ row }) => {
      const count = row.original.totalStories ?? 0;
      return (
        <span className="inline-flex min-w-7 h-6 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-800/80 px-2.5 text-xs font-bold text-zinc-200">
          {count}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return (
        <div suppressHydrationWarning className="text-xs text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
