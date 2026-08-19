import { ALIGN, TEXT_ALIGN } from '../../enums/Commons/align.enum'

export type TAlign = `${ALIGN}`

/**
 * Physical text alignment (`text-align`). See {@link TAlign} for the
 * logical box-alignment vocabulary — the two are distinct on purpose.
 */
export type TTextAlign = `${TEXT_ALIGN}`
