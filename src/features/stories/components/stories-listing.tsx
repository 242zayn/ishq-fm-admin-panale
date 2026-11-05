"use client";

import { Suspense } from "react";
import { StoriesTable, StoriesTableSkeleton } from "./stories-tables";

export default function StoriesListing() {
  return (
    <Suspense fallback={<StoriesTableSkeleton />}>
      <StoriesTable />
    </Suspense>
  );
}
