"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import type { MainCategory } from "../../api/types";
import type { Category } from "@/features/category/api/types";
import {
  useAllCategories,
  useAssignCategory,
  useCategoriesByMainCategory,
  useReorderCategories,
} from "@/features/category/hooks/useCategory";

import { AvailableCard, DraggedCardOverlay } from "./available-card";
import { AssignedItem, DraggedAssignedItemOverlay } from "./assigned-item";
import { QuickCreateCategoryDialog } from "./quick-create-category-dialog";
import { EditMainCategoryDialog } from "./edit-main-category-dialog";

interface AssignCategoriesWorkspaceProps {
  mainCategory: MainCategory;
}

export function AssignCategoriesWorkspace({
  mainCategory,
}: AssignCategoriesWorkspaceProps) {
  // Queries
  const {
    data: assignedData,
    isLoading: isAssignedLoading,
    refetch: refetchAssigned,
  } = useCategoriesByMainCategory(mainCategory.id, { limit: 100 });

  const {
    data: allCategories,
    isLoading: isAllLoading,
    refetch: refetchAll,
  } = useAllCategories();

  // Mutations
  const assignMutation = useAssignCategory();
  const reorderMutation = useReorderCategories();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<
    "all" | "unassigned" | "assigned"
  >("all");
  const [activeItem, setActiveItem] = useState<{
    type: "available" | "assigned";
    category: Category;
  } | null>(null);

  // Dialog states
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [editMainCategoryOpen, setEditMainCategoryOpen] = useState(false);

  const [, startTransition] = useTransition();

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Assigned categories list
  const assignedCategories: Category[] = useMemo(() => {
    return assignedData?.data ?? [];
  }, [assignedData]);

  // Set of assigned category IDs for quick lookup
  const assignedIds = useMemo(() => {
    return new Set(assignedCategories.map((c) => c.id));
  }, [assignedCategories]);

  // Available categories list filtered
  const filteredAvailableCategories = useMemo(() => {
    const list = allCategories ?? [];
    const query = searchQuery.trim().toLowerCase();

    return list.filter((cat) => {
      const isAssignedToThis = assignedIds.has(cat.id);

      if (filterMode === "unassigned") {
        // Unassigned or assigned to someone else
        if (isAssignedToThis) return false;
      } else if (filterMode === "assigned") {
        if (!isAssignedToThis) return false;
      }

      if (!query) return true;

      const titleMatch = cat.title.toLowerCase().includes(query);
      const slugMatch = cat.slug?.toLowerCase().includes(query);
      const tagMatch = cat.tags?.some((t) => t.toLowerCase().includes(query));

      return titleMatch || slugMatch || tagMatch;
    });
  }, [allCategories, searchQuery, filterMode, assignedIds]);

  // Droppable zone on right panel
  const { setNodeRef: setRightDropRef, isOver: isOverRightPanel } =
    useDroppable({
      id: "assigned-drop-zone",
    });

  // Assign category
  const handleAssignCategory = (category: Category) => {
    if (assignedIds.has(category.id)) {
      toast.info(
        `"${category.title}" is already assigned to this main category`,
      );
      return;
    }

    const nextSortOrder = assignedCategories.length;

    assignMutation.mutate(
      {
        categoryId: category.id,
        mainCategoryId: mainCategory.id,
        sortOrder: nextSortOrder,
      },
      {
        onSuccess: () => {
          toast.success(
            `Assigned "${category.title}" to ${mainCategory.title}`,
          );
          refetchAssigned();
          refetchAll();
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to assign category",
          );
        },
      },
    );
  };

  // Unassign category
  const handleUnassignCategory = (category: Category) => {
    assignMutation.mutate(
      {
        categoryId: category.id,
        mainCategoryId: null,
      },
      {
        onSuccess: () => {
          toast.success(
            `Removed "${category.title}" from ${mainCategory.title}`,
          );
          refetchAssigned();
          refetchAll();
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to unassign category",
          );
        },
      },
    );
  };

  // Reorder items
  const handleReorder = (newItems: Category[]) => {
    const reorderedPayload = newItems.map((item, idx) => ({
      id: item.id,
      sortOrder: idx,
    }));

    reorderMutation.mutate(reorderedPayload, {
      onSuccess: () => {
        toast.success("Categories order updated");
        refetchAssigned();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to update order",
        );
        refetchAssigned();
      },
    });
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = arrayMove(assignedCategories, index, index - 1);
    handleReorder(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index >= assignedCategories.length - 1) return;
    const newItems = arrayMove(assignedCategories, index, index + 1);
    handleReorder(newItems);
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "available") {
      setActiveItem({
        type: "available",
        category: activeData.category,
      });
    } else {
      const cat = assignedCategories.find((c) => c.id === active.id);
      if (cat) {
        setActiveItem({
          type: "assigned",
          category: cat,
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    // Case 1: Dragging available card into assigned zone
    if (active.data.current?.type === "available") {
      const category: Category = active.data.current.category;

      if (
        over.id === "assigned-drop-zone" ||
        assignedIds.has(String(over.id))
      ) {
        handleAssignCategory(category);
      }
      return;
    }

    // Case 2: Dragging assigned sortable item
    if (active.id !== over.id) {
      const oldIndex = assignedCategories.findIndex((c) => c.id === active.id);
      const newIndex = assignedCategories.findIndex((c) => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(assignedCategories, oldIndex, newIndex);
        handleReorder(newItems);
      }
    }
  };

  const isLoading = isAssignedLoading || isAllLoading;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-5">
        {/* Top Header / Breadcrumb matching screenshot style */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center gap-3.5">
            <Link
              href="/dashboard/main-category"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Back to Main Categories"
            >
              <Icons.chevronLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
                {mainCategory.iconImage || mainCategory.bannerImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mainCategory.iconImage || mainCategory.bannerImage}
                    alt={mainCategory.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icons.categories className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground md:text-xl">
                    {mainCategory.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className={
                      mainCategory.isActive
                        ? "border-emerald-800/60 bg-emerald-950/60 text-emerald-400 rounded-full px-2 py-0 text-[11px]"
                        : "border-zinc-700 bg-zinc-800/80 text-zinc-400 rounded-full px-2 py-0 text-[11px]"
                    }
                  >
                    {mainCategory.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Slug: {mainCategory.slug}</span>
                  <span>•</span>
                  <span>Placement: {mainCategory.sortOrder ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMainCategoryOpen(true)}
              className="h-9 rounded-xl border-border/60 text-xs font-medium"
            >
              <Icons.edit className="mr-1.5 h-3.5 w-3.5" />
              Edit Main Category
            </Button>
            <Button
              size="sm"
              onClick={() => setNewCategoryOpen(true)}
              className="h-9 rounded-xl text-xs font-medium shadow-sm"
            >
              <Icons.add className="mr-1.5 h-3.5 w-3.5" />
              New Category
            </Button>
          </div>
        </div>

        {/* Two-Panel Drag and Drop Layout matching Image 2 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT PANEL: Available Categories */}
          <div className="flex flex-col rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm shadow-xs lg:col-span-7">
            {/* Header with Title and Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground md:text-lg">
                  Available Games / Categories
                </h2>
                <p className="text-xs text-muted-foreground">
                  Drag cards to the right panel or click &apos;+&apos; to assign
                </p>
              </div>

              {/* Search Bar matching screenshot */}
              <div className="relative w-full sm:w-64">
                <Icons.search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search games / categories..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    startTransition(() => {
                      setSearchQuery(val);
                    });
                  }}
                  className="h-8 w-full rounded-lg bg-background/80 pl-8 text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Icons.close className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="mb-4 flex items-center gap-1.5 border-b border-border/40 pb-3">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  filterMode === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                All ({allCategories?.length ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("unassigned")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  filterMode === "unassigned"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                Unassigned Only
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("assigned")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  filterMode === "assigned"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                Assigned ({assignedCategories.length})
              </button>
            </div>

            {/* Grid of Cards */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
              </div>
            ) : filteredAvailableCategories.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground">
                <Icons.categories className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm font-medium">No categories found</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {searchQuery
                    ? `No categories matching "${searchQuery}"`
                    : "Create a new category using the button above"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[600px] p-1 sm:grid-cols-3 xl:grid-cols-4">
                {filteredAvailableCategories.map((cat) => (
                  <AvailableCard
                    key={cat.id}
                    category={cat}
                    isAssigned={assignedIds.has(cat.id)}
                    onAssign={handleAssignCategory}
                    onUnassign={handleUnassignCategory}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Assigned Categories */}
          <div
            ref={setRightDropRef}
            className={cn(
              "flex flex-col rounded-2xl border bg-card/60 p-5 backdrop-blur-sm shadow-xs transition-colors duration-200 lg:col-span-5",
              isOverRightPanel
                ? "border-primary/80 bg-primary/5 ring-2 ring-primary/20"
                : "border-border/50",
            )}
          >
            {/* Header matching Image 2 */}
            <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground md:text-lg">
                  Assigned Games ({assignedCategories.length})
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditMainCategoryOpen(true)}
                  className="h-8 w-8 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground"
                  title="Edit Main Category"
                >
                  <Icons.edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setNewCategoryOpen(true)}
                  className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                >
                  <Icons.add className="mr-1 h-3.5 w-3.5" />
                  New Category
                </Button>
              </div>
            </div>

            {/* Droppable and Sortable List */}
            <div className="mt-4 flex flex-1 flex-col">
              {isAssignedLoading ? (
                <div className="space-y-2.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : assignedCategories.length === 0 ? (
                <div
                  className={cn(
                    "flex h-80 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
                    isOverRightPanel
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground",
                  )}
                >
                  <Icons.gripVertical className="mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm font-semibold">Drop categories here</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Drag available cards from the left panel or click the
                    &apos;+&apos; button to assign categories to this main
                    category.
                  </p>
                </div>
              ) : (
                <SortableContext
                  items={assignedCategories.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2.5 overflow-y-auto max-h-[600px] p-1">
                    {assignedCategories.map((cat, idx) => (
                      <AssignedItem
                        key={cat.id}
                        category={cat}
                        index={idx}
                        total={assignedCategories.length}
                        onRemove={handleUnassignCategory}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>

            {/* Bottom info helper */}
            {assignedCategories.length > 0 && (
              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                <span>Drag the handle on the left to reorder</span>
                <span className="font-medium text-foreground">
                  {assignedCategories.length} item
                  {assignedCategories.length === 1 ? "" : "s"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Drag Overlays */}
        <DragOverlay>
          {activeItem?.type === "available" ? (
            <DraggedCardOverlay category={activeItem.category} />
          ) : activeItem?.type === "assigned" ? (
            <DraggedAssignedItemOverlay category={activeItem.category} />
          ) : null}
        </DragOverlay>

        {/* Dialogs */}
        <QuickCreateCategoryDialog
          open={newCategoryOpen}
          onOpenChange={setNewCategoryOpen}
          mainCategoryId={mainCategory.id}
          mainCategoryTitle={mainCategory.title}
          onCreated={() => {
            refetchAssigned();
            refetchAll();
          }}
        />

        <EditMainCategoryDialog
          open={editMainCategoryOpen}
          onOpenChange={setEditMainCategoryOpen}
          mainCategory={mainCategory}
          onUpdated={() => {
            refetchAssigned();
          }}
        />
      </div>
    </DndContext>
  );
}
