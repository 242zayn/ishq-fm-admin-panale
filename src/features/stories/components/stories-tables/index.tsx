"use client";

import { useMemo, useTransition } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllMainCategories } from "@/features/main-category/hooks/useMainCategory";
import { useGetStories } from "../../api/hooks";
import type { StoryLanguage } from "../../api/types";
import { getStoriesColumns } from "./columns";

const LANGUAGES: { value: StoryLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "hinglish", label: "Hinglish" },
];

export function StoriesTableSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-1">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-card/60 p-2.5">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-[460px] w-full rounded-xl" />
    </div>
  );
}

export function StoriesTable() {
  const [, startTransition] = useTransition();

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    lang: parseAsString.withDefault("en"),
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    lang: (params.lang as StoryLanguage) || "en",
  };

  const { data, error, isPending, refetch } = useGetStories(filters);
  const mainCategoriesQuery = useAllMainCategories();

  const mainCategoryNames = useMemo(
    () =>
      new Map(
        (mainCategoriesQuery.data ?? []).map((mainCategory) => [
          mainCategory.id,
          mainCategory.title,
        ]),
      ),
    [mainCategoriesQuery.data],
  );

  const columns = useMemo(
    () => getStoriesColumns(mainCategoryNames),
    [mainCategoryNames],
  );

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.meta?.pagination?.totalPages ?? 0,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
  });

  const handleLanguageChange = (value: string | null) => {
    startTransition(() => {
      setParams({ lang: value || "en", page: 1 });
    });
  };

  if (isPending || !data) {
    return <StoriesTableSkeleton />;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-6"
      >
        <p className="text-sm font-medium text-destructive">
          Could not load stories: {error.message}
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          {/* Language selector in Toolbar */}
          <Select value={params.lang} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-8 w-32 rounded-lg border-border/50 text-xs font-medium">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {LANGUAGES.map((language) => (
                <SelectItem
                  key={language.value}
                  value={language.value}
                  className="text-xs"
                >
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add story page navigation link */}
          <Link
            href="/dashboard/stories/new"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-8 rounded-lg bg-primary text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90",
            )}
          >
            <Icons.add className="mr-1.5 h-3.5 w-3.5" />
            Add Story
          </Link>
        </DataTableToolbar>
      </DataTable>
    </div>
  );
}
