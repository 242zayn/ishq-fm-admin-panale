"use client";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import type { Column, ColumnDef } from "@tanstack/react-table";
import type { Category } from "../../api/types";
import { CellAction } from "./cell-action";
import { ImagePreview } from "@/components/ui/image-preview";

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "banner",
    header: "Banner",
    cell: ({ row }) => {
      const bannerImage = row.original.bannerImage;
      return (
        <ImagePreview
          src={bannerImage}
          alt={`${row.original.title} banner`}
          title={`${row.original.title} Banner`}
          description="Category banner image preview."
          aspect="cover"
          className="w-10 h-14 rounded-md"
          fallback={
            <div className="w-10 h-14 overflow-hidden rounded-md border bg-muted flex items-center justify-center text-muted-foreground">
              <Icons.media className="h-4 w-4" />
            </div>
          }
        />
      );
    },
  },
  {
    id: "name",
    accessorKey: "title",
    header: ({ column }: { column: Column<Category, unknown> }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ cell }) => (
      <div className="font-medium">{cell.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "slug",
    header: "SLUG",
  },
  {
    accessorKey: "mainCategory",
    header: "PARENT CATEGORY",
    cell: ({ cell }) => {
      const mainCat = cell.getValue<Category["mainCategory"]>();
      return (
        <div className="font-medium text-muted-foreground">
          {mainCat?.title ?? "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "STATUS",
    cell: ({ cell }) => {
      const active = cell.getValue<boolean>();
      return (
        <Badge
          variant="outline"
          className={
            active
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-muted-foreground/20 text-muted-foreground"
          }
        >
          {active ? (
            <Icons.check className="mr-1 h-3 w-3" />
          ) : (
            <Icons.close className="mr-1 h-3 w-3" />
          )}
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isFeatured",
    header: "FEATURED",
    cell: ({ cell }) => (
      <span className="text-xs text-muted-foreground">
        {cell.getValue<boolean>() ? "Yes" : "No"}
      </span>
    ),
  },
  {
    accessorKey: "sortOrder",
    header: "ORDER",
    cell: ({ cell }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {cell.getValue<number>()}
      </span>
    ),
  },
  {
    accessorKey: "tags",
    header: "TAGS",
    cell: ({ cell }) => {
      const tags = cell.getValue<string[]>() ?? [];
      if (!tags.length) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="text-xs text-muted-foreground">{tags.join(", ")}</span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
