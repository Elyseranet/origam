import type { TBlockquoteAlign, TBlockquoteVariant } from '../../../ds/src/types/Blockquote/blockquote.type'
import type { TFontSize } from '../../../ds/src/types/Commons/font-size.type'
import type { TProbeIdentity, TProbeMode } from '../dark-contrast/probe-matrix.type'

/*********************************************************
 * IBlockquoteProbeCase
 *
 * @description
 * Un cas de la matrice. `key` est l'identifiant d'APPARIEMENT entre la
 * mesure d'avant et celle d'apres : il ne doit jamais changer de sens.
 *
 * @description
 * Le prefixe `override-` n'est pas decoratif — le comparateur s'en sert
 * pour separer les ecarts ATTENDUS (un prop concurrent qui doit battre le
 * preset) des ecarts INTERDITS (un variant nu, qui doit rendre a
 * l'identique).
 ********************************************************/
export interface IBlockquoteProbeCase {
    key: string
    variant: TBlockquoteVariant
    align?: TBlockquoteAlign
    fontSize?: TFontSize
    quoteMark?: boolean
    padding?: string
}

export interface IBlockquoteProbeConfig {
    identity: TProbeIdentity
    mode: TProbeMode
}
