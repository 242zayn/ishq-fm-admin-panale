export type FormatDateOptions = Intl.DateTimeFormatOptions & {
  locale?: string | string[];
  fallback?: string;
  includeTime?: boolean;
};

/**
 * Global helper to format date strings, numbers, or Date objects.
 * Returns a fallback string (default '—') if invalid or missing.
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  opts: FormatDateOptions = {}
): string {
  const { fallback = '—', locale = 'en-US', includeTime = false, ...formatOptions } = opts;

  if (!date) return fallback;

  try {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return fallback;

    const hasExplicitStyle =
      formatOptions.dateStyle !== undefined || formatOptions.timeStyle !== undefined;

    let options: Intl.DateTimeFormatOptions;

    if (hasExplicitStyle) {
      options = formatOptions;
    } else if (includeTime) {
      options = {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...formatOptions
      };
    } else if (
      formatOptions.day ||
      formatOptions.month ||
      formatOptions.year ||
      formatOptions.weekday
    ) {
      options = formatOptions;
    } else {
      options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...formatOptions
      };
    }

    const formatted = new Intl.DateTimeFormat(locale, options).format(d);
    return formatted.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
  } catch {
    return fallback;
  }
}

/**
 * Global helper to format date + readable 12-hour time with AM/PM (e.g. "Nov 14, 2026, 12:35 PM").
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  opts: FormatDateOptions = {}
): string {
  return formatDate(date, {
    dateStyle: opts.dateStyle ?? 'medium',
    timeStyle: opts.timeStyle ?? 'short',
    locale: opts.locale ?? 'en-US',
    fallback: opts.fallback ?? '—',
    ...opts
  });
}
