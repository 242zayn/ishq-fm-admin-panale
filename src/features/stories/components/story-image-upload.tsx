"use client";

import * as React from "react";
import Dropzone, { type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { storyResource } from "../api/resource";

interface StoryImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  aspect?: "banner" | "cover";
  disabled?: boolean;
  className?: string;
}

export function StoryImageUpload({
  label,
  value,
  onChange,
  aspect = "cover",
  disabled = false,
  className,
}: StoryImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isManualUrl, setIsManualUrl] = React.useState(false);
  const [manualInput, setManualInput] = React.useState(value ?? "");

  React.useEffect(() => {
    setManualInput(value ?? "");
  }, [value]);

  const handleUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, SVG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5 MB or smaller.");
      return;
    }

    try {
      setIsUploading(true);
      const response = await storyResource.uploadImage(file);
      const url = response.data?.url ?? "";
      onChange(url);
      toast.success(`${label} uploaded successfully!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to upload ${label}`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        toast.error("Invalid file. Please select an image under 5 MB.");
        return;
      }
      if (acceptedFiles.length > 0) {
        void handleUpload(acceptedFiles[0]);
      }
    },
    [],
  );

  const handleRemove = () => {
    onChange("");
    setManualInput("");
  };

  const isCover = aspect === "cover";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground">
          {label} *
        </label>
        <button
          type="button"
          onClick={() => setIsManualUrl(!isManualUrl)}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          {isManualUrl ? "Switch to Upload" : "Enter URL manually"}
        </button>
      </div>

      {isManualUrl ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="https://example.com/image.jpg"
            value={manualInput}
            onChange={(e) => {
              setManualInput(e.target.value);
              onChange(e.target.value.trim());
            }}
            disabled={disabled || isUploading}
            className="h-9 text-xs"
          />
          {manualInput && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Icons.close className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : value ? (
        /* Image Preview Box */
        <div
          className={cn(
            "relative group overflow-hidden rounded-2xl border border-border/60 bg-muted/20 p-2.5 transition-all shadow-xs",
            isCover && "w-full max-w-[240px]",
          )}
        >
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-xl bg-black/40",
              isCover ? "aspect-[3/4]" : "h-36 sm:h-44",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
            {/* Responsive Actions Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-2 p-3">
              <Dropzone
                onDrop={onDrop}
                accept={{ "image/*": [] }}
                maxFiles={1}
                multiple={false}
                disabled={disabled || isUploading}
              >
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()} className="w-full sm:w-auto">
                    <input {...getInputProps()} />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 w-full sm:w-auto px-3 text-xs font-medium cursor-pointer shadow-md bg-white/95 text-black hover:bg-white active:scale-95 transition-transform"
                      disabled={disabled || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Icons.spinner className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Icons.upload className="mr-1.5 h-3.5 w-3.5" />
                          Change
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Dropzone>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="h-8 w-full sm:w-auto px-3 text-xs font-medium shadow-md active:scale-95 transition-transform"
              >
                <Icons.trash className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Upload Area */
        <div className={cn(isCover && "w-full max-w-[240px]")}>
          <Dropzone
            onDrop={onDrop}
            accept={{ "image/*": [] }}
            maxFiles={1}
            multiple={false}
            disabled={disabled || isUploading}
          >
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all",
                  isCover ? "aspect-[3/4] w-full" : "h-36 sm:h-44 w-full",
                  isDragActive
                    ? "border-primary bg-primary/10 shadow-inner"
                    : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
                  (disabled || isUploading) && "opacity-60 cursor-not-allowed",
                )}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="flex flex-col items-center py-2">
                    <Icons.spinner className="h-6 w-6 animate-spin text-primary mb-1.5" />
                    <p className="text-xs font-medium text-foreground">
                      Uploading {label.toLowerCase()}...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 px-2">
                    <div className="rounded-full bg-accent/60 p-3 mb-2.5 shadow-xs">
                      <Icons.upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-snug">
                      Click to upload
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      or drag & drop {label.toLowerCase()}
                    </p>
                    <span className="mt-2 inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground border border-border/40">
                      3:4 Ratio • Max 5MB
                    </span>
                  </div>
                )}
              </div>
            )}
          </Dropzone>
        </div>
      )}
    </div>
  );
}
