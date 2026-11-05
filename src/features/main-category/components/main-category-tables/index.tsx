"use client";

import { DataTable } from "@/components/ui/table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { columns } from "./columns";
import { useMainCategories } from "../../hooks/useMainCategory";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { DataTableViewOptions } from "@/components/ui/table/data-table-view-options";
import { useState, useTransition, useSyncExternalStore } from "react";
import { toast } from "sonner";

const emptySubscribe = () => () => {};

export function MainCategoryTableSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-1">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-card/60 p-2.5">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-[420px] w-full rounded-xl" />
    </div>
  );
}

export function MainCategoryTable() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
  });

  const [searchValue, setSearchValue] = useState(params.name ?? "");
  const [, startTransition] = useTransition();

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
  };

  const { data, error, isPending, refetch, isFetching } =
    useMainCategories(filters);

  console.log("data", data);

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

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    startTransition(() => {
      setParams({ name: value || null, page: 1 });
    });
  };

  const handleExport = () => {
    if (!data?.data || data.data.length === 0) {
      toast.error("No categories to export");
      return;
    }

    const exportRows = data.data.map((cat) => ({
      Title: cat.title,
      Slug: cat.slug,
      Placement: cat.sortOrder ?? 0,
      Status: cat.isActive ? "Active" : "Inactive",
      TotalStories: cat.totalStories ?? 0,
      CreatedAt: cat.createdAt ?? "",
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Title,Slug,Placement,Status,TotalStories,CreatedAt"]
        .concat(
          exportRows.map(
            (r) =>
              `"${r.Title}","${r.Slug}",${r.Placement},"${r.Status}",${r.TotalStories},"${r.CreatedAt}"`,
          ),
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `categories_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Categories exported successfully");
  };

  // SSR or initial client loading before mount/data
  if (!isMounted || isPending || !data) {
    return <MainCategoryTableSkeleton />;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-6"
      >
        <p className="text-sm font-medium text-destructive">
          Could not load categories:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-4">
      {/* Top Search & Action Bar matching screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-card/60 p-2.5 backdrop-blur-sm">
        <div className="relative w-full max-w-sm sm:w-80">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 w-full rounded-lg bg-background/80 pl-9 text-sm focus-visible:ring-1"
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Icons.close className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-9 rounded-lg border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Icons.download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>

          <DataTableViewOptions table={table} />

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetch();
              toast.info("Refreshing categories...");
            }}
            disabled={isFetching}
            className="h-9 w-9 rounded-lg border-border/50 text-muted-foreground hover:text-foreground"
            title="Refresh"
          >
            <Icons.refresh
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex flex-1 flex-col min-h-[420px] rounded-xl border border-border/50 bg-card/40 p-1 backdrop-blur-sm">
        <DataTable table={table} />
      </div>
    </div>
  );
}
