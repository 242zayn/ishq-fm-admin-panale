"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { ImagePreview } from "@/components/ui/image-preview";
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
  const imageUrl = story.coverImage || story.bannerImage;

  return (
    <ImagePreview
      src={imageUrl}
      alt={`${story.title} cover`}
      title={`${story.title} Cover`}
      description="Full-size cover image preview."
      aspect="banner"
    />
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
