"use client";

import { useDraggable } from "@dnd-kit/core";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/features/category/api/types";
import { cn } from "@/lib/utils";

interface AvailableCardProps {
  category: Category;
  isAssigned: boolean;
  onAssign: (category: Category) => void;
  onUnassign?: (category: Category) => void;
}

export function AvailableCard({
  category,
  isAssigned,
  onAssign,
  onUnassign,
}: AvailableCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `available-${category.id}`,
    data: {
      type: "available",
      category,
    },
  });

  console.log("category", category);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative flex min-h-[110px] flex-col items-center justify-center rounded-2xl border p-4 text-center select-none transition-all duration-200 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40 scale-95 border-primary/50",
        isAssigned
          ? "border-emerald-900/40 bg-zinc-900/50 hover:border-emerald-800/60"
          : "border-zinc-800/80 bg-zinc-900/90 hover:border-zinc-700 hover:bg-zinc-850/90 hover:shadow-md",
      )}
    >
      {/* Assigned Badge Indicator */}
      {isAssigned && (
        <div className="absolute top-2.5 left-2.5">
          <Badge
            variant="outline"
            className="h-5 rounded-full border-emerald-800/60 bg-emerald-950/60 px-1.5 text-[10px] font-semibold text-emerald-400"
          >
            <Icons.check className="mr-0.5 h-2.5 w-2.5" />
            Assigned to {category?.mainCategory?.title}
          </Badge>
        </div>
      )}

      {/* Quick Action Button */}
      <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {isAssigned ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg border border-red-500/20 bg-zinc-900 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              onUnassign?.(category);
            }}
            title="Remove from this main category"
          >
            <Icons.close className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onAssign(category);
            }}
            title="Assign to this main category"
          >
            <Icons.add className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col items-center justify-center gap-1.5 pt-1">
        {category.iconImage || category.bannerImage ? (
          <div className="mb-1 h-9 w-9 overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={category.iconImage || category.bannerImage}
              alt={category.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <span className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {category.title}
        </span>

        {category.slug && (
          <span className="line-clamp-1 text-[11px] text-muted-foreground">
            {category.slug}
          </span>
        )}
      </div>
    </div>
  );
}

export function DraggedCardOverlay({ category }: { category: Category }) {
  return (
    <div className="flex min-h-[100px] w-48 flex-col items-center justify-center rounded-2xl border border-primary/60 bg-zinc-900/95 p-4 text-center shadow-2xl backdrop-blur-md rotate-2 scale-105">
      {category.iconImage || category.bannerImage ? (
        <div className="mb-1 h-8 w-8 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.iconImage || category.bannerImage}
            alt={category.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <span className="line-clamp-1 text-sm font-semibold text-primary">
        {category.title}
      </span>
      <span className="text-[10px] text-muted-foreground">Drop to assign</span>
    </div>
  );
}
