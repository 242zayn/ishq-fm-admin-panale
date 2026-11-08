"use client";

import * as React from "react";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyToClipboard } from "@/components/ui/copy-to-clipboard";
import { cn } from "@/lib/utils";

export interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src?: string | null;
  alt?: string;
  title?: string;
  description?: string;
  showActions?: boolean;
}

/**
 * Controlled dialog component for previewing a full-size image.
 */
export function ImagePreviewDialog({
  open,
  onOpenChange,
  src,
  alt = "Image preview",
  title = "Image Preview",
  description,
  showActions = true,
}: ImagePreviewDialogProps) {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-4xl p-6">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </DialogDescription>
              )}
            </div>

            {showActions && (
              <div className="flex items-center gap-1.5">
                <CopyToClipboard
                  variant="badge"
                  text={src}
                  successMessage="Image URL copied"
                  className="hidden sm:inline-flex text-[11px]"
                >
                  Copy URL
                </CopyToClipboard>

                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open original image in new tab"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon-sm" }),
                    "rounded-md text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icons.externalLink className="h-3.5 w-3.5" />
                  <span className="sr-only">Open in new tab</span>
                </a>
              </div>
            )}
          </div>
        </DialogHeader>

        <Card className="bg-black/80 relative flex h-[65vh] sm:h-[72vh] items-center justify-center overflow-hidden rounded-xl border border-border/60 p-2 shadow-inner">
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1200}
            unoptimized
            className="h-full w-full object-contain"
          />
        </Card>
      </DialogContent>
    </Dialog>
  );
}

export interface ImagePreviewProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The image URL to display and preview.
   */
  src?: string | null;
  /**
   * Accessible alt text for the image.
   */
  alt?: string;
  /**
   * Dialog title (e.g. "Story Cover", "Banner").
   * Defaults to "Image Preview".
   */
  title?: string;
  /**
   * Optional subtitle/description for the dialog.
   */
  description?: string;
  /**
   * Preset aspect ratio / dimensions:
   * - 'banner': 20x14 (80x56px) horizontal thumbnail
   * - 'cover': 3:4 vertical book cover
   * - 'square': 1:1 square thumbnail
   * - 'video': 16:9 widescreen
   * - 'auto': unconstrained, styled via className
   * Defaults to 'banner'.
   */
  aspect?: "banner" | "cover" | "square" | "video" | "auto";
  /**
   * Width for next/image loader (default 96)
   */
  width?: number;
  /**
   * Height for next/image loader (default 64)
   */
  height?: number;
  /**
   * ClassName for thumbnail button container.
   */
  className?: string;
  /**
   * ClassName for the internal <img> element.
   */
  imageClassName?: string;
  /**
   * Fallback node rendered when `src` is missing.
   * Defaults to: `<span className="text-muted-foreground text-xs">No image</span>`
   */
  fallback?: React.ReactNode;
  /**
   * Whether to show search/zoom icon overlay on hover.
   * Defaults to true.
   */
  showHoverIcon?: boolean;
  /**
   * Custom trigger element. If provided, overrides the default thumbnail button.
   */
  children?: React.ReactNode;
}

/**
 * Global reusable Image Preview component with thumbnail trigger and modal dialog viewer.
 */
export function ImagePreview({
  src,
  alt = "Image preview",
  title = "Image Preview",
  description = "Full-size image preview.",
  aspect = "banner",
  width = 96,
  height = 64,
  className,
  imageClassName,
  fallback = <span className="text-muted-foreground text-xs">No image</span>,
  showHoverIcon = true,
  children,
  onClick,
  disabled,
  ...props
}: ImagePreviewProps) {
  const [open, setOpen] = React.useState(false);

  if (!src) {
    return <>{fallback}</>;
  }

  const aspectStyles = {
    banner: "h-14 w-20",
    cover: "w-12 aspect-[3/4]",
    square: "size-12 aspect-square",
    video: "w-24 aspect-video",
    auto: "",
  }[aspect];

  return (
    <>
      {children ? (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={cn("inline-flex cursor-pointer", className)}
        >
          {children}
        </span>
      ) : (
        <div className="inline-flex shrink-0">
          <button
            type="button"
            aria-label={`Preview ${title}`}
            title={`Preview ${title}`}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClick?.(e);
              setOpen(true);
            }}
            className={cn(
              "group relative overflow-hidden rounded-lg border border-border/60 bg-muted/30 p-0 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
              aspectStyles,
              className,
            )}
            {...props}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              unoptimized
              className={cn("h-full w-full object-cover", imageClassName)}
            />
            {showHoverIcon && (
              <span
                aria-hidden="true"
                className="bg-background/90 text-foreground absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full opacity-90 transition group-hover:scale-110 shadow-sm"
              >
                <Icons.search className="h-3 w-3" />
              </span>
            )}
          </button>
        </div>
      )}

      <ImagePreviewDialog
        open={open}
        onOpenChange={setOpen}
        src={src}
        alt={alt}
        title={title}
        description={description}
      />
    </>
  );
}
