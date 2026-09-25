/**
 * components-catalog.util.ts — grouping helpers for the component catalogue.
 *
 * The `/components` index page groups only the TOP-LEVEL entries, so its
 * grouping is a one-line `filter`. The /roadmap "already shipped" section
 * claims the WHOLE catalogue is delivered, which means it has to render every
 * entry — sub-components included — and that is where the shape of the data
 * stops being trivial.
 *
 * ⛔ NO COUNT IS WRITTEN DOWN IN THIS FILE, AND NONE SHOULD BE. The catalogue
 * is editorial data served by `/api/reference/component`, and it differs per
 * environment: the same day this was written, the local dev server served 218
 * entries and the deployed one 194. Any figure quoted here as "the" size of
 * the catalogue would be a claim about one machine, stale on the next. The
 * proportions below are therefore described as mechanisms, never as totals.
 *
 * Two defects in the source data make a naive `groupBy(entry.category)` lose
 * entries. Both are tracked in #954, which fixes the DATA; everything here is
 * a WORKAROUND meant to be deleted once #954 lands:
 *
 *   1. A sizeable minority of sub-components carry `category: ''` — the bulk
 *      of them under `chart`, `transition` and `data-table`. Grouping on
 *      `entry.category` alone drops every one of them, so the section would
 *      render fewer components than the heading above it claims. No TOP-LEVEL
 *      entry is affected. `resolveCategory` walks up `parentSlug` to recover
 *      the category from the parent, which covers all but one of them.
 *
 *   2. The catalogue confuses `parentSlug` (a component) with a GROUPING
 *      DIRECTORY. Seven entries point at a `parentSlug` that is not itself a
 *      catalogue entry: `col` / `container` / `row` → `grids`,
 *      `media-controller` / `media-scrubber` / `media-volume-control` →
 *      `media`, and `slide-group` → `slide`. Those three parents are
 *      directories under `packages/ds/src/components/` that hold no
 *      homonymous component.
 *
 * Six of those seven are harmless today because they carry their own
 * `category`, so the parent walk never reaches the dangling link. Only
 * `slide-group` sits at the INTERSECTION of the two defects — dangling parent
 * AND empty category — and is therefore the sole entry nothing can classify.
 * Hence `fallbackCategory`: it goes into a visible bucket instead of
 * vanishing. Expect that bucket to hold exactly one entry until #954 lands,
 * and to disappear entirely afterwards.
 */

import type {
    IComponentCatalogGroup,
    IComponentEntry
} from '../interfaces/components-catalog.interface'

/**
 * Walks up `parentSlug` until an entry carries a non-empty `category`.
 *
 * The `seen` set is not defensive decoration: `parentSlug` is editorial data
 * coming from the API-Reference store, so a two-entry cycle would hang the
 * render rather than fail loudly. Returns `null` when nothing resolves.
 */
function resolveCategory (
    entry: IComponentEntry,
    bySlug: Map<string, IComponentEntry>
): string | null {
    const seen = new Set<string>()
    let current: IComponentEntry | undefined = entry

    while (current && !seen.has(current.slug)) {
        if (current.category) return current.category
        seen.add(current.slug)
        current = current.parentSlug ? bySlug.get(current.parentSlug) : undefined
    }

    return null
}

/**
 * Groups every catalogue entry by category, sub-components included.
 *
 * Groups come out in `categories` order — the order the
 * `/api/reference/categories/component` route already sorts by position —
 * with the fallback bucket appended last and only when it holds something.
 * Empty groups are dropped, so a category the API lists but nothing uses
 * does not render an empty heading.
 *
 * Entries are sorted by name inside each group: the catalogue route orders
 * by name globally, but distributing it across groups does not preserve a
 * useful order once the sub-components are folded in.
 *
 * @param entries          Every catalogue entry (top-level AND sub-components).
 * @param categories       Ordered category list from the categories route.
 * @param fallbackCategory Bucket for entries whose category cannot be resolved.
 */
export function groupComponentsByCategory (
    entries: IComponentEntry[],
    categories: string[],
    fallbackCategory: string
): IComponentCatalogGroup[] {
    const bySlug = new Map(entries.map(entry => [entry.slug, entry]))
    const buckets = new Map<string, IComponentEntry[]>()

    for (const category of categories) buckets.set(category, [])
    buckets.set(fallbackCategory, [])

    for (const entry of entries) {
        const resolved = resolveCategory(entry, bySlug)
        const key = resolved && buckets.has(resolved) ? resolved : fallbackCategory
        buckets.get(key)?.push(entry)
    }

    const groups: IComponentCatalogGroup[] = []

    for (const [category, bucket] of buckets) {
        if (bucket.length === 0) continue
        groups.push({
            category,
            entries: [...bucket].sort((a, b) => a.name.localeCompare(b.name))
        })
    }

    return groups
}
