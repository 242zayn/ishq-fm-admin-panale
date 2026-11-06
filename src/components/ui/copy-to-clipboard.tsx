'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface CopyToClipboardProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The text value that will be copied to the clipboard.
   */
  text: string;
  /**
   * Optional label or message for the success toast.
   * Defaults to: "Copied to clipboard"
   */
  successMessage?: string;
  /**
   * Optional duration in ms for showing the check icon state.
   * Defaults to: 2000ms
   */
  timeout?: number;
  /**
   * Whether to show a toast notification on copy.
   * Defaults to: true
   */
  showToast?: boolean;
  /**
   * Display variant:
   * - 'icon': Only the copy icon (compact square button).
   * - 'inline': Text displayed next to an inline copy icon.
   * - 'badge': Pill badge style with monospace text and copy icon.
   * Defaults to: 'icon'
   */
  variant?: 'icon' | 'inline' | 'badge';
  /**
   * Custom children to render inside the button.
   * If provided, overrides default display.
   */
  children?: React.ReactNode;
}

export function CopyToClipboard({
  text,
  successMessage = 'Copied to clipboard',
  timeout = 2000,
  showToast = true,
  variant = 'icon',
  children,
  className,
  onClick,
  ...props
}: CopyToClipboardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      onClick?.(e);

      if (!text) return;

      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers / non-HTTPS
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        setCopied(true);
        if (showToast) {
          toast.success(successMessage);
        }
        setTimeout(() => setCopied(false), timeout);
      } catch (err) {
        toast.error('Failed to copy to clipboard');
      }
    },
    [text, successMessage, showToast, timeout, onClick]
  );

  const renderIcon = () => {
    if (copied) {
      return <Icons.check className='size-3 text-emerald-500 animate-in fade-in zoom-in duration-150 shrink-0' />;
    }
    return <Icons.copy className='size-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0' />;
  };

  if (variant === 'badge') {
    return (
      <button
        type='button'
        onClick={handleCopy}
        title={copied ? 'Copied!' : `Copy: ${text}`}
        className={cn(
          'group inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:border-border active:scale-95',
          className
        )}
        {...props}
      >
        <span className='truncate'>{children ?? text}</span>
        {renderIcon()}
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type='button'
        onClick={handleCopy}
        title={copied ? 'Copied!' : `Copy: ${text}`}
        className={cn(
          'group inline-flex items-center gap-1.5 text-left text-xs font-mono text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline active:scale-98',
          className
        )}
        {...props}
      >
        <span className='truncate'>{children ?? text}</span>
        {renderIcon()}
      </button>
    );
  }

  // default 'icon' variant
  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy: ${text}`}
      className={cn(
        'group size-6 rounded p-0 text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95',
        className
      )}
      {...props}
    >
      {children ? children : renderIcon()}
    </Button>
  );
}
