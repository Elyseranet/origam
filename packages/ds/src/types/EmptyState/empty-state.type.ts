import OrigamEmptyState from '../../components/EmptyState/OrigamEmptyState.vue'
import { EMPTY_STATE_PRESET } from '../../enums/EmptyState/empty-state.enum'
import type { TTextAlign } from '../Commons/align.type'
import type { TRoundedToken } from '../Commons/rounded.type'

export type TOrigamEmptyState = InstanceType<typeof OrigamEmptyState>

/**
 * Visual presets for `<OrigamEmptyState>`. Each preset bundles a
 * default icon + intent mapping so consumers do not need to wire those
 * by hand for the 95% case. The icon and intent can still be
 * overridden via the matching props when a one-off variation is
 * needed.
 *
 * - `no-data`     — generic "nothing to show yet" (empty collection).
 * - `no-results`  — search or filter returned nothing.
 * - `error`       — an operation failed; retry CTA is typical.
 * - `offline`     — connectivity issue; offline-mode CTA is typical.
 * - `locked`      — feature is gated (auth, plan, permissions).
 */
export type TEmptyStatePreset = `${EMPTY_STATE_PRESET}`

/**
 * Horizontal alignment of the icon / title / description / actions
 * stack inside `<OrigamEmptyState>`.
 *
 * - `center` — default. Centred stack, content also `text-align: center`.
 *              Best for full-page or full-section placeholders.
 * - `left`   — left-aligned stack. Best for narrow side panels or list
 *              empty zones where the surrounding content is left-aligned.
 *
 * Narrows the Commons `TTextAlign` vocabulary rather than redeclaring
 * the strings — `right` is excluded on purpose (no design token drives
 * a right-aligned empty state).
 */
export type TEmptyStateAlign = Exclude<TTextAlign, 'right'>

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
