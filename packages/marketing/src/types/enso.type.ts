import type { COLOR_MODE } from 'origam/enums'

/** Variables CSS posées en `style` sur un décor enso (`--enso-art-light`, `--enso-art-dark`, `--petal-*`). */
export type TEnsoArtVars = Record<`--${string}`, string | number>

/** Variante d'une illustration enso : le mode concret de la page, jamais `auto`. */
export type TEnsoMode = Exclude<`${COLOR_MODE}`, `${COLOR_MODE.AUTO}`>
