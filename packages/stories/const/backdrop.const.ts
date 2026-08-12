import { ORIGAM_BACKDROP_BLUR_RUNGS } from '@origam/consts'
import type { IOptions } from '@origam/interfaces'
import type { TBackdropBlur } from '@origam/types'

/**
 * `backdropBlur` rungs surfaced in Histoire controls — built from the real
 * `ORIGAM_BACKDROP_BLUR_RUNGS` set (`useBackdrop`'s vocabulary), not
 * invented. `(none)` maps to `undefined` (prop unset — no `backdrop-filter`
 * declaration emitted at all) and is distinct from the `'none'` rung
 * (emits `blur(0px)` explicitly — same visual result, but exercises the
 * class/style resolution path so a tester can see the utility class
 * apply).
 */
export const backdropBlurList: Array<IOptions<TBackdropBlur | undefined>> = [
    { label: '(unset)', value: undefined },
    ...[...ORIGAM_BACKDROP_BLUR_RUNGS].map((rung) => ({
        label: rung,
        value: rung
    }))
]
