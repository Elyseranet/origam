# Composables — Masonry

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

3 symbole(s) exporte(s).

## `bucketFill`

```ts
export function bucketFill ( heights: ReadonlyArray<number>, containerWidth: number, gap: number, columns: number, align: TMasonryAlign = 'top' ): IMasonryLayoutResult
```

Pure bucket-fill algorithm. Given an ordered list of item heights, a
container width, a gap in px, and a column count, returns the layout
coordinates of every item and the final container height.

Algorithm:
  1. Compute item width  = (containerWidth - (cols - 1) * gap) / cols.
  2. Track `columnHeights[i]` — running sum of item heights + gaps.
  3. For each item, place it in the column with the SMALLEST current
     height (ties → leftmost column). Update that column's height.
  4. `containerHeight` = max(columnHeights).

No DOM access. Fully deterministic. Easy to unit-test.

**Source** : `packages/ds/src/composables/Masonry/masonry.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `pickColumnsForWidth`

```ts
export function pickColumnsForWidth ( width: number, breakpoints: TMasonryColumnBreakpoints | undefined, defaultColumns: number ): number
```

Decide how many columns to use given a container width and a
breakpoint map. Picks the LARGEST key ≤ width. Falls back to
`defaultColumns` when no key matches (i.e. the container is narrower
than every declared breakpoint).

Exposed for unit testing — the bucket-fill itself is pure.

**Exemple**

pickColumnsForWidth(750, { 600: 2, 900: 3, 1200: 4 }, 1) → 2
  pickColumnsForWidth(1500, { 600: 2, 900: 3, 1200: 4 }, 1) → 4
  pickColumnsForWidth(400, { 600: 2, 900: 3, 1200: 4 }, 1) → 1

**Source** : `packages/ds/src/composables/Masonry/masonry.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `useMasonry`

```ts
export function useMasonry (options: IUseMasonryOptions)
```

Public composable used by `<OrigamMasonry>` when the CSS-native
`grid-template-rows: masonry` is unavailable. Maintains:

  - `containerRef` — bind to the container element.
  - `itemRefs`     — bind via `:ref="(el) => setItem(idx, el)"` on
                     each masonry child.
  - `layout`       — reactive layout result (heights, item rects).
  - `setItem`      — register a child element. Idempotent.
  - `relayout()`   — manual re-measure; useful after async content
                     load (images, fonts) that doesn't trigger
                     `ResizeObserver`.

Lifecycle:
  - On mount: install a `ResizeObserver` on the container AND on
    every registered item. Run the first layout.
  - On every observed mutation: re-measure heights, re-run bucket-fill.
  - On unmount: disconnect observers.

**Source** : `packages/ds/src/composables/Masonry/masonry.composable.ts`

**Consommateurs** (2) : `components/Masonry/OrigamMasonry.vue`, `interfaces/Masonry/masonry.interface.ts`

