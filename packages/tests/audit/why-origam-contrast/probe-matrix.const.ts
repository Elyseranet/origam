import type { TProbeIdentity, TProbeMode } from './probe-matrix.type'

/*********************************************************
 * PROBE_IDENTITIES
 *
 * @description
 * The DS's own baseline (`origam` — no `data-theme`, the zero-config surface
 * `createOrigam()` always installs) plus the 7 brand themes of
 * `packages/marketing/src/themes/*.theme.ts`. This is what the mission brief
 * calls "8 marques … plus origam" — read literally that is 9 names, but only
 * 8 theme identities actually exist in the repo (7 brand files + the DS
 * baseline). Measured against the 8 that exist; see the report for this
 * discrepancy.
 ********************************************************/
export const PROBE_IDENTITIES: readonly TProbeIdentity[] = [
    'origam',
    'apple',
    'cartoon',
    'ecom',
    'editorial',
    'geek',
    'glass',
    'material'
]

export const PROBE_MODES: readonly TProbeMode[] = ['light', 'dark']
