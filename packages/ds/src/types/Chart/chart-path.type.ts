/**
 * A pre-scaled `[x, y]` coordinate pair (pixels in the SVG viewBox),
 * as consumed by the path builders in `src/utils/Chart/path.util.ts`.
 *
 * Deliberately a TUPLE, not the object-shaped `TPoint` (`{ x, y }`)
 * from `types/Commons/point.type.ts`: the path helpers build strings
 * from long lists of coordinates on every render, and the tuple form
 * both destructures positionally (`const [x, y] = p`) and keeps the
 * call sites readable (`linePath([[0, 0], [10, 10]])`). The two are not
 * interchangeable and neither replaces the other.
 */
export type TPathPoint = [number, number]
