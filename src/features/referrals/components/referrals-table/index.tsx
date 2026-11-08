"use client";

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTable } from "@/hooks/use-data-table";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useReferrals } from "../../hooks/useReferrals";
import type { ReferralFilters } from "../../api/types";
import { columns } from "./columns";

export function ReferralsTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    referralCode: parseAsString,
    status: parseAsString,
  });

  const filters: ReferralFilters = {
    page: params.page,
    limit: params.perPage,
    ...(params.referralCode ? { referralCode: params.referralCode } : {}),
    ...(params.status ? { status: params.status } : {}),
  };

  const { data, error, isLoading } = useReferrals(filters);

  if (error) {
    throw error;
  }

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.meta?.pagination?.totalPages ?? 0,
    shallow: true,
    debounceMs: 500,
    initialState: {
      pagination: {
        pageIndex: params.page - 1,
        pageSize: params.perPage,
      },
      columnPinning: { right: ["actions"] },
    },
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

export { columns } from "./columns";
