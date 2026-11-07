"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { getSortingStateParser } from "@/lib/parsers";
import { guestUsersQueryOptions } from "../../api/queries";
import type { GuestUser } from "../../api/types";
import { columns } from "./columns";

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

function getSortValue(guest: GuestUser, columnId: string): string {
  switch (columnId) {
    case "name":
      return `${guest.name} ${guest.guestId}`;
    case "isAdult":
      return guest.isAdult ? "true" : "false";
    case "lastActiveAt":
      return guest.lastActiveAt ?? "";
    case "createdAt":
      return guest.createdAt;
    default:
      return "";
  }
}

export function GuestUsersTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    isAdult: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([]),
  });

  const { data, error, isPending, refetch } = useQuery(
    guestUsersQueryOptions(),
  );
  const guestRecords = data ?? [];

  const filteredGuests = useMemo(() => {
    const search = params.name?.trim().toLocaleLowerCase();
    const selectedAdultFilters = new Set(
      params.isAdult?.split(/[,.]/).filter(Boolean) ?? [],
    );

    const guests = [...guestRecords].filter((guest) => {
      const matchesSearch =
        !search ||
        `${guest.name} ${guest.guestId}`.toLocaleLowerCase().includes(search);

      const adultStr = guest.isAdult ? "true" : "false";
      const matchesAdult =
        !selectedAdultFilters.size || selectedAdultFilters.has(adultStr);

      return matchesSearch && matchesAdult;
    });

    const [sort] = params.sort;
    if (sort) {
      guests.sort((left, right) => {
        const comparison = getSortValue(left, sort.id).localeCompare(
          getSortValue(right, sort.id),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          },
        );
        return sort.desc ? -comparison : comparison;
      });
    }

    return guests;
  }, [guestRecords, params.name, params.isAdult, params.sort]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredGuests.length / params.perPage),
  );
  const pageStart = (params.page - 1) * params.perPage;
  const pageGuests = filteredGuests.slice(
    pageStart,
    pageStart + params.perPage,
  );

  const { table } = useDataTable({
    data: pageGuests,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
  });

  if (isPending) return <GuestUsersTableSkeleton />;
  if (error) {
    return (
      <div
        role="alert"
        className="text-destructive flex flex-col items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4"
      >
        <p className="text-sm font-medium">
          Could not load guest users: {error.message}
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

export function GuestUsersTableSkeleton() {
  return (
    <div className="flex flex-1 animate-pulse flex-col gap-4">
      <div className="bg-muted h-10 w-full rounded" />
      <div className="bg-muted h-96 w-full rounded-lg" />
      <div className="bg-muted h-10 w-full rounded" />
    </div>
  );
}
