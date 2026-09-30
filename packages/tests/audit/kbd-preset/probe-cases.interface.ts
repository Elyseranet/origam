import type { TKbdVariant } from '../../../ds/src/types/Kbd/kbd.type'

/*********************************************************
 * IKbdProbeCase
 *
 * @description
 * Un cas de la matrice Kbd : un variant, une forme (simple ou
 * combinaison), et eventuellement un prop CONCURRENT que le preset nomme
 * aussi.
 *
 * @description
 * `bgColor` et `border` sont volontairement les deux seuls props
 * concurrents exposes : ce sont ceux dont ADR-005 dit qu'ils doivent
 * desormais GAGNER contre le variant, ce qu'ils ne faisaient pas contre
 * une regle CSS.
 ********************************************************/
export interface IKbdProbeCase {
    key: string
    variant: TKbdVariant
    combination: boolean
    bgColor?: string
    border?: string
}

/*********************************************************
 * IKbdProbeConfig
 *
 * @description
 * Ce que le pilote Playwright ecrit dans `window.__ORIGAM_KBD_PROBE__` via
 * `addInitScript`, donc AVANT le parse du document.
 ********************************************************/
export interface IKbdProbeConfig {
    identity: string
    mode: string
}
