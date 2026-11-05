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
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { mainCategoryKeys } from "@/features/main-category/api/queries";
import { categoryKeys } from "@/features/category/api/queries";

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
  const queryClient = useQueryClient();

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
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Assigned categories sorted by sortOrder
  const assignedCategories: Category[] = useMemo(() => {
    const list = assignedData?.data ?? [];
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [assignedData]);

  // Set of assigned category IDs for quick lookup
  const assignedIds = useMemo(() => {
    return new Set(assignedCategories.map((c) => c.id));
  }, [assignedCategories]);

  // Filtered available categories
  const filteredAvailableCategories = useMemo(() => {
    const list = allCategories ?? [];
    const query = searchQuery.trim().toLowerCase();

    return list.filter((cat) => {
      const isAssignedToThis = assignedIds.has(cat.id);

      // Filter by tab
      if (filterMode === "unassigned" && cat.mainCategory) {
        return false;
      }
      if (filterMode === "assigned" && !isAssignedToThis) {
        return false;
      }

      // Filter by search query
      if (!query) return true;
      const titleMatch = cat.title?.toLowerCase().includes(query);
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

  // Helper to invalidate and refetch all related categories and main categories
  const syncQueries = () => {
    refetchAssigned();
    refetchAll();
    queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    queryClient.invalidateQueries({
      queryKey: mainCategoryKeys.all,
      refetchType: "all",
    });
    queryClient.refetchQueries({ queryKey: mainCategoryKeys.all });
  };

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
          syncQueries();
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
          syncQueries();
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
        syncQueries();
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

  // DnD Handlers
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
      <div className="flex flex-1 flex-col gap-6">
        {/* Breadcrumb / Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/main-category"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "h-9 w-9 rounded-lg border-border/50 text-muted-foreground hover:text-foreground",
              )}
            >
              <Icons.chevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Main Categories</span>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {mainCategory.title}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium border-0",
                    mainCategory.isActive
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {mainCategory.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage assigned categories and drag to reorder their appearance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMainCategoryOpen(true)}
              className="h-9 rounded-lg border-border/50 text-xs font-medium"
            >
              <Icons.edit className="mr-1.5 h-3.5 w-3.5" />
              Edit Main Category
            </Button>
            <Button
              size="sm"
              onClick={() => setNewCategoryOpen(true)}
              className="h-9 rounded-lg bg-primary text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Icons.add className="mr-1.5 h-3.5 w-3.5" />
              New Category
            </Button>
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: Available Categories (7 cols) */}
          <section className="lg:col-span-7 flex flex-col rounded-2xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm shadow-sm min-h-[620px]">
            {/* Header + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight">
                  Available Categories
                </h2>
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-0 text-xs font-medium"
                >
                  {filteredAvailableCategories.length}
                </Badge>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Icons.search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    startTransition(() => setSearchQuery(val));
                  }}
                  className="h-8 w-full rounded-lg bg-background/80 pl-8 pr-7 text-xs focus-visible:ring-1"
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

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 py-3">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "unassigned", label: "Unassigned" },
                  { id: "assigned", label: "Assigned" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterMode(tab.id)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                    filterMode === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Grid of Available Category Cards */}
            <div className="flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))}
                </div>
              ) : filteredAvailableCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6 border border-dashed border-border/40 rounded-xl">
                  <Icons.product className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    No categories found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    {searchQuery
                      ? "Try searching for a different keyword or clearing filters."
                      : "Create a new category to get started."}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-xs"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                  {filteredAvailableCategories.map((cat) => {
                    const isAssigned = assignedIds.has(cat.id);
                    return (
                      <AvailableCard
                        key={cat.id}
                        category={cat}
                        isAssigned={isAssigned}
                        onAssign={() => handleAssignCategory(cat)}
                        onUnassign={() => handleUnassignCategory(cat)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT PANEL: Assigned Categories (5 cols) */}
          <section
            ref={setRightDropRef}
            className={cn(
              "lg:col-span-5 flex flex-col rounded-2xl border p-4 backdrop-blur-sm shadow-sm min-h-[620px] transition-colors",
              isOverRightPanel
                ? "border-primary/80 bg-primary/5 ring-2 ring-primary/20"
                : "border-border/50 bg-card/40",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight">
                  Assigned Categories
                </h2>
                <Badge
                  variant="outline"
                  className="rounded-full bg-primary/10 text-primary border-primary/20 px-2 py-0 text-xs font-semibold"
                >
                  {assignedCategories.length}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditMainCategoryOpen(true)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  title="Edit Main Category"
                >
                  <Icons.edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setNewCategoryOpen(true)}
                  className="h-8 rounded-lg bg-primary text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <Icons.add className="mr-1 h-3.5 w-3.5" />
                  New Category
                </Button>
              </div>
            </div>

            {/* List instructions banner */}
            <div className="mt-3 mb-2 flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span>Drag to reorder placement</span>
              <span>{assignedCategories.length} items</span>
            </div>

            {/* Sortable List of Assigned Categories */}
            <div className="flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="space-y-2 p-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : assignedCategories.length === 0 ? (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center h-80 text-center p-6 border-2 border-dashed rounded-xl transition-colors",
                    isOverRightPanel
                      ? "border-primary bg-primary/10"
                      : "border-border/40 bg-background/20",
                  )}
                >
                  <div className="rounded-full bg-accent/60 p-3 mb-3">
                    <Icons.sort className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Drop categories here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Drag items from the left panel or click the plus button on
                    any category card to assign it here.
                  </p>
                </div>
              ) : (
                <SortableContext
                  items={assignedCategories.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 p-1">
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
          </section>
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
          onCreated={syncQueries}
        />

        <EditMainCategoryDialog
          open={editMainCategoryOpen}
          onOpenChange={setEditMainCategoryOpen}
          mainCategory={mainCategory}
          onUpdated={syncQueries}
        />
      </div>
    </DndContext>
  );
}
