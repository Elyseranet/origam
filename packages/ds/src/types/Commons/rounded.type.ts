import { ROUNDED, ROUNDED_TOKEN } from '../../enums'

/**
 * Every value the `rounded` prop accepts.
 *
 * Two scales, deliberately kept distinct (see `rounded.enum.ts`):
 *   - `ROUNDED` — the component scale, naming an intent (`shaped`, `large`);
 *   - `ROUNDED_TOKEN` — the radius rungs (`md`, `full`), resolved to the
 *     generated utility classes.
 *
 * The token scale was already honoured at runtime but was missing from this
 * type, so `rounded="full"` — the only way to get a circle — failed to
 * type-check and never surfaced in autocompletion.
 */
export type TRounded = `${ROUNDED}` | `${ROUNDED_TOKEN}`
