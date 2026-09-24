import type { TProbeIdentity, TProbeMode } from './probe-matrix.type'

/*********************************************************
 * PROBE_IDENTITIES
 *
 * @description
 * The 8 identities of #871: the DS native baseline (`native` — no
 * `data-theme`, the zero-config surface `createOrigam()` always installs) plus
 * the 7 brands of `packages/marketing/src/themes`.
 *
 * ⛔ Marketing's own NAMED `origam` theme is deliberately NOT one of them: it
 * carries `ORIGAM_COMPONENT_RESET_*`, a GENERATED re-declaration of the ~2 700
 * component vars, which is precisely the consumer-side workaround for the
 * defect measured here. Including it would hide what is being measured.
 ********************************************************/
export const PROBE_IDENTITIES: readonly TProbeIdentity[] = [
    'native',
    'apple',
    'cartoon',
    'ecom',
    'editorial',
    'geek',
    'glass',
    'material'
]

export const PROBE_MODES: readonly TProbeMode[] = ['light', 'dark']
