import type { TRounded } from '../../types'

export interface IRoundedProps {
    /**
     * Corner-radius selector. Three modes:
     *  - **named variant** (`'small' | 'default' | 'large' | …`,
     *    cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the
     *    component's SCSS can pick the right token rung.
     *  - **boolean `true`** (or empty string `''`) → emits the legacy
     *    `--rounded` class for components that only have a single rounded
     *    state (e.g. `OrigamBtn` defaulting to `radius.2xl`).
     *  - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline
     *    `border-radius` declarations via `useRounded.roundedStyles`.
     */
    rounded?: boolean | number | string | TRounded | null | undefined
    roundedTopRight?: boolean | number | string
    roundedTopLeft?: boolean | number | string
    roundedBottomLeft?: boolean | number | string
    roundedBottomRight?: boolean | number | string
}
