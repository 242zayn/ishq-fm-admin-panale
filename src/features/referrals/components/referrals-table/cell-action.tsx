"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyToClipboard } from "@/components/ui/copy-to-clipboard";
import type { Referral } from "../../api/types";

type CellActionProps = {
  data: Referral;
};

export function CellAction({ data }: CellActionProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return Number.isNaN(date.getTime())
      ? "—"
      : new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);
  };

  const getStatusBadge = (status: Referral["status"]) => {
    switch (status) {
      case "rewarded":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize"
          >
            <Icons.check className="mr-1 h-3 w-3" />
            Rewarded
          </Badge>
        );
      case "qualified":
        return (
          <Badge
            variant="outline"
            className="border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400 capitalize"
          >
            Qualified
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge
            variant="outline"
            className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 capitalize"
          >
            <Icons.spinner className="mr-1 h-3 w-3 animate-spin" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icons.share className="h-5 w-5 text-primary" />
              Referral Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this referral record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Referral Code</span>
              <CopyToClipboard
                text={data.referralCode}
                variant="badge"
                successMessage="Referral code copied"
              />
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Status</span>
              {getStatusBadge(data.status)}
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Reward Days</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                +{data.rewardDays} Days
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Referrer ID</span>
              <CopyToClipboard
                text={data.referrerId}
                variant="inline"
                successMessage="Referrer ID copied"
              />
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Referred User ID</span>
              <CopyToClipboard
                text={data.referredUserId}
                variant="inline"
                successMessage="Referred user ID copied"
              />
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Record ID</span>
              <CopyToClipboard
                text={data.id || data._id || ""}
                variant="inline"
                successMessage="Referral ID copied"
              />
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Created At</span>
              <span>{formatDate(data.createdAt)}</span>
            </div>

            {data.qualifiedAt && (
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">Qualified At</span>
                <span>{formatDate(data.qualifiedAt)}</span>
              </div>
            )}

            {data.rewardedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rewarded At</span>
                <span>{formatDate(data.rewardedAt)}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer rounded-lg border border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => setDetailsOpen(true)}
          title="View Details"
        >
          <Icons.info className="h-4 w-4" />
          <span className="sr-only">View Details</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer rounded-lg border border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Icons.ellipsis className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setDetailsOpen(true)}
              className="cursor-pointer"
            >
              <Icons.info className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard.writeText(data.referralCode);
              }}
              className="cursor-pointer"
            >
              <Icons.copy className="mr-2 h-4 w-4" />
              Copy Code
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard.writeText(data.referrerId);
              }}
              className="cursor-pointer"
            >
              <Icons.copy className="mr-2 h-4 w-4" />
              Copy Referrer ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard.writeText(data.referredUserId);
              }}
              className="cursor-pointer"
            >
              <Icons.copy className="mr-2 h-4 w-4" />
              Copy Referred ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
