"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icons } from "@/components/icons";
import type { Story, StoryMainCategory } from "../../api/types";
import { StoryActions } from "../story-actions";

const mainCategoryIdField = "_id";

function getMainCategoryId(
  mainCategory: StoryMainCategory | string | null | undefined,
) {
  if (!mainCategory || typeof mainCategory === "string") {
    return mainCategory ?? "";
  }

  return mainCategory.id ?? mainCategory[mainCategoryIdField] ?? "";
}

export function StoryBannerPreview({ story }: { story: Story }) {
  const [open, setOpen] = useState(false);
  const imageUrl = story.coverImage || story.bannerImage;

  if (!imageUrl) {
    return <span className="text-muted-foreground text-xs">No image</span>;
  }

  return (
    <>
      <div className="w-20">
        <button
          type="button"
          aria-label={`Preview ${story.title} banner image`}
          title="Preview image"
          onClick={() => setOpen(true)}
          className="group relative h-14 w-20 overflow-hidden rounded-lg border border-border/60 bg-muted/30 p-0 transition-transform hover:scale-105"
        >
          <Image
            src={imageUrl}
            alt={`${story.title} banner`}
            width={80}
            height={56}
            unoptimized
            className="h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            className="bg-background/90 text-foreground absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full opacity-90 transition group-hover:scale-110 shadow-sm"
          >
            <Icons.search className="h-3 w-3" />
          </span>
        </button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full sm:max-w-4xl p-6">
          <DialogHeader>
            <DialogTitle>{story.title} Banner</DialogTitle>
            <DialogDescription>
              Full-size banner image preview.
            </DialogDescription>
          </DialogHeader>
          <Card className="bg-muted relative flex h-[70vh] items-center justify-center overflow-hidden rounded-xl border border-border/60">
            <Image
              src={imageUrl}
              alt={`${story.title} banner preview`}
              width={1600}
              height={1200}
              unoptimized
              className="h-full w-full object-contain"
            />
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function getStoriesColumns(
  mainCategoryNames: Map<string, string>,
): ColumnDef<Story>[] {
  return [
    {
      id: "banner",
      header: "Banner Image",
      cell: ({ row }) => <StoryBannerPreview story={row.original} />,
      enableSorting: false,
    },
    {
      id: "name",
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Story" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 max-w-xs">
          <Link
            href={`/dashboard/stories/${row.original._id}`}
            className="font-medium hover:underline text-foreground line-clamp-1"
          >
            {row.original.title}
          </Link>
          {row.original.synopsis && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.synopsis}
            </span>
          )}
        </div>
      ),
      meta: {
        label: "Story",
        placeholder: "Search stories by title...",
        variant: "text",
        icon: Icons.search,
      },
      enableColumnFilter: true,
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => {
        const cat =
          typeof row.original.categoryId === "object" && row.original.categoryId
            ? row.original.categoryId
            : null;
        return <span className="font-medium">{cat?.title ?? "—"}</span>;
      },
      enableSorting: false,
    },
    // {
    //   id: "mainCategory",
    //   header: "Main Category",
    //   cell: ({ row }) => {
    //     const cat =
    //       typeof row.original.categoryId === "object" && row.original.categoryId
    //         ? row.original.categoryId
    //         : null;
    //     const mainCat = cat?.mainCategory;
    //     const title =
    //       typeof mainCat === "object" && mainCat
    //         ? mainCat.title
    //         : mainCategoryNames.get(getMainCategoryId(mainCat));
    //     return <span className="text-muted-foreground">{title ?? "—"}</span>;
    //   },
    //   enableSorting: false,
    // },
    {
      accessorKey: "authorName",
      header: "Author",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.authorName || "—"}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "currentLanguage",
      header: "Language",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="uppercase text-[11px] font-semibold px-2 py-0.5"
        >
          {row.original.currentLanguage || "—"}
        </Badge>
      ),
      enableSorting: false,
    },
    {
      id: "chapters",
      header: "Chapters",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="rounded-full px-2 py-0 text-xs font-medium"
        >
          {row.original.chapters?.length ?? 0}
        </Badge>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "totalLikes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Likes" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-medium text-sm">
          <span>{row.original.totalLikes ?? 0}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const { isFeatured, isTrending } = row.original;
        if (!isFeatured && !isTrending) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {isFeatured && (
              <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
                Featured
              </Badge>
            )}
            {isTrending && (
              <Badge
                variant="outline"
                className="text-[11px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
              >
                Trending
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <StoryActions story={row.original} />
        </div>
      ),
      enableSorting: false,
    },
  ];
}
