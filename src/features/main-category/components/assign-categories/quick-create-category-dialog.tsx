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
import { useCreateCategory } from "@/features/category/hooks/useCategory";
import { toast } from "sonner";

interface QuickCreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainCategoryId: string;
  mainCategoryTitle: string;
  onCreated?: () => void;
}

export function QuickCreateCategoryDialog({
  open,
  onOpenChange,
  mainCategoryId,
  mainCategoryTitle,
  onCreated,
}: QuickCreateCategoryDialogProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [iconImage, setIconImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [tags, setTags] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const createMutation = useCreateCategory();

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (
      !slug ||
      slug ===
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
    ) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setIconImage("");
    setBannerImage("");
    setTags("");
    setIsActive(true);
    setIsFeatured(false);
  };

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

    createMutation.mutate(
      {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        iconImage: iconImage.trim() || undefined,
        bannerImage: bannerImage.trim() || undefined,
        mainCategory: mainCategoryId,
        isActive,
        isFeatured,
        sortOrder: 0,
        tags: tagArray,
      },
      {
        onSuccess: () => {
          toast.success(
            `Category "${title}" created and assigned to ${mainCategoryTitle}!`,
          );
          resetForm();
          onOpenChange(false);
          onCreated?.();
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to create category",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/60 bg-card p-6 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add Category to{" "}
            <span className="text-primary">{mainCategoryTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="quick-cat-title"
                className="text-xs font-semibold text-muted-foreground"
              >
                Title *
              </label>
              <Input
                id="quick-cat-title"
                placeholder="e.g. Vegas Ball Bonanza"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="quick-cat-slug"
                className="text-xs font-semibold text-muted-foreground"
              >
                Slug *
              </label>
              <Input
                id="quick-cat-slug"
                placeholder="e.g. vegas-ball-bonanza"
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
                htmlFor="quick-cat-icon"
                className="text-xs font-semibold text-muted-foreground"
              >
                Icon Image URL
              </label>
              <Input
                id="quick-cat-icon"
                placeholder="https://..."
                value={iconImage}
                onChange={(e) => setIconImage(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="quick-cat-banner"
                className="text-xs font-semibold text-muted-foreground"
              >
                Banner Image URL
              </label>
              <Input
                id="quick-cat-banner"
                placeholder="https://..."
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="quick-cat-tags"
              className="text-xs font-semibold text-muted-foreground"
            >
              Tags (comma separated)
            </label>
            <Input
              id="quick-cat-tags"
              placeholder="e.g. slots, pragmatic, hot"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="quick-cat-desc"
              className="text-xs font-semibold text-muted-foreground"
            >
              Description
            </label>
            <Textarea
              id="quick-cat-desc"
              placeholder="Brief description of this category..."
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
                id="quick-active"
              />
              <label
                htmlFor="quick-active"
                className="text-xs font-medium cursor-pointer"
              >
                Active
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
                id="quick-featured"
              />
              <label
                htmlFor="quick-featured"
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
              onClick={() => onOpenChange(false)}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 min-w-24"
            >
              {createMutation.isPending ? "Creating..." : "Create & Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
