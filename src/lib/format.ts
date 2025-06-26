export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date));
  } catch {
    return "";
  }
}

export function formatARR(value?: number): string {
  if (value == null || isNaN(value)) return '$0 ARR'
  if (value === 0) return '$0 ARR'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M ARR`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}k ARR`
  return `$${value} ARR`
}

export function middleTruncate(str: string, maxLength: number = 24): string {
  if (!str || str.length <= maxLength) return str
  const keep = Math.max(4, Math.floor((maxLength - 3) / 2))
  return str.slice(0, keep) + '...' + str.slice(-keep)
}
