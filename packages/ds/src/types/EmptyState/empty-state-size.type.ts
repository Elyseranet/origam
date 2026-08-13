import type { TRoundedToken } from '../Commons/rounded.type'

/**
 * Vertical density of `<OrigamEmptyState>`. Drives icon size + title /
 * description font sizes + gap + padding via per-size token overrides.
 *
 * - `sm` — compact (inline empty zones inside dense containers).
 * - `md` — default (full-page-section empty states).
 * - `lg` — generous (hero empty pages, marketing-style placeholders).
 *
 * Reuses the Commons abbreviated size vocabulary (`TRoundedToken`, see
 * `Commons/rounded.type.ts`) rather than redeclaring the strings —
 * same naming convention, unrelated CSS property.
 */
export type TEmptyStateSize = Extract<TRoundedToken, 'sm' | 'md' | 'lg'>
