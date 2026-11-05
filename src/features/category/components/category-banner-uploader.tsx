"use client";

import * as React from "react";
import Image from "next/image";
import Dropzone, { type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { categoryResource } from "../api/service";

interface CategoryBannerUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CategoryBannerUploader({
  value,
  onChange,
  disabled = false,
  className,
}: CategoryBannerUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isManualUrl, setIsManualUrl] = React.useState(false);
  const [manualInput, setManualInput] = React.useState(value ?? "");

  React.useEffect(() => {
    setManualInput(value ?? "");
  }, [value]);

  const handleUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5 MB or smaller.");
      return;
    }

    try {
      setIsUploading(true);
      const url = await categoryResource.uploadBanner(file);
      onChange(url);
      toast.success("Banner image uploaded successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload banner image",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        toast.error("Invalid file. Please upload an image under 5 MB.");
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

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground">
          Banner Image
        </label>
        <button
          type="button"
          onClick={() => setIsManualUrl(!isManualUrl)}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          {isManualUrl ? "Switch to File Upload" : "Enter URL manually"}
        </button>
      </div>

      {isManualUrl ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="https://example.com/banner.jpg"
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
        /* Current Image Preview Card */
        <div className="relative group overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-2 transition-all">
          <div className="relative h-32 w-full overflow-hidden rounded-lg bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Category Banner Preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Dropzone
                onDrop={onDrop}
                accept={{ "image/*": [] }}
                maxFiles={1}
                multiple={false}
                disabled={disabled || isUploading}
              >
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs font-medium cursor-pointer shadow-md"
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
                className="h-8 text-xs font-medium shadow-md"
              >
                <Icons.trash className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Upload Area */
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
                "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
                (disabled || isUploading) && "opacity-60 cursor-not-allowed",
              )}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="flex flex-col items-center py-2">
                  <Icons.spinner className="h-6 w-6 animate-spin text-primary mb-1.5" />
                  <p className="text-xs font-medium text-foreground">
                    Uploading banner...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2">
                  <div className="rounded-full bg-accent/60 p-2 mb-2">
                    <Icons.upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    Click to upload or drag & drop banner
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              )}
            </div>
          )}
        </Dropzone>
      )}
    </div>
  );
}
