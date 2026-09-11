/**
 * Vertical density of `<OrigamEmptyState>`. Drives icon size + title /
 * description font sizes + gap + padding via per-size token overrides.
 *
 * - `sm` — compact (inline empty zones inside dense containers).
 * - `md` — default (full-page-section empty states).
 * - `lg` — generous (hero empty pages, marketing-style placeholders).
 */
export type TEmptyStateSize = 'sm' | 'md' | 'lg'
