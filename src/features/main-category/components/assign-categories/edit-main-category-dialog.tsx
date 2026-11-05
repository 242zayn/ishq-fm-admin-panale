"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUpdateMainCategory } from "@/features/main-category/hooks/useMainCategory";
import type { MainCategory } from "@/features/main-category/api/types";
import { toast } from "sonner";

interface EditMainCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainCategory: MainCategory;
  onUpdated?: () => void;
}

export function EditMainCategoryDialog({
  open,
  onOpenChange,
  mainCategory,
  onUpdated,
}: EditMainCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] border-border/60 bg-card p-6 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Edit Main Category
          </DialogTitle>
        </DialogHeader>

        {open && (
          <EditMainCategoryForm
            mainCategory={mainCategory}
            onClose={() => onOpenChange(false)}
            onUpdated={onUpdated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditMainCategoryForm({
  mainCategory,
  onClose,
  onUpdated,
}: {
  mainCategory: MainCategory;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const [title, setTitle] = useState(mainCategory.title);
  const [slug, setSlug] = useState(mainCategory.slug);
  const [description, setDescription] = useState(
    mainCategory.description ?? "",
  );
  const [iconImage, setIconImage] = useState(mainCategory.iconImage ?? "");
  const [bannerImage, setBannerImage] = useState(
    mainCategory.bannerImage ?? "",
  );
  const [sortOrder, setSortOrder] = useState(mainCategory.sortOrder ?? 0);
  const [tags, setTags] = useState(mainCategory.tags?.join(", ") ?? "");
  const [isActive, setIsActive] = useState(mainCategory.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(
    mainCategory.isFeatured ?? false,
  );

  const updateMutation = useUpdateMainCategory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    updateMutation.mutate(
      {
        id: mainCategory.id,
        values: {
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          iconImage: iconImage.trim() || undefined,
          bannerImage: bannerImage.trim() || undefined,
          sortOrder: Number(sortOrder),
          isActive,
          isFeatured,
          tags: tagArray,
        },
      },
      {
        onSuccess: () => {
          toast.success("Main category updated successfully");
          onClose();
          onUpdated?.();
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to update main category",
          );
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="edit-mc-title"
            className="text-xs font-semibold text-muted-foreground"
          >
            Title *
          </label>
          <Input
            id="edit-mc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="edit-mc-slug"
            className="text-xs font-semibold text-muted-foreground"
          >
            Slug *
          </label>
          <Input
            id="edit-mc-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="edit-mc-sort"
            className="text-xs font-semibold text-muted-foreground"
          >
            Placement (Sort Order)
          </label>
          <Input
            id="edit-mc-sort"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="edit-mc-tags"
            className="text-xs font-semibold text-muted-foreground"
          >
            Tags
          </label>
          <Input
            id="edit-mc-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="action, drama"
            className="h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="edit-mc-icon"
            className="text-xs font-semibold text-muted-foreground"
          >
            Icon URL
          </label>
          <Input
            id="edit-mc-icon"
            value={iconImage}
            onChange={(e) => setIconImage(e.target.value)}
            placeholder="https://..."
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="edit-mc-banner"
            className="text-xs font-semibold text-muted-foreground"
          >
            Banner URL
          </label>
          <Input
            id="edit-mc-banner"
            value={bannerImage}
            onChange={(e) => setBannerImage(e.target.value)}
            placeholder="https://..."
            className="h-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="edit-mc-desc"
          className="text-xs font-semibold text-muted-foreground"
        >
          Description
        </label>
        <Textarea
          id="edit-mc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-accent/20 p-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            id="edit-active"
          />
          <label
            htmlFor="edit-active"
            className="text-xs font-medium cursor-pointer"
          >
            Active
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={isFeatured}
            onCheckedChange={setIsFeatured}
            id="edit-featured"
          />
          <label
            htmlFor="edit-featured"
            className="text-xs font-medium cursor-pointer"
          >
            Featured
          </label>
        </div>
      </div>

      <DialogFooter className="gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="h-9"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="h-9 min-w-24"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
